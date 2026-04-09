'use client';

import React, { useState } from 'react';
import {
  Globe,
  Lock,
  Zap,
  Copy,
  Check,
  Settings2,
  ShieldCheck,
  Rocket,
  AlertTriangle,
  RefreshCw,
  Activity,
  Trash2,
  Calendar,
  Hash,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorPanel } from '../EditorPanel';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { AppButton } from '@/components/CustomButton';
import { cn, getBackendEndpoint } from '@/lib/utils';

export function DeployWorkflowPanel({
  isOpen,
  onOpenChange,
  workflowName = 'untitled',
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workflowName: string;
}) {
  const { editorState, deployWorkflow, deleteDeployment, isDeploying } =
    useWorkflowEditor();

  const [isPrivate, setIsPrivate] = useState(true);
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false); // Separate state for URL copy
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const generateKey = () => {
    const result = `nrn_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setSecretKey(result);
    setShowKey(true);
  };

  const copyToClipboard = (val: string, isUrl = false) => {
    navigator.clipboard.writeText(val);
    if (isUrl) {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Deterministic URL based on your backend structure
  const deployedUrl = `${getBackendEndpoint()}/execute/workflow/${editorState.deployment?.id}`;

  return (
    <EditorPanel
      open={isOpen}
      onOpenChange={onOpenChange}
      title={
        editorState.deployment ? 'Deployment Status' : `Deploy ${workflowName}`
      }
      icon={
        editorState.deployment ? (
          <Activity size={20} className="text-emerald-500" />
        ) : (
          <ShieldCheck size={20} />
        )
      }
      description={
        editorState.deployment
          ? 'Monitoring live orchestration instance.'
          : 'Finalize your orchestration mesh and security parameters.'
      }
      position="Top Center"
      className="h-fit max-h-[600px] p-3"
      width="w-[550px]"
    >
      <div className="flex flex-col gap-6 py-2">
        <AnimatePresence mode="wait">
          {editorState.deployment !== null ? (
            /* --- ACTIVE DEPLOYMENT DASHBOARD --- */
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Live Badge Card */}
              <div className="flex items-center justify-between rounded-[2rem] border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <Rocket size={20} />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full border-2 border-[#0a0a0a] bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.2em] text-emerald-500 uppercase">
                      Instance Active
                    </p>
                    <h4 className="text-sm font-semibold tracking-tight text-white">
                      {editorState.deployment?.name ||
                        editorState.workflow.name}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-[9px] font-bold tracking-widest text-neutral-600 uppercase">
                    Status
                  </p>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-500">
                    HEALTHY
                  </span>
                </div>
              </div>

              {/* --- NEW: PRODUCTION ENDPOINT LAYER --- */}
              <div className="space-y-3">
                <div className="ml-1 flex items-center gap-2">
                  <Globe size={12} className="text-primary" />
                  <Label className="text-[10px] font-black tracking-widest text-neutral-600 uppercase">
                    Production Endpoint
                  </Label>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      value={deployedUrl}
                      className="text-primary h-10 rounded-xl border-white/5 bg-black/40 pr-10 font-mono text-[11px] focus-visible:ring-0"
                    />
                    <ExternalLink
                      size={10}
                      className="text-primary absolute top-3.5 right-3 opacity-20"
                    />
                  </div>
                  <AppButton
                    icon={
                      urlCopied ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )
                    }
                    label={urlCopied ? 'Copied' : 'Copy'}
                    onClick={() => copyToClipboard(deployedUrl, true)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 text-[10px] font-black text-white transition-all hover:bg-white/10"
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <DetailCard
                  icon={<Hash size={14} />}
                  label="Deployment ID"
                  value={editorState.deployment?.id?.slice(0, 18) + '...'}
                />
                <DetailCard
                  icon={<Calendar size={14} />}
                  label="Deployed At"
                  value={new Date(
                    editorState.deployment?.createdAt
                  ).toLocaleDateString()}
                />
                <DetailCard
                  icon={<Lock size={14} />}
                  label="Security"
                  value={
                    editorState.deployment?.private
                      ? 'Private Key'
                      : 'Public Access'
                  }
                />
                <DetailCard
                  icon={<Settings2 size={14} />}
                  label="Environment"
                  value="Production"
                />
              </div>

              {/* Danger Zone */}
              <div className="flex items-center justify-between border-t border-neutral-800/50 pt-6">
                <div>
                  <h5 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                    Danger Zone
                  </h5>
                  <p className="mt-1 text-[10px] text-neutral-600">
                    This will instantly kill the production API endpoint.
                  </p>
                </div>
                <AppButton
                  icon={<Trash2 size={14} />}
                  label="Delete"
                  variant="ghost"
                  onClick={() => deleteDeployment()}
                  className="rounded-xl border border-red-500/10 bg-red-500/5 px-6 text-[10px] font-black tracking-widest text-red-500 uppercase transition-all hover:bg-red-500 hover:text-white"
                />
              </div>
            </motion.div>
          ) : (
            /* --- CREATE DEPLOYMENT SECTION --- */
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Visibility Toggle */}
              <div
                onClick={() => setIsPrivate(!isPrivate)}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.06]"
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    {isPrivate ? (
                      <Lock size={16} className="text-neutral-500" />
                    ) : (
                      <Globe size={16} className="text-primary animate-pulse" />
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-white">
                      Private Execution
                    </Label>
                    <p className="mt-0.5 text-[10px] leading-tight text-neutral-500">
                      {isPrivate
                        ? 'Requires X-Neuron-Key for all API requests.'
                        : 'Open endpoint. Accessible without auth.'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Security Layer */}
              <AnimatePresence mode="wait">
                {isPrivate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="ml-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-indigo-400" />
                        <Label className="text-[10px] font-black tracking-widest text-neutral-600 uppercase">
                          Security Payload
                        </Label>
                      </div>
                      {secretKey && (
                        <span className="flex items-center gap-1 font-mono text-[9px] text-amber-500/80">
                          <AlertTriangle size={10} /> One-time reveal
                        </span>
                      )}
                    </div>

                    {!secretKey ? (
                      <button
                        onClick={generateKey}
                        className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-5 transition-all hover:border-white/20 hover:bg-white/[0.03]"
                      >
                        <RefreshCw
                          size={18}
                          className="group-hover:text-primary text-neutral-600 transition-colors"
                        />
                        <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                          Generate Deployment API Key
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              readOnly
                              type={showKey ? 'text' : 'password'}
                              value={secretKey}
                              className="border-primary/20 text-primary h-10 rounded-xl bg-black/40 pr-10 font-mono text-[11px]"
                            />
                            <button
                              onClick={() => setShowKey(!showKey)}
                              className="hover:text-primary absolute top-3 right-3 text-neutral-600 transition-colors"
                            >
                              {showKey ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                          <AppButton
                            icon={
                              copied ? <Check size={14} /> : <Copy size={14} />
                            }
                            label="Copy"
                            onClick={() => copyToClipboard(secretKey)}
                            className="bg-primary rounded-xl px-6 text-[10px] font-black text-black"
                          />
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                          <AlertTriangle
                            size={14}
                            className="mt-0.5 shrink-0 text-amber-500"
                          />
                          <p className="text-[10px] leading-relaxed text-amber-200/60 italic">
                            Key is hidden after panel exit. Store it securely.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AppButton
                icon={<Rocket size={14} />}
                label="Initialize Deployment"
                loading={isDeploying}
                onClick={() =>
                  deployWorkflow({ secretKey, private: isPrivate })
                }
                disabled={isDeploying || (isPrivate && !secretKey)}
                className="w-full rounded-xl bg-white py-4 text-[10px] font-black tracking-[0.2em] text-black uppercase shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Link */}
        <div className="mt-auto border-t border-neutral-800/50 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-center text-[9px] font-bold tracking-widest text-neutral-600 uppercase transition-colors hover:text-white"
          >
            Return to Canvas
          </button>
        </div>
      </div>
    </EditorPanel>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-neutral-500">
        {icon}
        <span className="text-[9px] font-black tracking-widest uppercase">
          {label}
        </span>
      </div>
      <p className="truncate text-xs font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
