// src/pages/CostGenerator.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import PageWrapper from "../components/PageWrapper";
import ConfirmDialog from "../components/ConfirmDialog";
import { useSnackbar } from "../context/SnackbarContext";

import type { Filament, Printer, Project } from "../types";
import {
  loadPrinters,
  loadFilaments,
  loadProjects,
  saveProjects,
  loadElectricityCost,
  loadHourlyRate,
  loadServiceCharge,
  getNextQuoteNumber
} from "../utils/storage";

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isValidId(id: string) {
  return typeof id === "string" && id.trim().length > 0;
}

function fmt2(n: number) {
  return `£${Number(n ?? 0).toFixed(2)}`;
}

function normalizeName(s: string) {
  return (s ?? "").trim().toLowerCase();
}

type FilamentLine = {
  filamentId: string;
  grams: number;
};

const MAX_FILAMENT_LINES = 16;

export default function CostGenerator() {
  const { notify } = useSnackbar();

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);

  // ---- form ----
  const [projectName, setProjectName] = useState("");
  const [printerId, setPrinterId] = useState("");

  // Up to 16 filament lines
  const [filamentLines, setFilamentLines] = useState<FilamentLine[]>([{ filamentId: "", grams: 0 }]);

  const [printHours, setPrintHours] = useState<number>(0);
  const [assemblyHours, setAssemblyHours] = useState<number>(0);

  const [accessoryCost, setAccessoryCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // ---- defaults from Settings ----
  // electricity stored as pence/kWh (e.g. 34)
  const [electricityPencePerKwh, setElectricityPencePerKwh] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [defaultServicePercent, setDefaultServicePercent] = useState<number>(0);

  // ---- override service charge ----
  const [serviceOverrideEnabled, setServiceOverrideEnabled] = useState(false);
  const [servicePercentOverride, setServicePercentOverride] = useState<number>(0);

  // ---- results ----
  const [electricityCost, setElectricityCost] = useState<number>(0);
  const [filamentCost, setFilamentCost] = useState<number>(0);
  const [assemblyCost, setAssemblyCost] = useState<number>(0);
  const [serviceAndHandlingCost, setServiceAndHandlingCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  // ---- edit mode ----
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingQuoteNumber, setEditingQuoteNumber] = useState<string | null>(null);

  // ---- overwrite prompt ----
  const [confirmOverwriteOpen, setConfirmOverwriteOpen] = useState(false);
  const [pendingOverwriteProject, setPendingOverwriteProject] = useState<Project | null>(null);

  useEffect(() => {
    setPrinters(loadPrinters());
    setFilaments(loadFilaments());

    const e = loadElectricityCost(); // pence/kWh
    const h = loadHourlyRate(); // £/hr
    const sc = loadServiceCharge(); // %

    setElectricityPencePerKwh(num(e));
    setHourlyRate(num(h));
    setDefaultServicePercent(num(sc));
    setServicePercentOverride(num(sc));

    const raw = localStorage.getItem("editProject");
    if (raw) {
      try {
        const p = JSON.parse(raw) as Project;

        setEditingProjectId((p as any).id ?? null);
        setEditingQuoteNumber((p as any).quoteNumber ?? null);

        setProjectName((p as any).name ?? "");
        setPrinterId((p as any).printerId ?? "");

        setPrintHours(num((p as any).printHours));
        setAssemblyHours(num((p as any).assemblyHours));

        setAccessoryCost(num((p as any).accessoryCost));
        setNotes(String((p as any).notes ?? ""));

        // Prefer filamentLines if present, otherwise fall back to legacy single filament fields
        const storedLines = (p as any).filamentLines as FilamentLine[] | undefined;
        if (Array.isArray(storedLines) && storedLines.length) {
          setFilamentLines(
            storedLines
              .slice(0, MAX_FILAMENT_LINES)
              .map((x) => ({ filamentId: String((x as any).filamentId ?? ""), grams: num((x as any).grams) }))
          );
        } else {
          setFilamentLines([{ filamentId: String((p as any).filamentId ?? ""), grams: num((p as any).filamentGrams) }]);
        }

        // restore saved costs
        setElectricityCost(num((p as any).electricityCost));
        setFilamentCost(num((p as any).filamentCost));
        setAssemblyCost(num((p as any).assemblyCost));
        setServiceAndHandlingCost(num((p as any).serviceAndHandlingCost));
        setTotalCost(num((p as any).totalCost));

        const storedServicePercent =
          num((p as any).serviceChargePercent) ||
          num((p as any).serviceChargePercentUsed) ||
          num((p as any).serviceChargePercentOverride);

        if (storedServicePercent > 0) {
          setServiceOverrideEnabled(true);
          setServicePercentOverride(storedServicePercent);
        } else {
          setServiceOverrideEnabled(false);
          setServicePercentOverride(num(sc));
        }

        notify("Loaded project for editing", "info");
      } catch {
        notify("Failed to load edit project data", "error");
      } finally {
        localStorage.removeItem("editProject");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify]);

  const filamentById = useMemo(() => {
    const map = new Map<string, Filament>();
    (filaments as any[]).forEach((f) => map.set(String((f as any).id), f as any));
    return map;
  }, [filaments]);

  const selectedPrinter = useMemo(() => {
    return (printers as any[]).find((p) => String((p as any).id) === printerId) ?? null;
  }, [printers, printerId]);

  function getFilamentCostPerGram(filamentId: string): number {
    const f = filamentById.get(String(filamentId));
    if (!f) return 0;

    const cpk = num((f as any).costPerKg);
    if (cpk > 0) return cpk / 1000;

    const cpg = num((f as any).costPerGram);
    return cpg;
  }

  /**
   * Electricity cost in £:
   * £ = (powerW/1000) * hours * (pencePerKwh/100)
   */
  function computeElectricityCostGBP(hours: number): number {
    const powerW = num((selectedPrinter as any)?.powerW);
    if (!powerW || powerW <= 0) return 0;

    const kW = powerW / 1000;
    const poundsPerKwh = num(electricityPencePerKwh) / 100;
    return kW * num(hours) * poundsPerKwh;
  }

  function validateFilamentLines(): boolean {
    const hasAny = filamentLines.some((l) => isValidId(l.filamentId) && num(l.grams) > 0);
    if (!hasAny) {
      notify("Please add at least one filament with grams", "warning");
      return false;
    }
    const invalid = filamentLines.some(
      (l) =>
        (isValidId(l.filamentId) && num(l.grams) < 0) ||
        (!isValidId(l.filamentId) && num(l.grams) > 0)
    );
    if (invalid) {
      notify("Each filament row must have both filament and grams", "warning");
      return false;
    }
    return true;
  }

  function calculate() {
    if (!projectName.trim()) {
      notify("Please enter a project name", "warning");
      return;
    }
    if (!isValidId(printerId)) {
      notify("Please select a printer", "warning");
      return;
    }
    if (!validateFilamentLines()) return;

    const elec = computeElectricityCostGBP(printHours);

    const fil = filamentLines.reduce((sum, line) => {
      if (!isValidId(line.filamentId)) return sum;
      const g = num(line.grams);
      if (g <= 0) return sum;
      return sum + g * getFilamentCostPerGram(line.filamentId);
    }, 0);

    const asm = num(assemblyHours) * num(hourlyRate);
    const accessories = num(accessoryCost);

    const sub = elec + fil + asm + accessories;

    const percent = serviceOverrideEnabled ? num(servicePercentOverride) : num(defaultServicePercent);
    const svc = sub * (percent / 100);

    const total = sub + svc;

    setElectricityCost(elec);
    setFilamentCost(fil);
    setAssemblyCost(asm);
    setServiceAndHandlingCost(svc);
    setTotalCost(total);

    notify("Costs calculated", "success");
  }

  function clearAll() {
    setEditingProjectId(null);
    setEditingQuoteNumber(null);

    setProjectName("");
    setPrinterId("");

    setFilamentLines([{ filamentId: "", grams: 0 }]);

    setPrintHours(0);
    setAssemblyHours(0);

    setAccessoryCost(0);
    setNotes("");

    setServiceOverrideEnabled(false);
    setServicePercentOverride(defaultServicePercent);

    setElectricityCost(0);
    setFilamentCost(0);
    setAssemblyCost(0);
    setServiceAndHandlingCost(0);
    setTotalCost(0);

    // clear overwrite prompt state (just in case)
    setConfirmOverwriteOpen(false);
    setPendingOverwriteProject(null);

    notify("Cleared", "info");
  }

  function saveQuote() {
    if (!projectName.trim()) {
      notify("Please enter a project name", "warning");
      return;
    }
    if (!isValidId(printerId)) {
      notify("Please select a printer", "warning");
      return;
    }
    if (!validateFilamentLines()) return;

    if (totalCost <= 0) {
      notify("Please calculate costs before saving", "warning");
      return;
    }

    const projects = loadProjects();

    const servicePercentUsed = serviceOverrideEnabled ? num(servicePercentOverride) : num(defaultServicePercent);

    const compactLines = filamentLines
      .filter((l) => isValidId(l.filamentId) && num(l.grams) > 0)
      .slice(0, MAX_FILAMENT_LINES)
      .map((l) => ({ filamentId: String(l.filamentId), grams: num(l.grams) }));

    // legacy compatibility fields (first filament only)
    const firstLine = compactLines[0] ?? { filamentId: "", grams: 0 };

    const base: any = {
      name: projectName.trim(),
      printerId,

      // new multi-line filament input
      filamentLines: compactLines,

      // legacy single filament fields so older pages/pdf still work
      filamentId: firstLine.filamentId,
      filamentGrams: num(firstLine.grams),

      printHours: num(printHours),
      assemblyHours: num(assemblyHours),

      accessoryCost: num(accessoryCost),
      notes: String(notes ?? ""),

      electricityCost: num(electricityCost),
      filamentCost: num(filamentCost),
      assemblyCost: num(assemblyCost),
      serviceChargePercent: servicePercentUsed,
      serviceAndHandlingCost: num(serviceAndHandlingCost),
      totalCost: num(totalCost)
    };

    if (editingProjectId) {
      const updated = (projects as any[]).map((p: any) => {
        if (p.id !== editingProjectId) return p;
        return {
          ...p,
          ...base,
          id: p.id,
          quoteNumber: p.quoteNumber ?? editingQuoteNumber ?? p.quoteNumber,
          createdAt: p.createdAt ?? new Date().toISOString()
        };
      });

      saveProjects(updated as any);
      notify(`Updated ${editingQuoteNumber ?? "project"}`, "success");
      return;
    }

    // ---- NEW PROJECT SAVE (with duplicate-name protection + overwrite prompt) ----
    const nameKey = normalizeName(projectName);
    const dupIndex = (projects as any[]).findIndex((p: any) => normalizeName(p?.name) === nameKey);

    // Candidate project WITHOUT quote number yet (so we don't burn quote numbers on duplicates)
    const candidate: any = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...base
    };

    if (dupIndex !== -1) {
      // Duplicate name found → prompt overwrite
      setPendingOverwriteProject(candidate);
      setConfirmOverwriteOpen(true);
      notify("Project name already exists — overwrite or rename", "warning");
      return;
    }

    // Unique → safe to assign quote number
    candidate.quoteNumber = getNextQuoteNumber();

    const updated = [candidate as any, ...(projects as any[])];
    saveProjects(updated as any);
    notify(`Saved ${candidate.quoteNumber}`, "success");
  }

  function setLine(i: number, patch: Partial<FilamentLine>) {
    setFilamentLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setFilamentLines((prev) => {
      if (prev.length >= MAX_FILAMENT_LINES) {
        notify(`Maximum ${MAX_FILAMENT_LINES} filament lines`, "info");
        return prev;
      }
      return [...prev, { filamentId: "", grams: 0 }];
    });
  }

  function removeLine(i: number) {
    setFilamentLines((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      return next.length ? next : [{ filamentId: "", grams: 0 }];
    });
  }

  return (
    <PageWrapper title="Cost generator">
      <Box sx={{ maxWidth: 1000 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
          <Stack spacing={2.5}>
            {/* Header */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {editingProjectId ? `Editing ${editingQuoteNumber ?? ""}` : "New quote"}
              </Typography>

              <Button variant="outlined" onClick={clearAll} sx={{ minHeight: 44 }}>
                Clear
              </Button>
            </Stack>

            <Divider />

            {/* Project details */}
            <Typography sx={{ fontWeight: 900 }}>Project details</Typography>

            <TextField
              label="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              fullWidth
            />

            <TextField select label="Printer" value={printerId} onChange={(e) => setPrinterId(e.target.value)} fullWidth>
              <MenuItem value="">Select printer</MenuItem>
              {(printers as any[]).map((p: any) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>

            <Divider />

            {/* Print inputs */}
            <Typography sx={{ fontWeight: 900 }}>Print inputs</Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Print time (hours)"
                value={printHours}
                onChange={(e) => setPrintHours(num(e.target.value))}
                fullWidth
              />
              <TextField
                type="number"
                label="Assembly time (hours)"
                value={assemblyHours}
                onChange={(e) => setAssemblyHours(num(e.target.value))}
                fullWidth
              />
            </Stack>

            <Divider />

            {/* Filaments (up to 16) */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 900 }}>Filaments (up to {MAX_FILAMENT_LINES})</Typography>

              <Button
                variant="contained"
                onClick={addLine}
                startIcon={<AddIcon />}
                sx={{ minHeight: 40 }}
                disabled={filamentLines.length >= MAX_FILAMENT_LINES}
              >
                Add filament
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {filamentLines.map((line, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                    <TextField
                      select
                      label={`Filament ${idx + 1}`}
                      value={line.filamentId}
                      onChange={(e) => setLine(idx, { filamentId: e.target.value })}
                      fullWidth
                    >
                      <MenuItem value="">Select filament</MenuItem>
                      {(filaments as any[]).map((f: any) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.name ?? "Filament"}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      type="number"
                      label="Grams"
                      value={line.grams}
                      onChange={(e) => setLine(idx, { grams: num(e.target.value) })}
                      fullWidth
                    />

                    <IconButton
                      onClick={() => removeLine(idx)}
                      aria-label="Remove filament"
                      sx={{ alignSelf: { xs: "flex-end", md: "center" } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Divider />

            {/* Accessories + Notes */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Accessory cost (£)"
                value={accessoryCost}
                onChange={(e) => setAccessoryCost(num(e.target.value))}
                fullWidth
              />
              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                minRows={1}
              />
            </Stack>

            <Divider />

            {/* Service & handling override */}
            <Typography sx={{ fontWeight: 900 }}>Service & handling</Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch checked={serviceOverrideEnabled} onChange={(e) => setServiceOverrideEnabled(e.target.checked)} />
                }
                label="Override service %"
              />

              <TextField
                type="number"
                label="Service charge %"
                value={serviceOverrideEnabled ? servicePercentOverride : defaultServicePercent}
                onChange={(e) => setServicePercentOverride(num(e.target.value))}
                disabled={!serviceOverrideEnabled}
                helperText={
                  serviceOverrideEnabled ? "Overrides the default from Settings" : `Default from Settings: ${defaultServicePercent}%`
                }
                fullWidth
              />
            </Stack>

            {/* ACTIONS at bottom */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button variant="contained" onClick={calculate} sx={{ minHeight: 44 }}>
                Calculate
              </Button>
              <Button variant="contained" onClick={saveQuote} sx={{ minHeight: 44 }}>
                {editingProjectId ? "Save changes" : "Save quote"}
              </Button>
            </Stack>

            <Divider />

            {/* Results */}
            <Typography sx={{ fontWeight: 900 }}>Results</Typography>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Electricity</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{fmt2(electricityCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Filament (all lines)</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{fmt2(filamentCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Assembly</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{fmt2(assemblyCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Accessories</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{fmt2(accessoryCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Service & handling</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{fmt2(serviceAndHandlingCost)}</Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 900 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{fmt2(totalCost)}</Typography>
                </Stack>
              </Stack>
            </Paper>

            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              Electricity uses printer power (W) × hours × your Settings rate (p/kWh → £).
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Overwrite confirm */}
      <ConfirmDialog
        open={confirmOverwriteOpen}
        title="Project name already exists"
        description={`A project named "${pendingOverwriteProject ? String((pendingOverwriteProject as any).name ?? "") : ""}" already exists. Overwrite it?`}
        confirmText="Overwrite"
        cancelText="Cancel"
        destructive
        onClose={() => {
          setConfirmOverwriteOpen(false);
          setPendingOverwriteProject(null);
        }}
        onConfirm={() => {
          if (!pendingOverwriteProject) return;

          const nameKey = normalizeName((pendingOverwriteProject as any).name);
          const current = loadProjects();

          const idx = (current as any[]).findIndex((p: any) => normalizeName(p?.name) === nameKey);

          if (idx === -1) {
            // Somehow no longer exists; treat as new save
            const created: any = { ...(pendingOverwriteProject as any), quoteNumber: getNextQuoteNumber() };
            saveProjects([created as any, ...(current as any[])] as any);
            notify(`Saved ${created.quoteNumber}`, "success");
          } else {
            const existing: any = (current as any[])[idx];

            const overwritten: any = {
              ...existing, // keep existing id/quoteNumber/createdAt
              ...(pendingOverwriteProject as any),
              id: existing.id,
              quoteNumber: existing.quoteNumber,
              createdAt: existing.createdAt ?? existing.createdAt
            };

            const next = [...(current as any[])];
            next[idx] = overwritten;

            saveProjects(next as any);
            notify(`Overwritten ${existing.quoteNumber ?? "project"}`, "success");
          }

          setConfirmOverwriteOpen(false);
          setPendingOverwriteProject(null);
        }}
      />
    </PageWrapper>
  );
}
