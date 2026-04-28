import { ObjectFieldSchema, ConfigField } from "@neuron/shared";
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import { getLayoutClass } from "../Layout";

export function ObjectField({ field, values, onChange }: {
    field: ObjectFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void
}) {
    return (
        <div className="flex flex-col gap-4 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
            {field.label && <span className="text-xs font-bold text-neutral-400 uppercase tracking-tight">{field.label}</span>}
            <div className={getLayoutClass(field.layout)}>
                {field.fields.map((subField) => (
                    <ConfigFieldRenderer
                        key={subField.path}
                        // Important: Nested fields paths are relative to the parent
                        field={subField}
                        values={values}
                        onChange={onChange}
                    />
                ))}
            </div>
        </div>
    );
}