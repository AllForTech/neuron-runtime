'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { SchemaField } from "@neuron/shared";

type NodeOutputContextType = {
  nodeOutputs: Record<string, Record<string, SchemaField>>;
  setNodeOutput: (nodeId: string, schema: Record<string, SchemaField>) => void;
};

export const NodeOutputContext = createContext<
  NodeOutputContextType | undefined
>(undefined);

export const NodeOutputProvider = ({ children }: { children: ReactNode }) => {
  const [nodeOutputs, setNodeOutputs] = useState<
    Record<string, Record<string, SchemaField>>
  >({});

  const setNodeOutput = (
    nodeId: string,
    schema: Record<string, SchemaField>
  ) => {
    setNodeOutputs((prev) => ({ ...prev, [nodeId]: schema }));
  };

  return (
    <NodeOutputContext.Provider value={{ nodeOutputs, setNodeOutput }}>
      {children}
    </NodeOutputContext.Provider>
  );
};
