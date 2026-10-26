/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "card-gradient": "linear-gradient(to bottom, #1e3a8a, #0284c7)", // sky-600 to blue-800
        "gradient-primary": "linear-gradient(to right, #2A53CC, #714BEF)",
        "gradient-primary-o5": "linear-gradient(to right, rgba(42,83,204,0.05), rgba(113,75,239,0.05))",
        "gradient-grey-to-bottom": "linear-gradient(to bottom, #828282 ,#FFFFFF)",
        "gradient-primary-to-left": "linear-gradient(to left, #2A53CC, #714BEF)",
        "gradient-primary-text": "linear-gradient(to right, #6a49eb, #4245ea, #1b6cf6)",
        "gradient-primary-to-left-o20": "linear-gradient(to left, rgba(42, 83, 204, 0.2), rgba(113, 75, 239, 0.2))",
        "gradient-blue-white": "linear-gradient(to left, #FFFFFF, #E1EEFF)",
        "gradient-white-blue": "linear-gradient(to left, #E1EEFF, #FFFFFF)",
        "btn-gradientprimary": "linear-gradient(to right, #4ade80, #16a34a)",
        "btn-gradientsecondary": "linear-gradient(to right, #d1d5db, #6b7280)",
        "btn-gradientblue": "linear-gradient(to right, #330df3ff, #5e55c4ff)",
      },
      clipPath: {
        polygon: "polygon(-1px -2px, -1px 100%, 100% 100%)", // default shape
      },
      fontFamily: {
        hanken: ['"Hanken Grotesk"', 'sans-serif'],
        gotham: ['Gotham', 'sans-serif'],
      },
    },
  },
  safelist: [
    {
      pattern:
        /(bg|text|hover:bg)-(sky|purple|red|green|blue)-(100|200|300|400|500|600|700)/,
    },
    "font-bold",
    "inline-block",
    "px-6",
    "py-3",
    "rounded-xl",
    "shadow-lg",
    "transition",
  ],
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.clip-path-polygon': {
          'clip-path': 'polygon(-1px -2px, -1px 100%, 100% 100%)',
        },
      })
    }
  ]
};
