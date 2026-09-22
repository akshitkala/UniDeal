'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

export const MOTION = {
  duration: {
    entrance: 0.5,
    entranceFast: 0.35,
    entranceSlow: 0.65,
    hover: 0.2,
    idle: 2.8,
    draw: 0.8,
  },
  stagger: {
    tight: 0.05,
    normal: 0.08,
    loose: 0.12,
    veryLoose: 0.14,
  },
  ease: {
    out: [0.22, 1, 0.36, 1],
    spring: [0.34, 1.56, 0.64, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  offset: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  viewport: { once: true, margin: '-80px 0px -40px 0px' as const, amount: 0.2 },
  viewportEarly: { once: true, margin: '-120px 0px -60px 0px' as const, amount: 0.15 },
};

export function useMotion() {
  const reduced = useReducedMotion();

  return useMemo(() => {
    const off = <T>(val: T, fallback: T) => (reduced ? fallback : val);
    const dur = (d: number) => (reduced ? 0 : d);

    const staggerContainer = (staggerDelay = MOTION.stagger.normal) => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: off(staggerDelay, 0),
          delayChildren: 0,
        },
      },
    });

    const fadeUp = (offsetY = MOTION.offset.md, d = MOTION.duration.entrance, delay = 0) => ({
      hidden: { opacity: 0, y: off(offsetY, 0) },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: dur(d), delay: reduced ? 0 : delay, ease: MOTION.ease.out },
      },
    });

    const fadeDown = (offsetY = MOTION.offset.md, d = MOTION.duration.entrance, delay = 0) => ({
      hidden: { opacity: 0, y: off(-offsetY, 0) },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: dur(d), delay: reduced ? 0 : delay, ease: MOTION.ease.out },
      },
    });

    const fadeLeft = (offsetX = MOTION.offset.md, d = MOTION.duration.entrance, delay = 0) => ({
      hidden: { opacity: 0, x: off(offsetX, 0) },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: dur(d), delay: reduced ? 0 : delay, ease: MOTION.ease.out },
      },
    });

    const fadeRight = (offsetX = MOTION.offset.md, d = MOTION.duration.entrance, delay = 0) => ({
      hidden: { opacity: 0, x: off(-offsetX, 0) },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: dur(d), delay: reduced ? 0 : delay, ease: MOTION.ease.out },
      },
    });

    const fadeIn = (d = MOTION.duration.entrance, delay = 0) => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { duration: dur(d), delay: reduced ? 0 : delay, ease: MOTION.ease.out },
      },
    });

    const scaleIn = (from = 0.85, to = 1, d = MOTION.duration.entranceFast, delay = 0) => ({
      hidden: { opacity: 0, scale: off(from, 1) },
      show: {
        opacity: 1,
        scale: to,
        transition: {
          duration: dur(d),
          delay: reduced ? 0 : delay,
          ease: off(MOTION.ease.spring, MOTION.ease.out),
        },
      },
    });

    const popIn = (d = MOTION.duration.entranceFast, delay = 0) => ({
      hidden: { opacity: 0, scale: off(0.92, 1) },
      show: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: dur(d),
          delay: reduced ? 0 : delay,
          ease: MOTION.ease.out,
        },
      },
    });

    const svgDraw = (d = MOTION.duration.draw, delay = 0) => ({
      hidden: { pathLength: 0, opacity: 0 },
      show: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: dur(d),
          delay: reduced ? 0 : delay,
          ease: MOTION.ease.inOut,
        },
      },
    });

    const quoteBorder = (d = MOTION.duration.entrance, delay = 0) => ({
      hidden: { height: '0%', opacity: 0 },
      show: {
        height: '100%',
        opacity: 1,
        transition: { duration: dur(d), delay: reduced ? 0 : delay, ease: MOTION.ease.out },
      },
    });

    const idleFloat = (amount = 4) => ({
      animate: reduced
        ? {}
        : {
            y: [0, -amount, 0],
            transition: {
              duration: MOTION.duration.idle,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'mirror' as const,
            },
          },
    });

    const cardHover = {
      whileHover: reduced
        ? {}
        : {
            y: -3,
            transition: { duration: MOTION.duration.hover, ease: MOTION.ease.out },
          },
      whileTap: reduced
        ? {}
        : {
            y: -1,
            transition: { duration: 0.1, ease: MOTION.ease.out },
          },
    };

    const transitionHover = {
      transition: { duration: MOTION.duration.hover, ease: MOTION.ease.out },
    };

    return {
      reduced,
      off,
      dur,
      staggerContainer,
      fadeUp,
      fadeDown,
      fadeLeft,
      fadeRight,
      fadeIn,
      scaleIn,
      popIn,
      svgDraw,
      quoteBorder,
      idleFloat,
      cardHover,
      transitionHover,
      MOTION,
    };
  }, [reduced]);
}

export type MotionAPI = ReturnType<typeof useMotion>;
