/**
 * Shared style utilities for Radix primitives
 * Tron-inspired glassmorphism design system
 *
 * Theme Support:
 * - All styles use Tailwind's dark: prefix for automatic theme switching
 * - Theme is managed by ThemeContext (light/dark)
 * - For runtime theme values, use useThemeAware hook
 */

// Base glassmorphism classes with Tron aesthetic
export const glassmorphism = {
  // Background variations - matching existing Card.tsx patterns
  background: {
    subtle: "backdrop-blur-md bg-gradient-to-b from-white/80 to-white/60 dark:from-white/10 dark:to-black/30",
    strong: "backdrop-blur-md bg-gradient-to-b from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/95",
    card: "backdrop-blur-md bg-gradient-to-b from-white/80 to-white/60 dark:from-white/10 dark:to-black/30",
    // Tron-style colored backgrounds
    cyan: "backdrop-blur-md bg-gradient-to-b from-cyan-100/80 dark:from-cyan-500/20 to-white/60 dark:to-cyan-500/5",
    blue: "backdrop-blur-md bg-gradient-to-b from-blue-100/80 dark:from-blue-500/20 to-white/60 dark:to-blue-500/5",
    purple:
      "backdrop-blur-md bg-gradient-to-b from-purple-100/80 dark:from-purple-500/20 to-white/60 dark:to-purple-500/5",
  },

  // Border styles with neon glow
  border: {
    default: "border border-gray-200 dark:border-gray-700",
    cyan: "border-cyan-300 dark:border-cyan-500/30",
    blue: "border-blue-300 dark:border-blue-500/30",
    purple: "border-purple-300 dark:border-purple-500/30",
    focus: "focus:border-cyan-500",
    hover: "hover:border-cyan-400/70",
  },

  // Interactive states
  interactive: {
    base: "transition-all duration-200",
    hover: "hover:bg-cyan-500/10 dark:hover:bg-cyan-400/10",
    active: "active:bg-cyan-500/20 dark:active:bg-cyan-400/20",
    selected:
      "data-[state=checked]:bg-cyan-500/20 dark:data-[state=checked]:bg-cyan-400/20 data-[state=checked]:text-cyan-700 dark:data-[state=checked]:text-cyan-300",
    disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
  },

  // Animation presets
  animation: {
    fadeIn:
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    slideIn: "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    slideFromTop: "data-[side=bottom]:slide-in-from-top-2",
    slideFromBottom: "data-[side=top]:slide-in-from-bottom-2",
    slideFromLeft: "data-[side=right]:slide-in-from-left-2",
    slideFromRight: "data-[side=left]:slide-in-from-right-2",
  },

  // Shadow effects with Tron-style neon glow
  shadow: {
    sm: "",
    md: "",
    lg: "",
    elevated: "",
    // Neon glow effects matching Card.tsx
    glow: {
      cyan: "",
      blue: "",
      purple: "",
      green: "",
      pink: "",
      orange: "",
    },
  },

  // Priority colors (matching our task system)
  priority: {
    critical: {
      background: "bg-red-100/80 dark:bg-red-500/20",
      text: "text-red-600 dark:text-red-400",
      hover: "hover:bg-red-200 dark:hover:bg-red-500/30",
      glow: "",
    },
    high: {
      background: "bg-orange-100/80 dark:bg-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
      hover: "hover:bg-orange-200 dark:hover:bg-orange-500/30",
      glow: "",
    },
    medium: {
      background: "bg-blue-100/80 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-200 dark:hover:bg-blue-500/30",
      glow: "",
    },
    low: {
      background: "bg-gray-100/80 dark:bg-gray-500/20",
      text: "text-gray-600 dark:text-gray-400",
      hover: "hover:bg-gray-200 dark:hover:bg-gray-500/30",
      glow: "",
    },
  },
};

// Compound styles for common patterns
export const compoundStyles = {
  // Standard interactive element (buttons, menu items, etc.)
  interactiveElement: `
    ${glassmorphism.interactive.base}
    ${glassmorphism.interactive.hover}
    ${glassmorphism.interactive.disabled}
  `,

  // Floating panels (dropdowns, popovers, tooltips)
  floatingPanel: `
    ${glassmorphism.background.strong}
    ${glassmorphism.border.default}
    ${glassmorphism.shadow.lg}
    ${glassmorphism.animation.fadeIn}
    ${glassmorphism.animation.slideIn}
  `,

  // Form controls (inputs, selects, etc.)
  formControl: `
    ${glassmorphism.background.subtle}
    ${glassmorphism.border.default}
    ${glassmorphism.border.hover}
    ${glassmorphism.border.focus}
    ${glassmorphism.interactive.base}
    ${glassmorphism.interactive.disabled}
  `,

  // Cards and containers
  card: `
    ${glassmorphism.background.card}
    ${glassmorphism.border.default}
    ${glassmorphism.shadow.md}
  `,
};

// Utility function to combine classes
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
