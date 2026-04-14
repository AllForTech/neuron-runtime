import { Play, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { PanelWrapper } from '@/components/workflow/editor/Panel/PanelWrapper';
import { useValidation } from '@/hooks/useValidation';
import { cn } from '@/lib/utils';

export function EditorTopMenu() {
  const { isValid } = useValidation();
  const {
    editorState,
    handleRunWorkflow,
    isRunning,
    setIsDeployWorkflowDialogOpen,
  } = useWorkflowEditor();

  return (
    <PanelWrapper position="top-center" width="w-auto" className="mt-6">
      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-neutral-900/50 p-1 shadow-2xl backdrop-blur-xl">
        <div className="border-r border-white/10 px-4">
          <p className="text-[8px] font-bold tracking-widest text-neutral-500 uppercase">
            Sequence
          </p>
          <p className="text-xs font-medium text-white">
            {editorState.workflow?.name || 'New Engine'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            variant="ghost"
            className="h-full gap-2 rounded-xl px-4 text-xs font-semibold text-neutral-300 transition-all hover:text-white"
          >
            <Play size={14} className={isRunning ? 'animate-pulse' : ''} />
            Execute
          </Button>
          <Button
            disabled={!isValid}
            onClick={() => setIsDeployWorkflowDialogOpen(true)}
            className={cn(
              'h-full gap-2 rounded-xl bg-white px-5 text-xs font-bold tracking-wider text-black uppercase shadow-lg transition-transform hover:bg-neutral-200 active:scale-95',
              !isValid && 'opacity-50 grayscale'
            )}
          >
            <Rocket size={14} />
            {isValid ? 'Deploy' : 'Fix Errors to Deploy'}
          </Button>
        </div>
      </div>
    </PanelWrapper>
  );
}
