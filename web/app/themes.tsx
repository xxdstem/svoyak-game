import { createTheme } from "@mui/material";

const basedarkTheme = createTheme({
  direction: "ltr",
  palette: {
    mode: "dark",
    primary: {
      main: "#5D87FF",
      light: "#253662",
      dark: "#4570EA",
    },
    grey: {
      100: "#2A3547",
      200: "#3A4557",
      300: "#4A5568",
      400: "#8C9BC7",
      500: "#A5B4CB",
      600: "#D1D9E8",
    },
    text: {
      primary: "#E5EAEF",
      secondary: "#B2BDCD",
    },
    background: {
      default: "#1A202E",
      paper: "#222B3C",
    },
    action: {
      disabledBackground: "rgba(200, 200, 200, 0.12)",
      hoverOpacity: 0.08,
      hover: "rgba(255, 255, 255, 0.08)",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
  typography: {
    h1: {
      fontWeight: 600,
      fontSize: "2.25rem",
      lineHeight: "2.75rem",
      color: "#E5EAEF",
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      color: "#E5EAEF",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: "1.75rem",
      color: "#E5EAEF",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.3125rem",
      lineHeight: "1.6rem",
      color: "#E5EAEF",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: "1.6rem",
      color: "#E5EAEF",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: "1.2rem",
      color: "#E5EAEF",
    },
    button: {
      fontSize: "1.1rem",
      textTransform: "capitalize",
      fontWeight: 400,
    },
    body1: {
      fontSize: "1.2rem",
      fontWeight: 400,
      lineHeight: "1.334rem",
      color: "#B2BDCD",
    },
    body2: {
      fontSize: "0.75rem",
      letterSpacing: "0rem",
      fontWeight: 400,
      lineHeight: "1rem",
      color: "#B2BDCD",
    },
    subtitle1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      color: "#B2BDCD",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      color: "#B2BDCD",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#1A202E",
        },
        ".MuiPaper-elevation9, .MuiPopover-root .MuiPaper-elevation": {
          boxShadow:
            "rgb(0 0 0 / 30%) 0px 0px 2px 0px, rgb(0 0 0 / 50%) 0px 12px 24px -4px !important",
          backgroundColor: "#222B3C",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "7px",
          backgroundColor: "#222B3C",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#222B3C",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#222B3C",
        },
      },
    },
  },
});



const baselightTheme = createTheme({
  direction: "ltr",
  palette: {
    mode: "light",
    primary: {
      main: "#5D87FF",
      light: "#ECF2FF",
      dark: "#4570EA",
    },
    secondary: {
      main: "#49BEFF",
      light: "#E8F7FF",
      dark: "#23afdb",
    },
    success: {
      main: "#13DEB9",
      light: "#E6FFFA",
      dark: "#02b3a9",
      contrastText: "#ffffff",
    },
    info: {
      main: "#539BFF",
      light: "#EBF3FE",
      dark: "#1682d4",
      contrastText: "#ffffff",
    },
    error: {
      main: "#FA896B",
      light: "#FDEDE8",
      dark: "#f3704d",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#FFAE1F",
      light: "#FEF5E5",
      dark: "#ae8e59",
      contrastText: "#ffffff",
    },
    grey: {
      100: "#F2F6FA",
      200: "#EAEFF4",
      300: "#DFE5EF",
      400: "#7C8FAC",
      500: "#5A6A85",
      600: "#2A3547",
    },
    text: {
      primary: "#2A3547",
      secondary: "#253662", // более тёмный оттенок для второстепенного текста
    },
    background: {
      default: "#F2F6FA",
      paper: "#fff",
    },
    action: {
      disabledBackground: "rgba(73,82,88,0.12)",
      hoverOpacity: 0.02,
      hover: "#f6f9fc",
    },
    divider: "#e5eaef",
  },
  typography: {
    h1: {
      fontWeight: 600,
      fontSize: "2.25rem",
      lineHeight: "2.75rem",
      color: "#2A3547",
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      color: "#2A3547",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: "1.75rem",
      color: "#2A3547",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.3125rem",
      lineHeight: "1.6rem",
      color: "#2A3547",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: "1.6rem",
      color: "#2A3547",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: "1.2rem",
      color: "#2A3547",
    },
    button: {
      textTransform: "capitalize",
      fontWeight: 400,
      fontSize: "1.1rem",
      color: "#253662", // более тёмный цвет для кнопок
    },
    body1: {
      fontSize: "1.2rem",
      fontWeight: 400,
      lineHeight: "1.334rem",
      color: "#253662", // более тёмный цвет для основного текста
    },
    body2: {
      fontSize: "0.75rem",
      letterSpacing: "0rem",
      fontWeight: 400,
      lineHeight: "1rem",
      color: "#253662", // более тёмный цвет для второстепенного текста
    },
    subtitle1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      color: "#253662",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      color: "#253662",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F2F6FA",
        },
        ".MuiPaper-elevation9, .MuiPopover-root .MuiPaper-elevation": {
          boxShadow:
            "rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px !important",
          backgroundColor: "#fff",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "7px",
          backgroundColor: "#fff",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#fff",
        },
      },
    },
  },
});

export { baselightTheme, basedarkTheme };
