'use client';

import React from 'react';
import { ConfigField } from "@neuron/shared";

import { TextField } from "./fields/TextField";
import { NumberField } from "./fields/NumberField";
import { SwitchField } from "./fields/SwitchField";
import { SelectField } from "./fields/SelectField";
import { ObjectField } from "./fields/ObjectField";
import { ArrayField } from "./fields/ArrayField";
import { KeyValueField } from "./fields/KeyValueField";
import { CodeField } from "./fields/CodeField";
import { JsonField } from "./fields/JsonField";
import { isFieldHidden } from "@/lib/config/path";
import { TemplateField } from "@/components/workflow/editor/config/renderer/fields/TemplateField";

interface ConfigFieldRendererProps {
    field: ConfigField;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
}

export function ConfigFieldRenderer({
                                        field,
                                        values,
                                        onChange
                                    }: ConfigFieldRendererProps) {
    const isHidden = isFieldHidden(field.hidden, values);

    if (isHidden) return null;

    return (
        <div className="relative w-full">
            {(field.type === "text" || field.type === "textarea" || field.type === "secret") && (
                <TextField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "code" && (
                <CodeField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "json" && (
                <JsonField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "template" && (
                <TemplateField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "number" && (
                <NumberField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "switch" && (
                <SwitchField field={field} values={values} onChange={onChange} />
            )}
            {(field.type === "select" || field.type === "multiselect") && (
                <SelectField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "object" && (
                <ObjectField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "array" && (
                <ArrayField field={field} values={values} onChange={onChange} />
            )}
            {field.type === "keyvalue" && (
                <KeyValueField field={field} values={values} onChange={onChange} />
            )}
        </div>
    );
}