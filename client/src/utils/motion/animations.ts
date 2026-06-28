import type { Variants } from 'motion/react';

/**
 * Universal fade-in and fade-out animation variants.
 */
export const fadeInOutVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: 0.28,
      ease: 'easeIn',
    },
  },
};

/**
 * Backdrop fade variants for modals and confirmation overlays.
 */
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
    },
  },
};

/**
 * Modal content zoom-in and scale-down variants.
 */
export const modalContentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 15,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      duration: 0.35,
      bounce: 0.15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 15,
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
};
