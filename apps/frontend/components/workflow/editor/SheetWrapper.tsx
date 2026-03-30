"use client";

import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils";
import { ContextRegistrationSheet } from "../editor/sheet/ContextRegistrationSheet";

interface ReusableSheetProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
    nodeId?: string; // Only required if showContextSettings is true
    showContextSettings?: boolean;
}

export function SheetWrapper({
                                 children,
                                 open,
                                 onOpenChange,
                                 title = "",
                                 description = "",
                                 side = "right",
                                 className,
                                 nodeId,
                                 showContextSettings = true,
                             }: ReusableSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={side}
                className={cn(
                    "w-[550px]! h-full! p-0! bg-neutral-950/95 backdrop-blur-xl shadow-2xl max-h-[97dvh] border-neutral-800/50 overflow-hidden border! m-2.5 mb-3.5 rounded-xl flex flex-col",
                    className
                )}
            >
                <SheetHeader className="p-6 border-b border-neutral-800/50 bg-neutral-900/20">
                    <SheetTitle className="text-neutral-100">{title}</SheetTitle>
                    <SheetDescription className="text-neutral-400">{description}</SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-10">
                        {/* Primary Node Configuration Section */}
                        <div className="space-y-6">
                            {children}
                        </div>

                        {/* Automatic Context Registration Section */}
                        {showContextSettings && nodeId && (
                            <div className="pt-8 border-t border-neutral-800/50">
                                <p className="text-[10px] font-bold uppercase text-neutral-600 tracking-[0.2em] mb-4">
                                    Neuron Engine Core
                                </p>
                                <ContextRegistrationSheet nodeId={nodeId} />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}