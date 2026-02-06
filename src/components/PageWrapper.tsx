// src/components/PageWrapper.tsx
import { Box, Typography } from "@mui/material";
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
        boxSizing: "border-box",
        // Keep padding light here. Let each page decide if it wants a Paper wrapper.
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 1.5, sm: 2 }
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            mb: 2,
            px: { xs: 0.25, sm: 0 }
          }}
        >
          {title}
        </Typography>

        {children}
      </Box>
    </Box>
  );
}
