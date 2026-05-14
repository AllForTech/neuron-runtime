"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
    APP_BRAND_DEFAULTS,
    APP_BRAND_SIZE_CONFIG,
    type AppBrandSize,
    type AppBrandVariant,
} from "@/constants/brand/app-brand";

export interface AppBrandProps {
    name?: string;
    logo?: React.ComponentType<{ className?: string }>;
    showDescriptor?: boolean;
    size?: AppBrandSize;
    variant?: AppBrandVariant;
    className?: string;
    logoClassName?: string;
    textClassName?: string;
    descriptorClassName?: string;
    asChild?: boolean;
}

const AppBrand = forwardRef<HTMLDivElement, AppBrandProps>(
    (
        {
            name = APP_BRAND_DEFAULTS.name,
            logo: Logo = APP_BRAND_DEFAULTS.logo,
            showDescriptor = true,
            size = "md",
            variant = "full",
            className,
            logoClassName,
            textClassName,
            descriptorClassName,
        },
        ref
    ) => {
        const sizeConfig = APP_BRAND_SIZE_CONFIG[size];

        const isIconOnly = variant === "icon";
        const showText = variant === "full" || variant === "compact";

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center",
                    sizeConfig.gap,
                    className
                )}
            >
                <div
                    className={cn(
                        "flex items-center justify-center rounded-md bg-foreground/10 text-foreground",
                        sizeConfig.logo
                    )}
                >
                    <Logo className={cn("shrink-0", logoClassName)} />
                </div>

                {showText && (
                    <div className="flex flex-col">
                        <span
                            className={cn(
                                "font-semibold text-foreground whitespace-nowrap",
                                sizeConfig.text,
                                textClassName
                            )}
                        >
                            {name}
                        </span>

                        {showDescriptor && variant === "full" && (
                            <span
                                className={cn(
                                    "text-muted-foreground whitespace-nowrap",
                                    sizeConfig.descriptor,
                                    descriptorClassName
                                )}
                            >
                                {APP_BRAND_DEFAULTS.descriptor}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

AppBrand.displayName = "AppBrand";

export { AppBrand };
export type { AppBrandSize, AppBrandVariant };