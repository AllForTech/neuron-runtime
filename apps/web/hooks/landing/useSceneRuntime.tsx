'use client'

import {useState, useCallback, useRef, useEffect, useContext} from 'react'
import {SceneRuntimeContext} from "@/providers/landing/SceneRuntimeProvider";

export type SceneState = 'inactive' | 'entering' | 'active' | 'exiting'

export interface SceneInfo {
    index: number
    state: SceneState
    progress: number // 0-1 normalized
}

export interface SceneRuntime {
    current: SceneInfo
    previous: SceneInfo | null
    next: SceneInfo | null
    direction: 'forward' | 'backward' | null
    isTransitioning: boolean
    transitionProgress: number // 0-1
}

const TOTAL_SCENES = 4
const TRANSITION_DURATION = 700 // ms
const SCROLL_DEBOUNCE = 50 // ms

export function useSceneRuntime() {
    const [sceneIndex, setSceneIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [transitionProgress, setTransitionProgress] = useState(0)
    const [direction, setDirection] = useState<'forward' | 'backward' | null>(null)

    const transitionStartTime = useRef<number | null>(null)
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)
    const animationFrameId = useRef<number | null>(null)

    // Animation loop for smooth transitions
    useEffect(() => {
        if (!isTransitioning || transitionStartTime.current === null) return

        const animate = () => {
            const now = Date.now()
            const elapsed = now - transitionStartTime.current!
            const progress = Math.min(elapsed / TRANSITION_DURATION, 1)

            // Easing function: ease-in-out
            const eased = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress

            setTransitionProgress(eased)

            if (progress < 1) {
                animationFrameId.current = requestAnimationFrame(animate)
            } else {
                setIsTransitioning(false)
                setTransitionProgress(0)
                transitionStartTime.current = null
            }
        }

        animationFrameId.current = requestAnimationFrame(animate)

        return () => {
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current)
            }
        }
    }, [isTransitioning])

    const goToScene = useCallback(
        (targetIndex: number) => {
            if (isTransitioning) return
            if (targetIndex === sceneIndex) return
            if (targetIndex < 0 || targetIndex >= TOTAL_SCENES) return

            const newDirection = targetIndex > sceneIndex ? 'forward' : 'backward'
            setDirection(newDirection)
            setIsTransitioning(true)
            transitionStartTime.current = Date.now()

            // Update scene after transition completes
            const updateTimer = setTimeout(() => {
                setSceneIndex(targetIndex)
            }, TRANSITION_DURATION)

            return () => clearTimeout(updateTimer)
        },
        [sceneIndex, isTransitioning]
    )

    const handleScroll = useCallback(
        (delta: number) => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current)

            debounceTimer.current = setTimeout(() => {
                const direction = delta > 0 ? 1 : -1
                const nextIndex = sceneIndex + direction

                if (nextIndex >= 0 && nextIndex < TOTAL_SCENES) {
                    goToScene(nextIndex)
                }
            }, SCROLL_DEBOUNCE)
        },
        [sceneIndex, goToScene]
    )

    const getPreviousScene = (): SceneInfo | null => {
        if (sceneIndex === 0) return null
        return {
            index: sceneIndex - 1,
            state: 'inactive',
            progress: 0,
        }
    }

    const getNextScene = (): SceneInfo | null => {
        if (sceneIndex >= TOTAL_SCENES - 1) return null
        return {
            index: sceneIndex + 1,
            state: 'inactive',
            progress: 0,
        }
    }

    const runtime: SceneRuntime = {
        current: {
            index: sceneIndex,
            state: isTransitioning
                ? direction === 'forward'
                    ? 'exiting'
                    : 'exiting'
                : 'active',
            progress: isTransitioning ? transitionProgress : 0,
        },
        previous: getPreviousScene(),
        next: getNextScene(),
        direction,
        isTransitioning,
        transitionProgress,
    }

    return {
        runtime,
        goToScene,
        handleScroll,
        sceneIndex,
    }
}


export function useSceneRuntimeContext() {
    const context = useContext(SceneRuntimeContext)
    if (!context) {
        throw new Error('useSceneRuntimeContext must be used within SceneRuntimeProvider')
    }
    return context
}
