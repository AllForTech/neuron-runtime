export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogPayload {
    module: string;
    context?: Record<string, any>;
    error?: any;
}