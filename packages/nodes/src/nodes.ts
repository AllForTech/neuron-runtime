import { httpNode } from '@neuron/node-http-request';
import { NodeRegistry } from './registry';
export * from "./types";
// import { aiNode } from '@neuron/node-ai';

const installedNodes = [
    httpNode,
    // aiNode,
];

const registry = new NodeRegistry();

// register everything ONCE
installedNodes.forEach((node) => {
    registry.register(node);
});

export const nodeRegistry = registry;

// for frontend (UI builder)
export const nodeCatalog = installedNodes.map((node) => node.template);