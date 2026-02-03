// src/pages/ProjectHistory.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  MenuItem,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent
} from "@mui/material";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import JSZip from "jszip";

import PageWrapper from "../components/PageWrapper";
import ConfirmDialog from "../components/ConfirmDialog";
import ProjectCharts from "../components/ProjectCharts";
import { QuotePdf } from "../pdf/QuotePdf";

import type { Project, Printer } from "../types";
import { loadProjects, saveProjects, loadPrinters, syncQuoteCounterFromProjects } from "../utils/storage";
import { saveAndShareBlob } from "../utils/deviceDownload";
type ViewMode = "cards" | "table";

function fmtGBP(n: number | undefined) {
  const v = Number(n ?? 0);
  return `£${v.toFixed(2)}`;
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

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename: string, text: string, mime = "text/plain") {
  downloadBlob(filename, new Blob([text], { type: mime }));
}

export default function ProjectHistory() {
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

  // mobile/tablet default to cards, desktop default to table
  const [viewMode, setViewMode] = useState<ViewMode>(() => (isMdDown ? "cards" : "table"));
  const [viewManuallySet, setViewManuallySet] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [printerFilter, setPrinterFilter] = useState<string>("all");

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ps = loadProjects();
    setProjects(ps);
    setPrinters(loadPrinters());
    syncQuoteCounterFromProjects();
  }, []);

  useEffect(() => {
    if (viewManuallySet) return;
    setViewMode(isMdDown ? "cards" : "table");
  }, [isMdDown, viewManuallySet]);

  const printerNameById = useMemo(() => {
    const map = new Map<string, string>();
    printers.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [printers]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => (p as any).id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();

    return projects
      .slice()
      .sort((a, b) => {
        const ta = typeof (a as any).createdAt === "number" ? (a as any).createdAt : Date.parse(String((a as any).createdAt));
        const tb = typeof (b as any).createdAt === "number" ? (b as any).createdAt : Date.parse(String((b as any).createdAt));
        return (tb || 0) - (ta || 0);
      })
      .filter((p) => {
        const printerOk = printerFilter === "all" ? true : (p as any).printerId === printerFilter;

        const hay = [
          (p as any).quoteNumber ?? "",
          (p as any).name ?? "",
          printerNameById.get((p as any).printerId) ?? ""
        ]
          .join(" ")
          .toLowerCase();

        const searchOk = q ? hay.includes(q) : true;
        return printerOk && searchOk;
      });
  }, [projects, search, printerFilter, printerNameById]);

  function selectProject(id: string) {
    setSelectedProjectId(id);

    // scroll to chart without causing horizontal jump
    setTimeout(() => {
      chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }, 50);
  }

  function clearSelection() {
    setSelectedProjectId(null);
  }

  function handleDeleteSelected() {
    if (!selectedProjectId) return;
    setConfirmDeleteOpen(true);
  }

  function doDeleteSelected() {
    if (!selectedProjectId) return;
    const updated = projects.filter((p: any) => p.id !== selectedProjectId);
    setProjects(updated);
    saveProjects(updated);
    setSelectedProjectId(null);
  }

  function handleBulkDeleteFiltered() {
    if (filteredProjects.length === 0) return;
    setConfirmBulkDeleteOpen(true);
  }

  function doBulkDeleteFiltered() {
    const ids = new Set(filteredProjects.map((p: any) => p.id));
    const updated = projects.filter((p: any) => !ids.has(p.id));
    setProjects(updated);
    saveProjects(updated);
    setSelectedProjectId((prev) => (prev && ids.has(prev) ? null : prev));
  }

  async function downloadZipOfFilteredPdfs() {
    if (filteredProjects.length === 0) return;

    const zip = new JSZip();

    for (const p of filteredProjects as any[]) {
      const blob = await pdf(<QuotePdf project={p} />).toBlob();
      const ab = await blob.arrayBuffer();
      const safeName = (p.name || "project").replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_");
      zip.file(`${p.quoteNumber || "quote"}-${safeName}.pdf`, ab);
      await new Promise((r) => setTimeout(r, 40));
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob("quotes.zip", zipBlob);
  }

  function exportFilteredCsv() {
    const rows = (filteredProjects as any[]).map((p) => ({
      quoteNumber: p.quoteNumber ?? "",
      name: p.name ?? "",
      printer: printerNameById.get(p.printerId) ?? "",
      createdAt: safeDate(p.createdAt),
      electricityCost: Number(p.electricityCost ?? 0),
      filamentCost: Number(p.filamentCost ?? 0),
      printingCost: Number(p.printingCost ?? 0),
      assemblyCost: Number(p.assemblyCost ?? 0),
      accessoryCost: Number(p.accessoryCost ?? 0),
      serviceAndHandlingCost: Number(p.serviceAndHandlingCost ?? 0),
      totalCost: Number(p.totalCost ?? 0)
    }));

    const header = [
      "quoteNumber",
      "name",
      "printer",
      "createdAt",
      "electricityCost",
      "filamentCost",
      "printingCost",
      "assemblyCost",
      "accessoryCost",
      "serviceAndHandlingCost",
      "totalCost"
    ];

    const csv = [
      header.join(","),
      ...rows.map((r) =>
        header
          .map((k) => {
            const v = (r as any)[k];
            const s = typeof v === "string" ? v : String(v ?? "");
            return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
    ].join("\n");

    downloadTextFile("projects.csv", csv, "text/csv");
  }

  return (
    <PageWrapper title="Project history">
      {/* FINAL OUTER WRAPPER CLAMP:
          This prevents the TABLE from widening the whole page.
       */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          boxSizing: "border-box",
          px: { xs: 1.5, sm: 0 }
        }}
      >
        {/* INNER CONTENT WIDTH */}
        <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", boxSizing: "border-box", overflowX: "hidden" }}>
          {/* CONTROLS (must NEVER inherit table width) */}
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              mb: 3,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflowX: "clip"
            }}
          >
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                sx={{ minWidth: 0 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Quotes
                </Typography>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, next) => {
                    if (!next) return;
                    setViewMode(next);
                    setViewManuallySet(true);
                  }}
                  size="small"
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" }, maxWidth: "100%" }}
                >
                  <ToggleButton value="cards">Cards</ToggleButton>
                  <ToggleButton value="table">Table</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ minWidth: 0 }}>
                <TextField
                  label="Search (quote, project, printer)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />

                <TextField
                  select
                  label="Filter by printer"
                  value={printerFilter}
                  onChange={(e) => setPrinterFilter(e.target.value)}
                  fullWidth={isMdDown}
                  sx={{ minWidth: { xs: "100%", md: 260 }, maxWidth: "100%" }}
                >
                  <MenuItem value="all">All printers</MenuItem>
                  {printers.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Divider />

              {/* Actions: full width on mobile; wrap and center on larger */}
              <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "clip" }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    justifyContent: { xs: "stretch", sm: "center" },
                    alignItems: { xs: "stretch", sm: "center" }
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={downloadZipOfFilteredPdfs}
                    disabled={filteredProjects.length === 0}
                    fullWidth={isMdDown}
                    sx={{
                      minHeight: 44,
                      width: { xs: "100%", sm: "auto" },
                      maxWidth: "100%",
                      flex: { xs: "1 1 100%", sm: "0 0 auto" }
                    }}
                  >
                    Download PDFs (ZIP)
                  </Button>

                  <Button
                    variant="contained"
                    onClick={exportFilteredCsv}
                    disabled={filteredProjects.length === 0}
                    fullWidth={isMdDown}
                    sx={{
                      minHeight: 44,
                      width: { xs: "100%", sm: "auto" },
                      maxWidth: "100%",
                      flex: { xs: "1 1 100%", sm: "0 0 auto" }
                    }}
                  >
                    Export CSV (filtered)
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleBulkDeleteFiltered}
                    disabled={filteredProjects.length === 0}
                    fullWidth={isMdDown}
                    sx={{
                      minHeight: 44,
                      width: { xs: "100%", sm: "auto" },
                      maxWidth: "100%",
                      flex: { xs: "1 1 100%", sm: "0 0 auto" }
                    }}
                  >
                    Delete filtered
                  </Button>
                </Stack>
              </Box>

              <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 3, maxWidth: "100%" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                    Showing
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                    {filteredProjects.length} quote{filteredProjects.length === 1 ? "" : "s"}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Paper>

          {/* LIST */}
          {viewMode === "table" ? (
            <Paper
              sx={{
                borderRadius: 4,
                mb: 3,
                overflow: "hidden",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0
              }}
            >
              {/* ONLY THIS BOX SCROLLS HORIZONTALLY */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  overflowX: "auto",
                  overflowY: "hidden",
                  WebkitOverflowScrolling: "touch",
                  overscrollBehaviorX: "contain"
                }}
              >
                <TableContainer sx={{ width: "100%" }}>
                  <Table
                    size="medium"
                    sx={{
                      width: "max-content",
                      minWidth: 980
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Quote</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Project</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Printer</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">
                          Total
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">
                          PDF
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {(filteredProjects as any[]).map((p) => {
                        const isSelected = p.id === selectedProjectId;

                        return (
                          <TableRow
                            key={p.id}
                            hover
                            selected={isSelected}
                            onClick={() => selectProject(p.id)}
                            onDoubleClick={() => {
                              localStorage.setItem("editProject", JSON.stringify(p));
                              window.location.href = "/cost-generator";
                            }}
                            sx={{ cursor: "pointer", "& td": { py: 1.4 } }}
                          >
                            <TableCell>
                              <Chip label={p.quoteNumber ?? "—"} size="small" sx={{ fontWeight: 800 }} />
                            </TableCell>

                            <TableCell>{p.name}</TableCell>
                            <TableCell>{printerNameById.get(p.printerId) ?? "—"}</TableCell>
                            <TableCell>{safeDate(p.createdAt)}</TableCell>

                            <TableCell align="right" sx={{ fontWeight: 800 }}>
                              {fmtGBP(p.totalCost)}
                            </TableCell>

                            <TableCell align="right">
                              <PDFDownloadLink
                                document={<QuotePdf project={p} />}
                                fileName={`${p.quoteNumber || "quote"}.pdf`}
                                style={{ textDecoration: "none" }}
                              >
                                {({ loading }) => (
                                  <Button variant="text" size="small" sx={{ fontWeight: 800, minHeight: 40 }}>
                                    {loading ? "Building…" : "Download"}
                                  </Button>
                                )}
                              </PDFDownloadLink>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {filteredProjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography color="text.secondary" sx={{ py: 2 }}>
                              No projects match your filters.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          ) : (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {(filteredProjects as any[]).map((p) => {
                const isSelected = p.id === selectedProjectId;

                return (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 4,
                      borderColor: isSelected ? "primary.main" : "divider"
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Chip label={p.quoteNumber ?? "—"} size="small" sx={{ fontWeight: 900 }} />
                          <Typography sx={{ fontWeight: 800 }}>{fmtGBP(p.totalCost)}</Typography>
                        </Stack>

                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                          {p.name}
                        </Typography>

                        <Typography color="text.secondary">
                          {printerNameById.get(p.printerId) ?? "—"} • {safeDate(p.createdAt)}
                        </Typography>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                          <Button variant="contained" onClick={() => selectProject(p.id)} sx={{ minHeight: 44 }}>
                            View chart
                          </Button>

                          <Button
                            variant="contained"
                            onClick={() => {
                              localStorage.setItem("editProject", JSON.stringify(p));
                              window.location.href = "/cost-generator";
                            }}
                            sx={{ minHeight: 44 }}
                          >
                            Edit
                          </Button>

                          <PDFDownloadLink
                            document={<QuotePdf project={p} />}
                            fileName={`${p.quoteNumber || "quote"}.pdf`}
                            style={{ textDecoration: "none" }}
                          >
                            {({ loading }) => (
                              <Button variant="contained" sx={{ minHeight: 44 }} disabled={loading}>
                                {loading ? "Building…" : "Download PDF"}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredProjects.length === 0 ? (
                <Paper sx={{ p: 3, borderRadius: 4 }}>
                  <Typography color="text.secondary">No projects match your filters.</Typography>
                </Paper>
              ) : null}
            </Stack>
          )}

          {/* CHART PANEL */}
          <Paper
            ref={chartRef}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              overflowX: "hidden",
              scrollMarginTop: "84px" // prevents “header gets clipped” feel when scrolling to chart
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              sx={{ width: "100%", minWidth: 0 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Cost breakdown
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                useFlexGap
                flexWrap="wrap"
                sx={{ justifyContent: { xs: "stretch", sm: "flex-end" } }}
              >
                <Button variant="contained" onClick={clearSelection} disabled={!selectedProject} sx={{ minHeight: 44 }}>
                  Clear selection
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelected}
                  disabled={!selectedProject}
                  sx={{ minHeight: 44 }}
                >
                  Delete selected
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {selectedProject ? (
              <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
                <ProjectCharts project={selectedProject as any} />
              </Box>
            ) : (
              <Typography color="text.secondary">Select a project to see the chart.</Typography>
            )}
          </Paper>

          {/* Confirm dialogs */}
          <ConfirmDialog
            open={confirmDeleteOpen}
            title="Delete selected project?"
            description="This will permanently delete the selected project."
            confirmText="Delete"
            cancelText="Cancel"
            destructive
            onClose={() => setConfirmDeleteOpen(false)}
            onConfirm={() => {
              setConfirmDeleteOpen(false);
              doDeleteSelected();
            }}
          />

          <ConfirmDialog
            open={confirmBulkDeleteOpen}
            title="Delete all filtered projects?"
            description="This will permanently delete all projects currently shown by your filters/search."
            confirmText="Delete"
            cancelText="Cancel"
            destructive
            onClose={() => setConfirmBulkDeleteOpen(false)}
            onConfirm={() => {
              setConfirmBulkDeleteOpen(false);
              doBulkDeleteFiltered();
            }}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
}
