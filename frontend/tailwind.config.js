// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "#0B0F19", // Deep Midnight Indigo for the main backgdrop
//         surface: {
//           DEFAULT: "#151C2C", // Dark navy for cards/surfaces
//           hover: "#1D273B",
//           active: "#25314A"
//         },
//         primary: {
//           DEFAULT: "#7C3AED", // Vibrant violet
//           hover: "#6D28D9",
//           glow: "rgba(124, 58, 237, 0.4)" // Purple glow
//         },
//         secondary: {
//           DEFAULT: "#00E5FF", // Cyan for secondary actions / system healthy colors
//           hover: "#00B8CC",
//           glow: "rgba(0, 229, 255, 0.4)"
//         },
//         accent: {
//           warning: "#F59E0B", // Bright amber for warnings
//           error: "#EF4444",   // Red for CRIT / Errors
//           success: "#10B981"  // Emerald for OK statuses
//         },
//         text: {
//           primary: "#F8FAFC",
//           secondary: "#94A3B8",
//           muted: "#64748B"
//         },
//         border: {
//           DEFAULT: "#1E293B",
//           light: "#334155"
//         }
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//         mono: ['Fira Code', 'Roboto Mono', 'monospace'],
//       },
//       boxShadow: {
//         'glow-primary': '0 0 20px -5px rgba(124, 58, 237, 0.4)',
//         'glow-secondary': '0 0 20px -5px rgba(0, 229, 255, 0.4)',
//         'glow-error': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
//         'glass': '0 4px 30px rgba(0, 0, 0, 0.3)',
//       },
//       backdropBlur: {
//         'glass': '12px',
//       }
//     },
//   },
//   plugins: [],
// }


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        surface: {
          DEFAULT: "#151C2C",
          hover: "#1D273B",
          active: "#25314A",
          elevated: "#2D3D5A",  // For modals, dropdowns, tooltips
        },
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          glow: "rgba(124, 58, 237, 0.4)",
          subtle: "rgba(124, 58, 237, 0.1)",  // Chart fills, backgrounds
        },
        secondary: {
          DEFAULT: "#00E5FF",
          hover: "#00B8CC",
          glow: "rgba(0, 229, 255, 0.4)",
          subtle: "rgba(0, 229, 255, 0.1)",   // Chart fills, backgrounds
        },
        accent: {
          warning: "#F59E0B",
          error: "#EF4444",
          success: "#10B981",
          warningSubtle: "rgba(245, 158, 11, 0.1)",
          errorSubtle: "rgba(239, 68, 68, 0.1)",
          successSubtle: "rgba(16, 185, 129, 0.1)",
        },
        // First-class log level tokens — used across LogTable, LogBadge, filters
        log: {
          critical: "#EF4444",       // Red   — CRITICAL
          criticalSubtle: "rgba(239, 68, 68, 0.1)",
          error: "#F97316",          // Orange — ERROR (distinct from critical)
          errorSubtle: "rgba(249, 115, 22, 0.1)",
          warning: "#F59E0B",        // Amber  — WARN
          warningSubtle: "rgba(245, 158, 11, 0.1)",
          info: "#94A3B8",           // Slate  — INFO
          infoSubtle: "rgba(148, 163, 184, 0.1)",
          debug: "#6366F1",          // Indigo — DEBUG
          debugSubtle: "rgba(99, 102, 241, 0.1)",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        border: {
          DEFAULT: "#1E293B",
          light: "#334155",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Roboto Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',     // Cards, panels, surfaces
        badge: '6px',     // Log level badges, tags
        pill: '9999px',   // Status dots, toggle pills
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(124, 58, 237, 0.4)',
        'glow-secondary': '0 0 20px -5px rgba(0, 229, 255, 0.4)',
        'glow-error': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.4)',  // For modals/dropdowns
      },
      backdropBlur: {
        'glass': '12px',
      },
      transitionDuration: {
        fast: '150ms',   // Hover states, small toggles
        base: '250ms',   // Most UI transitions
        slow: '400ms',   // Page transitions, charts animating in
      },
    },
  },
  plugins: [],
}