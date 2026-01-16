  import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Button
  } from "@mui/material";
  import { useEffect, useState } from "react";
  import { v4 as uuid } from "uuid";

  import { Printer, Filament, ProjectFilament, Project } from "../types";
  import { loadPrinters } from "../utils/printerStorage";
  import { loadFilaments } from "../utils/filamentStorage";
  import { loadProjects, saveProjects } from "../utils/projectStorage";
  //import { useSettings } from "../context/SettingsContext";

  export default function CostGenerator() {
    //const { settings } = useSettings();

    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    const [projectName, setProjectName] = useState("");

    const [printers, setPrinters] = useState<Printer[]>([]);
    const [filaments, setFilaments] = useState<Filament[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);

    const [filamentCount, setFilamentCount] = useState(1);
    const [selectedFilaments, setSelectedFilaments] = useState<ProjectFilament[]>([
      { filamentId: "", gramsUsedG: 0, costPerKg: 0 }
    ]);

    const [runtimeHours, setRuntimeHours] = useState(0);
    const [runtimeMinutes, setRuntimeMinutes] = useState(0);

    const [assemblyHours, setAssemblyHours] = useState(0);
    const [accessoryCost, setAccessoryCost] = useState(0);
    const [accessoryNote, setAccessoryNote] = useState("");

    const [result, setResult] = useState<Project | null>(null);

    // Load printers and filaments
    useEffect(() => {
      setPrinters(loadPrinters());
      setFilaments(loadFilaments());
    }, []);

    // Adjust filament rows when count changes
    useEffect(() => {
      setSelectedFilaments(
        Array.from({ length: filamentCount }, (_, i) =>
          selectedFilaments[i] ?? {
            filamentId: "",
            gramsUsedG: 0,
            costPerKg: 0
          }
        )
      );
    }, [filamentCount]);

    // Load project for editing
    useEffect(() => {
      const raw = localStorage.getItem("editProject");
      if (!raw) return;

      const project: Project = JSON.parse(raw);

      setEditingProjectId(project.id);
      setProjectName(project.name);

      setRuntimeHours(Math.floor(project.runtimeHoursT));
      setRuntimeMinutes(Math.round((project.runtimeHoursT % 1) * 60));

      setAssemblyHours(project.assemblyHoursA);
      setAccessoryCost(project.accessoryCostM);
      setAccessoryNote(project.accessoryNote);

      setSelectedPrinter({
        id: project.printerId,
        name: "",
        powerW: project.printerPowerW
      });

      setFilamentCount(project.filaments.length);
      setSelectedFilaments(project.filaments);

      setResult(null);

      localStorage.removeItem("editProject");
    }, []);

    function calculate() {
      if (!selectedPrinter || !projectName) return;

      const T = runtimeHours + runtimeMinutes / 60;

      const electricityCost =
        (selectedPrinter.powerW / 1000) *
        settings.electricityCostE *
        T;

      const filamentCost = selectedFilaments.reduce(
        (sum, f) => sum + (f.costPerKg / 1000) * f.gramsUsedG,
        0
      );

      const assemblyCost =
        assemblyHours * settings.hourlyRateH + accessoryCost;

      const totalCost = electricityCost + filamentCost + assemblyCost;

      const project: Project = {
        id: editingProjectId ?? uuid(),
        name: projectName,
        printerId: selectedPrinter.id,
        printerPowerW: selectedPrinter.powerW,
        runtimeHoursT: T,
        assemblyHoursA: assemblyHours,
        accessoryCostM: accessoryCost,
        accessoryNote,
        electricityCost,
        filamentCost,
        assemblyCost,
        totalCost,
        filaments: selectedFilaments,
        createdAt: new Date().toISOString()
      };

      const projects = loadProjects();

      const updatedProjects = editingProjectId
        ? projects.map(p => (p.id === editingProjectId ? project : p))
        : [...projects, project];

      saveProjects(updatedProjects);

      setEditingProjectId(null);
      setResult(project);
    }

    function clearForm() {
      setEditingProjectId(null);
      setProjectName("");
      setSelectedPrinter(null);
      setFilamentCount(1);
      setSelectedFilaments([
        { filamentId: "", gramsUsedG: 0, costPerKg: 0 }
      ]);
      setRuntimeHours(0);
      setRuntimeMinutes(0);
      setAssemblyHours(0);
      setAccessoryCost(0);
      setAccessoryNote("");
      setResult(null);
    }

    return (
      <Box sx={{ maxWidth: 800 }}>
        <Typography variant="h5" gutterBottom>
          Cost Generator
        </Typography>

        <TextField
          fullWidth
          label="Project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          fullWidth
          label="Printer"
          value={selectedPrinter?.id ?? ""}
          onChange={(e) =>
            setSelectedPrinter(
              printers.find(p => p.id === e.target.value) ?? null
            )
          }
          sx={{ mb: 2 }}
        >
          {printers.map(p => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} ({p.powerW} W)
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Number of filaments"
          value={filamentCount}
          onChange={(e) => setFilamentCount(Number(e.target.value))}
          sx={{ mb: 2 }}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {i + 1}
            </MenuItem>
          ))}
        </TextField>

        {selectedFilaments.map((f, i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              select
              label={`Filament ${i + 1}`}
              value={f.filamentId}
              onChange={(e) => {
                const filament = filaments.find(fl => fl.id === e.target.value);
                const copy = [...selectedFilaments];
                if (filament) {
                  copy[i] = {
                    ...copy[i],
                    filamentId: filament.id,
                    costPerKg: filament.costPerKg
                  };
                  setSelectedFilaments(copy);
                }
              }}
            >
              {filaments.map(fl => (
                <MenuItem key={fl.id} value={fl.id}>
                  {fl.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Usage (g)"
              type="number"
              value={f.gramsUsedG}
              onChange={(e) => {
                const copy = [...selectedFilaments];
                copy[i].gramsUsedG = Number(e.target.value);
                setSelectedFilaments(copy);
              }}
            />
          </Box>
        ))}

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Runtime hours"
            type="number"
            value={runtimeHours}
            onChange={(e) => setRuntimeHours(Number(e.target.value))}
          />
          <TextField
            label="Runtime minutes"
            type="number"
            value={runtimeMinutes}
            onChange={(e) => setRuntimeMinutes(Number(e.target.value))}
          />
        </Box>

        <TextField
          label="Assembly time"
          type="number"
          value={assemblyHours}
          InputProps={{ endAdornment: <span>hours</span> }}
          onChange={(e) => setAssemblyHours(Number(e.target.value))}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Accessory cost"
          type="number"
          value={accessoryCost}
          InputProps={{ endAdornment: <span>£</span> }}
          onChange={(e) => setAccessoryCost(Number(e.target.value))}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Accessory note"
          value={accessoryNote}
          onChange={(e) => setAccessoryNote(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={calculate}>
            Calculate & Save
          </Button>

          <Button variant="outlined" onClick={clearForm}>
            Clear
          </Button>
        </Box>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Typography>
              Total cost: £{result.totalCost.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
