"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeActionType = void 0;
__exportStar(require("./logger"), exports);
__exportStar(require("./nodes"), exports);
__exportStar(require("./edges"), exports);
__exportStar(require("./workflow"), exports);
__exportStar(require("./globalVariables"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./template"), exports);
__exportStar(require("./sdk"), exports);
__exportStar(require("./vault"), exports);
// export * from "./executor";
var RuntimeActionType;
(function (RuntimeActionType) {
    RuntimeActionType["SET_NODE_STATUS"] = "SET_NODE_STATUS";
    RuntimeActionType["SET_EDGE_ACTIVE"] = "SET_EDGE_ACTIVE";
    RuntimeActionType["SET_EXECUTIONS"] = "SET_EXECUTIONS";
    RuntimeActionType["ADD_EXECUTION"] = "ADD_EXECUTION";
    RuntimeActionType["UPDATE_EXECUTION"] = "UPDATE_EXECUTION";
    RuntimeActionType["SET_LOGS"] = "SET_LOGS";
    RuntimeActionType["ADD_LOG"] = "ADD_LOG";
    RuntimeActionType["UPDATE_LOGS"] = "UPDATE_LOGS";
    RuntimeActionType["RESET_FLOW_VISUALS"] = "RESET_FLOW_VISUALS";
    RuntimeActionType["CLEAR_RUNTIME"] = "CLEAR_RUNTIME";
})(RuntimeActionType || (exports.RuntimeActionType = RuntimeActionType = {}));
