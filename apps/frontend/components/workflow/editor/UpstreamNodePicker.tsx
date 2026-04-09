'use client';

import React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Zap,
  Globe,
  GitBranch,
  Code,
  Database,
  Lock,
  Loader2,
  Plus,
  ShieldCheck,
  Variable,
  Cpu,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVault } from '@/hooks/useVault';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';

const nodeIcons: Record<string, React.ReactNode> = {
  trigger: <Zap className="h-3 w-3 text-amber-500" />,
  httpNode: <Globe className="h-3 w-3 text-blue-400" />,
  condition: <GitBranch className="h-3 w-3 text-orange-400" />,
  transform: <Code className="h-3 w-3 text-purple-400" />,
  database: <Database className="h-3 w-3 text-emerald-400" />,
};

export function UpstreamNodePicker({
  nodes,
  onSelect,
  className,
}: {
  nodes: { id: string; type: string }[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}) {
  const { secrets, isLoading: isSecretLoading } = useVault();
  const {
    editorState: { globalVariables },
    setIsGlobalVariableSheetOpen,
  } = useWorkflowEditor();

  return (
    <Command
      id={'hide-scrollbar'}
      className={cn(
        'animate-in fade-in zoom-in-95 w-72 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 p-0.5 shadow-2xl transition-all duration-100',
        className
      )}
    >
      {/* --- UTILITY HEADER --- */}
      <div className="flex items-center justify-between border-b border-neutral-900/50 px-3 pt-3 pb-1">
        <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] text-neutral-500 uppercase">
          <Layers className="h-3 w-3" /> Data Context
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setIsGlobalVariableSheetOpen(true)}
            className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
            title="New Variable"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <CommandInput
        placeholder="Search variables or nodes..."
        className="h-10 border-none text-[11px] placeholder:text-neutral-700 focus:ring-0"
      />

      <CommandList
        id={'hide-scrollbar'}
        className="no-scrollbar mask-fade-bottom max-h-64 py-1"
      >
        <CommandEmpty className="py-6 text-center font-mono text-[10px] text-neutral-600 italic">
          No results found in current context.
        </CommandEmpty>

        {isSecretLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-700" />
          </div>
        ) : (
          <>
            {/* 1. PRIORITY: UPSTREAM NODES */}
            {nodes.length > 0 && (
              <CommandGroup
                id={'hide-scrollbar'}
                heading={
                  <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-neutral-600 uppercase">
                    <Cpu className="h-3 w-3" /> Upstream Nodes
                  </div>
                }
                className="px-2"
              >
                {nodes.map((node) => (
                  <CommandItem
                    key={node.id}
                    onSelect={() => onSelect(node.id)}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11px] aria-selected:bg-white/5"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 group-aria-selected:border-neutral-700">
                      {nodeIcons[node.type] || (
                        <Code className="h-3 w-3 text-neutral-500" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate leading-tight font-medium text-neutral-300">
                        {node.id}
                      </span>
                      <span className="font-mono text-[9px] tracking-tighter text-neutral-600 uppercase">
                        {node.type}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* 2. PRIORITY: GLOBAL REGISTRY */}
            {globalVariables && Object.keys(globalVariables).length > 0 && (
              <CommandGroup
                id={'hide-scrollbar'}
                heading={
                  <div className="mt-2 mb-1 flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-neutral-600 uppercase">
                    <Variable className="h-3 w-3" /> Global Variables
                  </div>
                }
                className="px-2"
              >
                {Object.entries(globalVariables).map(([key]) => (
                  <CommandItem
                    key={key}
                    onSelect={() => onSelect(`Global.${key}`)}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11px] aria-selected:bg-blue-500/10"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-blue-500/10 bg-blue-500/5 group-aria-selected:border-blue-500/30">
                      <Variable className="h-3 w-3 text-blue-500" />
                    </div>
                    <span className="truncate font-mono font-medium tracking-tight text-neutral-300">
                      {key}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* 3. PRIORITY: SECRETS VAULT */}
            {secrets.length > 0 && (
              <CommandGroup
                id={'hide-scrollbar'}
                heading={
                  <div className="mt-2 mb-1 flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-neutral-600 uppercase">
                    <ShieldCheck className="h-3 w-3" /> Security Vault
                  </div>
                }
                className="px-2"
              >
                {secrets.map((v) => (
                  <CommandItem
                    key={v.id}
                    onSelect={() => onSelect(`Vault.${v.name}`)}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11px] aria-selected:bg-emerald-500/10"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-emerald-500/10 bg-emerald-500/5 group-aria-selected:border-emerald-500/30">
                      <Lock className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="truncate font-medium text-neutral-300">
                      {v.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>

      {/* --- ACTION FOOTER --- */}
      <div className="border-t border-neutral-900/50 bg-neutral-900/40 p-2">
        <button
          onClick={() => {
            /* Open Settings */
          }}
          className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[10px] text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-3 w-3 text-neutral-600 group-hover:text-blue-400" />
            <span>Add external data source...</span>
          </div>
          <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100" />
        </button>
      </div>
    </Command>
  );
}
