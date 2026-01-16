import {
  TextField,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";
import { Filament } from "../types";
import { loadFilaments, saveFilaments } from "../utils/filamentStorage";
import { v4 as uuid } from "uuid";

export default function FilamentPage() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [name, setName] = useState("");
  const [costPerKg, setCostPerKg] = useState<number>(0);

  useEffect(() => {
    setFilaments(loadFilaments());
  }, []);

  function addFilament() {
    if (!name || costPerKg <= 0) return;

    const updated = [
      ...filaments,
      { id: uuid(), name, costPerKg }
    ];

    setFilaments(updated);
    saveFilaments(updated);
    setName("");
    setCostPerKg(0);
  }

  function deleteFilament(id: string) {
    const updated = filaments.filter(f => f.id !== id);
    setFilaments(updated);
    saveFilaments(updated);
  }

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>
        Filaments
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Filament name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Cost"
          type="number"
          value={costPerKg}
          onChange={(e) => setCostPerKg(Number(e.target.value))}
          InputProps={{ endAdornment: <span>£/kg</span> }}
        />

        <Button variant="contained" onClick={addFilament}>
          Add
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Filament</TableCell>
            <TableCell>Cost (£/kg)</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {filaments.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.costPerKg}</TableCell>
              <TableCell>
                <IconButton onClick={() => deleteFilament(f.id)}>
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
