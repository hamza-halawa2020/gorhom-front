/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
      },
      colors: {
        primary: "#0ea5e9",
        secondary: "#0284c7",
        accent: "#38bdf8",
        dark: "#0f172a",
        darker: "#000000",
        darkest: "#000000",
      },
      animation: {
        "pulse-blue": "pulse-blue 4s ease-in-out infinite",
        "rotate-light": "rotate-light 20s linear infinite",
        "data-flow": "data-flow 2s infinite linear",
        "data-flow-rtl": "data-flow-rtl 2s infinite linear",
        "animate-border": "animate-border 3s linear infinite",
        "animate-border-rtl": "animate-border-rtl 3s linear infinite",
        ripple: "ripple 3s linear infinite",
        bounce: "bounce 2s infinite",
        "bounce-rtl": "bounce-rtl 2s infinite",
        vibrate: "vibrate 10ms infinite",
      },
      keyframes: {
        "pulse-blue": {
          "0%, 100%": {
            opacity: "0.3",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.6",
            transform: "scale(1.1)",
          },
        },
        "rotate-light": {
          "0%": {
            transform: "translate(-50%, -50%) rotate(0deg)",
          },
          "100%": {
            transform: "translate(-50%, -50%) rotate(360deg)",
          },
        },
        "data-flow": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "data-flow-rtl": {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        "animate-border": {
          "0%": {
            left: "-100%",
          },
          "50%, 100%": {
            left: "100%",
          },
        },
        "animate-border-rtl": {
          "0%": {
            right: "-100%",
          },
          "50%, 100%": {
            right: "100%",
          },
        },
        ripple: {
          to: {
            transform: "scale(4)",
            opacity: "0",
          },
        },
        bounce: {
          "0%, 20%, 50%, 80%, 100%": {
            transform: "translateY(0)",
          },
          "40%": {
            transform: "translateY(-20px)",
          },
          "60%": {
            transform: "translateY(-10px)",
          },
        },
        "bounce-rtl": {
          "0%, 20%, 50%, 80%, 100%": {
            transform: "translateY(0)",
          },
          "40%": {
            transform: "translateY(-20px)",
          },
          "60%": {
            transform: "translateY(-10px)",
          },
        },
        vibrate: {
          "0%": {
            transform: "translate(0)",
          },
          "25%": {
            transform: "translate(1px, 1px)",
          },
          "50%": {
            transform: "translate(0)",
          },
          "75%": {
            transform: "translate(-1px, -1px)",
          },
          "100%": {
            transform: "translate(0)",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    // RTL plugin for better RTL support
    function ({addUtilities}) {
      const newUtilities = {
        ".rtl": {
          direction: "rtl",
        },
        ".ltr": {
          direction: "ltr",
        },
        ".text-start": {
          "text-align": "start",
        },
        ".text-end": {
          "text-align": "end",
        },
        ".ms-0": {
          "margin-inline-start": "0",
        },
        ".me-0": {
          "margin-inline-end": "0",
        },
        ".ps-0": {
          "padding-inline-start": "0",
        },
        ".pe-0": {
          "padding-inline-end": "0",
        },
        ".border-s": {
          "border-inline-start-width": "1px",
        },
        ".border-e": {
          "border-inline-end-width": "1px",
        },
        ".rounded-s": {
          "border-start-start-radius": "0.375rem",
          "border-end-start-radius": "0.375rem",
        },
        ".rounded-e": {
          "border-start-end-radius": "0.375rem",
          "border-end-end-radius": "0.375rem",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
