/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dayflow: {
          green: '#18D98B',
          blue: '#55BCEB',
          navy: '#11111F',
          white: '#FFFFFF',
          bg: '#F7F9FB',
          greenSoft: '#E8FFF5',
          blueSoft: '#EAF8FF',
          border: '#E7EAF0',
          text: '#11111F',
          muted: '#667085',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          purple: '#8B5CF6'
        }
      },
      boxShadow: {
        soft: '0 8px 22px rgba(17,17,31,0.06)',
        card: '0 10px 26px rgba(17,17,31,0.05)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      }
    }
  },
  plugins: []
}
