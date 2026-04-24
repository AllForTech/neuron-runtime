import 'server-only';

import {NodeRegistry} from './registry/index.js';
import { httpNode } from '@neuron/node-http-request';
import { triggerNode } from '@neuron/node-trigger';
import { debugNode } from '@neuron/node-debug';
import { respondNode } from '@neuron/node-respond';
import { conditionNode } from '@neuron/node-condition';
import { llmNode } from '@neuron/node-llm';
import { transformNode } from '@neuron/node-transform';
import { decisionNode } from '@neuron/node-decision';
import { integrationNode } from '@neuron/node-integration';
import { contextNode } from '@neuron/node-context';
import { outputNode } from '@neuron/node-output';
import {NodeDefinition, NodeType} from "@neuron/shared";

export interface INodeRegistry {
    register(node: NodeDefinition): void;
    get(type: NodeType): NodeDefinition;
    getAll(): NodeDefinition[];
    has(type: NodeType): boolean;
}

const installedNodes = [
    triggerNode,
    httpNode,
    debugNode,
    respondNode,
    conditionNode,
    llmNode,
    transformNode,
    decisionNode,
    integrationNode,
    contextNode,
    outputNode
];

export const nodeRegistry = new NodeRegistry();

installedNodes.forEach((node) => {
    nodeRegistry.register(node);
});

export { nodeCatalog } from './catalog/index.js';

export type { HttpNodeConfig } from "@neuron/node-http-request";
export type { TriggerNodeConfig } from "@neuron/node-trigger";
export type { DebugNodeConfig } from "@neuron/node-debug";
export type { RespondNodeConfig } from "@neuron/node-respond";
export type { ConditionNodeConfig } from "@neuron/node-condition";
export type { LLMNodeConfig } from "@neuron/node-llm";
export type { TransformNodeConfig } from "@neuron/node-transform";
export type { DecisionNodeConfig } from "@neuron/node-decision";
export type { IntegrationNodeConfig } from "@neuron/node-integration";
export type { ContextNodeConfig } from "@neuron/node-context";
export type { OutputNodeConfig } from "@neuron/node-output";