import { ConfigLayoutType } from "@neuron/shared";

export function getLayoutClass(
    layout?: ConfigLayoutType
) {
    switch (layout) {
        case "row":
            return "flex flex-row gap-3";

        case "grid":
            return "grid grid-cols-2 gap-3";

        case "column":
        default:
            return "flex flex-col gap-3";
    }
}