// src/components/ProjectCharts.tsx
import { Box, Typography, Stack, useMediaQuery, useTheme } from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Project } from "../types";

interface Props {
  project: Project | null;
}

const COLORS = {
  filament: "#2DD4BF",
  printing: "#6366F1",
  assembly: "#22C55E",
  service: "#F59E0B",
  accessories: "#EC4899"
};

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function fmtGBP(val: number) {
  return `£${val.toFixed(2)}`;
}

export default function ProjectCharts({ project }: Props) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  if (!project) return null;

  const electricity = n((project as any).electricityCost);
  const filament = n((project as any).filamentCost);
  const assembly = n((project as any).assemblyCost);
  const service = n((project as any).serviceAndHandlingCost);
  const accessories = n((project as any).accessoryCost);

  const data = [
    { key: "filament", name: "Filament", value: filament },
    { key: "printing", name: "Printing", value: electricity },
    { key: "assembly", name: "Assembly", value: assembly },
    { key: "service", name: "Service & Handling", value: service },
    { key: "accessories", name: "Accessories", value: accessories }
  ].filter((d) => d.value > 0);

  const chartData = data.length ? data : [{ key: "empty", name: "No costs", value: 1 }];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Smaller radius on mobile gives labels more room
  const outerRadius = isSmDown ? "62%" : "76%";

  const chartMargin = isSmDown
    ? { top: 18, right: 46, bottom: 18, left: 46 }
    : { top: 14, right: 22, bottom: 14, left: 22 };

  return (
    <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
      {/* Chart */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          // Give ResponsiveContainer a stable height (aspectRatio alone can be flaky)
          height: { xs: 320, sm: 380 },
          maxHeight: 420,

          // IMPORTANT: allow labels outside the chart box
          overflow: "visible",
          "& .recharts-wrapper": { overflow: "visible" },
          "& svg": { overflow: "visible" }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={chartMargin}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={outerRadius}
              labelLine={false}
              label={({ value }) => (data.length ? fmtGBP(Number(value)) : "")}
            >
              {chartData.map((entry: any, idx: number) => (
                <Cell
                  key={`${entry.key}-${idx}`}
                  fill={entry.key === "empty" ? "#9CA3AF" : (COLORS as any)[entry.key] || "#94A3B8"}
                />
              ))}
            </Pie>

            {data.length ? <Tooltip formatter={(v: any) => fmtGBP(Number(v))} /> : null}
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Key */}
      <Stack spacing={1} sx={{ width: "100%", minWidth: 0 }}>
        {data.map((d) => (
          <Stack
            key={d.key}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", minWidth: 0 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: (COLORS as any)[d.key] || "grey.500",
                  flex: "0 0 auto"
                }}
              />
              <Typography sx={{ fontWeight: 800 }} noWrap>
                {d.name}
              </Typography>
            </Stack>

            <Typography sx={{ fontWeight: 900, flex: "0 0 auto" }}>
              {fmtGBP(d.value)}
            </Typography>
          </Stack>
        ))}

        <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
          <Typography sx={{ fontWeight: 900 }}>Total</Typography>
          <Typography sx={{ fontWeight: 900 }}>{fmtGBP(total)}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
