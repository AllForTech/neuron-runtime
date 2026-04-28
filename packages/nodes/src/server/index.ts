import { transformNodeExecutor } from '@neuron/node-transform/server';
import { httpNodeExecutor } from '@neuron/node-http-request/server';
import { triggerNodeExecutor } from '@neuron/node-trigger/server';
import { debugNodeExecutor } from '@neuron/node-debug/server';
import { respondNodeExecutor } from '@neuron/node-respond/server';
import { conditionNodeExecutor } from '@neuron/node-condition/server';
import { llmNodeExecutor } from '@neuron/node-llm/server';
import { decisionNodeExecutor } from '@neuron/node-decision/server';
import { integrationNodeExecutor } from '@neuron/node-integration/server';
import { contextNodeExecutor } from '@neuron/node-context/server';
import { outputNodeExecutor } from '@neuron/node-output/server';

import { NodeType } from "@neuron/shared";

export const nodeExecutors: Record<NodeType, any> = {
    "Utility.Transform": transformNodeExecutor,
    "Network.Http": httpNodeExecutor,
    "Trigger.Manual": triggerNodeExecutor,
    "Trigger.Webhook": triggerNodeExecutor,
    "Trigger.Schedule": triggerNodeExecutor,
    "Utility.Debug": debugNodeExecutor,
    "Network.Respond": respondNodeExecutor,
    "Logic.Condition": conditionNodeExecutor,
    "AI.Llm": llmNodeExecutor,
    "Logic.Decision": decisionNodeExecutor,
    "Integration.Service": integrationNodeExecutor,
    "Utility.Context": contextNodeExecutor,
    "Utility.Output": outputNodeExecutor,
    "Logic.Delay": conditionNodeExecutor,
};