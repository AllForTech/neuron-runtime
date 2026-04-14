'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sparkles, Shield, MessageSquare, Maximize2 } from 'lucide-react';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';

interface PromptOrchestratorProps {
  systemPrompt: string;
  userPrompt: string;
  variables: any[];
  onUpdate: (key: string, value: string) => void;
  modelName?: string;
}

export const PromptOrchestrator = ({
  systemPrompt,
  userPrompt,
  variables,
  onUpdate,
  modelName = 'AI Model',
}: PromptOrchestratorProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="group flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-white/[0.03] p-5 transition-all hover:border-neutral-700 active:scale-[0.99]">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/5 p-2.5 text-neutral-400 transition-colors group-hover:text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-[14px] font-semibold tracking-tight text-white">
                Prompt Orchestrator
              </p>
              <p className="mt-0.5 text-[12px] text-neutral-500">
                Configure behavior and instructions
              </p>
            </div>
          </div>
          <Maximize2 className="h-4 w-4 text-neutral-600 transition-colors group-hover:text-white" />
        </button>
      </DialogTrigger>

      <DialogContent className="flex h-[83vh] max-w-2xl flex-col overflow-hidden border-neutral-800 bg-neutral-950 p-0 shadow-2xl backdrop-blur-xl">
        {/* STICKY HEADER */}
        <DialogHeader className="border-b border-neutral-900 bg-neutral-950/50 px-8 py-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <Sparkles className="h-4 w-4 text-black" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-white">
                AI Orchestration
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                Refine the logic for {modelName}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* SCROLLABLE EDITOR AREA */}
        <ScrollArea className="h-[50dvh] flex-1">
          <div className="p-8 py-1!">
            <Accordion
              type="multiple"
              defaultValue={['system', 'prompt']}
              className="space-y-4"
            >
              {/* SYSTEM PERSONA SECTION */}
              <AccordionItem
                value="system"
                className="rounded-xl border border-neutral-800 bg-white/[0.01] px-2"
              >
                <AccordionTrigger className="group px-4 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-white" />
                    <span className="text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
                      System Persona
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-4">
                  <TemplateTextarea
                    value={systemPrompt}
                    onChange={(val) => onUpdate('systemPrompt', val)}
                    variables={variables}
                    className="min-h-[160px] resize-none rounded-lg border-neutral-800 bg-transparent p-4 text-[14px] leading-relaxed text-neutral-300 transition-all focus:border-white/30"
                    placeholder="Describe how the AI should act..."
                  />
                </AccordionContent>
              </AccordionItem>

              {/* USER PROMPT SECTION */}
              <AccordionItem
                value="prompt"
                className="rounded-xl border border-neutral-800 bg-white/[0.01] px-2"
              >
                <AccordionTrigger className="group px-4 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-white" />
                    <span className="text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
                      Prompt
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-4">
                  <TemplateTextarea
                    value={userPrompt}
                    onChange={(val) => onUpdate('userPrompt', val)}
                    variables={variables}
                    className="min-h-[280px] resize-none rounded-lg border-neutral-800 bg-transparent p-4 text-[14px] leading-relaxed text-neutral-300 transition-all focus:border-white/30"
                    placeholder="Enter instructions and use {{variables}}..."
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>

        {/* STICKY FOOTER */}
        <div className="flex items-center justify-between border-t border-neutral-900 bg-neutral-950/80 p-6 px-8 backdrop-blur-md">
          <div className="text-[11px] font-medium text-neutral-500">
            CHANGES ARE SAVED AUTOMATICALLY
          </div>
          <div className="flex items-center gap-3">
            <DialogTrigger asChild>
              <Button className="h-10 rounded-lg bg-white px-10 font-bold text-black transition-colors hover:bg-neutral-200">
                Close
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
