'use client'

import React, { useState } from 'react'
import {useSceneRuntimeContext} from "@/hooks/landing/useSceneRuntime";

interface NavigationOverlayProps {
    onSceneChange: (index: number) => void
}

const NAV_ITEMS = [
    { label: 'Identity', index: 0 },
    { label: 'Coordination', index: 1 },
    { label: 'Infrastructure', index: 2 },
    { label: 'System Elasticity', index: 3 },
]

export function NavigationOverlay({ onSceneChange }: NavigationOverlayProps) {
    const { runtime } = useSceneRuntimeContext()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleNavClick = (index: number) => {
        onSceneChange(index)
        setIsMobileMenuOpen(false)
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 md:py-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <div className="shrink-0">
                    <button
                        onClick={() => handleNavClick(0)}
                        className="text-lg md:text-xl font-bold text-foreground hover:text-muted-foreground transition-colors"
                    >
                        NEURON
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.index}
                            onClick={() => handleNavClick(item.index)}
                            className={`text-sm transition-colors ${
                                runtime.current.index === item.index
                                    ? 'text-foreground font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* CTA Button */}
                <button className="hidden md:block px-6 py-2 bg-foreground text-background rounded-lg font-semibold text-sm hover:bg-muted-foreground transition-colors">
                    Get Started
                </button>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden flex flex-col gap-1.5 p-2"
                >
                    <div className="w-6 h-0.5 bg-foreground rounded-full"></div>
                    <div className="w-6 h-0.5 bg-foreground rounded-full"></div>
                    <div className="w-6 h-0.5 bg-foreground rounded-full"></div>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border mt-2">
                    <div className="flex flex-col gap-4 p-4">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.index}
                                onClick={() => handleNavClick(item.index)}
                                className={`text-left text-sm transition-colors ${
                                    runtime.current.index === item.index
                                        ? 'text-foreground font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                        <button className="w-full px-4 py-2 bg-foreground text-background rounded-lg font-semibold text-sm hover:bg-muted-foreground transition-colors mt-2">
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}
