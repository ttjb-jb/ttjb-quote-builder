// src/components/Page.tsx
import { ReactNode } from "react";
import { Box, Typography, Paper } from "@mui/material";

type Props = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: number;
};

export default function Page({
  title,
  subtitle,
  actions,
  children,
  maxWidth = 1100
}: Props) {
  return (
    <Box sx={{ width: "100%" }}>
      {(title || actions) && (
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
            flexDirection: { xs: "column", sm: "row" }
          }}
        >
          <Box>
            {title && (
              <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {actions && <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{actions}</Box>}
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          maxWidth,
          borderRadius: 4,
          p: { xs: 2.5, sm: 4 },
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper"
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}