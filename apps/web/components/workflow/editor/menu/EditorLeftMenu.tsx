import { Plus, Layers } from 'lucide-react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { TooltipButton } from '@/components/workflow/ToolTipButton';

export function EditorLeftMenu() {
  const {
      setSelectedNode,
      setSelectedHandle,
      editorUIDispatch,
  } = useWorkflowEditor();

  return (
      <div className="flex flex-col rounded-lg border border-white/5 bg-neutral-900/60 shadow-2xl backdrop-blur-xl items-center gap-4 py-4 px-1.5 w-[30px]">
          <TooltipButton
              icon={Plus}
              label="Add"
              onClick={() => {
                  setSelectedNode(null);
                  setSelectedHandle(null);

                  editorUIDispatch({ type: 'OPEN_PANEL', panelId: 'node-library' })
              }}
          />
          <TooltipButton
              icon={Layers}
              label="Library"
              onClick={() => editorUIDispatch({ type: 'OPEN_PANEL', panelId: 'graph-navigator' })}
          />
      </div>
  );
}
