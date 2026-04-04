import { useEffect, useState } from "react";
import { ArrowLeft, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import {useWorkflowEditor} from "@/hooks/workflow/useWorkflowEditor";

export function ExecutionLogsViewer({ executionId, onBack }: { executionId: string, onBack: () => void }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const {getExecutionLogs} = useWorkflowEditor();

    useEffect(() => {
        // Replace with your actual API fetch call
        const fetchLogs = async () => {
            setLoading(true);
            try {
                // Example: const data = await getExecutionLogs(executionId);
                const data = await getExecutionLogs(executionId);

                setLogs(data);
                // setLogs(data);
                console.log("Fetching logs for:", executionId);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [executionId]);

    return (
        <div className="flex flex-col h-full bg-neutral-950">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center gap-3 sticky top-0 bg-neutral-950/80 backdrop-blur-md z-10">
                <button onClick={onBack} className="p-2 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-[0.2em]">Execution Logs</p>
                    <p className="text-xs text-white font-mono">{executionId?.slice(0, 16)}...</p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="flex items-center gap-2 text-neutral-500 text-sm animate-pulse italic">
                        <Terminal className="w-4 h-4" /> Loading sequence...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs && logs.map((log, idx) => (
                            <div key={log.id} className="border-l-2 border-neutral-800 pl-4 py-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "text-[9px] uppercase px-1.5 py-0.5 rounded border",
                                        log?.status === "success" ? "border-emerald-500/20 text-emerald-500" : "border-red-500/20 text-red-500"
                                    )}>
                                        {log?.nodeType}
                                    </span>
                                    <span className="text-xs font-medium text-white">{log?.nodeLabel}</span>
                                    <span className="text-[10px] text-neutral-600 font-mono ml-auto">{log?.durationMs}ms</span>
                                </div>
                                <div className="bg-neutral-900/50 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-neutral-400 overflow-x-auto">
                                    <pre>{JSON.stringify(log?.output, null, 2)}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}