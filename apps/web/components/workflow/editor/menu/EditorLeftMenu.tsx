import { Plus, Layers } from 'lucide-react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { PanelWrapper } from '@/components/workflow/editor/Panel/PanelWrapper';
import { TooltipButton } from '@/components/workflow/ToolTipButton';

export function EditorLeftMenu() {
  const { setIsSheetOpen, setIsEditorPanelOpen } = useWorkflowEditor();

  return (
    <PanelWrapper position="top-left" width="w-auto" className="mt-24 ml-2!">
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900/50 p-1 shadow-2xl backdrop-blur-xl">
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
