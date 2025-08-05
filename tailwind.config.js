
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,pages,hooks,context}/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
