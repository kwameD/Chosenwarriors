/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        purplePrimary: "#6F4A9E",
        purpleHover: "#533475",
        deepPurple: "#241B3A",
        goldAccent: "#D7A84E",
        warmGold: "#F8F0DB",
        softBg: "#F6F2FA",
        darkText: "#1F1A2C",
        coralPop: "#C67A69",
        skyPop: "#8EB6C9",
        mintPop: "#8FB8A4"
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
