// src/pages/Landing.tsx
import { Box, Typography, Button, Stack, Paper } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { loadProjects } from "../utils/storage";
import type { Project } from "../types";

function fmtGBP(n: number) {
  return `£${Number(n ?? 0).toFixed(2)}`;
}

function safeDate(ts: any) {
  try {
    const d = typeof ts === "number" ? new Date(ts) : new Date(String(ts));
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function Landing() {
  const nav = useNavigate();

  const stats = useMemo(() => {
    const projects = loadProjects() as Project[];

    const totalQuotes = projects.length;
    const totalValue = projects.reduce((sum, p: any) => sum + Number(p.totalCost ?? 0), 0);
    const avg = totalQuotes > 0 ? totalValue / totalQuotes : 0;

    const sorted = projects
      .slice()
      .sort((a: any, b: any) => {
        const ta = typeof a.createdAt === "number" ? a.createdAt : Date.parse(String(a.createdAt));
        const tb = typeof b.createdAt === "number" ? b.createdAt : Date.parse(String(b.createdAt));
        return (tb || 0) - (ta || 0);
      });

    const last = sorted[0] as any | undefined;

    return {
      totalQuotes,
      totalValue,
      avg,
      lastQuote: last?.quoteNumber ?? "—",
      lastDate: last ? safeDate(last.createdAt) : ""
    };
  }, []);

  return (
    <PageWrapper title="TTJB Quote Builder">
      <Box sx={{ maxWidth: 1100 }}>
        <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 6, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
            Quick actions
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button variant="contained" sx={{ minHeight: 48 }} onClick={() => nav("/cost-generator")}>
              New quote
            </Button>
            <Button variant="contained" sx={{ minHeight: 48 }} onClick={() => nav("/projects")}>
              Project history
            </Button>
            <Button variant="outlined" sx={{ minHeight: 48 }} onClick={() => nav("/settings")}>
              Settings
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
            Company stats
          </Typography>

          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5 }}>
              <Typography color="text.secondary">Total quotes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {stats.totalQuotes}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5 }}>
              <Typography color="text.secondary">Total quoted value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {fmtGBP(stats.totalValue)}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5 }}>
              <Typography color="text.secondary">Average quote</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {fmtGBP(stats.avg)}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5 }}>
              <Typography color="text.secondary">Last quote</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {stats.lastQuote}
                {stats.lastDate ? ` • ${stats.lastDate}` : ""}
              </Typography>
            </Paper>
          </Stack>
        </Paper>
      </Box>
    </PageWrapper>
  );
}