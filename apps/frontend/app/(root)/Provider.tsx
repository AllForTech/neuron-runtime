"use client";

import {ReactNode} from "react";
import {SidebarProvider} from "@/components/ui/sidebar";
import {WorkflowProvider} from "@/providers/WorkflowProvider";
import {DashboardProvider} from "@/providers/DashboardContext";

export const Provider = ({ children }: { children: ReactNode }) => {

    return (
        <>
            <WorkflowProvider>
                <SidebarProvider>
                    <DashboardProvider>
                        {children}
                    </DashboardProvider>
                </SidebarProvider>
            </WorkflowProvider>
        </>
    )
}