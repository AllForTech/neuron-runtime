'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { VaultProvider } from '@/providers/VaultProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <VaultProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                </VaultProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
