/** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/**/*.{js,jsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            // Ensure tables render properly
            table: {
              width: "100%",
              borderCollapse: "collapse",
            },
            th: {
              border: "1px solid #d1d5db", // Tailwind's gray-300
              padding: "0.5rem",
              textAlign: "left",
            },
            td: {
              border: "1px solid #d1d5db",
              padding: "0.5rem",
            },
            // Optional: remove quotes from code
            "code::before": { content: 'none' },
            "code::after": { content: 'none' },
            // Highlight color override
            mark: {
              backgroundColor: "#FEF3C7", // Tailwind amber-100
              padding: "0.1em 0.3em",
              borderRadius: "0.2em",
            },
            // Font family rendering
            'span[style*="font-family"]': {
              fontFamily: "inherit !important", // allow rendering if needed
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

