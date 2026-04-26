/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        wood: {
          900: '#1c1410',
          800: '#2a1f17',
          700: '#3d2b1f',
          600: '#5c3d2e',
          500: '#8b6914',
          400: '#a67c00',
        },
        felt: {
          700: '#1a5c2a',
          600: '#2d7a3e',
          500: '#38944a',
        },
        amber: {
          500: '#d4a03c',
          400: '#e8b84a',
          300: '#f0ca6e',
        },
        ivory: {
          100: '#f5f0e1',
          50: '#faf6eb',
        },
        red: {
          600: '#c0392b',
          500: '#e74c3c',
        },
        green: {
          600: '#27ae60',
          500: '#2ecc71',
        },
      },
      boxShadow: {
        'glow-amber': '0 0 20px rgba(232, 184, 74, 0.3)',
        'glow-green': '0 0 15px rgba(45, 122, 62, 0.4)',
        'inner-felt': 'inset 0 2px 20px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'wood-grain': 'linear-gradient(135deg, #1c1410 0%, #2a1f17 50%, #1c1410 100%)',
        'wood-card': 'linear-gradient(145deg, #3d2b1f 0%, #2a1f17 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
