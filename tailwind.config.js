/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flowboard brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Workflow status colors
        workflow: {
          pending: '#f59e0b',
          running: '#3b82f6',
          success: '#10b981',
          failed: '#ef4444',
        },
        // Node type colors
        node: {
          start: '#10b981',
          end: '#6b7280',
          http: '#3b82f6',
          delay: '#f59e0b',
          conditional: '#8b5cf6',
          join: '#06b6d4',
          subworkflow: '#ec4899',
        },
      },
      boxShadow: {
        'node': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'panel': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 1s ease-in-out 3',
      }
    },
  },
  plugins: [],
}
