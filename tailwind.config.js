/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        purplePrimary: "#6A0DAD",
        purpleHover: "#8E44AD",
        goldAccent: "#D4AF37",
        softBg: "#F7F5FA",
        darkText: "#1A1A1A"
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
