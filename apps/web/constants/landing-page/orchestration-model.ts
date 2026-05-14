export const ORCHESTRATION_MODEL_SECTION = {
    id: 'orchestration-model',

    badge: {
        label: 'ORCHESTRATION MODEL',
    },

    heading: {
        title: 'Coordinated flow across connected infrastructure.',
        description:
            'Neuron continuously coordinates transitions, routing, synchronization, and downstream propagation through a structured orchestration pipeline.',
    },

    body: {
        paragraphs: [
            'Incoming events are interpreted into structured orchestration context before being routed through connected operational stages.',
            'State transitions remain synchronized across the pipeline, allowing downstream systems to behave predictably during both parallel and sequential coordination paths.',
            'Propagation is continuously monitored and observed, making orchestration behavior traceable from ingestion through delivery.',
        ],
    },

    pipeline: {
        direction: 'horizontal',

        mobileDirection: 'vertical',

        stages: [
            {
                id: 'event-ingestion',

                index: '01',

                title: 'Event Ingestion',

                description:
                    'Capture inbound signals from APIs, queues, databases, webhooks, and external systems.',

                icon: 'radio',

                annotations: [
                    'Inbound context detected.',
                    'External signal validated.',
                ],

                indicators: {
                    pulse: true,
                    queueActivity: true,
                    propagation: false,
                },
            },

            {
                id: 'context-resolution',

                index: '02',

                title: 'Context Resolution',

                description:
                    'Resolve workflow context, routing conditions, and dependency relationships before coordination begins.',

                icon: 'binary',

                annotations: [
                    'Conditions evaluated.',
                    'Dependencies resolved.',
                ],

                indicators: {
                    pulse: true,
                    queueActivity: false,
                    propagation: true,
                },
            },

            {
                id: 'flow-coordination',

                index: '03',

                title: 'Flow Coordination',

                description:
                    'Coordinate downstream operations across connected services and orchestration layers.',

                icon: 'git-branch',

                annotations: [
                    'Routing synchronized.',
                    'Parallel paths coordinated.',
                ],

                indicators: {
                    pulse: true,
                    queueActivity: false,
                    propagation: true,
                },
            },

            {
                id: 'state-propagation',

                index: '04',

                title: 'State Propagation',

                description:
                    'Propagate operational state across connected nodes and distributed infrastructure boundaries.',

                icon: 'share-2',

                annotations: [
                    'State transferred.',
                    'Transitions propagated.',
                ],

                indicators: {
                    pulse: true,
                    queueActivity: false,
                    propagation: true,
                },
            },

            {
                id: 'delivery-layer',

                index: '05',

                title: 'Action & Delivery',

                description:
                    'Dispatch coordinated operations to APIs, storage systems, AI services, queues, and connected integrations.',

                icon: 'send',

                annotations: [
                    'Actions dispatched.',
                    'Delivery confirmed.',
                ],

                indicators: {
                    pulse: true,
                    queueActivity: true,
                    propagation: false,
                },
            },

            {
                id: 'observability-layer',

                index: '06',

                title: 'Observability Layer',

                description:
                    'Collect operational telemetry, transitions, diagnostics, and synchronization visibility continuously.',

                icon: 'activity',

                annotations: [
                    'Telemetry updated.',
                    'State visibility synchronized.',
                ],

                indicators: {
                    pulse: true,
                    queueActivity: false,
                    propagation: false,
                },
            },
        ],

        connectors: [
            {
                from: 'event-ingestion',
                to: 'context-resolution',
            },
            {
                from: 'context-resolution',
                to: 'flow-coordination',
            },
            {
                from: 'flow-coordination',
                to: 'state-propagation',
            },
            {
                from: 'state-propagation',
                to: 'delivery-layer',
            },
            {
                from: 'delivery-layer',
                to: 'observability-layer',
            },
        ],
    },

    propagation: {
        enabled: true,

        behaviors: [
            'sequential-pulse',
            'parallel-synchronization',
            'conditional-routing',
            'downstream-propagation',
            'telemetry-stream',
        ],

        flowDirection: 'left-to-right',

        preserveContinuity: true,

        synchronizedTransitions: true,
    },

    orchestrationConcepts: [
        {
            title: 'Deterministic Coordination',
            description:
                'Every transition path remains explicit and operationally traceable.',
        },

        {
            title: 'Continuous Synchronization',
            description:
                'State continuity is preserved across distributed orchestration stages.',
        },

        {
            title: 'Conditional Routing',
            description:
                'Flow decisions are evaluated procedurally during propagation.',
        },

        {
            title: 'Operational Visibility',
            description:
                'Every orchestration layer contributes to system-wide observability.',
        },
    ],

    interaction: {
        enableStageFocus: true,
        enablePipelineHighlight: true,
        enablePropagationPreview: true,
        enableOperationalInspection: true,
    },

    responsive: {
        stackPipelineOnMobile: true,
        simplifyAnimationsOnMobile: true,
        preserveSequentialFlow: true,
        preserveStageClarity: true,
    },
} as const;