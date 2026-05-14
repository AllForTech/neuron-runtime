import { cn } from "@/lib/utils";

export function FieldWrapper({ label, description, required, children, className }: any) {
    return (
        <div className={cn("flex flex-col overflow-hidden gap-2 w-full group", className)}>
            {(label || description) && (
                <div className="flex flex-col gap-1 pl-0.5">
                    {label && (
                        <label className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5 group-hover:text-neutral-300 transition-colors">
                            {label}
                            {required && (
                                <span className="text-[7px] font-bold tracking-wider text-red-500/60">
                                    ●
                                </span>
                            )}
                        </label>
                    )}
                    {description && (
                        <p className="text-[10px] text-neutral-600 leading-tight line-clamp-2 group-hover:text-neutral-500 transition-colors">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="w-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}