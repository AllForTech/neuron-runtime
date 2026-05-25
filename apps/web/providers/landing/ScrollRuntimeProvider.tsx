'use client'

import React, { useEffect, useCallback, useRef } from 'react'

interface ScrollRuntimeProviderProps {
    children: React.ReactNode
    onScroll: (delta: number) => void
}

export function ScrollRuntimeProvider({
                                          children,
                                          onScroll,
                                      }: ScrollRuntimeProviderProps) {
    const wheelDeltaRef = useRef(0)
    const touchStartRef = useRef<{ x: number; y: number } | null>(null)

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault()

            // Normalize scroll delta
            const delta = e.deltaY > 0 ? 1 : -1
            wheelDeltaRef.current += delta

            // Trigger on meaningful scroll accumulation
            if (Math.abs(wheelDeltaRef.current) >= 1) {
                onScroll(wheelDeltaRef.current)
                wheelDeltaRef.current = 0
            }
        },
        [onScroll]
    )

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            }
        }
    }, [])

    const handleTouchEnd = useCallback(
        (e: TouchEvent) => {
            if (!touchStartRef.current || e.changedTouches.length === 0) return

            const touchEnd = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
            }

            const deltaX = touchEnd.x - touchStartRef.current.x
            const deltaY = touchEnd.y - touchStartRef.current.y

            // Detect vertical swipe
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
                const direction = deltaY > 0 ? -1 : 1
                onScroll(direction)
            }

            touchStartRef.current = null
        },
        [onScroll]
    )

    useEffect(() => {
        const html = document.documentElement
        const body = document.body

        // Prevent scrolling
        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
        html.style.height = '100%'
        body.style.height = '100%'

        // Add event listeners
        window.addEventListener('wheel', handleWheel, { passive: false })
        window.addEventListener('touchstart', handleTouchStart, { passive: true })
        window.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            html.style.overflow = ''
            body.style.overflow = ''
            html.style.height = ''
            body.style.height = ''

            window.removeEventListener('wheel', handleWheel)
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleWheel, handleTouchStart, handleTouchEnd])

    return <>{children}</>
}
