'use client';
import { motion } from 'framer-motion';
import { CardFlowLines } from './CardFlowLines';

export function NeuronCard({ item, index }: { item: any; index: number }) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      viewport={{ once: true }}
      className={`group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-8 backdrop-blur-xl ${item.size} transition-all duration-500 hover:border-white/20`}
    >
      {/* Background SVG Data Lines */}
      <CardFlowLines color={item.color} />

      {/* Hover Highlight Glow */}
      <div
        className="pointer-events-none absolute -top-1/4 -right-1/4 h-full w-full opacity-0 blur-[100px] transition-opacity duration-700 group-hover:opacity-10"
        style={{ backgroundColor: item.color }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/50 shadow-xl transition-all duration-500 group-hover:bg-white/10 group-hover:text-white">
            <Icon size={20} strokeWidth={2} />
          </div>
          <h3 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase group-hover:text-white">
            {item.title}
          </h3>
        </div>
        <p className="text-[13px] leading-relaxed text-neutral-500 transition-colors group-hover:text-neutral-300">
          {item.desc}
        </p>
      </div>

      {/* Bottom Subtle Corner Accent */}
      <div className="absolute right-0 bottom-0 p-2 opacity-10">
        <div className="h-[1px] w-6 bg-white" />
        <div className="absolute right-0 bottom-0 h-6 w-[1px] bg-white" />
      </div>
    </motion.div>
  );
}
