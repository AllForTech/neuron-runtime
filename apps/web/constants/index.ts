import type { NodeConfigType } from '@neuron/shared';
import {
    Slack,
    Github,
    Mail,
    MessageSquare,
    Database,
    Calendar,
    BarChart3,
    Infinity,
    Workflow,
    Cpu,
    Layers,
    Terminal,
    GitBranch,
    Share2,
    Zap,
    Brain,
    Shield,
    GitMerge,
    Activity,
    Send, LucideIcon,
} from 'lucide-react';
import { NodeType } from "@neuron/shared";


export * from './editor-panel';
export * from './panel-registry';

export const neuronSteps = [
  {
    id: 1,
    icon: Zap,
    title: 'Event Ingestion',
    description:
      'Neuron acts as your system’s entry point, capturing events from APIs, webhooks, and databases in real time. Every signal is normalized and prepared for downstream execution.',
    position: 'top-left',
  },
  {
    id: 2,
    icon: Cpu,
    title: 'Workflow Execution',
    description:
      'Neuron processes incoming data through node-based workflows, applying logic, conditions, and AI-driven decisions to determine the correct execution path.',
    position: 'center-right',
  },
  {
    id: 3,
    icon: Activity,
    title: 'Action & Delivery',
    description:
      'Results are executed instantly triggering APIs, automations, or external systems while maintaining a structured execution trace for full visibility.',
    position: 'bottom-left',
  },
];

export type AuthMethod = 'oauth' | 'apikey';

export interface IntegrationPlatform {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'Communication' | 'DevTools' | 'Productivity' | 'Data';
  authMethod: AuthMethod;
  color: string;
}

export const SUPPORTED_PLATFORMS: IntegrationPlatform[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Post messages, alerts, and manage channels.',
    icon: Slack,
    category: 'Communication',
    authMethod: 'oauth',
    color: '#4A154B',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Send automated template messages via Meta.',
    icon: MessageSquare,
    category: 'Communication',
    authMethod: 'apikey',
    color: '#25D366',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Trigger workflows on commits or PRs.',
    icon: Github,
    category: 'DevTools',
    authMethod: 'oauth',
    color: '#181717',
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Sync tasks and track project progress.',
    icon: Infinity,
    category: 'Productivity',
    authMethod: 'oauth',
    color: '#F06595',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Manage issues and agile development.',
    icon: BarChart3,
    category: 'Productivity',
    authMethod: 'oauth',
    color: '#0052CC',
  },
  {
    id: 'google',
    name: 'Google Drive',
    description: 'Access files and cloud storage.',
    icon: Database,
    category: 'Data',
    authMethod: 'oauth',
    color: '#4285F4',
  },
];

export const WorkflowCategory = {
  aiAgentWorkflow: 'Ai Agent Workflow',
  automationWorkflow: 'Automation Workflow',
  hybridWorkflow: 'Hybrid Workflow',
  custom: 'Custom',
};

export enum WorkflowActionType {
  SET_WORKFLOWS = 'SET_WORKFLOWS',
  ADD_WORKFLOW = 'ADD_WORKFLOW',
  DELETE_WORKFLOW = 'DELETE_WORKFLOW',
  UPDATE_WORKFLOW = 'UPDATE_WORKFLOW',
  UPDATE_STATUS = 'UPDATE_STATUS',
}

export enum WorkflowEditorActionType {
  SET_WORKFLOW_ID = 'SET_WORKFLOW_ID',
  SET_GRAPH = 'SET_GRAPH',
  ADD_NODE = 'ADD_NODE',
  ADD_EDGE = 'ADD_EDGE',
  UPDATE_NODE = 'UPDATE_NODE',
  UPDATE_EDGE = 'UPDATE_EDGE',
  UPDATE_NODE_POSITION = 'UPDATE_NODE_POSITION',
  DELETE_NODE = 'DELETE_NODE',
  DELETE_EDGE = 'DELETE_EDGE',

  UPDATE_DIRTY_STATE = 'UPDATE_DIRTY_STATE',

  UPDATE_WORKFLOW = 'UPDATE_WORKFLOW',
  UPDATE_STATUS = 'UPDATE_STATUS',

  NODE_EXECUTION_START = 'NODE_EXECUTION_START',
  NODE_EXECUTION_SUCCESS = 'NODE_EXECUTION_SUCCESS',
  NODE_EXECUTION_ERROR = 'NODE_EXECUTION_ERROR',
  RESET_NODE_STATUS = 'RESET_NODE_STATUS',

  EDGE_EXECUTION_START = 'EDGE_EXECUTION_START',
  EDGE_EXECUTION_END = 'EDGE_EXECUTION_END',

  UPDATE_GLOBAL_VARS = 'UPDATE_GLOBAL_VARS',

  SET_DEPLOYMENT = 'SET_DEPLOYMENT',
  UPDATE_DEPLOYMENT = 'UPDATE_DEPLOYMENT',

  SET_EXECUTIONS = 'SET_EXECUTIONS',
  UPDATE_EXECUTIONS = 'UPDATE_EXECUTIONS',
  DELETE_EXECUTIONS = 'DELETE_EXECUTIONS',
}

export type FloatingItem = {
  title: string;
  icon: any;
  desc: string;
  side: 'left' | 'right';
};


export const SINGLETON_NODE_TYPES: NodeType[] = ['Trigger.Webhook', 'Trigger.Schedule', 'Trigger.Manual', 'Network.Respond', 'Utility.Context'];
