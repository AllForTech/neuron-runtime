import { Plus, Layers } from "lucide-react";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { PanelWrapper } from "@/components/workflow/editor/Panel/PanelWrapper";
import {TooltipButton} from "@/components/workflow/ToolTipButton";

export function EditorLeftMenu() {
    const { setIsSheetOpen, setIsEditorPanelOpen } = useWorkflowEditor();

    return (
        <PanelWrapper position="top-left" width="w-auto" className="mt-24 ml-2!">
            <div className="flex flex-col gap-3 bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-2xl">
                <TooltipButton
                    icon={Plus}
                    label="Add Node"
                    onClick={() => setIsSheetOpen(true)}
                />
                <TooltipButton
                    icon={Layers}
                    label="Layer Inspector"
                    onClick={() => setIsEditorPanelOpen(true)}
                />
            </div>
        </PanelWrapper>
    );
}