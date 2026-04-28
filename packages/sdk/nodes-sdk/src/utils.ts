import { NodeConfigSection, ConfigField } from "@neuron/shared";

/**
 * buildSharedNodeSchema
 * Returns a standardized array of sections for properties common to all nodes.
 */
export function buildSharedNodeSchema(): NodeConfigSection[] {
    return [
        {
            id: "shared-meta",
            title: "General Information",
            description: "Identify this node within your workflow canvas.",
            layout: "grid",
            fields: [
                {
                    id: "label",
                    type: "text",
                    path: "meta.label",
                    label: "Node Label",
                    placeholder: "e.g., Process User Data",
                    required: true
                },
                {
                    id: "description",
                    type: "textarea",
                    path: "meta.description",
                    label: "Description",
                    placeholder: "What does this node do?"
                }
            ]
        },
        {
            id: "shared-execution",
            title: "Execution & Reliability",
            description: "Configure how this node behaves during runtime.",
            collapsible: true,
            defaultCollapsed: true,
            layout: "grid",
            fields: [
                {
                    id: "retry-enabled",
                    type: "switch",
                    path: "executionConfig.retry.enabled",
                    label: "Enable Retries",
                    description: "Retry execution if the node fails."
                },
                {
                    id: "timeout-enabled",
                    type: "switch",
                    path: "executionConfig.timeout.enabled",
                    label: "Enable Timeout",
                    description: "Prevent long-running processes."
                },
                {
                    id: "continue-on-error",
                    type: "switch",
                    path: "executionConfig.errorHandling.continueOnError",
                    label: "Continue on Error",
                    description: "Don't stop the workflow if this node fails."
                },
                {
                    id: "logging-level",
                    type: "select",
                    path: "executionConfig.logging.level",
                    label: "Logging Level",
                    options: [
                        { label: "Minimal", value: "minimal" },
                        { label: "Verbose", value: "verbose" }
                    ]
                }
            ]
        },
        {
            id: "shared-context",
            title: "Context Registration",
            description: "Persist output data to the global workflow context.",
            collapsible: true,
            defaultCollapsed: true,
            layout: "column",
            fields: [
                {
                    id: "persist-context",
                    type: "switch",
                    path: "persistToContext",
                    label: "Persist to Context",
                },
                {
                    id: "context-alias",
                    type: "text",
                    path: "alias",
                    label: "Variable Alias",
                    placeholder: "e.g. lastResponse",
                    hidden: (values) => !values.persistToContext
                }
            ]
        }
    ];
}