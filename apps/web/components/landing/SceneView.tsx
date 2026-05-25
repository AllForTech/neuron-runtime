'use client'

import React from 'react'
import { useSceneRuntimeContext } from '@/hooks/landing/useSceneRuntime';

interface SceneViewProps {
    sceneIndex: number
    children: React.ReactNode
    className?: string
}

export function SceneView({
                              sceneIndex,
                              children,
                              className = '',
                          }: SceneViewProps) {
    const { runtime } = useSceneRuntimeContext()

    const isCurrentScene = runtime.current.index === sceneIndex
    const isPreviousScene = runtime.previous?.index === sceneIndex
    const isNextScene = runtime.next?.index === sceneIndex

    let opacity = 0
    let scale = 1
    let zIndex = 0

    // Current scene exiting (transitioning out)
    if (isCurrentScene && runtime.isTransitioning && runtime.direction === 'forward') {
        opacity = 1 - runtime.transitionProgress
        scale = 0.95 + (1 - runtime.transitionProgress) * 0.05
        zIndex = 10
    }
    // Previous scene entering (transitioning in when moving backward)
    else if (isPreviousScene && runtime.isTransitioning && runtime.direction === 'backward') {
        opacity = runtime.transitionProgress
        scale = 0.95 + runtime.transitionProgress * 0.05
        zIndex = 10
    }
    // Current scene at rest
    else if (isCurrentScene) {
        opacity = 1
        scale = 1
        zIndex = 10
    }
    // Next scene entering (transitioning in)
    else if (isNextScene && runtime.isTransitioning && runtime.direction === 'forward') {
        opacity = runtime.transitionProgress
        scale = 0.95 + runtime.transitionProgress * 0.05
        zIndex = 10
    }
    // Current scene entering (transitioning in when moving forward)
    else if (isCurrentScene && runtime.isTransitioning && runtime.direction === 'forward') {
        opacity = runtime.transitionProgress
        scale = 0.95 + runtime.transitionProgress * 0.05
        zIndex = 10
    }
    // Previous scene exiting (transitioning out when moving backward)
    else if (isPreviousScene && runtime.isTransitioning && runtime.direction === 'backward') {
        opacity = 1 - runtime.transitionProgress
        scale = 0.95 + (1 - runtime.transitionProgress) * 0.05
        zIndex = 10
    }

    return (
        <div
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-none ${className}`}
            style={{
                opacity,
                transform: `scale(${scale})`,
                zIndex,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    )
}
