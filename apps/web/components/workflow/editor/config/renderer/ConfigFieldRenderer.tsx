'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import {TemplateField} from "@/components/workflow/editor/config/renderer/fields/TemplateField";

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

    const renderField = () => {
        switch (field.type) {
            case "text":
            case "textarea":
            case "secret":
                return <TextField field={field} values={values} onChange={onChange} />;
            case "code":
                return <CodeField field={field} values={values} onChange={onChange} />;
            case "json":
                return <JsonField field={field} values={values} onChange={onChange} />;
            case "template":
                return <TemplateField field={field} values={values} onChange={onChange} />;
            case "number":
                return <NumberField field={field} values={values} onChange={onChange} />;
            case "switch":
                return <SwitchField field={field} values={values} onChange={onChange} />;
            case "select":
            case "multiselect":
                return <SelectField field={field} values={values} onChange={onChange} />;
            case "object":
                return <ObjectField field={field} values={values} onChange={onChange} />;
            case "array":
                return <ArrayField field={field} values={values} onChange={onChange} />;
            case "keyvalue":
                return <KeyValueField field={field} values={values} onChange={onChange} />;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!isHidden && (
                <motion.div
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        opacity: { duration: 0.2 }
                    }}
                    className="relative w-full"
                >
                    {renderField()}
                </motion.div>
            )}
        </AnimatePresence>
    );
}