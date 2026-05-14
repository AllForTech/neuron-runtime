/* ==========================================================================
APP BRAND CONSTANTS
PURPOSE: Reusable brand configuration for Neuron Engine
========================================================================== */

import { Zap } from "lucide-react";

export const APP_BRAND_DEFAULTS = {
    name: "Neuron Engine",

    logo: Zap,

    descriptor: "Workflow Orchestration Runtime",
} as const;

export type AppBrandSize = (typeof APP_BRAND_SIZES)[number];

export const APP_BRAND_SIZES = ["sm", "md", "lg"] as const;

export type AppBrandVariant = (typeof APP_BRAND_VARIANTS)[number];

export const APP_BRAND_VARIANTS = ["full", "compact", "icon"] as const;

export const APP_BRAND_SIZE_CONFIG = {
    sm: {
        logo: "h-4 w-4",
        text: "text-xs",
        descriptor: "text-[10px]",
        gap: "gap-1",
    },

    md: {
        logo: "h-5 w-5",
        text: "text-sm",
        descriptor: "text-xs",
        gap: "gap-1.5",
    },

    lg: {
        logo: "h-6 w-6",
        text: "text-base",
        descriptor: "text-sm",
        gap: "gap-2",
    },
} as const satisfies Record<
    AppBrandSize,
    {
        logo: string;
        text: string;
        descriptor: string;
        gap: string;
    }
>;