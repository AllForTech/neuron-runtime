"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_SECTION } from "@/constants/landing-page/cta-section";

function CTAContent() {
    const { heading, description, cta } = CTA_SECTION;
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/30 p-8 backdrop-blur-sm md:p-12"
        >
            <div className="relative z-10">
                <h2 className="text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl tracking-tight">
                    {heading}
                </h2>
                <p className="mt-4 max-w-lg text-base text-muted-foreground/70">
                    {description}
                </p>
                <a
                    href={cta.href}
                    className={cn(
                        "group mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all duration-300",
                        "hover:bg-foreground/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    )}
                >
                    {cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-foreground/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-foreground/[0.02] blur-3xl" />

            <div className="pointer-events-none absolute inset-0 opacity-[0.015]">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: "24px 24px",
                    }}
                />
            </div>
        </motion.div>
    );
}

function Footer() {
    const { footer, status } = CTA_SECTION;
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const shouldReduceMotion = useReducedMotion();

    return (
        <footer
            ref={ref}
            className="relative w-full border-t border-border/30 px-6 py-12 md:px-8"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {footer.columns.map((column) => (
                        <div key={column.id}>
                            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                                {column.title}
                            </h4>
                            <ul className="mt-4 space-y-2">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            target={link.external ? "_blank" : undefined}
                                            rel={link.external ? "noopener noreferrer" : undefined}
                                            className="text-sm text-muted-foreground/70 transition-colors duration-200 hover:text-foreground"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/20 pt-8 md:flex-row">
                    <div className="flex items-center gap-6 text-xs text-muted-foreground/50">
                        <span>{status.version}</span>
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
                            {status.apiStatus}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground/50">
                        &copy; 2024 Neuron Engine. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export function CTASection() {
    return (
        <div className="relative w-full">
            <section className="px-6 py-20 md:px-8 md:py-28 lg:py-36">
                <div className="mx-auto max-w-7xl">
                    <CTAContent />
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default function CTASectionComponent() {
    return <CTASection />;
}