import { NodeDefinition, NodeType } from '@neuron/shared';

/**
 * Interface for the centralized Node Registry.
 * Handles discovery, storage, and retrieval of node packages.
 */
export interface INodeRegistry {
    /**
     * Adds a new node definition to the system.
     * @throws Error if the node type is already registered.
     */
    register(node: NodeDefinition): void;

    /**
     * Retrieves a specific node definition by its unique type.
     * @throws Error if the node type does not exist.
     */
    get(type: NodeType): NodeDefinition;

    /**
     * Returns an array of all registered node definitions.
     * Useful for populating the frontend node picker/sidebar.
     */
    getAll(): NodeDefinition[];

    /**
     * Checks if a specific node type is currently supported.
     */
    has(type: NodeType): boolean;
}