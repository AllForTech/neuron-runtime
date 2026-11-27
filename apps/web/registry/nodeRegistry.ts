import {
    NodeType,
    HttpRequestNodeConfig,
    LLMNodeConfig,
    ValidationError,
    TriggerNode,
    HttpRequestNode,
    LLMNode,
} from '@neuron/shared';
import { ValidationFunction } from '@/types/validation';
import {
    Zap,
    Globe,
    Sparkles,
    Bug,
    Clock,
    GitBranch,
    Binary,
    ArrowRightCircle,
    Database,
    Terminal,
    Layers
} from 'lucide-react';

interface NodeRegistryEntry {
    validate: ValidationFunction;
    icon: React.ElementType;
    styles: {
        iconClass: string;
        bgClass: string;
    };
}

const validateTrigger = (node: TriggerNode) => {
    const errors: ValidationError[] = [];
    if (!node.config.triggerType) {
        errors.push({ nodeId: node.id, field: 'triggerType', message: 'Trigger type is required', level: 'error' });
    }
    return errors;
};

export const nodeRegistry: Record<NodeType, NodeRegistryEntry> = {
    "Trigger.Webhook": {
        icon: Zap,
        styles: { iconClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
        validate: validateTrigger,
    },
    "Trigger.Schedule": {
        icon: Zap,
        styles: { iconClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
        validate: validateTrigger,
    },
    "Trigger.Manual": {
        icon: Zap,
        styles: { iconClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
        validate: validateTrigger,
    },
    "Network.Http": {
        icon: Globe,
        styles: { iconClass: "text-blue-400", bgClass: "bg-blue-500/10 border-blue-500/20" },
        validate: (node: HttpRequestNode) => {
            const errors: ValidationError[] = [];
            const config = node.config as HttpRequestNodeConfig;
            if (!config.url) {
                errors.push({ nodeId: node.id, field: 'url', message: 'URL endpoint is missing', level: 'error' });
            }
            return errors;
        },
    },
    "AI.Llm": {
        icon: Sparkles,
        styles: { iconClass: "text-indigo-400", bgClass: "bg-indigo-500/10 border-indigo-500/20" },
        validate: (node: LLMNode) => {
            const errors: ValidationError[] = [];
            const config = node.config as LLMNodeConfig;
            if (!config.userPrompt) {
                errors.push({ nodeId: node.id, field: 'userPrompt', message: 'Prompt cannot be empty', level: 'error' });
            }
            if (config.jsonMode && !config.outputSchema) {
                errors.push({ nodeId: node.id, field: 'outputSchema', message: 'Output schema is required', level: 'warning' });
            }
            if (!config.apiKey) {
                errors.push({ nodeId: node.id, field: 'apiKey', message: 'API Key required', level: 'error' });
            }
            return errors;
        },
    },
    "Utility.Debug": {
        icon: Bug,
        styles: { iconClass: "text-rose-400", bgClass: "bg-rose-500/10 border-rose-500/20" },
        validate: () => []
    },
    "Logic.Delay": {
        icon: Clock,
        styles: { iconClass: "text-neutral-400", bgClass: "bg-neutral-500/10 border-neutral-500/20" },
        validate: () => []
    },
    "Logic.Condition": {
        icon: GitBranch,
        styles: { iconClass: "text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20" },
        validate: () => []
    },
    "Utility.Transform": {
        icon: Binary,
        styles: { iconClass: "text-cyan-400", bgClass: "bg-cyan-500/10 border-cyan-500/20" },
        validate: () => []
    },
    "Logic.Decision": {
        icon: GitBranch,
        styles: { iconClass: "text-orange-400", bgClass: "bg-orange-500/10 border-orange-500/20" },
        validate: () => []
    },
    "Utility.Output": {
        icon: Database,
        styles: { iconClass: "text-purple-400", bgClass: "bg-purple-500/10 border-purple-500/20" },
        validate: () => []
    },
    "Network.Respond": {
        icon: ArrowRightCircle,
        styles: { iconClass: "text-emerald-500", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
        validate: () => []
    },
    "Utility.Context": {
        icon: Layers,
        styles: { iconClass: "text-slate-400", bgClass: "bg-slate-500/10 border-slate-500/20" },
        validate: () => []
    },
    "Integration.Service": {
        icon: Terminal,
        styles: { iconClass: "text-blue-300", bgClass: "bg-blue-400/10 border-blue-400/20" },
        validate: () => []
    },
};