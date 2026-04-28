'use client';

import { ConfigLayoutType } from "@neuron/shared";
import { cn } from "@/lib/utils";

/**
 * getLayoutClass
 * Generates the CSS classes for field containers based on the schema layout.
 * Optimized for a sleek, consistent spacing system that adapts to nested contexts.
 */
export function getLayoutClass(
    layout?: ConfigLayoutType,
    className?: string
) {
    const baseClasses = "w-full transition-all duration-300";

    switch (layout) {
        case "row":
            // "row" layout: Side-by-side fields with wrapping for smaller containers
            return cn(
                baseClasses,
                "flex flex-row flex-wrap items-start gap-4",
                className
            );

        case "grid":
            // "grid" layout: Two-column distribution for dense configuration data
            return cn(
                baseClasses,
                "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4",
                className
            );

        case "column":
        default:
            // "column" layout: Standard vertical stack with clean engineering gaps
            return cn(
                baseClasses,
                "flex flex-col gap-6",
                className
            );
    }
}