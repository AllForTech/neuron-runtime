'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, SearchX, Loader2 } from 'lucide-react';
import { getAvailableNodes } from '@/lib/nodeCatalog/action';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeTemplateCard } from './NodeTemplateCard';
import { SINGLETON_NODE_TYPES } from '@/constants';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { NodeType } from '@neuron/shared';

const CATEGORIES = ['All', 'Trigger', 'Network', 'AI', 'Logic', 'Utility', 'Integration'];

export function NodeTemplateSheet({
                                      open,
                                      onOpenChange,
                                      onSelectTemplate,
                                  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectTemplate: (template: any) => void;
}) {
    // --- State Management ---
    const [nodes, setNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const { editorState } = useWorkflowEditor();

    // --- Fetch Logic: Calls Server Action when component mounts/opens ---
    useEffect(() => {
        async function fetchNodes() {
            if (!open && nodes.length > 0) return; // Prevent re-fetching if data exists and closed

            setIsLoading(true);
            try {
                const response = await getAvailableNodes();
                if (response.success && response.data) {
                    setNodes(response.data);
                }
            } catch (err) {
                console.error("Error fetching nodes:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchNodes();
    }, [open]); // Re-fetch or check on open

    const activeNodeTypes = useMemo(() =>
            Object.values(editorState.graph.nodes).map((n) => n.type),
        [editorState.graph.nodes]);

    // --- Filter Logic using fetched 'nodes' state ---
    const filteredNodes = useMemo(() => {
        return nodes.filter((node) => {
            // Singleton Logic
            const isSingleton = SINGLETON_NODE_TYPES.includes(node.type as any);
            if (isSingleton && activeNodeTypes.includes(node.type as NodeType)) return false;

            const matchesSearch = node.label.toLowerCase().includes(search.toLowerCase());
            const matchesCat = activeCategory === 'All' || node.category === activeCategory;

            return matchesSearch && matchesCat;
        });
    }, [search, activeCategory, activeNodeTypes, nodes]);

    return (
        <SheetWrapper
            title="Add Component"
            open={open}
            onOpenChange={onOpenChange}
            className="w-full sm:w-[500px]! border-l border-white/5 bg-[#050505] p-0! backdrop-blur-2xl"
        >
            <div className="flex h-full flex-col">
                {/* Header Section */}
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
                        <ScrollArea className="w-full whitespace-nowrap">
                            <TabsList className="bg-transparent h-auto p-0 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="px-4 py-2 rounded-full border border-white/5 data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        {cat}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>
                    </Tabs>
                </div>

                {/* Content Section */}
                <ScrollArea className="flex-1 px-6">
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-neutral-800" />
                        </div>
                    ) : filteredNodes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 pb-12">
                            {filteredNodes.map((node) => (
                                <NodeTemplateCard
                                    key={node.key}
                                    template={node}
                                    onSelect={() => {
                                        onSelectTemplate(node);
                                        onOpenChange(false);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                            <SearchX className="h-10 w-10 mb-4 stroke-[1.5]" />
                            <p className="text-sm font-medium">No components match your filter</p>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </SheetWrapper>
    );
}