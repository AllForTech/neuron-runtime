import {beforeEach, describe, expect, it, vi} from "vitest";
import {WorkflowEditorActionType} from "@neuron/shared";

const wire = vi.hoisted(() => ({channels: [] as string[], sends: [] as any[]}));
const store = vi.hoisted(() => ({
    rows: null as any,
    userIds: [] as string[],
    resolve: vi.fn(async (_key: string) => "decrypted")
}));

vi.mock("@neuron/auth", () => ({
    supabase: {
        channel: (name: string) => {
            wire.channels.push(name);
            return {
                send: async (payload: any) => {
                    wire.sends.push(payload);
                }
            };
        }
    }
}));

vi.mock("@neuron/db", async () => {
    const {workflowBroadcast} = await import("../../../packages/db/src/realtime/workflowBroadcast");
    return {
        getGlobalVariables: async (_workflowId: string) => store.rows,
        VaultService: class {
            constructor(userId: string) {
                store.userIds.push(userId);
            }
            resolve(key: string) {
                return store.resolve(key);
            }
        },
        workflowBroadcast
    };
});

import {
    createDefaultRuntimeCollaborators,
    DbVaultResolver,
    DbWorkflowVariableSource,
    WorkflowRealtimeEventSink
} from "../src/adapters/index.js";

describe("default adapters preserve today's collaborator behavior", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        wire.channels.length = 0;
        wire.sends.length = 0;
        store.userIds.length = 0;
        store.rows = null;
    });

    it("maps global variable rows exactly as the engine used to", async () => {
        store.rows = [
            {key: "alpha", value: "1"},
            {key: "beta", value: "2"},
            {key: "alpha", value: "3"}
        ];

        expect(await new DbWorkflowVariableSource().getForWorkflow("wf-1")).toEqual({
            alpha: "3",
            beta: "2"
        });

        store.rows = null;
        expect(await new DbWorkflowVariableSource().getForWorkflow("wf-1")).toEqual({});
    });

    it("keeps one vault service per execution and delegates resolution", async () => {
        const resolver = new DbVaultResolver("u-1");

        expect(await resolver.resolve("API_KEY")).toBe("decrypted");
        expect(store.userIds).toEqual(["u-1"]);
        expect(store.resolve).toHaveBeenCalledWith("API_KEY");
    });

    it("keeps the frozen realtime channel, event and payload contract", async () => {
        const sink = new WorkflowRealtimeEventSink("wf-1");

        await sink.emit({type: "node.started", nodeId: "n1"});
        await sink.emit({type: "node.succeeded", nodeId: "n1", output: {ok: true}});
        await sink.emit({type: "node.failed", nodeId: "n1", error: "boom"});

        expect(wire.channels).toEqual(["workflow_wf-1", "workflow_wf-1", "workflow_wf-1"]);
        expect(wire.sends).toEqual([
            {
                type: "broadcast",
                event: "workflow_action",
                payload: {type: WorkflowEditorActionType.NODE_EXECUTION_START, nodeId: "n1"}
            },
            {
                type: "broadcast",
                event: "workflow_action",
                payload: {
                    type: WorkflowEditorActionType.NODE_EXECUTION_SUCCESS,
                    nodeId: "n1",
                    output: {ok: true}
                }
            },
            {
                type: "broadcast",
                event: "workflow_action",
                payload: {
                    type: WorkflowEditorActionType.NODE_EXECUTION_ERROR,
                    nodeId: "n1",
                    error: "boom"
                }
            }
        ]);
    });

    it("bundles all three collaborators for the legacy wrapper", () => {
        const collaborators = createDefaultRuntimeCollaborators("u-1", "wf-1");

        expect(collaborators.vault).toBeInstanceOf(DbVaultResolver);
        expect(collaborators.variables).toBeInstanceOf(DbWorkflowVariableSource);
        expect(collaborators.events).toBeInstanceOf(WorkflowRealtimeEventSink);
    });
});
