export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A1A2F",     // Azul escuro do menu
        secondary: "#F4A300",   // Amarelo torrado do clube
        accent: "#D98200",      // Laranja escuro para hover
        bg: "#0F1B2D",          // Fundo geral da app
        text: "#FFFFFF",        // Texto branco
      },
    },
  },
  safelist: [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-bg",
    "text-text",
    "text-secondary",
    "hover:text-secondary",
    "hover:bg-accent",
    "text-white",
    "hover:text-white",
  ],
  plugins: [],
};
