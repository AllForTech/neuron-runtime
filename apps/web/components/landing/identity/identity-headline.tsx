'use client'

import React from 'react'
import { ArrowRight, Terminal } from 'lucide-react'
import {useRouter} from "next/navigation";

interface Headline {
    title: string
    description: string
}

interface HeroContentProps {
    headlines: Headline[]
    activeIndex: number
}

export function IdentityHeadline({ headlines, activeIndex }: HeroContentProps) {
    const router = useRouter();
    
    return (
        // Added items-center for mobile, lg:items-start for desktop
        <div className="flex flex-col items-center lg:items-start w-full max-w-2xl z-10">

            {/* System Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 mb-8 w-fit rounded-full border border-neutral-800/50 bg-neutral-900/20 text-[10px] font-mono text-neutral-400 uppercase tracking-widest backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse"></span>
                System Active
            </div>

            {/* Crossfading Headline & Subheadline Wrapper */}
            {/* Increased mobile height slightly to account for text wrapping while centered */}
            <div className="relative h-[240px] sm:h-[200px] md:h-[240px] w-full">
                {headlines.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={index}
                            // Added flex-col, items-center, and text-center for mobile layout
                            className={`absolute top-0 left-0 w-full flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isActive
                                ? 'opacity-100 translate-y-0 blur-none pointer-events-auto'
                                : 'opacity-0 translate-y-4 blur-sm pointer-events-none'
                            }
              `}
                        >
                            <h1
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight pb-6 leading-[1.1]"
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, #a1a1aa 0%, #ffffff 40%, #e4e4e7 60%, #71717a 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0px 2px 10px rgba(255,255,255,0.15))'
                                }}
                            >
                                {item.title}
                            </h1>

                            <p className="text-base md:text-lg text-neutral-400 max-w-lg leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Call to Action Buttons */}
            {/* Added justify-center for mobile, lg:justify-start for desktop, and flex-wrap in case of narrow screens */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4">
                <button
                    onClick={() => router.push('/auth')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-lg font-semibold text-sm hover:bg-neutral-300 transition-colors">
                    Get Started
                    <ArrowRight size={16} strokeWidth={2.5} />
                </button>

                <button disabled={true} className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-neutral-800 text-neutral-300 rounded-lg font-semibold text-sm hover:bg-neutral-900 transition-colors">
                    <Terminal size={16} />
                    View Documentation
                </button>
            </div>

        </div>
    )
}