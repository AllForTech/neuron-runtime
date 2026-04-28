'use client';

import { NodeConfigSection } from "@neuron/shared";
import { getLayoutClass } from "./Layout";
import { ConfigFieldRenderer } from "./ConfigFieldRenderer";

interface ConfigSectionRendererProps {
    section: NodeConfigSection;

    values: Record<string, any>;

    onChange: (
        path: string,
        value: any
    ) => void;
}

export function ConfigSectionRenderer({
                                          section,
                                          values,
                                          onChange
                                      }: ConfigSectionRendererProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            {(section.title || section.description) && (
                <div className="flex flex-col gap-1">
                    {section.title && (
                        <h3 className="text-sm font-semibold text-neutral-200">
                            {section.title}
                        </h3>
                    )}

                    {section.description && (
                        <p className="text-xs text-neutral-500">
                            {section.description}
                        </p>
                    )}
                </div>
            )}

            <div className={getLayoutClass(section.layout)}>
                {section.fields.map((field) => (
                    <ConfigFieldRenderer
                        key={field.path}
                        field={field}
                        values={values}
                        onChange={onChange}
                    />
                ))}
            </div>
        </div>
    );
}