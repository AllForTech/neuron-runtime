'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Zap, ArrowRight, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const footerLinks = [
  {
    name: 'Platform',
    links: ['Intelligence', 'Flows', 'Integration', 'Security'],
  },
  {
    name: 'Resources',
    links: ['Documentation', 'University', 'API Status', 'Changelog'],
  },
  { name: 'Company', links: ['Our Story', 'Careers', 'Press Kit', 'Contact'] },
];

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Mail, href: '#', label: 'Email' },
];

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const ctaVariants: Variants = {
  hover: {
    scale: 1.03,
    y: -5,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  tap: { scale: 0.98 },
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/[0.03] bg-neutral-950 font-sans text-neutral-300">
      {/* Smooth Background Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />

      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5 lg:gap-16">
          {/* --- 1. THE MASSIVE CALL TO ACTION --- */}
          <motion.div
            className="space-y-6 md:col-span-2"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 text-white">
              <Zap className="text-primary fill-primary h-6 w-6" />
              <span className="text-xl font-bold tracking-tight">Neuron</span>
            </div>

            <h2 className="max-w-sm text-3xl leading-[1.1] font-extrabold tracking-tighter text-white md:text-4xl">
              Ready to orchestrate your data stream?
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
              Join the next generation of data-driven teams. Start building
              intelligent automation today, no complex configuration required.
            </p>

            <motion.div
              variants={ctaVariants}
              whileHover="hover"
              whileTap="tap"
              className="inline-block"
            >
              <Button className="group h-14 gap-3 rounded-2xl bg-white px-8 text-black shadow-2xl transition-colors duration-300 hover:bg-neutral-100 active:scale-95">
                <span className="text-xs font-bold tracking-[0.2em] uppercase">
                  Begin Your Journey
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>

          {/* --- 2. SMOOTH NAV COLUMNS --- */}
          <div className="grid grid-cols-2 gap-8 pt-6 sm:grid-cols-3 md:col-span-3">
            {footerLinks.map((section) => (
              <motion.div
                key={section.name}
                className="space-y-5"
                variants={itemVariants}
              >
                <h5 className="text-[10px] font-bold tracking-[0.3em] text-neutral-600 uppercase">
                  {section.name}
                </h5>
                <ul className="space-y-3.5">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="group relative inline-flex items-center text-[13px] text-neutral-400 transition-colors duration-300 hover:text-white"
                      >
                        {link}
                        {/* Smooth Underline Animation */}
                        <span className="absolute -bottom-1 left-0 h-px w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- 3. THE REFINED BOTTOM BAR --- */}
        <motion.div
          className="mt-16 flex flex-col-reverse items-center justify-between gap-6 border-t border-white/[0.03] pt-8 sm:flex-row md:mt-24"
          variants={itemVariants}
        >
          <div className="flex flex-col items-center gap-2 font-mono text-xs tracking-tight text-neutral-700 sm:flex-row sm:gap-6">
            <span>© {currentYear} Neuron Engine</span>
            <div className="hidden h-3 w-px bg-white/5 sm:block" />
            <a href="#" className="transition-colors hover:text-neutral-500">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-neutral-500">
              Terms of Service
            </a>
          </div>

          {/* Icon Socials */}
          <div className="flex items-center gap-1.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="rounded-xl p-2.5 text-neutral-600 transition-all duration-300 hover:bg-white/[0.03] hover:text-white"
                  whileHover={{ y: -3 }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
