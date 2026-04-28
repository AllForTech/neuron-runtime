'use client';

import React, { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeTemplateCard } from './NodeTemplateCard';
import { SINGLETON_NODE_TYPES } from '@/constants';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import {NodeDefinition, NodeType} from '@neuron/shared';

const CATEGORIES = ['All', 'Trigger', 'Network', 'AI', 'Logic', 'Utility', 'Integration'];

export function NodeTemplateSheet({
                                      open,
                                      onOpenChange,
                                      onSelectTemplate,
                                  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectTemplate: (template: any, node?: any) => void;
}) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const { editorState, nodeCatalog, selectedNode } = useWorkflowEditor();

    const activeNodeTypes = useMemo(() =>
            Object.values(editorState.graph.nodes)?.map((n) => n?.type),
        [editorState.graph.nodes]);

    const filteredNodes = useMemo(() => {
        if (!nodeCatalog) return [];
        return nodeCatalog.filter((node) => {
            const isSingleton = SINGLETON_NODE_TYPES.includes(node.type as any);
            if (isSingleton && activeNodeTypes.includes(node.type as NodeType)) return false;

            const matchesSearch = node?.template.label?.toLowerCase()?.includes(search?.toLowerCase());
            const matchesCat = activeCategory === 'All' || node?.template?.category === activeCategory;

            return matchesSearch && matchesCat;
        });
    }, [search, activeCategory, activeNodeTypes, nodeCatalog]);

    return (
        <SheetWrapper
            title="Add Component"
            open={open}
            onOpenChange={onOpenChange}
            className="w-[450px] sm:w-[550px] lg:w-[600px] border-l border-white/5 bg-[#050505] p-0! backdrop-blur-2xl overflow-visible!"
        >
            <div className="flex h-full flex-col overflow-visible!">
                <div className="p-6 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-white" />
                        <Input
                            placeholder="Search components..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 pl-11 bg-white/[0.03] border-white/5 rounded-2xl focus:border-white/20 transition-all text-sm"
                        />
                    </div>

                    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                        <ScrollArea className="w-[400px] sm:w-[500px] lg:w-[550px] whitespace-nowrap">
                            <TabsList className="bg-transparent h-auto p-0 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="px-4 py-2 rounded-xl border border-white/5 data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        {cat}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-visible px-3.5 custom-scrollbar">
                    {filteredNodes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 pb-20 overflow-visible!">
                            {filteredNodes.map((node) => (
                                <NodeTemplateCard
                                    key={node?.template?.key}
                                    template={node?.template}
                                    onSelect={() => {
                                        onSelectTemplate({ type: node.type, template: node.template }, selectedNode);
                                        onOpenChange(false);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <SearchX className="h-12 w-12 mb-4 stroke-[1]" />
                            <p className="text-sm font-medium tracking-tight">No components found</p>
                        </div>
                    )}
                </div>
            </div>
        </SheetWrapper>
    );
}