'use client';

import React, { useMemo, memo } from 'react';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import { FieldWrapper } from '../FieldWrapper';
import { getAvailableUpstreamNodes } from '@/lib/utils';
import {useWorkflowEditor} from "@/hooks/workflow/useWorkflowEditor";
import { TemplateFieldSchema } from "@neuron/shared";

export function TemplateField({ field, values, onChange }: {
    field: TemplateFieldSchema;
    values: Record<string, unknown>;
    onChange: (path: string, value: string) => void;
}) {
    const { editorState: { graph: { nodes, edges }}, selectedNode } = useWorkflowEditor();

    const availableVariables = useMemo(() => {
        if (!selectedNode || !nodes[selectedNode.id]) return [];

        return getAvailableUpstreamNodes(selectedNode.id, {
            nodes,
            edges,
        });
    }, [selectedNode, nodes, edges]);

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <TemplateTextarea
                value={(values[field.path] as string) || ""}
                variables={availableVariables}
                placeholder={field.placeholder as string | undefined}
                disabled={field.disabled}
                onChange={(val) => onChange(field.path, val)}
                className={"min-h-[120px] z-50 h-full"}
            />
        </FieldWrapper>
    );
}