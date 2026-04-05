export type ExecutionStatus = "pending" | "running" | "success" | "failed";


export enum RuntimeActionType {
    SET_NODE_STATUS = "SET_NODE_STATUS",
    SET_EDGE_ACTIVE = "SET_EDGE_ACTIVE",
    SET_EXECUTIONS = "SET_EXECUTIONS",
    ADD_EXECUTION = "ADD_EXECUTION",
    UPDATE_EXECUTION = "UPDATE_EXECUTION",
    SET_LOGS = "SET_LOGS",
    ADD_LOG = "ADD_LOG",
    UPDATE_LOGS = "UPDATE_LOGS",
    RESET_FLOW_VISUALS = "RESET_FLOW_VISUALS",
    CLEAR_RUNTIME = "CLEAR_RUNTIME",
}