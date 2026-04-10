/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19", // Deep Midnight Indigo for the main backgdrop
        surface: {
          DEFAULT: "#151C2C", // Dark navy for cards/surfaces
          hover: "#1D273B",
          active: "#25314A"
        },
        primary: {
          DEFAULT: "#7C3AED", // Vibrant violet
          hover: "#6D28D9",
          glow: "rgba(124, 58, 237, 0.4)" // Purple glow
        },
        secondary: {
          DEFAULT: "#00E5FF", // Cyan for secondary actions / system healthy colors
          hover: "#00B8CC",
          glow: "rgba(0, 229, 255, 0.4)"
        },
        accent: {
          warning: "#F59E0B", // Bright amber for warnings
          error: "#EF4444",   // Red for CRIT / Errors
          success: "#10B981"  // Emerald for OK statuses
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B"
        },
        border: {
          DEFAULT: "#1E293B",
          light: "#334155"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(124, 58, 237, 0.4)',
        'glow-secondary': '0 0 20px -5px rgba(0, 229, 255, 0.4)',
        'glow-error': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
