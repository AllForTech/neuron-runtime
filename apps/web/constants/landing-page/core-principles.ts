export const CORE_PRINCIPLES_SECTION = {
    id: 'core-principles',

    badge: 'Core Pillars',

    heading: 'System Determinism',

    pillars: [
        {
            id: 'deterministic',
            title: 'Deterministic Execution',
            description: 'Every event. Every time. Deterministic by design.',
            icon: 'route',
        },
        {
            id: 'resilient',
            title: 'Resilient By Design',
            description: 'Retries, compensation, and fault tolerance built-in.',
            icon: 'shield',
        },
        {
            id: 'observable',
            title: 'Full Observability',
            description: 'Trace every node. Visualize every decision.',
            icon: 'eye',
        },
        {
            id: 'extensible',
            title: 'Limitless Extensibility',
            description: 'Integrate anything. Build without boundaries.',
            icon: 'layers',
        },
    ],
} as const;