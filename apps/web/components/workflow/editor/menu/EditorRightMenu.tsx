import { Activity, Database, History, Variable } from 'lucide-react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { PanelWrapper } from '@/components/workflow/editor/Panel/PanelWrapper';
import { TooltipButton } from '@/components/workflow/ToolTipButton';
import { useValidation } from '@/hooks/useValidation';
import { useMemo } from 'react';
import type { EditorUIAction } from '@/constants/editor-panel';

export function EditorRightMenu() {
  const {
    editorUIDispatch,
  } = useWorkflowEditor();

  const { isValid, errors } = useValidation();
  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  const handleOpenPanel = (panelId: 'variables' | 'execution-history' | 'workflow-inspector') => {
    editorUIDispatch({ type: 'OPEN_PANEL', panelId });
  };

  return (
      <div className="flex flex-col items-center gap-4 py-4 w-[30px]">
          <TooltipButton
              icon={Database}
              label="Live Insights"
              side={'left'}
              onClick={() => {
                  /* Implement Trace logic */
              }}
          />
          <TooltipButton
              icon={History}
              label="Execution History"
              side={'left'}
              onClick={() => handleOpenPanel('execution-history')}
          />
          <TooltipButton
              icon={Variable}
              label="Global Variables"
              side={'left'}
              onClick={() => handleOpenPanel('variables')}
          />

          {!isValid && (
              <div className="relative">
                  <TooltipButton
                      icon={Activity}
                      label={`Workflow Editor Errors`}
                      side={'left'}
                      className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                      onClick={() =>
                          handleOpenPanel('workflow-inspector')
                      }
                  />
                  <span className="pointer-events-none absolute top-1 right-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
              </div>
          )}
      </div>
  );
}
