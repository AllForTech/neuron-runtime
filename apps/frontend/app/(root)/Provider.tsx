'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { WorkflowProvider } from '@/providers/WorkflowProvider';
import { DashboardProvider } from '@/providers/DashboardContext';
import {WorkspaceProvider} from "@/providers/WorkspaceProvider";

export const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <>
        <WorkflowProvider>
            <WorkspaceProvider>
                <SidebarProvider>
                    <DashboardProvider>{children}</DashboardProvider>
                </SidebarProvider>
            </WorkspaceProvider>
        </WorkflowProvider>
    </>
  );
};
