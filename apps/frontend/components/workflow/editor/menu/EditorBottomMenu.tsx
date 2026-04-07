import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { PanelWrapper } from "@/components/workflow/editor/Panel/PanelWrapper";
import { Spinner } from "@/components/ui/spinner";

export function EditorBottomMenu() {
    const { rfNodes, isRunning } = useWorkflowEditor();

    return (
        <PanelWrapper position="bottom-left" width="w-auto" className="m-8">
            <div className="flex items-center gap-6 bg-neutral-900/80 backdrop-blur-md border border-white/5 px-5 py-2.5 rounded-xl shadow-2xl">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                        Active Nodes: <span className="text-white ml-1">{rfNodes.length}</span>
                    </span>
                </div>

                {isRunning && (
                    <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                        <Spinner className="w-3.5 h-3.5 border-primary/30 border-t-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                            Processing Stream
                        </span>
                    </div>
                )}
            </div>
        </PanelWrapper>
    );
}