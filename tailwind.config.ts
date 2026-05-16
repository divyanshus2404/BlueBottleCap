import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 70px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        brand: {
          500: '#1d4ed8',
          600: '#1e40af',
        },
      },
    },
  },
  plugins: [],
};

export default config;
