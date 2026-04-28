'use client';

import React, { useMemo } from 'react';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import { FieldWrapper } from '../FieldWrapper';
import { getAvailableUpstreamNodes } from '@/lib/utils';
import {useWorkflowEditor} from "@/hooks/workflow/useWorkflowEditor";

export function TemplateField({ field, values, onChange }: any) {
    const { editorState: { graph: { nodes, edges }}, selectedNode } = useWorkflowEditor();

    // 1. Calculate accessible variables based on the currently selected node
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
                value={values[field.path] || ""}
                variables={availableVariables}
                placeholder={field.placeholder}
                disabled={field.disabled}
                onChange={(val) => onChange(field.path, val)}
            />
        </FieldWrapper>
    );
}