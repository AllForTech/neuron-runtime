'use client';

import React from 'react';
import { NodeExecutionConfig } from '@neuron/shared';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Clock, RefreshCcw, ShieldAlert, Zap } from 'lucide-react';

export function ExecutionConfigSettings({
  config = {},
  onUpdate,
}: {
  config?: NodeExecutionConfig;
  onUpdate?: (config: NodeExecutionConfig) => void;
}) {
  const update = (path: string, value: any) => {
    const newConfig = { ...config };
    // Simple nested update logic
    const keys = path.split('.');
    let current = newConfig as any;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onUpdate?.(newConfig);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-300">
      {/* RETRY POLICY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-bold tracking-wider text-neutral-200 uppercase">
              Retry Strategy
            </h4>
          </div>
          <Switch
            checked={config.retry?.enabled}
            onCheckedChange={(val) => update('retry.enabled', val)}
          />
        </div>

        {config.retry?.enabled && (
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase">
                Max Attempts
              </Label>
              <Input
                type="number"
                value={config.retry.maxAttempts}
                onChange={(e) =>
                  update('retry.maxAttempts', parseInt(e.target.value))
                }
                className="h-8 bg-black text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase">
                Delay (ms)
              </Label>
              <Input
                type="number"
                value={config.retry.delayMs}
                onChange={(e) =>
                  update('retry.delayMs', parseInt(e.target.value))
                }
                className="h-8 bg-black text-xs"
              />
            </div>
          </div>
        )}
      </section>

      {/* TIMEOUT SETTINGS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-bold tracking-wider text-neutral-200 uppercase">
              Timeout Policy
            </h4>
          </div>
          <Switch
            checked={config.timeout?.enabled}
            onCheckedChange={(val) => update('timeout.enabled', val)}
          />
        </div>

        {config.timeout?.enabled && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase">
                Duration (milliseconds)
              </Label>
              <Input
                type="number"
                value={config.timeout.durationMs}
                onChange={(e) =>
                  update('timeout.durationMs', parseInt(e.target.value))
                }
                className="h-8 bg-black text-xs"
                placeholder="5000"
              />
            </div>
          </div>
        )}
      </section>

      {/* ERROR HANDLING */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <h4 className="text-xs font-bold tracking-wider text-neutral-200 uppercase">
            Fault Tolerance
          </h4>
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-neutral-300">
              Continue on Error
            </Label>
            <Switch
              checked={config.errorHandling?.continueOnError}
              onCheckedChange={(val) =>
                update('errorHandling.continueOnError', val)
              }
            />
          </div>
          <p className="text-[10px] leading-relaxed text-neutral-500 italic">
            If enabled, a failure in this node will not halt the entire workflow
            execution.
          </p>
        </div>
      </section>
    </div>
  );
}
