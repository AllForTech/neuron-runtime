/* ==========================================================================
NAVBAR CONTENT CONSTANTS
PURPOSE: Static content configuration for Neuron Engine navbar
========================================================================== */

export const NAVBAR_BRAND = {
    name: "Neuron Engine",
    shortName: "Neuron",
    descriptor: "Workflow Orchestration Runtime",
    repository: "https://github.com/neuron-engine",
}

/* ==========================================================================
PRIMARY NAVIGATION
========================================================================== */

export const NAVBAR_ITEMS = [
    {
        id: "system",
        label: "System",

        children: [
            {
                id: "definition",
                label: "Definition",
                href: "#system-definition",
                description: "Execution graph runtime architecture",
            },

            {
                id: "principles",
                label: "Principles",
                href: "#core-principles",
                description: "Core orchestration philosophy",
            },

            {
                id: "capabilities",
                label: "Capabilities",
                href: "#system-capabilities",
                description: "Runtime coordination domains",
            },
        ],
    },

    {
        id: "runtime",
        label: "Runtime",

        children: [
            {
                id: "orchestration",
                label: "Orchestration",
                href: "#orchestration-model",
                description: "Execution coordination model",
            },

            {
                id: "lifecycle",
                label: "Execution",
                href: "#execution-lifecycle",
                description: "Workflow execution lifecycle",
            },

            {
                id: "intelligence",
                label: "Intelligence",
                href: "#runtime-intelligence",
                description: "Runtime decision coordination",
            },
        ],
    },

    {
        id: "infrastructure",
        label: "Infrastructure",

        children: [
            {
                id: "connectivity",
                label: "Connectivity",
                href: "#infrastructure-connectivity",
                description: "Distributed infrastructure coordination",
            },

            {
                id: "architecture",
                label: "Architecture",
                href: "#architecture-observability",
                description: "Runtime telemetry and tracing",
            },
        ],
    },

    {
        id: "developer",
        label: "Developer",

        children: [
            {
                id: "experience",
                label: "Workspace",
                href: "#developer-experience",
                description: "Workflow authoring and inspection",
            },

            {
                id: "docs",
                label: "Documentation",
                href: "/docs",
                description: "Runtime and SDK references",
                external: false,
            },

            {
                id: "github",
                label: "GitHub",
                href: "https://github.com/neuron-engine",
                description: "Source repository",
                external: true,
            },
        ],
    },
] as const

/* ==========================================================================
NAVBAR RUNTIME STATUS
========================================================================== */

export const NAVBAR_RUNTIME_STATUS = {
    label: "Operational",
    region: "Global Runtime",
    api: "Healthy",
    orchestration: "Active",
} as const

/* ==========================================================================
MOBILE NAVIGATION
========================================================================== */

export const MOBILE_NAVIGATION = {
    title: "Runtime Navigation",
    description: "Execution system navigation",
} as const

/* ==========================================================================
SECTION IDS
========================================================================== */

export const LANDING_SECTION_IDS = {
    hero: "hero",

    systemDefinition: "system-definition",

    orchestrationModel: "orchestration-model",

    executionLifecycle: "execution-lifecycle",

    corePrinciples: "core-principles",

    systemCapabilities: "system-capabilities",

    runtimeIntelligence: "runtime-intelligence",

    infrastructureConnectivity: "infrastructure-connectivity",

    developerExperience: "developer-experience",

    architectureObservability: "architecture-observability",

    finalStatement: "final-system-statement",
} as const

/* ==========================================================================
FOOTER LINKS
========================================================================== */

export const FOOTER_LINKS = [
    {
        label: "GitHub",
        href: "https://github.com/neuron-engine",
        external: true,
    },

    {
        label: "Documentation",
        href: "/docs",
        external: false,
    },

    {
        label: "API Status",
        href: "/status",
        external: false,
    },

    {
        label: "Changelog",
        href: "/changelog",
        external: false,
    },
] as const