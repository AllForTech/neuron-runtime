'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from "@/hooks/useAuth";
import { Vault } from "@neuron/db";
import { secrets as secretsClient } from "@neuron/client";

interface VaultContextType {
    secrets: Vault[];
    isLoading: boolean;
    refreshSecrets: () => Promise<void>;
    addSecret: (name: string, value: string) => Promise<void>;
    removeSecret: (id: string) => Promise<void>;
}

export const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
    const { user, session } = useAuth();
    const [secrets, setSecrets] = useState<Vault[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const token = session?.access_token;

    const refreshSecrets = useCallback(async () => {
        if (!user || !token) return;

        setIsLoading(true);

        const [data, error] = await secretsClient.list(token);

        if (error) {
            console.error('Vault Error:', error);
            toast.error('Could not load secrets from vault');
        } else if (data) {
            setSecrets(data as Vault[]);
        }

        setIsLoading(false);
    }, [user, token]);

    useEffect(() => {
        if (user && token) {
            refreshSecrets();
        }
    }, [user, token, refreshSecrets]);

    const addSecret = async (name: string, value: string) => {
        if (!token) return;

        const [_, error] = await secretsClient.create(name, value, token);

        if (error) {
            toast.error('Failed to encrypt and store secret');
            return;
        }

        toast.success('Secret stored securely');
        await refreshSecrets();
    };

    const removeSecret = async (id: string) => {
        if (!token) return;

        const [_, error] = await secretsClient.delete(id, token);

        if (error) {
            toast.error('Could not delete secret');
            return;
        }

        setSecrets((prev) => prev.filter((s) => s.id !== id));
        toast.success('Secret removed from vault');
    };

    return (
        <VaultContext.Provider
            value={{ secrets, isLoading, refreshSecrets, addSecret, removeSecret }}
        >
            {children}
        </VaultContext.Provider>
    );
}