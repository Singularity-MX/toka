export const C = {
  bg: "#f4f5f0",
  surface: "#ffffff",
  ink: "#12261e",
  inkSoft: "#5b6b63",
  line: "#e2e5dc",
  forest: "#1b3a2f",
  gold: "#d9a82b",
  earth: "#8a6244",
  water: "#2f6f8f",
  sage: "#6f9a7b",
};

export const tokaTheme = {
  token: {
    colorPrimary: C.forest,
    colorBgLayout: C.bg,
    colorText: C.ink,
    colorBorder: C.line,
    borderRadius: 10,
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Menu: {
      itemBg: "transparent",
      itemColor: "#c9d6cd",
      itemHoverColor: "#ffffff",
      itemHoverBg: "rgba(255,255,255,0.08)",
      itemSelectedBg: "rgba(217,168,43,0.18)",
      itemSelectedColor: C.gold,
      itemHeight: 44,
    },
  },
};
