import { Database, History, Variable } from "lucide-react";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { PanelWrapper } from "@/components/workflow/editor/Panel/PanelWrapper";
import {TooltipButton} from "@/components/workflow/ToolTipButton";

export function EditorRightMenu() {
    const {
        editorState,
        setIsExecutionsSheetOpen,
        setIsGlobalVariableSheetOpen
    } = useWorkflowEditor();

    return (
        <PanelWrapper position="top-right" width="w-auto" className="mt-24 mr-2!">
            <div className="flex flex-col gap-2 bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
                <TooltipButton
                    icon={Database}
                    label="Live Insights"
                    side={"left"}
                    onClick={() => {/* Implement Trace logic */}}
                />
                <TooltipButton
                    icon={History}
                    label="Execution History"
                    side={"left"}
                    onClick={() => setIsExecutionsSheetOpen(true)}
                />
                <TooltipButton
                    icon={Variable}
                    label="Global Variables"
                    side={"left"}
                    onClick={() => setIsGlobalVariableSheetOpen(true)}
                />
            </div>
        </PanelWrapper>
    );
}