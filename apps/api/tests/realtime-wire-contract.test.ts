import {beforeEach, describe, expect, it, vi} from "vitest";

// Capture the raw frames handed to Supabase so the frozen wire strings are
// asserted as literals, independent of the editor action enum references.
const wire = vi.hoisted(() => ({channels: [] as string[], sends: [] as any[]}));

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

// Re-export the real broadcaster from source so its literal channel/event
// strings are exercised; only the persistence barrel is replaced.
vi.mock("@neuron/db", async () => {
    const {workflowBroadcast} = await import("../../../packages/db/src/realtime/workflowBroadcast");
    return {workflowBroadcast};
});

import {WorkflowRealtimeEventSink} from "../src/adapters/WorkflowRealtimeEventSink.js";

describe("realtime wire contract (literal)", () => {
    beforeEach(() => {
        wire.channels.length = 0;
        wire.sends.length = 0;
    });

    it("uses the literal workflow_<id> channel prefix for any run id", async () => {
        for (const id of ["wf-42", "run_abc", "123"]) {
            await new WorkflowRealtimeEventSink(id).emit({type: "node.started", nodeId: "n1"});
        }

        expect(wire.channels).toEqual([
            "workflow_wf-42",
            "workflow_run_abc",
            "workflow_123"
        ]);
    });

    it("sends the exact node.started frame", async () => {
        await new WorkflowRealtimeEventSink("wf-42").emit({type: "node.started", nodeId: "n1"});

        expect(wire.channels).toEqual(["workflow_wf-42"]);
        expect(wire.sends).toEqual([
            {
                type: "broadcast",
                event: "workflow_action",
                payload: {
                    type: "NODE_EXECUTION_START",
                    nodeId: "n1"
                }
            }
        ]);
    });

    it("sends the exact node.succeeded frame with the output field", async () => {
        await new WorkflowRealtimeEventSink("wf-42").emit({
            type: "node.succeeded",
            nodeId: "n1",
            output: {ok: true, count: 2}
        });

        expect(wire.channels).toEqual(["workflow_wf-42"]);
        expect(wire.sends).toEqual([
            {
                type: "broadcast",
                event: "workflow_action",
                payload: {
                    type: "NODE_EXECUTION_SUCCESS",
                    nodeId: "n1",
                    output: {ok: true, count: 2}
                }
            }
        ]);
    });

    it("sends the exact node.failed frames with the error field, including the second null error", async () => {
        const sink = new WorkflowRealtimeEventSink("wf-42");

        // The runtime emits two node.failed events for a failing node: the
        // thrown error, then a null terminal error. Both must reach the wire.
        await sink.emit({type: "node.failed", nodeId: "n1", error: "boom"});
        await sink.emit({type: "node.failed", nodeId: "n1", error: null});

        expect(wire.channels).toEqual(["workflow_wf-42", "workflow_wf-42"]);
        expect(wire.sends).toEqual([
            {
                type: "broadcast",
                event: "workflow_action",
                payload: {
                    type: "NODE_EXECUTION_ERROR",
                    nodeId: "n1",
                    error: "boom"
                }
            },
            {
                type: "broadcast",
                event: "workflow_action",
                payload: {
                    type: "NODE_EXECUTION_ERROR",
                    nodeId: "n1",
                    error: null
                }
            }
        ]);
    });
});
