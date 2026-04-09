import { Box, Database, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonRenderer } from '@/components/JsonRenederer';

export function ExecutionDataInspector({ selectedLog }: { selectedLog: any }) {
  return (
    <Tabs defaultValue="output" className="w-full">
      <TabsList className="mb-4 w-fit border border-neutral-800 bg-neutral-900 p-0.5">
        <TabsTrigger
          value="input"
          className="px-4 py-1.5 text-[10px] tracking-widest uppercase data-[state=active]:bg-white/10"
        >
          <Box className="mr-2 h-3 w-3" /> Input
        </TabsTrigger>
        <TabsTrigger
          value="output"
          className="px-4 py-1.5 text-[10px] tracking-widest uppercase data-[state=active]:bg-white/10"
        >
          <Database className="mr-2 h-3 w-3 text-emerald-500" /> Output
        </TabsTrigger>
        {selectedLog.error && (
          <TabsTrigger
            value="error"
            className="px-4 py-1.5 text-[10px] tracking-widest text-red-400 uppercase"
          >
            <AlertCircle className="mr-2 h-3 w-3" /> Error
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="input" className="mt-0">
        <div className="overflow-hidden rounded-xl">
          <JsonRenderer
            data={selectedLog.input || {}}
            maxHeight="max-h-[300px]"
            className="no-scrollbar m-0! max-h-[500px] min-h-[150px] max-w-full overflow-x-auto border-0! bg-transparent! text-[11px]"
          />
        </div>
      </TabsContent>

      <TabsContent value="output" className="mt-0">
        <div className="overflow-hidden rounded-xl border border-white/5 bg-neutral-950 p-2">
          <JsonRenderer
            data={selectedLog.output || {}}
            maxHeight="max-h-[300px]"
            className="no-scrollbar h-fit! max-h-[500px] max-w-full overflow-x-auto text-[11px]"
          />
        </div>
      </TabsContent>

      {selectedLog.error && (
        <TabsContent value="error" className="mt-0">
          <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4 font-mono text-[11px] leading-relaxed text-red-400">
            <JsonRenderer
              data={selectedLog?.error || {}}
              maxHeight="max-h-[300px]"
              className="no-scrollbar h-fit max-h-[500px]! max-w-full overflow-x-auto text-[11px]"
            />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
