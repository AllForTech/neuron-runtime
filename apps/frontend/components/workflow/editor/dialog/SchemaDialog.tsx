import React from 'react';
import {
  Braces,
  Cpu,
  ExternalLink,
  Info,
  Maximize2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import CodeEditor from '@/components/workflow/editor/CodeEditor';
import { cn } from '@/lib/utils';

interface SchemaEditorProps {
  value: string;
  onChange: (key: string, val: string) => void;
}

export function SchemaDialog({ value, onChange }: SchemaEditorProps) {
  const hasValue = typeof value === 'string' && value?.trim()?.length > 0;

  const defaultTemplate = `{
  name: z.string().describe("User's full name"),
  age: z.number().positive(),
  interests: z.array(z.string())
}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            'group flex w-full items-center justify-between rounded-2xl border p-5 transition-all active:scale-[0.99]',
            hasValue
              ? 'border-emerald-500/30 bg-emerald-500/[0.03] shadow-[0_0_20px_rgba(16,185,129,0.05)]'
              : 'border-neutral-800 bg-white/[0.03] hover:border-neutral-700'
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'rounded-xl p-2.5 transition-colors',
                hasValue
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-white/5 text-neutral-400 group-hover:text-white'
              )}
            >
              <Braces className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold tracking-tight text-white">
                  Output Schema
                </p>
                {hasValue && (
                  <div className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5">
                    <span className="text-[9px] font-bold tracking-tighter text-emerald-500 uppercase">
                      Updated
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-0.5 text-[12px] text-neutral-500">
                {hasValue
                  ? 'Structured JSON output configured'
                  : 'Define AI output structure'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p
                className={cn(
                  'font-mono text-[10px] font-medium tracking-widest uppercase',
                  hasValue ? 'text-emerald-500' : 'text-neutral-600'
                )}
              >
                {hasValue ? 'Configured' : 'Empty'}
              </p>
            </div>
            <Maximize2
              className={cn(
                'h-4 w-4 transition-colors',
                hasValue
                  ? 'text-emerald-500'
                  : 'text-neutral-600 group-hover:text-white'
              )}
            />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="w-2xl overflow-hidden rounded-xl border-neutral-800 bg-neutral-950 p-0 shadow-2xl backdrop-blur-xl sm:max-w-lg">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2">
              <Cpu className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-white">
                Output Schema
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                Define the exact JSON structure the AI must return using
                Zod-like syntax.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 p-6 pt-2">
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl">
            {/* Code Editor */}
            <CodeEditor
              value={value || ''}
              onChange={(val: string) => onChange('outputSchema', val)}
              height="290px"
              className="max-w-full! border-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-emerald-500" />
              <span className="max-w-[420px] text-[11px] leading-normal text-neutral-400">
                Constrain the AI using{' '}
                <code className="text-white">z.string()</code>,{' '}
                <code className="text-white">z.number()</code>, and{' '}
                <code className="text-white">.describe()</code>.
              </span>
            </div>
            <Button
              size="sm"
              variant="default"
              className="h-8 p-3 py-5! text-xs font-semibold transition-colors"
              onClick={() => onChange('outputSchema', defaultTemplate)}
            >
              Load Boilerplate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
