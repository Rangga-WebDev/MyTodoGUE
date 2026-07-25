import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Palet "Lime Orbit" — nama pendek agar mudah dipakai di className.
      // Didefinisikan sebagai hex (bukan var) agar modifier opacity
      // seperti bg-lime/10 tetap berfungsi.
      colors: {
        obsidian: "#11110F", // background utama
        surface: "#1C1D18", // card, sidebar, dialog
        moss: "#292B22", // surface aktif/hover
        lime: "#C7F36B", // aksen utama — pakai dengan disiplin
        lavender: "#A99BFF", // aksen sekunder
        ivory: "#F4F1E8", // teks utama
        ash: "#A8A89F", // teks pendukung
        line: "#393B31", // border
        coral: "#FF6B64", // terlambat / hapus / error
        amber: "#F5B942", // mendekati deadline / peringatan
        mint: "#65D6A6", // selesai / sukses
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"], // Syne
        sans: ["var(--font-body)", "sans-serif"], // Manrope
      },
      borderRadius: {
        card: "22px",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        orbitSpin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        rise: "rise 0.35s ease-out both",
        floaty: "floaty 7s ease-in-out infinite",
        orbit: "orbitSpin 90s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
