// src/components/PageWrapper.tsx
import { Box, Typography, Paper } from "@mui/material";
import type { ReactNode } from "react";

export default function PageWrapper({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "hidden",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            mb: 2,
            px: { xs: 0.5, sm: 0 }
          }}
        >
          {title}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3 },
            borderRadius: 4,
            width: "100%",
            overflowX: "hidden"
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
}