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

  // Donut sizing
  const outerRadius = isSmDown ? "84%" : "78%";
  const innerRadius = isSmDown ? "58%" : "52%";

  // Slice label inside (hide tiny slices)
  const renderInsideLabel = (props: any) => {
    if (!data.length) return null;

    const { cx, cy, midAngle, innerRadius: inR = 0, outerRadius: outR, value } = props;

    const v = Number(value);
    const pct = total > 0 ? v / total : 0;
    if (pct < 0.06) return null; // hide tiny slices (<6%) to keep donut clean

    const RADIAN = Math.PI / 180;
    const r = (inR + outR) / 2;
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

  // Center label (Total)
  const renderCenter = () => {
    // If there's no real data, keep it simple
    if (!data.length) {
      return (
        <>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontWeight: 900, fontSize: isSmDown ? 14 : 16 }}
            fill={theme.palette.text.primary}
          >
            No costs
          </text>
        </>
      );
    }

    return (
      <>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontWeight: 800, fontSize: isSmDown ? 12 : 13 }}
          fill={theme.palette.text.secondary}
        >
          Total
        </text>
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontWeight: 950, fontSize: isSmDown ? 18 : 20 }}
          fill={theme.palette.text.primary}
        >
          {fmtGBP(total)}
        </text>
      </>
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
              innerRadius={innerRadius}
              label={data.length ? renderInsideLabel : undefined}
              labelLine={false}
              paddingAngle={data.length ? 1 : 0}
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

            {/* Center label */}
            {renderCenter()}

            {data.length ? <Tooltip formatter={(v: any) => fmtGBP(Number(v))} /> : null}
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Key (no Total row now) */}
      <Stack spacing={1} sx={{ width: "100%", minWidth: 0 }}>
        {data.map((d) => (
          <Stack
