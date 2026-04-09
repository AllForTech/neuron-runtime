'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import {
  Plus,
  X,
  ChevronDown,
  GripVertical,
  Split,
  Type,
  Settings2,
  Trash2,
} from 'lucide-react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { getAvailableUpstreamNodes, cn } from '@/lib/utils';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DecisionNodeConfig, DecisionRule } from '@neuron/shared';

const TRANSFORMS = [
  'toLowerCase',
  'toUpperCase',
  'trim',
  'toString',
  'toNumber',
];
const OPERATORS = ['==', '!=', '>', '<', 'includes', 'exists'];

function DecisionConfigSheet({
  node,
  open,
  onOpen,
}: {
  node: Node;
  open: boolean;
  onOpen?: (open: boolean) => void;
}) {
  const {
    workflowEditorDispatch,
    editorState: {
      graph: { nodes, edges },
    },
  } = useWorkflowEditor();

  // 1. Initialize local state from node data
  const [config, setConfig] = useState<DecisionNodeConfig>({
    input: node.data?.input || '',
    inputTransforms: node.data?.inputTransforms || [],
    rules: node.data?.rules || [],
    includeDefault: node.data?.includeDefault ?? true,
    ...node.data,
  });

  const [openRules, setOpenRules] = useState<Record<string, boolean>>({});
  const availableVariables = getAvailableUpstreamNodes(node.id, {
    nodes,
    edges,
  });

  // 2. Debounced sync to global workflow state
  useEffect(() => {
    const hasChanged = JSON.stringify(config) !== JSON.stringify(node.data);
    if (!hasChanged) return;

    const timer = setTimeout(() => {
      workflowEditorDispatch({
        type: WorkflowEditorActionType.UPDATE_NODE,
        id: node.id,
        payload: config,
      });
    }, 300); // Standardized to 300ms for Neuron consistency

    return () => clearTimeout(timer);
  }, [config, node.id, workflowEditorDispatch]);

  const handleChange = (key: keyof DecisionNodeConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addRule = () => {
    if (config.rules.length >= 10) return; // Increased limit for complex flows
    const id = crypto.randomUUID();
    const newRule: DecisionRule = {
      id,
      operator: '==',
      value: '',
      transforms: [],
      label: `Case ${config.rules.length + 1}`,
    };
    handleChange('rules', [...config.rules, newRule]);
    setOpenRules((prev) => ({ ...prev, [id]: true }));
  };

  const updateRule = (id: string, patch: Partial<DecisionRule>) => {
    const nextRules = config.rules.map((r) =>
      r.id === id ? { ...r, ...patch } : r
    );
    handleChange('rules', nextRules);
  };

  const toggleTransform = (current: string[], t: string) =>
    current.includes(t) ? current.filter((x) => x !== t) : [...current, t];

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpen}
      nodeId={node.id}
      nodeMeta={config?.meta}
      onMetaUpdate={handleChange}
      className="h-full! w-[550px]! border-l border-neutral-800 bg-neutral-950/95 p-0! backdrop-blur-xl"
      title="Decision Logic"
    >
      <div className="mt-6 flex h-full flex-col space-y-6">
        {/* INPUT SOURCE SECTION */}
        <section className="shrink-0 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Type className="h-3.5 w-3.5 text-blue-500" />
            <label className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
              Evaluation Source
            </label>
          </div>
          <Card className="space-y-4 overflow-hidden border-neutral-800 bg-neutral-900/40 p-4 shadow-inner">
            <TemplateTextarea
              label="Variable Path"
              value={config.input}
              variables={availableVariables}
              onChange={(val) => handleChange('input', val)}
              placeholder="{{trigger.body.type}}"
              className="min-h-[80px] border-neutral-800 bg-black/40 font-mono text-[11px]"
            />
            <div className="space-y-2.5">
              <p className="text-[9px] font-bold tracking-tight text-neutral-600 uppercase">
                Input Pre-processing
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TRANSFORMS.map((t) => (
                  <Badge
                    key={t}
                    onClick={() =>
                      handleChange(
                        'inputTransforms',
                        toggleTransform(config.inputTransforms, t)
                      )
                    }
                    className={cn(
                      'cursor-pointer border px-2.5 py-0.5 text-[9px] transition-all select-none',
                      config.inputTransforms.includes(t)
                        ? 'border-blue-500/30 bg-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-700'
                    )}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* BRANCHING RULES SECTION */}
        <section className="flex min-h-0 flex-1 flex-col space-y-3">
          <div className="flex shrink-0 items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5 text-neutral-500" />
              <label className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                Output Branches
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addRule}
              className="h-7 border-neutral-800 bg-neutral-900/50 px-3 text-[10px] font-black text-blue-400 uppercase transition-all hover:border-blue-500/30 hover:bg-blue-500/10 active:scale-95"
            >
              <Plus className="mr-1.5 h-3 w-3" /> Add Case
            </Button>
          </div>

          <ScrollArea className="-mr-4 flex-1 pr-4">
            <div className="space-y-3 pb-8">
              {config.rules.map((rule, index) => (
                <Collapsible
                  key={rule.id}
                  open={openRules[rule.id]}
                  onOpenChange={(val) =>
                    setOpenRules((prev) => ({ ...prev, [rule.id]: val }))
                  }
                  className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/20 shadow-sm transition-all hover:border-neutral-700/80"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-neutral-800/30">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-600 transition-colors group-hover:text-blue-400">
                        <GripVertical className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col">
                        <span className="mb-1.5 text-[11px] leading-none font-bold text-neutral-200">
                          {rule.label || `Case ${index + 1}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge className="h-4 border-none bg-emerald-500/10 text-[8px] font-black text-emerald-500 uppercase">
                            {rule.operator}
                          </Badge>
                          <span className="max-w-[180px] truncate font-mono text-[10px] text-neutral-500">
                            {rule.operator === 'exists'
                              ? 'VALUE_PRESENT'
                              : rule.value || 'undefined'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-neutral-700 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="animate-in slide-in-from-top-2 space-y-5 border-t border-neutral-800/50 bg-black/40 p-5 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="px-1 text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
                          Operator
                        </label>
                        <Select
                          value={rule.operator}
                          onValueChange={(val: any) =>
                            updateRule(rule.id, { operator: val })
                          }
                        >
                          <SelectTrigger className="h-10 rounded-xl border-neutral-800 bg-neutral-950 text-[11px] focus:ring-0">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent className="border-neutral-800 bg-neutral-900">
                            {OPERATORS.map((op) => (
                              <SelectItem
                                key={op}
                                value={op}
                                className="text-[11px] text-white focus:bg-blue-500/10 focus:text-blue-400"
                              >
                                {op.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
                          Target Value
                        </label>
                        <TemplateTextarea
                          label=""
                          value={rule.value}
                          disabled={rule.operator === 'exists'}
                          variables={availableVariables}
                          onChange={(val) =>
                            updateRule(rule.id, { value: val })
                          }
                          placeholder="Value..."
                          className="h-10 rounded-xl border-neutral-800 bg-neutral-950 text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="px-1 text-[9px] font-bold tracking-widest text-neutral-600 uppercase">
                        Case Transforms
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {TRANSFORMS.map((t) => (
                          <Badge
                            key={t}
                            onClick={() =>
                              updateRule(rule.id, {
                                transforms: toggleTransform(rule.transforms, t),
                              })
                            }
                            className={cn(
                              'cursor-pointer border px-2.5 py-0.5 text-[9px] transition-all select-none',
                              rule.transforms.includes(t)
                                ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                                : 'border-neutral-800 bg-neutral-900 text-neutral-600 hover:border-neutral-700'
                            )}
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-800/50 pt-5">
                      <div className="space-y-1">
                        <Input
                          value={rule.label}
                          onChange={(e) =>
                            updateRule(rule.id, { label: e.target.value })
                          }
                          placeholder="Branch Alias..."
                          className="h-8 w-44 border-dashed border-neutral-800 bg-transparent text-[10px] transition-all focus:border-neutral-200/50"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleChange(
                            'rules',
                            config.rules.filter((r) => r.id !== rule.id)
                          )
                        }
                        className="h-8 px-3 text-[10px] font-bold text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove Case
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {config.rules.length === 0 && (
                <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-neutral-800 py-12">
                  <Split className="h-8 w-8 text-neutral-800" />
                  <p className="text-[11px] font-medium text-neutral-600 italic">
                    No output branches defined.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </section>
      </div>
    </SheetWrapper>
  );
}

export const DecisionNodeConfigSheet = memo(DecisionConfigSheet);
