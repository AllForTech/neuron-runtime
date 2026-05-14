export const CONNECTIVE_INTELLIGENCE_SECTION = {
    id: 'capabilities',

    badge: 'Connective Intelligence',

    heading: 'Orchestrate Complexity',

    description:
        'Neuron Engine connects your systems, data, and services as nodes and orchestrates them into deterministic execution flows.',

    categories: [
        {
            id: 'storage',
            title: 'Storage',
            systems: ['PostgreSQL', 'MongoDB', 'Redis', 'S3'],
        },
        {
            id: 'messaging',
            title: 'Messaging',
            systems: ['Kafka', 'RabbitMQ', 'Pub/Sub', 'Webhooks'],
        },
        {
            id: 'ai',
            title: 'AI',
            systems: ['OpenAI', 'Anthropic', 'Hugging Face', 'Custom LLMs'],
        },
        {
            id: 'auth',
            title: 'Auth',
            systems: ['Clerk', 'Auth0', 'Firebase', 'JWT'],
        },
    ],

    integrations: [
        { name: 'AWS', category: 'cloud' },
        { name: 'Stripe', category: 'payments' },
        { name: 'Slack', category: 'notifications' },
        { name: 'GitHub', category: 'devops' },
        { name: 'Cloudflare', category: 'infrastructure' },
        { name: 'Vercel', category: 'deployment' },
        { name: 'Supabase', category: 'database' },
        { name: 'Linear', category: 'project-management' },
    ],
} as const;