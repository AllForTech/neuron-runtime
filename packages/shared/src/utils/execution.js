"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinalStatus = isFinalStatus;
exports.isRunning = isRunning;
exports.validateAgainstSchema = validateAgainstSchema;
exports.getContentType = getContentType;
function isFinalStatus(status) {
    return status === "success" || status === "failed";
}
function isRunning(status) {
    return status === "running";
}
function validateAgainstSchema(payload, schema) {
    // Logic: Iterate through outputSchema.fields and check if payload keys exist/match types
    // If mismatch found, throw error to be caught by the engine's error handler
    schema.fields.forEach((field) => {
        if (field.required && payload[field.key] === undefined) {
            throw new Error(`Schema Violation: Missing required field '${field.key}'`);
        }
    });
}
function getContentType(format) {
    const types = {
        json: "application/json",
        markdown: "text/markdown",
        html: "text/html",
        text: "text/plain"
    };
    return types[format] || "text/plain";
}
