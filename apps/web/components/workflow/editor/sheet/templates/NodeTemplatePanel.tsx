'use client';

import React, { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeTemplateCard } from './NodeTemplateCard';
import { SINGLETON_NODE_TYPES } from '@/constants';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { NodeType } from '@neuron/shared';

const CATEGORIES = ['All', 'Trigger', 'Network', 'AI', 'Logic', 'Utility', 'Integration'];

export default function NodeTemplatePanel() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const { editorState, nodeCatalog, selectedNode, handleSelectTemplate } = useWorkflowEditor();

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
        <div className="flex h-full flex-col bg-transparent overflow-hidden">
            {/* Compact Header */}
            <div className="p-3 space-y-3 border-b border-white/[0.05]">
                <div className="relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600 transition-colors group-focus-within:text-neutral-400" />
                    <Input
                        placeholder="Search nodes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 bg-white/[0.03] border-white/5 rounded-md focus:border-white/10 transition-all text-[11px]"
                    />
                </div>

                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                    <div className="overflow-x-auto no-scrollbar">
                        <TabsList className="bg-transparent h-auto p-0 gap-1 flex flex-nowrap">
                            {CATEGORIES.map((cat) => (
                                <TabsTrigger
                                    key={cat}
                                    value={cat}
                                    className="px-2.5 py-1 rounded-md border border-white/5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap"
                                >
                                    {cat}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </Tabs>
            </div>

            {/* List View - Fixed Overflow */}
            <div className="flex-1 overflow-y-auto px-2 py-3 no-scrollbar! custom-scrollbar">
                {filteredNodes.length > 0 ? (
                    <div className="flex flex-col gap-1.5 pb-10">
                        {filteredNodes.map((node) => (
                            <NodeTemplateCard
                                key={node?.template?.key}
                                template={node?.template}
                                onSelect={() => handleSelectTemplate(node, selectedNode)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                        <SearchX className="h-8 w-8 mb-2 stroke-[1]" />
                        <p className="text-[10px] font-medium uppercase tracking-widest">Empty Workspace</p>
                    </div>
                )}
            </div>
        </div>
    );
}