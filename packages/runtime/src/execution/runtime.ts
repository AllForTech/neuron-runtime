import {
    BaseNodeConfig,
    createContextEntry,
    ExecutionSignal,
    logger,
    NodeType
} from "@neuron/shared";
import type {IVaultResolver, WorkflowEventSink, WorkflowVariableSource} from "@neuron/shared";
import {NodeRunner} from "./nodeRunner";
import {resolveConfig} from "../utils";
import type {ExecuteWorkflowType, RuntimeGraphEdge, RuntimeGraphNode} from "../types";
import {getEdgeTargets} from "../utils/branching";

export class Runtime {
    private readonly workflowId: string;
    private readonly userId: string;
    private readonly executorId: string;
    private readonly nodes: RuntimeGraphNode[];
    private readonly edges: RuntimeGraphEdge[];

    private executed = new Set<string>();
    private success = new Set<string>();
    private failed = new Set<string>();
    private running = new Set<string>();

    private incoming: Record<string, string[]> = {};
    private outgoing: Record<string, string[]> = {};
    private nodeMap: Record<string, RuntimeGraphNode> = {};

    private contextNode: Record<string, any> = { isPresent: false };
    private nodesContext: Record<string, any> = {};
    private globalVariables: Record<string, string> = {};

    public finalResponse: any = null;

    private readonly vault?: IVaultResolver;
    private readonly variables?: WorkflowVariableSource;
    private readonly events?: WorkflowEventSink;

    constructor(params: ExecuteWorkflowType) {
        this.workflowId = params.workflowId;
        this.userId = params.userId;
        this.executorId = params.executionId;
        this.nodes = params.graph.nodes;
        this.edges = params.graph.edges;
        this.vault = params.vault;
        this.variables = params.variables;
        this.events = params.events;
    }

    public async initialize(): Promise<void> {
        try {
            const variables = (await this.variables?.getForWorkflow(this.workflowId)) ?? {};

            for (const [key, value] of Object.entries(variables)) {
                this.globalVariables[key] = value;
            }

            for (const node of this.nodes) {
                this.nodeMap[node.id] = node;
                this.incoming[node.id] = [];
                this.outgoing[node.id] = [];

                if (node.type.includes("Utility.Context")) {
                    this.contextNode.isPresent = true;
                }
            }

            for (const edge of this.edges) {
                if (!this.nodeMap[edge.source] || !this.nodeMap[edge.target]) continue;
                this.incoming[edge.target].push(edge.source);
                this.outgoing[edge.source].push(edge.target);
            }

            logger.debug("Runtime", "Graph initialized", { nodeCount: this.nodes.length });
        } catch (error) {
            logger.error("Runtime", "Failed to initialize graph", error);
            throw error;
        }
    }

    public async execute() {
        await this.initialize();

        logger.info("Runtime", "Workflow execution started", {
            workflowId: this.workflowId,
            executorId: this.executorId
        });

        const startNodes = this.nodes.filter(n => this.incoming[n.id]?.length === 0);
        await Promise.all(startNodes.map(n => this.runNode(n.id)));

        logger.info("Runtime", "Workflow execution completed", {
            workflowId: this.workflowId,
            status: this.finalResponse ? "terminal_response_sent" : "finished"
        });

        return {
            nodesContext: this.nodesContext,
            globalVariables: this.globalVariables,
            response: this.finalResponse
        };
    }

    private async runNode(nodeId: string): Promise<void> {
        if (this.executed.has(nodeId) || this.running.has(nodeId)) return;

        const node = this.nodeMap[nodeId];
        if (!node) throw new Error(`Unknown Node Error: ${nodeId}`);

        this.running.add(nodeId);
        await this.events?.emit({ type: "node.started", nodeId });

        try {
            const resolvedConfig = await resolveConfig(
                node.config,
                this.nodesContext,
                {
                    variables: this.globalVariables,
                    vault: this.vault
                }
            );

            logger.debug("Runtime", "Workflow resolved configs", resolvedConfig);

            const runner = new NodeRunner();
            const { result, signal } = await runner.run(node, resolvedConfig);

            const output = result.data;
            const policy = node.config as BaseNodeConfig;

            logger.debug("Runtime", "Workflow execution result", {
                result: output,
                policy,
                nodeType: node?.type,
                nodeConfig: node?.config
            });


            if (signal !== "success") {
                await this.events?.emit({
                    type: "node.failed",
                    nodeId,
                    error: result.error?.message
                });

                this.failed.add(nodeId);
            } else {
                this.success.add(nodeId);
                if (this.contextNode.isPresent) {
                    this.contextNode[nodeId] = createContextEntry(node, output, Date.now());
                }
            }

            if (output?.__isTerminal) {
                this.finalResponse = {
                    status: output.status,
                    headers: output.headers,
                    body: output.body
                };
            }

            this.nodesContext[nodeId] = output;
            this.executed.add(nodeId);

            await this.events?.emit(
                signal === "success"
                    ? { type: "node.succeeded", nodeId, output }
                    : { type: "node.failed", nodeId, error: output }
            );

            // Allow Error/Timeout routes to trigger even if continueOnError is false
            await this.triggerNext(nodeId, output, signal);

            if (signal !== "success" && policy?.executionConfig?.errorHandling?.continueOnError === false) {
                return;
            }

        } catch (e: any) {
            logger.error("Runtime", `Node execution failed: ${nodeId}`, e, {
                nodeType: node.type,
                workflowId: this.workflowId
            });

            this.failed.add(nodeId);
            await this.events?.emit({
                type: "node.failed",
                nodeId,
                error: e.message
            });
        } finally {
            this.running.delete(nodeId);
        }
    }

    private async triggerNext(nodeId: string, output: any, signal: ExecutionSignal) {
        const node = this.nodeMap[nodeId];
        const policy = node.config as BaseNodeConfig;

        if (signal !== "success" && policy?.executionConfig?.errorHandling?.fallbackNodeId) {
            await this.runNode(policy.executionConfig.errorHandling.fallbackNodeId);
            return;
        }

        const nextNodeIds = getEdgeTargets(
            node.type as NodeType,
            nodeId,
            this.edges,
            output,
            signal
        );

        console.log('------------------------------------------------------------------------------')
        console.log(`>>>>>>>>>>>>>>> Next Node: ${nextNodeIds.join(",")} and signal: ${signal} <<<<<<<<<<<<<<<`);
        console.log('------------------------------------------------------------------------------')


        const readyNodes = nextNodeIds.filter(id => {
            // Error, Timeout, and Retry Failed routes trigger immediately
            if (signal !== "success") return true;

            // Success route waits for all incoming parents to be executed
            return this.incoming[id]?.every(parent => this.executed.has(parent));
        });

        await Promise.all(readyNodes.map(id => this.runNode(id)));
    }
}