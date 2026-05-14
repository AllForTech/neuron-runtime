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
      <div className="flex flex-col items-center gap-4 py-4 w-[30px]">
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
