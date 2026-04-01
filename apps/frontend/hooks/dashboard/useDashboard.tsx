// hooks/useDashboard.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    getExecutionMetricsRequest,
    getRecentExecutionsRequest,
} from "@/lib/api-client/dashboard.client";

export function useDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const getToken = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("No session");
        return data.session.access_token;
    }, [supabase]);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);

            const token = await getToken();

            const [metricsRes, executionsRes] = await Promise.all([
                getExecutionMetricsRequest(token),
                getRecentExecutionsRequest(token, 20),
            ]);

            setMetrics(metricsRes);
            setExecutions(executionsRes);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        metrics,
        executions,
        loading,
        refetch: fetchDashboard,
    };
}