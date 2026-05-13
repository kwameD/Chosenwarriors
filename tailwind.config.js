/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        purplePrimary: "#000000",
        purpleHover: "#1A1A1A",
        deepPurple: "#000000",
        goldAccent: "#FFFFFF",
        warmGold: "#FFFFFF",
        softBg: "#FFFFFF",
        darkText: "#000000"
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 40px rgba(26, 26, 26, 0.08)"
      }
    },
  },
  plugins: [],
}
