import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { PanelWrapper } from '@/components/workflow/editor/Panel/PanelWrapper';
import { Spinner } from '@/components/ui/spinner';

export function EditorBottomMenu() {
  const { rfNodes, isRunning } = useWorkflowEditor();

  return (
    <PanelWrapper position="bottom-left" width="w-auto" className="m-8">
      <div className="flex items-center gap-6 rounded-xl border border-white/5 bg-neutral-900/80 px-5 py-2.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          <span className="text-[10px] font-bold tracking-[0.15em] text-neutral-400 uppercase">
            Active Nodes:{' '}
            <span className="ml-1 text-white">{rfNodes.length}</span>
          </span>
        </div>

        {isRunning && (
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <Spinner className="border-primary/30 border-t-primary h-3.5 w-3.5" />
            <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
              Processing Stream
            </span>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
