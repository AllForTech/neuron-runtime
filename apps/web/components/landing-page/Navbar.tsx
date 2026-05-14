"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppBrand } from "@/components/brand/AppBrand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";

/**
 * NEURON NAVBAR CONFIGURATION
 * Floating Pill Edition with Smart Scroll Hide
 */
const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Demo", href: "#demo" },
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "#pricing" },
];

function DesktopLinks() {
    return (
        <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
                <Link
                    key={link.label}
                    href={link.href}
                    className="text-[13px] font-medium tracking-wide text-muted-foreground transition-all duration-300 hover:text-foreground"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}

function RuntimePulse() {
    return (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border bg-card/30 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/70">
                System Operational
            </span>
        </div>
    );
}

export function Navbar() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    // Track scroll direction to hide/show navbar
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;

        // If scrolling down and passed 100px, hide the navbar
        if (latest > previous && latest > 100) {
            setHidden(true);
        } else {
            // If scrolling up, show it
            setHidden(false);
        }
    });

    return (
        <motion.header
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: -150, opacity: 0 } // Moves up far enough to clear the top margin
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={cn(
                "fixed top-6 left-0 right-0 z-[100] mx-auto h-16 w-[calc(100%-2rem)] max-w-6xl",
                "flex items-center rounded-full border border-white/10 bg-background/50 backdrop-blur-xl shadow-2xl",
                "transition-shadow duration-500 hover:shadow-white/5"
            )}
        >
            <div className="w-full px-6 md:px-8 flex items-center justify-between">

                {/* Left: Brand & Runtime Status */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                        <AppBrand name="NEURON" size="sm" variant="compact" />
                    </Link>
                    <div className="hidden xl:block">
                        <RuntimePulse />
                    </div>
                </div>

                {/* Center: Navigation */}
                <DesktopLinks />

                {/* Right: Actions */}
                <div className="flex items-center gap-5">
                    <Link
                        href="/login"
                        className="hidden sm:block text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sign In
                    </Link>

                    <Link
                        href="/signup"
                        className={cn(
                            "group flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-[12px] font-bold text-background transition-all duration-300",
                            "hover:scale-105 hover:bg-foreground/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
                        )}
                    >
                        START BUILDING
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    {/* Mobile Toggle */}
                    <MobileMenu />
                </div>
            </div>
        </motion.header>
    );
}

function MobileMenu() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-sm bg-background border-l border-border p-8 flex flex-col z-[110]"
            >
                <div className="flex items-center justify-between mb-12">
                    <AppBrand name="NEURON" size="sm" variant="compact" />
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <Menu className="h-6 w-6 rotate-90" />
                    </Button>
                </div>

                <nav className="flex flex-col gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="text-2xl font-bold tracking-tighter text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <Link
                        href="/signup"
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-sm font-bold text-background transition-transform active:scale-95"
                    >
                        START BUILDING <ArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="flex justify-center py-4">
                        <RuntimePulse />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}