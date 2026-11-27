import { toast } from 'sonner';

/** Load/log failures were logged only; other command failures keep legacy toasts. */
const LOG_ONLY_ERROR_CONTEXTS: ReadonlySet<string> = new Set([
  'loadGraph',
  'loadDeployment',
  'getExecutionLogs',
]);

function reportError(error: unknown, context: string) {
  const message = error instanceof Error ? error.message : String(error);
  if (LOG_ONLY_ERROR_CONTEXTS.has(context)) {
    console.error(message);
    return;
  }
  if (context === 'saveGraph') {
    toast.error('Cloud sync failed after multiple attempts. Working offline.');
    return;
  }
  toast.error(message);
}

export { reportError };
