'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Define the shape of our particle data
interface Particle {
  id: number
  size: number
  left: string
  top: string
  duration: number
  delay: number
  xDrift: number
  yDrift: number
  opacity: number
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  // Generate particles only on the client to prevent SSR hydration errors
  useEffect(() => {
    const generatedParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      // Mix of very small (1px) and slightly larger (up to 4px) particles
      size: Math.random() > 0.8 ? Math.random() * 3 + 3 : Math.random() * 1.5 + 0.7,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      // Randomize movement speed heavily
      duration: Math.random() * 40 + 30,
      delay: Math.random() * 10,
      // Randomize drift direction and distance
      xDrift: (Math.random() - 0.5) * 200,
      yDrift: (Math.random() - 0.5) * 200,
      // Base opacity varies per particle
      opacity: Math.random() * 0.3 + 0.1,
    }))

    setParticles(generatedParticles)
  }, [])

  return (
    // Deep pure black base
    <div className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none selection:bg-transparent">

      {/* 1. Floating Particles Layer */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 0
            }}
            animate={{
              x: [0, p.xDrift, 0],
              y: [0, p.yDrift, 0],
              opacity: [0, p.opacity, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
            className="absolute rounded-full bg-white"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              // Add a tiny bit of blur to the larger ones to simulate depth of field
              filter: p.size > 2 ? 'blur(1px)' : 'none'
            }}
          />
        ))}
      </div>

      {/* 2. Strict Monochrome Noise Overlay (Matte Finish) */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="monochromeNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
            {/* Forces the noise to be strictly grayscale */}
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#monochromeNoise)" />
        </svg>
      </div>

      {/* 3. Deep Vignette Shadow (Frames the view heavily, fading into the center) */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,1)]" />

    </div>
  )
}