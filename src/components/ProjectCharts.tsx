// src/components/ProjectCharts.tsx
import { Box, Typography, Stack } from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Project } from "../types";

interface Props {
  project: Project | null;
}

const COLORS: Record<string, string> = {
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

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
      <Box
        sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          maxHeight: 420
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ key: "empty", name: "No costs", value: 1 }]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="75%"
              labelLine={false}
              label={({ value }) =>
                data.length ? fmtGBP(Number(value)) : ""
              }
            >
              {(data.length ? data : [{ key: "empty", name: "No costs", value: 1 }]).map(
                (entry, idx) => (
                  <Cell
                    key={`${entry.key}-${idx}`}
                    fill={
                      entry.key === "empty"
                        ? "#9CA3AF"
                        : COLORS[entry.key] || "#94A3B8"
                    }
                  />
                )
              )}
            </Pie>
            {data.length && (
              <Tooltip formatter={(v: any) => fmtGBP(Number(v))} />
            )}
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Stack spacing={1}>
        {data.map((d) => (
          <Stack
            key={d.key}
            direction="row"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: COLORS[d.key] || "grey.500"
                }}
              />
              <Typography fontWeight={800}>{d.name}</Typography>
            </Stack>
            <Typography fontWeight={900}>
              {fmtGBP(d.value)}
            </Typography>
          </Stack>
        ))}

        <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
          <Typography fontWeight={900}>Total</Typography>
          <Typography fontWeight={900}>{fmtGBP(total)}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
