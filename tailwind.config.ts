import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KRDS Primary (정부 청색)
        primary: {
          5: "#ecf2fe",
          10: "#d8e5fd",
          20: "#b1cefb",
          30: "#86aff9",
          40: "#4c87f6",
          50: "#256ef4",
          60: "#0b50d0",
          70: "#083891",
          80: "#052561",
          90: "#03163a",
          DEFAULT: "#0b50d0",
        },
        // KRDS Secondary
        secondary: {
          50: "#346fb2",
          60: "#1c589c",
          70: "#063a74",
        },
        // KRDS Point (정부 적색)
        point: {
          50: "#d63d4a",
          60: "#ab2b36",
          70: "#7a1f26",
          DEFAULT: "#d63d4a",
        },
        // KRDS Gray
        gray: {
          0: "#ffffff",
          5: "#f4f5f6",
          10: "#e6e8ea",
          20: "#cdd1d5",
          30: "#b1b8be",
          40: "#8a949e",
          50: "#6d7882",
          60: "#58616a",
          70: "#464c53",
          80: "#33363d",
          90: "#1e2124",
          100: "#000000",
        },
        // KRDS System
        danger: "#de3412",
        success: "#16a34a",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      fontSize: {
        "display-lg": ["3.75rem", { lineHeight: "1.2" }],
        "display-md": ["2.75rem", { lineHeight: "1.25" }],
        "display-sm": ["2.25rem", { lineHeight: "1.3" }],
        "heading-xl": ["2.5rem", { lineHeight: "1.3" }],
        "heading-lg": ["2rem", { lineHeight: "1.35" }],
        "heading-md": ["1.5rem", { lineHeight: "1.4" }],
        "heading-sm": ["1.1875rem", { lineHeight: "1.4" }],
        "heading-xs": ["1.0625rem", { lineHeight: "1.45" }],
        "body-lg": ["1.1875rem", { lineHeight: "1.6" }],
        "body-md": ["1.0625rem", { lineHeight: "1.6" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.6" }],
        "body-xs": ["0.8125rem", { lineHeight: "1.5" }],
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
