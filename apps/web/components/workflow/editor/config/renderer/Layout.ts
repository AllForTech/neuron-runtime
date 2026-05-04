export function getLayoutClass(layout?: string) {
    switch (layout) {
        case "grid":
            // Ensures two equal columns that fill the 450px width
            return "grid grid-cols-2 gap-x-4 gap-y-6 w-full";
        case "row":
            return "flex flex-row flex-wrap gap-4 w-full";
        case "column":
        default:
            return "flex flex-col gap-6 w-full";
    }
}