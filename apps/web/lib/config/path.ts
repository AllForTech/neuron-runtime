import {
    ConfigField,
    ObjectFieldSchema,
    ArrayFieldSchema
} from "@neuron/shared";

const PATH_REGEX = /[^.[\]]+/g;

export function parsePath(path: string): string[] {
    return path.match(PATH_REGEX) || [];
}

export function getValueAtPath<T = any>(obj: any, path: string, defaultValue?: T): T {
    if (!path || !obj) return defaultValue as T;
    const segments = parsePath(path);
    let current = obj;
    for (const segment of segments) {
        if (current == null) return defaultValue as T;
        current = current[segment];
    }
    return (current ?? defaultValue) as T;
}

export function setValueAtPath<T extends Record<string, any>>(obj: T, path: string, value: any): T {
    const segments = parsePath(path);
    if (segments.length === 0) return obj;

    // Deep clone to maintain immutability for React
    const result = Array.isArray(obj) ? [...obj] : { ...obj };
    let current: any = result;

    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        const nextSegment = segments[i + 1];

        // Create the path if it doesn't exist
        if (current[segment] == null) {
            current[segment] = isNaN(Number(nextSegment)) ? {} : [];
        } else {
            // Clone the next level
            current[segment] = Array.isArray(current[segment])
                ? [...current[segment]]
                : { ...current[segment] };
        }
        current = current[segment];
    }

    current[segments[segments.length - 1]] = value;
    return result as T;
}
export function buildDefaultValues(
    fields: ConfigField[]
): Record<string, any> {
    const result: Record<string, any> = {};

    for (const field of fields) {
        if (field.defaultValue !== undefined) {
            result[field.path] = field.defaultValue;
        }

        if (field.type === "object") {
            const objectField = field as ObjectFieldSchema;

            result[field.path] = buildDefaultValues(
                objectField.fields
            );
        }

        if (field.type === "array") {
            const arrayField = field as ArrayFieldSchema;

            result[field.path] = [];
        }
    }

    return result;
}

export function getValueByPath<T = any>(
    obj: Record<string, any>,
    path: string,
    defaultValue?: T
): T {
    if (!path) {
        return obj as T;
    }

    const segments = parsePath(path);

    let current: any = obj;

    for (const segment of segments) {
        if (current == null) {
            return defaultValue as T;
        }

        current = current[segment];
    }

    return (current ?? defaultValue) as T;
}

export function removeValueByPath<T extends Record<string, any>>(
    obj: T,
    path: string
): T {
    const segments = parsePath(path);

    if (segments.length === 0) {
        return obj;
    }

    const result: any = Array.isArray(obj)
        ? [...obj]
        : { ...obj };

    let current: any = result;

    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];

        if (current[segment] == null) {
            return result;
        }

        current[segment] = Array.isArray(current[segment])
            ? [...current[segment]]
            : { ...current[segment] };

        current = current[segment];
    }

    const lastSegment = segments[segments.length - 1];

    if (Array.isArray(current)) {
        current.splice(Number(lastSegment), 1);
    } else {
        delete current[lastSegment];
    }

    return result;
}

export function hasPath(
    obj: Record<string, any>,
    path: string
): boolean {
    const segments = parsePath(path);

    let current: any = obj;

    for (const segment of segments) {
        if (
            current == null ||
            !(segment in current)
        ) {
            return false;
        }

        current = current[segment];
    }

    return true;
}

export function isFieldHidden(
    hidden:
        | boolean
        | ((values: Record<string, any>) => boolean)
        | undefined,
    values: Record<string, any>
): boolean {
    if (typeof hidden === "function") {
        return hidden(values);
    }

    return hidden === true;
}