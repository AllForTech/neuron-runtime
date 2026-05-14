"use client";

import { Box, Database, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonRenderer } from '@/components/JsonRenederer';

export function ExecutionDataInspector({ selectedLog }: { selectedLog: any }) {
  const hasError = selectedLog?.error;

  return (
    <Tabs defaultValue="output" className="w-full">
      <TabsList className="mb-3 w-fit border border-white/10 bg-white/[0.02] p-0.5">
        <TabsTrigger
          value="input"
          className="px-3 py-1.5 text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-primary"
        >
          <Box className="mr-1.5 h-3 w-3" /> Input
        </TabsTrigger>
        <TabsTrigger
          value="output"
          className="px-3 py-1.5 text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-primary"
        >
          <Database className="mr-1.5 h-3 w-3 text-emerald-500" /> Output
        </TabsTrigger>
        {hasError && (
          <TabsTrigger
            value="error"
            className="px-3 py-1.5 text-[10px] text-red-400 data-[state=active]:bg-red-500/10"
          >
            <AlertCircle className="mr-1.5 h-3 w-3" /> Error
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="input" className="mt-0">
        <div className="rounded-lg border border-white/5 bg-neutral-950/50 p-2">
          <JsonRenderer
            data={selectedLog.input || {}}
            maxHeight="max-h-[200px]"
            className="max-h-[200px] text-[11px]"
          />
        </div>
      </TabsContent>

      <TabsContent value="output" className="mt-0">
        <div className="rounded-lg border border-white/5 bg-neutral-950/50 p-2">
          <JsonRenderer
            data={selectedLog.output || {}}
            maxHeight="max-h-[200px]"
            className="max-h-[200px] text-[11px]"
          />
        </div>
      </TabsContent>

      {hasError && (
        <TabsContent value="error" className="mt-0">
          <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-3 text-[11px] text-red-400">
            <JsonRenderer
              data={selectedLog?.error || {}}
              maxHeight="max-h-[200px]"
              className="max-h-[200px]"
            />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}