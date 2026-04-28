import { NodeRegistry } from '../registry';

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

export * from "../types/index.js";

export const nodeRegistry = new NodeRegistry();

installedNodes.forEach((node) => {
    nodeRegistry.register(node);
});

export const nodeCatalog = installedNodes.map((node) => ({
    ...node
}))