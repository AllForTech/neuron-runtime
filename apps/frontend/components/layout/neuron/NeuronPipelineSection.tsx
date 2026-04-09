'use client';

import React, { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { neuronSteps } from '@/constants';

// Container
const Container = ({ children, className = '' }) => (
  <div className={`container mx-auto px-6 md:px-8 lg:px-12 ${className}`}>
    {children}
  </div>
);

// Orb
export const NeuralOrb = () => (
  <motion.div
    className="pointer-events-none absolute top-1/2 left-0 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full md:h-[900px] md:w-[900px]"
    initial={{ rotate: 0, opacity: 0.1, scale: 0.8 }}
    animate={{
      rotate: 360,
      opacity: [0.05, 0.15, 0.05],
      scale: [0.8, 1, 0.8],
    }}
    transition={{
      rotate: { duration: 100, ease: 'linear', repeat: Infinity },
      opacity: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
      scale: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
    }}
  >
    <div className="flex h-full w-full items-center justify-center rounded-full border border-white/[0.03]">
      <div className="flex h-4/5 w-4/5 items-center justify-center rounded-full border border-white/[0.02]">
        <div className="h-3/4 w-3/4 rounded-full border border-white/[0.01]" />
      </div>
    </div>
  </motion.div>
);

// Pipeline Core
const AnimatedPipelineCore = () => {
  // Improved smooth curve
  const pathD = 'M 50 20 C 50 180, 280 120, 300 250 C 320 380, 80 380, 50 480';

  return (
    <div className="relative flex h-[550px] w-full items-center justify-center">
      <svg
        viewBox="0 0 350 500"
        className="absolute mx-auto h-full w-full max-w-[400px]"
        fill="none"
      >
        {/* Path */}
        <path
          d={pathD}
          stroke="#898989"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {/* Moving Packet */}
        <motion.circle
          r="6"
          fill="#ffffff"
          style={{ offsetPath: `path("${pathD}")` }}
          animate={{ offsetDistance: ['0%', '100%'] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.circle
            r="12"
            fill="white"
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.circle>

        {/* Anchors */}
        {[
          { cx: 50, cy: 20 },
          { cx: 300, cy: 250 },
          { cx: 50, cy: 480 },
        ].map((a, i) => (
          <g key={i}>
            <circle
              cx={a.cx}
              cy={a.cy}
              r="10"
              fill="black"
              stroke="rgba(255,255,255,0.2)"
            />
            <circle cx={a.cx} cy={a.cy} r="4" fill="white" />
          </g>
        ))}
      </svg>
    </div>
  );
};

function NeuronPipelineSection() {
  const [activeStep, setActiveStep] = useState(0);

  // Sync animation with steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % neuronSteps.length);
    }, 2000); // 6s / 3 steps

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-black/70! py-32 font-sans backdrop-blur-xl">
      <NeuralOrb />

      {/* Header */}
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="from-foreground via-foreground/90 to-foreground/40 mx-auto max-w-4xl bg-gradient-to-b bg-clip-text text-4xl font-extrabold tracking-tighter text-transparent md:text-6xl">
            Transforming Events into Deterministic Execution.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-500">
            Neuron processes events through workflows and executes
            actions with full traceability.
          </p>
        </motion.div>
      </Container>

      {/* Pipeline */}
      <Container className="relative z-10 mt-24">
        <div className="relative mx-auto max-w-5xl md:h-[550px]">
          {/* Animation */}
          <div className="absolute inset-0 hidden items-center justify-center md:flex">
            <AnimatedPipelineCore />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-8">
            {neuronSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{
                    opacity: 0,
                    x: step.position.includes('right') ? 30 : -30,
                  }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className={`relative mx-auto w-full max-w-lg rounded-2xl border p-6 backdrop-blur-xl transition-all duration-500 ${
                    isActive
                      ? 'scale-[1.02] border-white/[0.15] bg-white/[0.07]'
                      : 'border-white/[0.05] bg-white/[0.03] opacity-70'
                  } md:absolute md:w-[280px] lg:w-[320px] ${step.position === 'top-left' ? 'md:top-[-40px] md:left-0 md:text-right' : ''} ${step.position === 'center-right' ? 'md:top-[120px] md:right-0 md:text-left' : ''} ${step.position === 'bottom-left' ? 'md:bottom-[-60px] md:left-0 md:text-right' : ''} `}
                >
                  {/* Glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border border-white/10"
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  <div
                    className={`mb-4 flex items-center gap-3 ${step.position.includes('left') ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.04] p-2 text-white">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-600 uppercase">
                      STEP {step.id.toString().padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs text-neutral-500">
                    {step.description}
                  </p>

                  <div className="mt-4 h-[2px] bg-white/[0.05]">
                    <div
                      className={`h-full bg-white ${isActive ? 'w-full' : 'w-0'} transition-all`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-32 border-t border-white/[0.05] pt-12 text-center"
        >
          <button className="rounded-2xl bg-white px-10 py-4 text-xs font-bold tracking-widest text-black uppercase transition-all hover:bg-neutral-200 active:scale-95">
            Deploy Your First Workflow
          </button>
        </motion.div>
      </Container>
    </section>
  );
}

export default memo(NeuronPipelineSection);
