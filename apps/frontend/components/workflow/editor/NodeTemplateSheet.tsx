'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Zap,
  Cpu,
  Globe,
  Settings2,
  MessageSquare,
  Workflow,
  ArrowRight,
  SearchX,
} from 'lucide-react';
import { Node } from 'reactflow';

import {
  NODE_TEMPLATES,
  NodeTemplate,
  SINGLETON_NODE_TYPES,
} from '@/constants';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEditorState } from '@tiptap/react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { NodeType } from '@neuron/shared';

interface NodeTemplateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: NodeTemplate, node?: Node) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Nodes', icon: <Workflow className="h-3 w-3" /> },
  { id: 'Logic', label: 'Logic', icon: <Cpu className="h-3 w-3" /> },
  { id: 'Network', label: 'Network', icon: <Globe className="h-3 w-3" /> },
  { id: 'AI', label: 'Intelligence', icon: <Zap className="h-3 w-3" /> },
  {
    id: 'Communication',
    label: 'Integrations',
    icon: <MessageSquare className="h-3 w-3" />,
  },
];

export function NodeTemplateSheet({
  open,
  onOpenChange,
  onSelectTemplate,
}: NodeTemplateSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { editorState } = useWorkflowEditor();

  const activeNodeTypes = useMemo(() => {
    return Object.values(editorState.graph.nodes).map((node) => node.type);
  }, [editorState.graph.nodes]);

  const filteredTemplates = useMemo(() => {
    return NODE_TEMPLATES.filter((template) => {
      // Check if this specific template type is restricted to one instance
      const isSingleton = SINGLETON_NODE_TYPES.includes(template.type);

      // Check if a node of this type already exists in the workflow
      const alreadyExists = activeNodeTypes.includes(template.type as NodeType);

      // If it's a singleton and it already exists, HIDE it from the list
      if (isSingleton && alreadyExists) {
        return false;
      }

      const matchesSearch =
        template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeTab === 'all' || template.category === activeTab;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab, activeNodeTypes]);

  return (
    <SheetWrapper
      title="Add Node"
      open={open}
      onOpenChange={onOpenChange}
      className="w-[550px]! border-l border-neutral-800 bg-neutral-950/98 p-0! backdrop-blur-xl"
    >
      <div className="flex h-full flex-col">
        {/* SEARCH HEADER */}
        <div className="space-y-4 p-4 pb-2">
          <div className="group relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-blue-500" />
            <Input
              placeholder="Search nodes (e.g. 'Slack', 'Filter'...)"
              className="focus-visible:ring-primary border-neutral-800 bg-neutral-900/50 pl-10 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="max-w-[500px]"
          >
            <div
              id={'hide-scrollbar'}
              className="w-full overflow-x-scroll pb-2"
            >
              <TabsList className="inline-flex h-auto w-max min-w-full items-center justify-start gap-1 border border-neutral-800 bg-neutral-900/50 p-1">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className={cn(
                      'flex-shrink-0 whitespace-nowrap',
                      'data-[state=active]:bg-neutral-800 data-[state=active]:text-white',
                      'gap-2 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all',
                      activeTab === cat.id &&
                        'data-[state=active]:bg-primary! data-[state=active]:text-black!'
                    )}
                  >
                    {cat.icon}
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* TEMPLATES GRID */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 py-4">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 pb-10">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.key}
                    template={template}
                    onClick={() => {
                      onSelectTemplate(template);
                      onOpenChange(false);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-20 text-center">
                <div className="rounded-full bg-neutral-900 p-4">
                  <SearchX className="h-8 w-8 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">
                    No nodes found
                  </p>
                  <p className="text-xs text-neutral-600">
                    Try adjusting your search or category filter
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </SheetWrapper>
  );
}

function TemplateCard({
  template,
  onClick,
}: {
  template: NodeTemplate;
  onClick: () => void;
}) {
  // Determine color based on category
  const categoryColors: Record<string, string> = {
    Logic: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    AI: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    Network: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Communication: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Utility: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
  };

  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-4 text-left transition-all hover:border-neutral-700 hover:bg-neutral-800/40"
    >
      <div
        className={cn(
          'shrink-0 rounded-lg border p-2.5 transition-transform group-hover:scale-110',
          categoryColors[template.category] || categoryColors.Utility
        )}
      >
        {/* Dynamically render icons based on type or key */}
        {getIconForType(template.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-bold text-neutral-200 transition-colors group-hover:text-white">
            {template.label}
          </span>
          <Badge
            variant="outline"
            className="h-4 border-neutral-800 py-0 text-[9px] tracking-tighter text-neutral-500 uppercase"
          >
            {template.category}
          </Badge>
        </div>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-500">
          {template.description}
        </p>
      </div>

      <div className="-translate-x-2 self-center opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
        <ArrowRight className="h-4 w-4 text-blue-500" />
      </div>
    </button>
  );
}

function getIconForType(type: string) {
  switch (type) {
    case 'llmNode':
      return <Zap className="h-4 w-4" />;
    case 'httpNode':
      return <Globe className="h-4 w-4" />;
    case 'condition':
    case 'decisionNode':
      return <Cpu className="h-4 w-4" />;
    case 'transform':
      return <Settings2 className="h-4 w-4" />;
    default:
      return <Workflow className="h-4 w-4" />;
  }
}
