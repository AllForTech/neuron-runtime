export const CTA_SECTION = {
    id: 'cta',

    heading: 'Ready to orchestrate your infrastructure?',

    description:
        'Join the next generation of data-driven teams. Start building intelligent automation today.',

    cta: {
        label: 'Begin Your Journey',
        href: '/signup',
    },

    footer: {
        columns: [
            {
                id: 'platform',
                title: 'Platform',
                links: [
                    { label: 'Documentation', href: '/docs' },
                    { label: 'API Reference', href: '/api' },
                    { label: 'Runtime SDK', href: '/sdk' },
                    { label: 'Examples', href: '/examples' },
                ],
            },
            {
                id: 'resources',
                title: 'Resources',
                links: [
                    { label: 'GitHub', href: 'https://github.com/neuron-engine', external: true },
                    { label: 'Changelog', href: '/changelog' },
                    { label: 'Status', href: '/status' },
                    { label: 'Blog', href: '/blog' },
                ],
            },
            {
                id: 'company',
                title: 'Company',
                links: [
                    { label: 'About', href: '/about' },
                    { label: 'Careers', href: '/careers' },
                    { label: 'Contact', href: '/contact' },
                ],
            },
            {
                id: 'legal',
                title: 'Legal',
                links: [
                    { label: 'Privacy', href: '/privacy' },
                    { label: 'Terms', href: '/terms' },
                    { label: 'Security', href: '/security' },
                ],
            },
        ],
    },

    status: {
        version: 'v0.1.0',
        apiStatus: 'Operational',
    },
} as const;