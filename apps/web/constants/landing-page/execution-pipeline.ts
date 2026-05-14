export const EXECUTION_PIPELINE_SECTION = {
    id: 'execution-pipeline',

    badge: 'Execution Pipeline',

    heading: 'Orchestrate any workflow',

    description: 'Connect systems, apply logic, execute actions with full traceability.',

    steps: [
        {
            id: 'ingestion',
            index: '01',
            title: 'Event Ingestion',
            description: 'Capture events from APIs, queues, webhooks, and databases.',
        },
        {
            id: 'workflow',
            index: '02',
            title: 'Workflow Execution',
            description: 'Apply business logic and AI decisions to determine the path.',
        },
        {
            id: 'delivery',
            index: '03',
            title: 'Action & Delivery',
            description: 'Execute across systems with full traceability.',
        },
    ],

    integrations: [
        'AWS',
        'Kafka',
        'Slack',
        'Stripe',
        'GitHub',
        'PostgreSQL',
        'OpenAI',
    ],
} as const;