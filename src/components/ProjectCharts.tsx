// src/components/ProjectCharts.tsx
import { Box, Typography, Stack } from "@mui/material";
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

// Label renderer: place text INSIDE the slice so it can’t be clipped
function renderValueLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
  if (!value || value <= 0) return "";

  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.6; // 60% into the slice
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800}>
      {fmtGBP(Number(value))}
    </text>
  );
}

export default function ProjectCharts({ project }: Props) {
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

  const safeData = data.length ? data : [{ key: "empty", name: "No costs", value: 1 }];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
      {/* Chart */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          overflow: "visible",     // <-- IMPORTANT: don’t clip SVG
          aspectRatio: "1 / 1",
          maxHeight: 420
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="68%"      // <-- smaller so it fits better on phones
              labelLine={false}
              label={data.length ? renderValueLabel : undefined}
            >
              {safeData.map((entry: any, idx: number) => (
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

            <Typography sx={{ fontWeight: 900, flex: "0 0 auto" }}>{fmtGBP(d.value)}</Typography>
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
