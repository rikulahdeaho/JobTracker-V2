import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1f4b99",
    },
    secondary: {
      main: "#0f766e",
    },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
});
