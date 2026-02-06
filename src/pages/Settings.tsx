  // src/pages/Settings.tsx
  import { useEffect, useMemo, useRef, useState } from "react";
  import {
    Box,
    Typography,
    Divider,
    TextField,
    Button,
    Stack,
    Paper
  } from "@mui/material";

  import PageWrapper from "../components/PageWrapper";
  import ConfirmDialog from "../components/ConfirmDialog";
  import { useThemeMode } from "../context/ThemeModeContext";

  import { saveAndShareBlob } from "../utils/deviceDownload";

  import {
    loadElectricityCost,
    saveElectricityCost,
    loadHourlyRate,
    saveHourlyRate,
    loadServiceCharge,
    saveServiceCharge,
    loadCompanyInfo,
    saveCompanyInfo,
    exportBackupJson,
    importBackupJson,
    wipeProjectsOnly,
    // These must exist in ../utils/storage for this exportSettings payload:
    loadPrinters,
    loadFilaments,
    loadProjects
  } from "../utils/storage";

  function num(v: any) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  export default function Settings() {
    const { themeMode, setThemeMode } = useThemeMode();

    // ---- Basic costs (from Settings) ----
    // Electricity is now stored as "pence per kWh"
    const [electricityPencePerKwh, setElectricityPencePerKwh] = useState<number>(0);
    const [assemblyHourlyRate, setAssemblyHourlyRate] = useState<number>(0); // £/hr
    const [defaultServicePercent, setDefaultServicePercent] = useState<number>(0); // %

    // ---- Company info ----
    const [companyName, setCompanyName] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [companyPhone, setCompanyPhone] = useState("");
    const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState<string>("");

    // ---- Backup/restore state ----
    const [pendingImportText, setPendingImportText] = useState<string | null>(null);

    // ---- Hidden inputs ----
    const logoInputRef = useRef<HTMLInputElement | null>(null);
    const backupInputRef = useRef<HTMLInputElement | null>(null);

    // ---- Dialog state ----
    const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
    const [confirmResetOpen, setConfirmResetOpen] = useState(false);

    // Load on mount
    useEffect(() => {
      // Basic costs
      setElectricityPencePerKwh(num(loadElectricityCost()));
      setAssemblyHourlyRate(num(loadHourlyRate()));
      setDefaultServicePercent(num(loadServiceCharge()));

      // Company info
      const info = loadCompanyInfo();
      setCompanyName(info.companyName ?? "");
      setCompanyAddress(info.companyAddress ?? "");
      setCompanyEmail(info.companyEmail ?? "");
      setCompanyPhone(info.companyPhone ?? "");
      setCompanyLogoDataUrl(info.companyLogoDataUrl ?? "");
    }, []);

    // Persist basic costs
    useEffect(() => {
      saveElectricityCost(num(electricityPencePerKwh)); // p/kWh
    }, [electricityPencePerKwh]);

    useEffect(() => {
      saveHourlyRate(num(assemblyHourlyRate)); // £/hr
    }, [assemblyHourlyRate]);

    useEffect(() => {
      saveServiceCharge(num(defaultServicePercent)); // %
    }, [defaultServicePercent]);

    // Persist company info whenever fields change
    useEffect(() => {
      saveCompanyInfo({
        companyName,
        companyAddress,
        companyEmail,
        companyPhone,
        companyLogoDataUrl
      });
    }, [companyName, companyAddress, companyEmail, companyPhone, companyLogoDataUrl]);

    const logoPreview = useMemo(() => {
      if (!companyLogoDataUrl) return null;
      return (
        <Box
          component="img"
          src={companyLogoDataUrl}
          alt="Company logo"
          sx={{
            width: 180,
            height: "auto",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider"
          }}
        />
      );
    }, [companyLogoDataUrl]);

    async function handleExportBackup() {
      const json = exportBackupJson(); // <-- full backup (all app data)
      const blob = new Blob([json], { type: "application/json" });
      await saveAndShareBlob("ttjb-quote-builder-backup.json", blob);
    }



    // ✅ New: export settings via Capacitor share sheet on mobile, download in browser

    function handlePickImportFile() {
      backupInputRef.current?.click();
    }

    async function handleFileChosen(file: File) {
      const text = await file.text();
      setPendingImportText(text);
      setConfirmRestoreOpen(true);
    }

    function doRestore() {
      if (!pendingImportText) return;

      importBackupJson(pendingImportText);
      setPendingImportText(null);

      // Refresh local UI from restored storage
      setElectricityPencePerKwh(num(loadElectricityCost()));
      setAssemblyHourlyRate(num(loadHourlyRate()));
      setDefaultServicePercent(num(loadServiceCharge()));

      const info = loadCompanyInfo();
      setCompanyName(info.companyName ?? "");
      setCompanyAddress(info.companyAddress ?? "");
      setCompanyEmail(info.companyEmail ?? "");
      setCompanyPhone(info.companyPhone ?? "");
      setCompanyLogoDataUrl(info.companyLogoDataUrl ?? "");
    }

    function doResetProjectsAndQuotes() {
      wipeProjectsOnly();
    }

    function onLogoFileChosen(file: File) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyLogoDataUrl(String(reader.result || ""));
      };
      reader.readAsDataURL(file);
    }

    return (
      <PageWrapper title="Settings">
        <Box sx={{ maxWidth: 900 }}>
          {/* APPEARANCE */}
          <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Appearance
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
              <Button
                variant={themeMode === "light" ? "contained" : "outlined"}
                onClick={() => setThemeMode("light")}
              >
                Light
              </Button>
              <Button
                variant={themeMode === "dark" ? "contained" : "outlined"}
                onClick={() => setThemeMode("dark")}
              >
                Dark
              </Button>
              <Button
                variant={themeMode === "system" ? "contained" : "outlined"}
                onClick={() => setThemeMode("system")}
              >
                System
              </Button>
            </Stack>
          </Paper>

          {/* DEFAULT COST SETTINGS */}
          <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Default costs
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              These are used as defaults when you calculate quotes.
            </Typography>

            <Stack spacing={2}>
              <TextField
                type="number"
                label="Electricity (pence per kWh)"
                value={electricityPencePerKwh}
                onChange={(e) => setElectricityPencePerKwh(num(e.target.value))}
                fullWidth
                helperText="Example: 30 means 30p per kWh."
              />

              <TextField
                type="number"
                label="Assembly labour rate (£ per hour)"
                value={assemblyHourlyRate}
                onChange={(e) => setAssemblyHourlyRate(num(e.target.value))}
                fullWidth
                helperText="Used for Assembly cost = hours × rate."
              />

              <TextField
                type="number"
                label="Default service & handling (%)"
                value={defaultServicePercent}
                onChange={(e) => setDefaultServicePercent(num(e.target.value))}
                fullWidth
                helperText="Applied on top of Electricity + Filament + Assembly + Accessories."
              />
            </Stack>
          </Paper>

          {/* COMPANY INFO */}
          <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Company info
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  fullWidth
                />
              </Stack>

              <Divider />

              <Typography sx={{ fontWeight: 700 }}>Logo</Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <Button variant="contained" onClick={() => logoInputRef.current?.click()}>
                  Upload logo
                </Button>

                {companyLogoDataUrl ? (
                  <Button variant="outlined" onClick={() => setCompanyLogoDataUrl("")}>
                    Remove logo
                  </Button>
                ) : null}
              </Stack>

              {logoPreview ? <Box sx={{ mt: 1 }}>{logoPreview}</Box> : null}

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onLogoFileChosen(file);
                  e.target.value = "";
                }}
              />
            </Stack>
          </Paper>

          {/* BACKUP / RESTORE */}
          <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Backup & restore
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Export all app data to a file, or restore from a previous backup.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button variant="contained" onClick={handleExportBackup}>
                Export backup
              </Button>

              <Button variant="contained" onClick={handlePickImportFile}>
                Restore from backup
              </Button>
            </Stack>


            <input
              ref={backupInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleFileChosen(file);
                e.target.value = "";
              }}
            />
          </Paper>

          {/* RESET */}
          <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Reset
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Removes <b>projects</b> only and resets quote numbering back to <b>Q-0001</b>.
              Printers, filaments, company info, logo, and theme stay.
            </Typography>

            <Button variant="contained" color="error" onClick={() => setConfirmResetOpen(true)}>
              Reset projects & quotes
            </Button>
          </Paper>

          {/* CONFIRM DIALOGS */}
          <ConfirmDialog
            open={confirmRestoreOpen}
            title="Restore from backup?"
            description="This will replace your current data with the contents of the backup file."
            confirmText="Restore"
            cancelText="Cancel"
            destructive
            onClose={() => {
              setConfirmRestoreOpen(false);
              setPendingImportText(null);
            }}
            onConfirm={doRestore}
          />

          <ConfirmDialog
            open={confirmResetOpen}
            title="Reset projects & quote numbers?"
            description="This will permanently delete all projects and reset quote numbering back to Q-0001."
            confirmText="Reset"
            cancelText="Cancel"
            destructive
            onClose={() => setConfirmResetOpen(false)}
            onConfirm={() => {
              setConfirmResetOpen(false);
              doResetProjectsAndQuotes();
            }}
          />
        </Box>
      </PageWrapper>
    );
  }
