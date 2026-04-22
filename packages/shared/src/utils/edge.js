"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertEdgeToDBSchema = convertEdgeToDBSchema;
function convertEdgeToDBSchema(edge) {
    return {
        id: edge.id,
        config: edge.config ?? {},
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? edge.id,
        targetHandle: edge.targetHandle ?? edge.id,
    };
}
