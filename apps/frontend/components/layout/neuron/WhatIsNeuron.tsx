'use client';
import { NEURON_PILLARS } from '@/constants';
import { NeuronCard } from './NeuronCard';

export function WhatIsNeuron() {
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-32">
      {/* SECTION HEADER */}
      <div className="mb-24 max-w-xl text-center">
        <h2 className="mb-6 text-4xl font-light tracking-tighter text-white md:text-5xl">
          A Single Point of{' '}
          <span className="text-neutral-500 italic">Execution.</span>
        </h2>
        <div className="mx-auto h-[1px] w-16 bg-white/20" />
      </div>

      {/* ASYMMETRIC GRID */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {NEURON_PILLARS.map((item, i) => (
          <NeuronCard key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
