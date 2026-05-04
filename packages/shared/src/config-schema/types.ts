import { ConfigLayoutType } from "./layouts";
import { ConfigOption } from "./shared";
import { FieldValidationRule } from "./validation";
import {ConfigFieldType} from "./field-types";

export interface BaseConfigField {
    id: string;

    type: ConfigFieldType;

    path: string;

    label?: string;
    description?: string;

    placeholder?: {
        key?: string;
        value?: string;
    } | string;

    required?: boolean;
    disabled?: boolean;

    defaultValue?: any;

    validations?: FieldValidationRule[];

    hidden?:
        | boolean
        | ((values: Record<string, any>) => boolean);

    width?: number;

    className?: string;
}

export interface TextFieldSchema
    extends BaseConfigField {
    type: "text" | "textarea" | "secret";
}

export interface CodeFieldSchema
    extends BaseConfigField {
    type: "code";
}

export interface JsonFieldSchema
    extends BaseConfigField {
    type: "json";
}

export interface TemplateFieldSchema extends BaseConfigField {
    type: "template";

    /**
     * Toggle to allow multi-line editing.
     * If true, it uses the larger TemplateTextarea style.
     */
    multiline?: boolean;

    showVariableHelper?: boolean;
}

export interface NumberFieldSchema
    extends BaseConfigField {
    type: "number";

    min?: number;
    max?: number;
    step?: number;
}

export interface SwitchFieldSchema
    extends BaseConfigField {
    type: "switch";
}

export interface SelectFieldSchema
    extends BaseConfigField {
    type: "select" | "multiselect";

    options: ConfigOption[];
}

export interface ObjectFieldSchema
    extends BaseConfigField {
    type: "object";

    layout?: ConfigLayoutType;

    fields: ConfigField[];
}

export interface ArrayFieldSchema
    extends BaseConfigField {
    type: "array";

    itemLabel?: string;

    layout?: ConfigLayoutType;

    fields: ConfigField[];

    defaultItem?: Record<string, any>;
}

export interface KeyValueFieldSchema
    extends BaseConfigField {
    type: "keyvalue";

    valueType?: "text" | "template";
}

export interface DialogFieldSchema
    extends BaseConfigField {
    type: "dialog";

    triggerLabel?: string;

    sections: import("./sections").NodeConfigSection[];
}

export type ConfigField =
    | TextFieldSchema
    | CodeFieldSchema
    | JsonFieldSchema
    | NumberFieldSchema
    | SwitchFieldSchema
    | SelectFieldSchema
    | ObjectFieldSchema
    | ArrayFieldSchema
    | KeyValueFieldSchema
    | DialogFieldSchema
    | TemplateFieldSchema;