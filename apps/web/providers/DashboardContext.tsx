'use client';

import React, {
    createContext,
    useCallback,
    useEffect,
    useState,
    useMemo,
    useRef,
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
    const isFetching = useRef(false);

    const supabase = useMemo(() => createClient(), []);

    /**
     * Retrieves the current Supabase authentication token
     */
    const getToken = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) throw new Error('No session');
        return data.session.access_token;
    }, [supabase]);

    /**
     * Fetches detailed logs for a specific execution ID
     */
    const getExecutionLogs = useCallback(
        async (executionId: string) => {
            if (!executionId) return {};
            try {
                setIsLogsLoading(true);
                setCurrentExecId(executionId);

                const token = await getToken();
                const [data, error] = await executionsClient.getLogs(executionId, token);

                if (error) throw error;

                if (data) {
                    const logsRecord: Record<string, ExecutionLog> = {};
                    (data as ExecutionLog[]).forEach((e) => (logsRecord[e.id] = e));
                    setLogs(logsRecord);
                    return logsRecord;
                }

                return {};
            } catch (e) {
                console.error('Failed to fetch logs:', e);
                return {};
            } finally {
                setIsLogsLoading(false);
            }
        },
        [getToken]
    );

    /**
     * Synchronizes core dashboard metrics and recent execution data
     */
    const fetchDashboardData = useCallback(async (isInitial = false) => {
        if (isFetching.current) return;

        try {
            isFetching.current = true;
            if (isInitial) setLoading(true);

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
            const latestExecutions = (executionsData as Execution[]) || [];
            setExecutions(latestExecutions);

            if (isInitial && latestExecutions.length > 0) {
                await getExecutionLogs(latestExecutions[0].id);
            }
        } catch (error) {
            console.error('Dashboard Sync Failed:', error);
        } finally {
            if (isInitial) setLoading(false);
            isFetching.current = false;
        }
    }, [getToken, getExecutionLogs]);

    useEffect(() => {
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData(false);
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const value = useMemo(
        () => ({
            metrics,
            executions,
            logs,
            loading,
            isLogsLoading,
            refresh: () => fetchDashboardData(false),
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