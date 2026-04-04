"use client";

import React, { useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, Info, Tag, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeMetaCollapsibleProps {
    label: string;
    description?: string;
    onUpdate: (key: string, data: any) => void;
}

export function NodeMeta({
                                        label,
                                        description = "",
                                        onUpdate
                                    }: NodeMetaCollapsibleProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full border border-neutral-800/50 bg-neutral-900/40 rounded-xl overflow-hidden transition-all duration-200"
        >
            {/* Header / Trigger */}
            <CollapsibleTrigger className="w-full flex items-center  justify-between p-4 hover:bg-neutral-800/30 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-md border border-white/10 group-hover:border-white/20 transition-colors">
                        <Layout className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest leading-none mb-2">
                            Node Identity
                        </p>
                        <h4 className="text-sm font-medium text-neutral-200 truncate max-w-[280px]">
                            {label || "Untitled Node"}
                        </h4>
                    </div>
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-neutral-500 transition-transform duration-200",
                    isOpen && "rotate-180 text-white"
                )} />
            </CollapsibleTrigger>

            {/* Form Content */}
            <CollapsibleContent className="px-4 pb-5 space-y-4 border-t border-neutral-800/50 pt-4 bg-neutral-950/20">
                <div className="space-y-2">
                    <Label className="text-[11px] text-neutral-400 flex items-center gap-1.5 ml-0.5">
                        <Tag className="w-3 h-3" /> Display Name
                    </Label>
                    <Input
                        value={label}
                        onChange={(e) => onUpdate("meta", { label: e.target.value, description })}
                        placeholder="e.g., Process User Data"
                        className="bg-neutral-900 border-neutral-800 text-white focus:border-white/20 focus:ring-0 h-9"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] text-neutral-400 flex items-center gap-1.5 ml-0.5">
                        <Info className="w-3 h-3" /> Description
                    </Label>
                    <Textarea
                        value={description}
                        onChange={(e) => onUpdate("meta", { label, description: e.target.value })}
                        placeholder="Describe what this node does..."
                        className="bg-neutral-900 border-neutral-800 text-white focus:border-white/20 focus:ring-0 min-h-[80px] resize-none text-sm leading-relaxed"
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}