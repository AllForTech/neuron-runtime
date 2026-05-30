export enum WorkflowEditorActionType {
    SET_WORKFLOW_ID = "SET_WORKFLOW_ID",
    SET_GRAPH = "SET_GRAPH",
    ADD_NODE = "ADD_NODE",
    ADD_EDGE = "ADD_EDGE",
    UPDATE_NODE = "UPDATE_NODE",
    UPDATE_EDGE = "UPDATE_EDGE",
    UPDATE_NODE_POSITION = "UPDATE_NODE_POSITION",
    DELETE_NODE = "DELETE_NODE",
    DELETE_EDGE = "DELETE_EDGE",

    UPDATE_DIRTY_STATE = "UPDATE_DIRTY_STATE",

    UPDATE_WORKFLOW = "UPDATE_WORKFLOW",
    UPDATE_STATUS = "UPDATE_STATUS",

    NODE_EXECUTION_START = "NODE_EXECUTION_START",
    NODE_EXECUTION_SUCCESS = "NODE_EXECUTION_SUCCESS",
    NODE_EXECUTION_ERROR = "NODE_EXECUTION_ERROR",
    RESET_NODE_STATUS = "RESET_NODE_STATUS",

    EDGE_EXECUTION_START = "EDGE_EXECUTION_START",
    EDGE_EXECUTION_END = "EDGE_EXECUTION_END",
}


export const NODE_KIND = {
    // Triggers
    TRIGGER_WEBHOOK: "Trigger.Webhook",
    TRIGGER_SCHEDULE: "Trigger.Schedule",
    TRIGGER_MANUAL: "Trigger.Manual",

    // Network
    NETWORK_HTTP: "Network.Http",
    NETWORK_RESPOND: "Network.Respond",

    // Logic
    LOGIC_CONDITION: "Logic.Condition",
    LOGIC_DECISION: "Logic.Decision",
    LOGIC_DELAY: "Logic.Delay",

    // AI
    AI_LLM: "AI.Llm",

    // Utility
    UTILITY_CONTEXT: "Utility.Context",
    UTILITY_TRANSFORM: "Utility.Transform",
    UTILITY_DEBUG: "Utility.Debug",
    UTILITY_OUTPUT: "Utility.Output",

    // Integration
    INTEGRATION_SERVICE: "Integration.Service",
} as const;


export const  SECRET_PREFIX = 'nrn_live_' as const;
