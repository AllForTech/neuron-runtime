'use client'

import React, { createContext } from 'react';
import { SceneRuntime as Scene } from '@/hooks/landing/useSceneRuntime';

interface SceneRuntimeContextType {
    runtime: Scene
}

export const SceneRuntimeContext = createContext<SceneRuntimeContextType | null>(null)

interface SceneRuntimeProps {
    runtime: Scene
    children: React.ReactNode
}

export function SceneRuntime({ runtime, children }: SceneRuntimeProps) {
    return (
        <SceneRuntimeContext.Provider value={{ runtime }}>
            <div
                className="fixed font-landing! inset-0 w-screen h-screen overflow-hidden bg-background"
                style={{
                    willChange: 'transform',
                }}
            >
                {children}
            </div>
        </SceneRuntimeContext.Provider>
    )
}
