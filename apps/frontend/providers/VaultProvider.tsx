'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Secret } from '@/types/workflow';
import {
    createSecretRequest,
    deleteSecretRequest,
    getSecretRequest,
} from '@/lib/api-client/client';
import { useAuth } from "@/hooks/useAuth";

interface VaultContextType {
    secrets: Secret[];
    isLoading: boolean;
    refreshSecrets: () => Promise<void>;
    addSecret: (name: string, value: string) => Promise<void>;
    removeSecret: (id: string) => Promise<void>;
}

export const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
    const { user, session } = useAuth();
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // FIX: Simply extract the token string. No async useMemo needed.
    const token = session?.access_token;

    const refreshSecrets = useCallback(async () => {
        if (!user || !token) return;

        setIsLoading(true);
        try {
            // Pass the string token directly
            const response = await getSecretRequest(token);
            setSecrets(response);
        } catch (error) {
            console.error('Vault Error:', error);
            toast.error('Could not load secrets from vault');
        } finally {
            setIsLoading(false);
        }
    }, [user, token]); // Add token to dependencies

    useEffect(() => {
        if (user && token) {
            refreshSecrets();
        }
    }, [user, token, refreshSecrets]);

    const addSecret = async (name: string, value: string) => {
        if (!token) return;

        try {
            await createSecretRequest(name, value, token);
            toast.success('Secret stored securely');
            await refreshSecrets();
        } catch (error) {
            toast.error('Failed to encrypt and store secret');
        }
    };

    const removeSecret = async (id: string) => {
        if (!token) return;

        try {
            await deleteSecretRequest(id, token);
            setSecrets((prev) => prev.filter((s) => s.id !== id));
            toast.success('Secret removed from vault');
        } catch (error) {
            toast.error('Could not delete secret');
        }
    };

    return (
        <VaultContext.Provider
            value={{ secrets, isLoading, refreshSecrets, addSecret, removeSecret }}
        >
            {children}
        </VaultContext.Provider>
    );
}