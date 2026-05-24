import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#140e08',
        surface: '#1e1510',
        surface2: '#2a1d15',
        accent: '#d4673a',
        'accent-dark': '#8b3a1e',
        foreground: '#f2e4cf',
        muted: '#a08060',
        subtle: '#6a4e38',
        success: '#5a7a50',
        error: '#a03020',
      },
      fontFamily: {
        serif: ['var(--font-lora)', 'Georgia', '"Palatino Linotype"', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
