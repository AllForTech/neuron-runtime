'use client';

import { NodeConfigSchema } from "@neuron/shared";
import { ConfigSectionRenderer } from "./ConfigSectionRenderer";

interface NodeConfigRendererProps {
    schema: NodeConfigSchema;

    values: Record<string, any>;

    onChange: (
        path: string,
        value: any
    ) => void;
}

export function NodeConfigRenderer({
                                       schema,
                                       values,
                                       onChange
                                   }: NodeConfigRendererProps) {
    return (
        <div className="flex flex-col gap-5">
            {schema.sections.map((section) => (
                <ConfigSectionRenderer
                    key={section.id}
                    section={section}
                    values={values}
                    onChange={onChange}
                />
            ))}
        </div>
    );
}