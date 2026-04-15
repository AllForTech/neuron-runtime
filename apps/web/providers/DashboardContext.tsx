'use client';

import React, {
    createContext,
    useCallback,
    useEffect,
    useState,
    useMemo,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { Execution, ExecutionLog } from "@neuron/db";
import { executions as executionsClient } from "@neuron/client";

interface DashboardContextType {
    metrics: any;
    executions: Execution[];
    loading: boolean;
    isLogsLoading: boolean;
    refresh: () => Promise<void>;
    currentExecId: string;
    logs: Record<string, ExecutionLog>;
    getExecutionLogs: (
        executionId: string
    ) => Promise<Record<string, ExecutionLog>>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [metrics, setMetrics] = useState<any>(null);
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [currentExecId, setCurrentExecId] = useState('');
    const [logs, setLogs] = useState<Record<string, ExecutionLog>>({});
    const [loading, setLoading] = useState(true);
    const [isLogsLoading, setIsLogsLoading] = useState(false);

    const supabase = useMemo(() => createClient(), []);

    const getToken = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error('No session');
        return data.session.access_token;
    }, [supabase]);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const token = await getToken();

            const [
                [metricsData, metricsError],
                [executionsData, executionsError]
            ] = await Promise.all([
                executionsClient.getMetrics(token),
                executionsClient.getRecent(token, 20),
            ]);

            if (metricsError || executionsError) {
                throw new Error(metricsError?.message || executionsError?.message);
            }

            setMetrics(metricsData);
            setExecutions((executionsData as Execution[]) || []);

            if (executionsData) {
                const lastExecId = (executionsData as Execution[])[0]?.id ?? null;
                if (lastExecId) {
                    await getExecutionLogs(lastExecId);
                }
            }
        } catch (error) {
            console.error('Dashboard Intelligence Sync Failed:', error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    const getExecutionLogs = useCallback(
        async (executionId: string) => {
            try {
                setIsLogsLoading(true);
                setCurrentExecId(executionId);

                const token = await getToken();
                const [data, error] = await executionsClient.getLogs(executionId, token);

                if (error) throw error;

                if (data) {
                    const logsRecord: Record<string, ExecutionLog> = {};
                    (data as ExecutionLog[]).map((e: ExecutionLog) => (logsRecord[e.id] = e));
                    setLogs(logsRecord);
                    return logsRecord;
                }

                return {};
            } catch (e) {
                console.error('Failed to fetch logs:', e.message);
                return {};
            } finally {
                setIsLogsLoading(false);
            }
        },
        [getToken]
    );

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const value = useMemo(
        () => ({
            metrics,
            executions,
            logs,
            loading,
            isLogsLoading,
            refresh: fetchDashboardData,
            getExecutionLogs,
            currentExecId,
        }),
        [
            metrics,
            executions,
            logs,
            loading,
            isLogsLoading,
            fetchDashboardData,
            getExecutionLogs,
            currentExecId,
        ]
    );

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}