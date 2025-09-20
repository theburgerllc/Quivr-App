/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#FFF0F6",100:"#FFD1E7",200:"#FFA3CF",300:"#FF75B6",400:"#FF479E",500:"#FF2A8E",
          600:"#E0207B",700:"#B81862",800:"#8F124C",900:"#690C36"
        }
      }
    }
  },
  plugins: []
};
