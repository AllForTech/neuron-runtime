import { NodeConfigSection, ConfigField } from "@neuron/shared";

/**
 * buildSharedNodeSchema
 * Comprehensive schema including all properties from BaseNodeConfig.
 */
export function buildSharedNodeSchema(): NodeConfigSection[] {
    return [
        {
            id: "shared-meta",
            title: "General Information",
            description: "Identify this node within your workflow canvas.",
            layout: "column",
            collapsible: true,
            fields: [
                {
                    id: "meta-label",
                    type: "text",
                    path: "meta.label",
                    label: "Node Label",
                    placeholder: "e.g., Process User Data",
                    required: true
                },
                {
                    id: "meta-description",
                    type: "textarea",
                    path: "meta.description",
                    label: "Description",
                    placeholder: "What does this node do?"
                }
            ]
        },
        {
            id: "shared-execution",
            title: "Execution Settings",
            description: "Reliability, timeouts, and performance control.",
            collapsible: true,
            defaultCollapsed: true,
            layout: "column",
            fields: [
                // --- RETRY SETTINGS ---
                {
                    id: "retry-group",
                    type: "object",
                    path: "executionConfig.retry",
                    label: "Retry Policy",
                    fields: [
                        { id: "retry-enabled", type: "switch", path: "enabled", label: "Enable Retries" },
                        { id: "retry-maxAttempts", type: "number", path: "maxAttempts", label: "Max Attempts", hidden: (v) => !v.executionConfig?.retry?.enabled },
                        { id: "retry-delayMs", type: "number", path: "delayMs", label: "Delay (ms)", hidden: (v) => !v.executionConfig?.retry?.enabled },
                        {
                            id: "retry-strategy",
                            type: "select",
                            path: "strategy",
                            label: "Strategy",
                            options: [{ label: "Fixed", value: "fixed" }, { label: "Exponential", value: "exponential" }],
                            hidden: (v) => !v.executionConfig?.retry?.enabled
                        },
                    ]
                },
                // --- TIMEOUT & ERROR HANDLING ---
                {
                    id: "error-handling-group",
                    type: "object",
                    path: "executionConfig",
                    label: "Safety & Error Handling",
                    fields: [
                        { id: "timeout-enabled", type: "switch", path: "timeout.enabled", label: "Enable Timeout" },
                        { id: "timeout-durationMs", type: "number", path: "timeout.durationMs", label: "Timeout (ms)", hidden: (v) => !v.executionConfig?.timeout?.enabled },
                        { id: "error-continueOnError", type: "switch", path: "errorHandling.continueOnError", label: "Continue on Error" },
                        { id: "error-fallbackNodeId", type: "text", path: "errorHandling.fallbackNodeId", label: "Fallback Node ID", placeholder: "UUID of node" }
                    ]
                },
                // --- ASYNC & CACHING ---
                {
                    id: "performance-group",
                    type: "object",
                    path: "executionConfig",
                    label: "Performance & Caching",
                    fields: [
                        { id: "async-enabled", type: "switch", path: "async.enabled", label: "Run Asynchronously" },
                        { id: "async-detach", type: "switch", path: "async.detach", label: "Detach (Don't Wait)", hidden: (v) => !v.executionConfig?.async?.enabled },
                        { id: "cache-enabled", type: "switch", path: "cache.enabled", label: "Enable Cache" },
                        { id: "cache-ttlMs", type: "number", path: "cache.ttlMs", label: "Cache TTL (ms)", hidden: (v) => !v.executionConfig?.cache?.enabled },
                        { id: "cache-key", type: "text", path: "cache.key", label: "Custom Cache Key", hidden: (v) => !v.executionConfig?.cache?.enabled }
                    ]
                },
                // --- LIMITS & LOGGING ---
                {
                    id: "limits-group",
                    type: "object",
                    path: "executionConfig",
                    label: "Limits & Logging",
                    fields: [
                        { id: "rateLimit-enabled", type: "switch", path: "rateLimit.enabled", label: "Enable Rate Limit" },
                        { id: "rateLimit-maxPerSecond", type: "number", path: "rateLimit.maxPerSecond", label: "Max Per Second", hidden: (v) => !v.executionConfig?.rateLimit?.enabled },
                        { id: "concurrency-limit", type: "number", path: "concurrency.limit", label: "Concurrency Limit" },
                        {
                            id: "logging-level",
                            type: "select",
                            path: "logging.level",
                            label: "Logging Level",
                            options: [{ label: "Minimal", value: "minimal" }, { label: "Verbose", value: "verbose" }]
                        }
                    ]
                }
            ]
        },
        {
            id: "shared-context",
            title: "Data Persistence",
            description: "How this node interacts with global context.",
            collapsible: true,
            defaultCollapsed: true,
            layout: "column",
            fields: [
                {
                    id: "persistToContext",
                    type: "switch",
                    path: "persistToContext",
                    label: "Persist to Context",
                },
                {
                    id: "contextNodeId",
                    type: "template",
                    path: "contextNodeId",
                    label: "Target Context Node ID",
                    placeholder: "UUID",
                    hidden: (values) => !values.persistToContext
                },
                {
                    id: "alias",
                    type: "text",
                    path: "alias",
                    label: "Variable Alias",
                    placeholder: "e.g. userData",
                    hidden: (values) => !values.persistToContext
                },
                {
                    id: "outputSchema",
                    type: "template",
                    path: "outputSchema",
                    label: "Output Schema Reference",
                    placeholder: "v1/schema"
                }
            ]
        }
    ];
}