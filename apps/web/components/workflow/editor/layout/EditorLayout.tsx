'use client';

import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { EditorLeftSidebar, EditorRightSidebar } from './Sidebar';
import React from "react";
import {EditorLeftMenu} from "@/components/workflow/editor/menu/EditorLeftMenu";
import { EditorRightMenu } from "../menu/EditorRightMenu";

export interface EditorLayoutProps {
  children?: React.ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
    const { editorUIState } = useWorkflowEditor();

    // Check if panels are active to handle layout spacing
    const isLeftPanelOpen = !!editorUIState.activeLeftPanel;
    const isRightPanelOpen = !!editorUIState.activeRightPanel;

    return (
        <div className="relative center h-screen w-screen overflow-hidden gap-1.5 p-2 px-0! bg-neutral-900 text-white">
            {/* 1. LEFT MENU (Fixed Rail) */}
            <div className="z-50 h-[85%] rounded-xl shrink-0">
                <EditorLeftMenu />
            </div>

            {/* 2. MAIN EDITOR / GRAPH */}
            <main className="relative flex-1 overflow-hidden h-full rounded-xl bg-neutral-950">
                {children}
            </main>

            {/* 3. RIGHT MENU (Fixed Rail) */}
            <div className="z-50 h-[85%] rounded-xl shrink-0">
                <EditorRightMenu />
            </div>

            {/* 4. FLOATING PANELS (overlaid, not pushing layout) */}
            <EditorLeftSidebar />
            <EditorRightSidebar />
        </div>
    );
}