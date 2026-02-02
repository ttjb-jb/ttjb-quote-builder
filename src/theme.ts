// src/theme.ts
import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export function buildTheme(mode: ThemeMode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#2563EB" // nice blue, readable on dark + light
      }
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"'
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: "contained"
        }
      }
    }
  });
}
