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

  // Bigger on mobile, but keep room for inside labels
  const outerRadius = isSmDown ? "82%" : "76%";

  // Recharts label renderer with inside placement
  const renderInsideLabel = (props: any) => {
    if (!data.length) return null;

    const { cx, cy, midAngle, innerRadius = 0, outerRadius, value } = props;

    const v = Number(value);
    const pct = total > 0 ? v / total : 0;
    if (pct < 0.05) return null; // hide tiny slices (<5%)

    // Position text halfway between inner and outer radius
    const RADIAN = Math.PI / 180;
    const r = (innerRadius + outerRadius) / 2;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontWeight: 800, fontSize: isSmDown ? 12 : 14 }}
      >
        {fmtGBP(v)}
      </text>
    );
  };

  return (
    <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
      {/* Chart */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 340, sm: 380 },
          maxHeight: 420,
          overflow: "visible",
          "& svg": { overflow: "visible" }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={outerRadius}
              label={isSmDown ? renderInsideLabel : (e) => fmtGBP(Number(e.value))}
              labelLine={false}
            >
              {chartData.map((entry: any, idx: number) => (
                <Cell
                  key={`${entry.key}-${idx}`}
                  fill={
                    entry.key === "empty"
                      ? "#9CA3AF"
                      : (COLORS as any)[entry.key] || "#94A3B8"
                  }
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: (COLORS as any)[d.key] || "grey.500"
                }}
              />
              <Typography sx={{ fontWeight: 800 }}>{d.name}</Typography>
            </Stack>

            <Typography sx={{ fontWeight: 900 }}>{fmtGBP(d.value)}</Typography>
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
