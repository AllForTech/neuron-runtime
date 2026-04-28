'use client';

import {
    ConfigField
} from "@neuron/shared";

import { isFieldHidden } from "@/lib/config/path";

import { TextField } from "./fields/TextField";
import { NumberField } from "./fields/NumberField";
import { SwitchField } from "./fields/SwitchField";
import { SelectField } from "./fields/SelectField";
import { ObjectField } from "./fields/ObjectField";
import { ArrayField } from "./fields/ArrayField";

interface ConfigFieldRendererProps {
    field: ConfigField;

    values: Record<string, any>;

    onChange: (
        path: string,
        value: any
    ) => void;
}

export function ConfigFieldRenderer({
                                        field,
                                        values,
                                        onChange
                                    }: ConfigFieldRendererProps) {
    if (isFieldHidden(field.hidden, values)) {
        return null;
    }

    switch (field.type) {
        case "text":
        case "textarea":
            return (
                <TextField
                    field={field}
                    values={values}
                    onChange={onChange}
                />
            );

        case "number":
            return (
                <NumberField
                    field={field}
                    values={values}
                    onChange={onChange}
                />
            );

        case "switch":
            return (
                <SwitchField
                    field={field}
                    values={values}
                    onChange={onChange}
                />
            );

        case "select":
            return (
                <SelectField
                    field={field}
                    values={values}
                    onChange={onChange}
                />
            );

        case "object":
            return (
                <ObjectField
                    field={field}
                    values={values}
                    onChange={onChange}
                />
            );

        case "array":
            return (
                <ArrayField
                    field={field}
                    values={values}
                    onChange={onChange}
                />
            );

        default:
            return null;
    }
}