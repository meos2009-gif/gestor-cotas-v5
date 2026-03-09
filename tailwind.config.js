export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tema atual
        primary: "#0A1A2F",     // Azul escuro do menu
        secondary: "#F4A300",   // Amarelo torrado do clube
        accent: "#D98200",      // Laranja escuro para hover
        bg: "#0F1B2D",          // Fundo geral da app
        text: "#FFFFFF",        // Texto branco

        // Tema antigo (para restaurar o visual original)
        clubYellow: "#FFD700",      // Amarelo forte do menu antigo
        clubYellowDark: "#E6C200",  // Amarelo escuro (hover)
        clubOrange: "#FF7A00",      // Laranja do botão Terminar Sessão
        clubBlack: "#000000",       // Preto do texto
      },
    },
  },

  safelist: [
    // Tema atual
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

    // Tema antigo
    "bg-clubYellow",
    "bg-clubYellowDark",
    "bg-clubOrange",
    "text-clubBlack",
    "hover:text-clubYellowDark",
  ],

  plugins: [],
};
