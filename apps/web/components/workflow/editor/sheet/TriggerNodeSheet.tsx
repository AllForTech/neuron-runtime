'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Globe,
  Clock,
  MousePointerIcon,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { TriggerNodeConfig } from '@neuron/shared'; // Assuming schema type exists

function TriggerConfigSheet({
  node,
  open,
  onOpen,
}: {
  node: Node;
  open: boolean;
  onOpen: (open: boolean) => void;
}) {
  const { workflowEditorDispatch } = useWorkflowEditor();

  // 1. Initialize local state from node data
  const [config, setConfig] = useState<TriggerNodeConfig>({
    name: 'Primary Inbound Entry',
    triggerType: 'manual',
    cron: '* * * * *',
    webhookUrl: '',
    ...node.data,
  });

  // 2. Standard Debounced Sync to Global State
  useEffect(() => {
    const hasChanged = JSON.stringify(config) !== JSON.stringify(node.data);
    if (!hasChanged) return;

    const timer = setTimeout(() => {
      workflowEditorDispatch({
        type: WorkflowEditorActionType.UPDATE_NODE,
        id: node.id,
        payload: config,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [config, node.id, workflowEditorDispatch]);

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SheetWrapper
      nodeId={node.id}
      open={open}
      onOpenChange={onOpen}
      nodeMeta={config.meta}
      onMetaUpdate={handleChange}
      executionConfig={config.executionConfig}
      onExecutionConfigUpdate={(newExec) =>
        handleChange('executionConfig', newExec)
      }
      title="Trigger Initiation"
      className="w-[500px]! border-l border-neutral-900 bg-neutral-950/95 p-0! backdrop-blur-2xl"
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* STATUS SUB-HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/40 px-6 py-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-neutral-500" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
              Entry Protocol // Root
            </span>
          </div>
        </div>

        <div className="space-y-8 p-6">
          {/* SECTION: IDENTITY */}
          <section className="space-y-4">
            <div className="space-y-1.5">
              <Label className="ml-1 text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                Friendly Name
              </Label>
              <Input
                value={' '}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Primary Inbound Entry"
                className="h-10 rounded-xl border-neutral-800 bg-neutral-900/50 text-xs transition-all focus:border-white/20"
              />
            </div>
          </section>

          {/* SECTION: TRIGGER TYPE */}
          <section className="space-y-4">
            <header className="flex items-center gap-2 px-1 text-neutral-400">
              <MousePointerIcon size={12} />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Activation Method
              </span>
            </header>

            <RadioGroup
              value={config.triggerType}
              onValueChange={(value) => handleChange('triggerType', value)}
              className="grid grid-cols-1 gap-3"
            >
              <TriggerTypeOption
                value="manual"
                icon={MousePointerIcon}
                title="Manual Execution"
                description="Trigger this sequence directly from the dashboard."
                isActive={config.triggerType === 'manual'}
              />
              <TriggerTypeOption
                value="webhook"
                icon={Globe}
                title="External Webhook"
                description="Invoke via an HTTP POST request from another service."
                isActive={config.triggerType === 'webhook'}
              />
              <TriggerTypeOption
                value="schedule"
                icon={Clock}
                title="Scheduled Interval"
                description="Automate execution based on a specific time frequency."
                isActive={config.triggerType === 'schedule'}
              />
            </RadioGroup>
          </section>

          {/* SECTION: CONDITIONAL PARAMS */}
          {config.triggerType === 'schedule' && (
            <section className="animate-in fade-in slide-in-from-top-2 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 duration-300">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Cron Schedule
                </Label>
                <Input
                  value={''}
                  onChange={(e) => handleChange('cron', e.target.value)}
                  placeholder="* * * * *"
                  className="h-10 rounded-lg border-neutral-800 bg-black/40 font-mono tracking-widest text-emerald-400"
                />
              </div>
              <p className="text-[10px] leading-relaxed text-neutral-500 italic">
                Sequence will resolve based on standard crontab syntax.
              </p>
            </section>
          )}

          {config.triggerType === 'webhook' && (
            <section className="animate-in fade-in slide-in-from-top-2 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 duration-300">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Endpoint URL
                </Label>
                <Input
                  readOnly
                  value={`https://api.neuron.engine/v1/wh/${node.id}`}
                  className="h-10 truncate rounded-lg border-neutral-800 bg-black/40 font-mono text-[11px] text-blue-400"
                />
              </div>
              <div className="flex items-start gap-2 text-[10px] text-neutral-500">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-neutral-600" />
                <span>
                  Requests are authenticated via your Workspace API Key.
                </span>
              </div>
            </section>
          )}
        </div>
      </div>
    </SheetWrapper>
  );
}

// Helper component for the activation options
function TriggerTypeOption({
  value,
  icon: Icon,
  title,
  description,
  isActive,
}: any) {
  return (
    <Label
      className={`group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
        isActive
          ? 'border-white/20 bg-white/5 shadow-[0_0_20px_-12px_rgba(255,255,255,0.2)]'
          : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
      } `}
    >
      <RadioGroupItem value={value} className="sr-only" />
      <div
        className={`mt-0.5 rounded-xl border p-2 transition-colors ${isActive ? 'border-white bg-white text-black' : 'border-neutral-800 bg-neutral-950 text-neutral-500 group-hover:border-neutral-700'} `}
      >
        <Icon size={16} />
      </div>
      <div className="space-y-1">
        <p
          className={`text-xs font-bold tracking-tight ${isActive ? 'text-white' : 'text-neutral-400'}`}
        >
          {title}
        </p>
        <p className="text-[10px] leading-relaxed font-medium text-neutral-500">
          {description}
        </p>
      </div>
    </Label>
  );
}

export const TriggerNodeConfigSheet = memo(TriggerConfigSheet);
