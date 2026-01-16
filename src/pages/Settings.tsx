import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

import {
  loadElectricityCost,
  saveElectricityCost,
  loadHourlyRate,
  saveHourlyRate,
  loadPrinters,
  savePrinters,
  loadFilaments,
  saveFilaments
} from "../utils/storage";

import {
  loadServiceCharge,
  saveServiceCharge
} from "../utils/serviceChargeStorage";

interface Printer {
  name: string;
  power: number;
}

interface Filament {
  name: string;
  cost: number;
}

export default function Settings() {
  /* ------------------ BASIC COST SETTINGS ------------------ */
  const [electricityCost, setElectricityCost] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [serviceCharge, setServiceCharge] = useState<number>(10);

  /* ------------------ PRINTERS ------------------ */
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printerName, setPrinterName] = useState("");
  const [printerPower, setPrinterPower] = useState<number>(0);

  /* ------------------ FILAMENTS ------------------ */
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [filamentName, setFilamentName] = useState("");
  const [filamentCost, setFilamentCost] = useState<number>(0);

  useEffect(() => {
    setElectricityCost(loadElectricityCost());
    setHourlyRate(loadHourlyRate());
    setPrinters(loadPrinters());
    setFilaments(loadFilaments());
    setServiceCharge(loadServiceCharge());
  }, []);

  /* ------------------ HANDLERS ------------------ */

  function addPrinter() {
    if (!printerName || printerPower <= 0) return;
    const updated = [...printers, { name: printerName, power: printerPower }];
    setPrinters(updated);
    savePrinters(updated);
    setPrinterName("");
    setPrinterPower(0);
  }

  function deletePrinter(index: number) {
    const updated = printers.filter((_, i) => i !== index);
    setPrinters(updated);
    savePrinters(updated);
  }

  function addFilament() {
    if (!filamentName || filamentCost <= 0) return;
    const updated = [...filaments, { name: filamentName, cost: filamentCost }];
    setFilaments(updated);
    saveFilaments(updated);
    setFilamentName("");
    setFilamentCost(0);
  }

  function deleteFilament(index: number) {
    const updated = filaments.filter((_, i) => i !== index);
    setFilaments(updated);
    saveFilaments(updated);
  }

  /* ------------------ RENDER ------------------ */

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      {/* ELECTRICITY & LABOUR */}
      <Typography variant="h6">Base Costs</Typography>

      <TextField
        fullWidth
        label="Electricity cost (p/kWh)"
        type="number"
        value={electricityCost}
        onChange={(e) => {
          const v = Number(e.target.value);
          setElectricityCost(v);
          saveElectricityCost(v);
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Hourly rate (£/hour)"
        type="number"
        value={hourlyRate}
        onChange={(e) => {
          const v = Number(e.target.value);
          setHourlyRate(v);
          saveHourlyRate(v);
        }}
      />

      <Divider sx={{ my: 4 }} />

      {/* SERVICE CHARGE */}
      <Typography variant="h6">Pricing Defaults</Typography>

      <TextField
        fullWidth
        type="number"
        label="Default Service & handling charge (%)"
        value={serviceCharge}
        onChange={(e) => {
          const v = Number(e.target.value);
          setServiceCharge(v);
          saveServiceCharge(v);
        }}
        inputProps={{ min: 0, max: 100, step: 0.1 }}
        helperText="Used as the default for new quotes. Can be overridden per project."
      />

      <Divider sx={{ my: 4 }} />

      {/* PRINTERS */}
      <Typography variant="h6">Printers</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Printer name"
          value={printerName}
          onChange={(e) => setPrinterName(e.target.value)}
        />
        <TextField
          label="Power (W)"
          type="number"
          value={printerPower}
          onChange={(e) => setPrinterPower(Number(e.target.value))}
        />
        <Button variant="contained" onClick={addPrinter}>
          Add
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Printer</TableCell>
            <TableCell>Power (W)</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {printers.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.power}</TableCell>
              <TableCell>
                <IconButton onClick={() => deletePrinter(i)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 4 }} />

      {/* FILAMENTS */}
      <Typography variant="h6">Filaments</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Filament name"
          value={filamentName}
          onChange={(e) => setFilamentName(e.target.value)}
        />
        <TextField
          label="Cost (£/kg)"
          type="number"
          value={filamentCost}
          onChange={(e) => setFilamentCost(Number(e.target.value))}
        />
        <Button variant="contained" onClick={addFilament}>
          Add
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Filament</TableCell>
            <TableCell>Cost (£/kg)</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {filaments.map((f, i) => (
            <TableRow key={i}>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.cost}</TableCell>
              <TableCell>
                <IconButton onClick={() => deleteFilament(i)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
