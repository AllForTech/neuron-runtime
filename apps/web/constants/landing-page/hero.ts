export const HERO_SECTION = {
    id: 'hero',

    badge: {
        label: 'Distributed Execution Infrastructure',
    },

    headline: 'BEYOND CODE.',

    subheadline: 'Autonomous backend orchestration kernel. Build visually, deploy instantly.',

    cta: {
        primary: {
            label: 'Get Started',
            href: '/signup',
        },
        secondary: {
            label: 'Explore Platform',
            href: '#capabilities',
        },
    },

    orb: {
        coreRadius: 0.8,
        particleCount: 80,
        orbitRadius: 2.5,
        rotationSpeed: 0.15,
        pulseIntensity: 0.3,
    },

    nodeConstellations: [
        {
            id: 'api',
            label: 'APIs',
            orbitIndex: 0,
            angle: 0,
            distance: 1.8,
        },
        {
            id: 'database',
            label: 'Databases',
            orbitIndex: 1,
            angle: 120,
            distance: 2.2,
        },
        {
            id: 'ai',
            label: 'AI Models',
            orbitIndex: 2,
            angle: 240,
            distance: 2.0,
        },
        {
            id: 'queue',
            label: 'Queues',
            orbitIndex: 0,
            angle: 60,
            distance: 2.5,
        },
        {
            id: 'storage',
            label: 'Storage',
            orbitIndex: 1,
            angle: 180,
            distance: 2.3,
        },
        {
            id: 'compute',
            label: 'Compute',
            orbitIndex: 2,
            angle: 300,
            distance: 2.1,
        },
    ],

    connectionLines: [
        { from: 'api', to: 'database' },
        { from: 'database', to: 'ai' },
        { from: 'ai', to: 'queue' },
        { from: 'queue', to: 'storage' },
        { from: 'storage', to: 'compute' },
        { from: 'compute', to: 'api' },
    ],

    systemMetrics: [
        { label: 'Execution Model', value: 'Deterministic' },
        { label: 'Observability', value: 'Traceable' },
        { label: 'Architecture', value: 'Node-Based' },
    ],
} as const;