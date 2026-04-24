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

export const nodeCatalog = [
    { ...triggerNode.template, type: triggerNode.type },
    { ...httpNode.template, type: httpNode.type },
    { ...debugNode.template, type: debugNode.type },
    { ...respondNode.template, type: respondNode.type },
    { ...conditionNode.template, type: conditionNode.type },
    { ...llmNode.template, type: llmNode.type },
    { ...transformNode.template, type: transformNode.type },
    { ...decisionNode.template, type: decisionNode.type },
    { ...integrationNode.template, type: integrationNode.type },
    { ...contextNode.template, type: contextNode.type },
    { ...outputNode.template, type: outputNode.type }
];