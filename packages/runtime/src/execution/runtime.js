"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runtime = void 0;
const db_1 = require("@neuron/db");
const nodes_1 = require("@neuron/nodes");
const nodeRunner_1 = require("./nodeRunner");
const shared_1 = require("@neuron/shared");
const utils_1 = require("../utils");
class Runtime {
    constructor(params) {
        this.completed = new Set();
        this.running = new Set();
        this.incoming = {};
        this.outgoing = {};
        this.nodeMap = {};
        this.contextNode = { isPresent: false };
        this.nodesContext = {};
        this.globalVariables = {};
        this.finalResponse = null;
        this.workflowId = params.workflowId;
        this.userId = params.userId;
        this.executorId = params.executionId;
        this.nodes = params.graph.nodes;
        this.edges = params.graph.edges;
        this.vault = new db_1.VaultService(params.userId);
        const { dispatch } = (0, db_1.workflowBroadcast)(params.workflowId);
        this.dispatch = dispatch;
    }
    /**
     * Prepares graph adjacency maps and global state for execution.
     */
    async initialize() {
        try {
            const dbVariables = await (0, db_1.getGlobalVariables)(this.workflowId);
            if (dbVariables) {
                dbVariables.forEach(v => this.globalVariables[v.key] = v.value);
            }
            for (const node of this.nodes) {
                this.nodeMap[node.id] = node;
                this.incoming[node.id] = [];
                this.outgoing[node.id] = [];
                if (node.type.includes("contextNode"))
                    this.contextNode.isPresent = true;
            }
            for (const edge of this.edges) {
                if (this.nodeMap[edge.source] && this.nodeMap[edge.target]) {
                    this.incoming[edge.target].push(edge.source);
                    this.outgoing[edge.source].push(edge.target);
                }
            }
            shared_1.logger.debug("Runtime", "Graph initialized", { nodeCount: this.nodes.length });
        }
        catch (error) {
            shared_1.logger.error("Runtime", "Failed to initialize graph", error);
            throw error;
        }
    }
    /**
     * Orchestrates the full workflow execution starting from root nodes.
     */
    async execute() {
        await this.initialize();
        // Professional info log for start of execution
        shared_1.logger.info("Runtime", "Workflow execution started", {
            workflowId: this.workflowId,
            executorId: this.executorId
        });
        const startNodes = this.nodes.filter(n => this.incoming[n.id].length === 0);
        await Promise.all(startNodes.map(node => this.runNode(node.id)));
        shared_1.logger.info("Runtime", "Workflow execution completed", {
            workflowId: this.workflowId,
            status: this.finalResponse ? "terminal_response_sent" : "finished"
        });
        return {
            nodesContext: this.nodesContext,
            globalVariables: this.globalVariables,
            response: this.finalResponse
        };
    }
    /**
     * Executes a single node via the NodeRunner and manages state transitions.
     */
    async runNode(nodeId) {
        if (this.completed.has(nodeId) || this.running.has(nodeId))
            return;
        const node = this.nodeMap[nodeId];
        this.running.add(nodeId);
        await this.dispatch(shared_1.WorkflowEditorActionType.NODE_EXECUTION_START, { nodeId });
        shared_1.logger.info("Runtime", `Attempting to resolve config for ${node.type} node - ${node.id}`);
        try {
            const resolvedConfig = await (0, utils_1.resolveConfig)(node.config, this.nodesContext, {
                variables: this.globalVariables,
                vault: this.vault
            });
            // Log detailed node activity
            shared_1.logger.debug("Runtime", `Executing node: ${node.type}`, { nodeId });
            const runner = new nodeRunner_1.NodeRunner(nodes_1.nodeRegistry);
            const result = await runner.run(node, resolvedConfig);
            if (result.status === 'failed') {
                throw new Error(result.error?.message || "Unknown Node Error");
            }
            const output = result.data;
            if (output?.__isTerminal) {
                this.finalResponse = {
                    status: output.status,
                    headers: output.headers,
                    body: output.body
                };
            }
            if (this.contextNode.isPresent) {
                this.contextNode[nodeId] = (0, shared_1.createContextEntry)(node, output, Number(result.metrics.timestamp));
            }
            this.nodesContext[nodeId] = output;
            this.completed.add(nodeId);
            await this.dispatch(shared_1.WorkflowEditorActionType.NODE_EXECUTION_SUCCESS, { nodeId, output });
            await this.triggerNext(nodeId, output);
        }
        catch (e) {
            // Log the error with full context and the Error object
            shared_1.logger.error("Runtime", `Node execution failed: ${nodeId}`, e, {
                nodeType: node.type,
                workflowId: this.workflowId
            });
            await this.dispatch(shared_1.WorkflowEditorActionType.NODE_EXECUTION_ERROR, { nodeId, error: e.message });
        }
        finally {
            this.running.delete(nodeId);
        }
    }
    /**
     * Identifies and triggers subsequent nodes whose dependencies have been met.
     */
    async triggerNext(nodeId, output) {
        const nextIds = this.outgoing[nodeId] || [];
        const readyNodes = nextIds.filter(id => this.incoming[id].every(parentId => this.completed.has(parentId)));
        if (readyNodes.length > 0) {
            shared_1.logger.debug("Runtime", `Triggering ${readyNodes.length} downstream nodes`, { fromNode: nodeId });
        }
        await Promise.all(readyNodes.map(id => this.runNode(id)));
    }
}
exports.Runtime = Runtime;
