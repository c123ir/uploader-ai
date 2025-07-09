// frontend/tailwind.config.js - تنظیمات Tailwind CSS
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include any additional paths where classes are used
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // Custom colors
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)',
        }
      },

      // Custom gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        'gradient-warning': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'gradient-error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },

      // Custom fonts
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },

      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Custom box shadows
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.37)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'hard': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
      },

      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-scale': 'fadeInScale 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },

      // Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },

      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '32px',
      },

      // Custom z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Custom line heights
      lineHeight: {
        'extra-loose': '2.5',
        '12': '3rem',
      },

      // Custom max widths
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },

      // Custom aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
      },
    },
  },

  plugins: [
    // Add Tailwind plugins
    function({ addUtilities, addComponents, theme }) {
      // Glass morphism utilities
      addUtilities({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      })

      // Custom components
      addComponents({
        '.btn-primary': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '1rem',
          border: 'none',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
            transform: 'none',
          },
        },
        '.btn-secondary': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
        '.card': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 50px rgba(31, 38, 135, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      })
    },
  ],

  // Dark mode configuration
  darkMode: 'class',

  // RTL support
  corePlugins: {
    // Enable all core plugins
  },

  // Important prefix (if needed)
  // important: true,

  // Separator for responsive prefixes
  separator: ':',

  // Prefix for all classes (if needed)
  // prefix: '',
}