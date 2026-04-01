// components/dashboard/execution-feed.tsx

export function ExecutionFeed({
                                  executions,
                                  loading,
                              }: {
    executions: any[];
    loading: boolean;
}) {
    return (
        <div
            className="rounded-2xl border border-white/10 hover:bg-white/[0.05] transition-200 bg-muted/50 p-5 h-full">
            <p className="text-sm text-white/60 mb-4">
                Recent Executions
            </p>

            {loading ? (
                <p className="text-white/40 text-sm">Loading...</p>
            ) : (
                <div className="space-y-3">
                    {executions.map((exec) => (
                        <div
                            key={exec.id}
                            className="
                flex justify-between items-center
                p-3 rounded-xl
                bg-white/[0.03] hover:bg-white/[0.06]
                transition
              "
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {exec.workflow?.name ?? "Workflow"}
                                </p>
                                <p className="text-xs text-white/40">
                                    {new Date(exec.startedAt).toLocaleString()}
                                </p>
                            </div>

                            <span className={`
                text-xs px-2 py-1 rounded-full
                ${exec.status === "success"
                                ? "bg-green-500/10 text-green-400"
                                : exec.status === "failed"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-white/10 text-white/60"}
              `}>
                {exec.status}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}