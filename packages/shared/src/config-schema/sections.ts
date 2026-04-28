import { ConfigLayoutType } from "./layouts";
import { ConfigField } from "./types";

export interface NodeConfigSection {
    id: string;

    title?: string;
    description?: string;

    layout?: ConfigLayoutType;

    collapsible?: boolean;

    defaultCollapsed?: boolean;

    fields: ConfigField[];
}