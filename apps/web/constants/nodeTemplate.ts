import {
    ConditionNodeConfig,
    ContextNodeConfig,
    DebugNodeConfig,
    DecisionNodeConfig, getBaseConfig,
    HttpRequestNodeConfig,
    IntegrationNodeConfig,
    LLMNodeConfig,
    NodeConfigType,
    NodeType,
    OutputNodeConfig,
    RespondNodeConfig,
    TransformNodeConfig,
    TriggerNodeConfig,
} from '@neuron/shared';
import {
  Zap,
  Globe,
  Bug,
  Split,
  Code2,
  Sparkles,
  Slack,
  MessageSquare,
  FileJson,
  Send,
  Database,
  LucideIcon,
} from 'lucide-react';

export interface NodeTemplate {
  key: string;
  type: NodeType; // Changed from string to NodeType for strictness
  label: string;
  category: 'Logic' | 'Network' | 'AI' | 'Communication' | 'Data';
  description: string;
  icon: LucideIcon; // Added Icon property
  defaultConfig: NodeConfigType;
}

export const HTTP_METHODS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
];

/**
 * Helper to generate default base settings for templates
 */
