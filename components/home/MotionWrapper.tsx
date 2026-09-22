'use client';

/**
 * Thin re-export of Framer Motion primitives used across home sections.
 * Centralised here so server components only import this one client boundary.
 * Respects prefers-reduced-motion — Framer Motion reads it automatically via
 * its built-in `useReducedMotion` hook when we use `whileInView` with duration.
 */
export { motion, useReducedMotion } from 'framer-motion';
