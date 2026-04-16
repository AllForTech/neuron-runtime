import {supabase} from "@neuron/auth";

export const workflowBroadcast = (runId: string) => ({

    dispatch: async (type: string, payload: any) => {
        await supabase.channel(`workflow_${runId}`).send({
            type: 'broadcast',
            event: 'workflow_action',
            payload: { type, ...payload }
        });
    }
});


export const workflowRuntimeBroadcast = (runId: string) => ({

    dispatch: async (type: string, payload: any) => {
        await supabase.channel(`workflow_${runId}`).send({
            type: 'broadcast',
            event: 'workflow_runtime_action',
            payload: { type, ...payload }
        });
    }
});