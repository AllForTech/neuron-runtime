import {
    ConfigField,
    ObjectFieldSchema
} from "@neuron/shared";
import set from 'lodash/set';
import get from 'lodash/get';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';
import unset from 'lodash/unset';

export function getValueAtPath<T = any>(obj: any, path: string, defaultValue?: T): T {
    return get(obj, path, defaultValue);
}

export function setValueAtPath<T extends Record<string, any>>(obj: T, path: string, value: any): T {
    if (!path) return obj;
    const result = cloneDeep(obj);
    set(result, path, value);
    return result;
}

export function removeValueByPath<T extends Record<string, any>>(obj: T, path: string): T {
    if (!path) return obj;
    const result = cloneDeep(obj);
    unset(result, path);
    return result;
}

export function hasPath(obj: any, path: string): boolean {
    return has(obj, path);
}

export function buildDefaultValues(fields: ConfigField[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const field of fields) {
        if (field.defaultValue !== undefined) {
            result[field.path] = field.defaultValue;
        }

        if (field.type === "object") {
            const objectField = field as ObjectFieldSchema;
            result[field.path] = buildDefaultValues(objectField.fields);
        }

        if (field.type === "array") {
            result[field.path] = [];
        }
    }

    return result;
}

export function isFieldHidden(
    hidden: boolean | ((values: Record<string, any>) => boolean) | undefined,
    values: Record<string, any>
): boolean {
    if (typeof hidden === "function") {
        return hidden(values);
    }
    return hidden === true;
}