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

              const total = data.reduce((sum, d) => sum + d.value, 0);

              const outerRadius = isSmDown ? "84%" : "78%";
              const innerRadius = isSmDown ? "58%" : "52%";

              return (
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 340, sm: 380 }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={outerRadius}
                          innerRadius={innerRadius}
                          paddingAngle={1}
                        >
                          {data.map((entry, idx) => (
                            <Cell
                              key={idx}
                              fill={(COLORS as any)[entry.key] || "#94A3B8"}
                            />
                          ))}
                        </Pie>

                        {/* Center total */}
                        <text
                          x="50%"
                          y="46%"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontWeight: 700,
                            fontSize: isSmDown ? 12 : 13,
                            fill: theme.palette.text.secondary
                          }}
                        >
                          Total
                        </text>

                        <text
                          x="50%"
                          y="55%"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontWeight: 900,
                            fontSize: isSmDown ? 18 : 20,
                            fill: theme.palette.text.primary
                          }}
                        >
                          {fmtGBP(total)}
                        </text>

                        <Tooltip formatter={(v: any) => fmtGBP(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Legend */}
                  <Stack spacing={1}>
                    {data.map((d) => (
                      <Stack
                        key={d.key}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
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
                          <Typography sx={{ fontWeight: 800 }}>
                            {d.name}
                          </Typography>
                        </Stack>

                        <Typography sx={{ fontWeight: 900 }}>
                          {fmtGBP(d.value)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              );
            }
