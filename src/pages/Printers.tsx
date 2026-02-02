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
  Paper,
  Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

import PageWrapper from "../components/PageWrapper";
import type { Printer } from "../types";
import { loadPrinters, savePrinters } from "../utils/storage";

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [name, setName] = useState("");
  const [powerW, setPowerW] = useState<number>(0);

  useEffect(() => {
    setPrinters(loadPrinters());
  }, []);

  const sorted = useMemo(() => {
    return [...printers].sort((a, b) => a.name.localeCompare(b.name));
  }, [printers]);

  function addPrinter() {
    const trimmed = name.trim();
    if (!trimmed || powerW <= 0) return;

    const next: Printer[] = [
      ...printers,
      { id: uuid(), name: trimmed, powerW }
    ];

    setPrinters(next);
    savePrinters(next);

    setName("");
    setPowerW(0);
  }

  function removePrinter(id: string) {
    const next = printers.filter((p) => p.id !== id);
    setPrinters(next);
    savePrinters(next);
  }

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Printers
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add printer
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Printer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Power (W)"
              type="number"
              value={powerW}
              onChange={(e) => setPowerW(Number(e.target.value))}
              inputProps={{ min: 0, step: 1 }}
              sx={{ width: { xs: "100%", sm: 220 } }}
            />
            <Button
              variant="contained"
              onClick={addPrinter}
              sx={{ whiteSpace: "nowrap" }}
            >
              Add
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography sx={{ px: 1, pb: 1 }} color="text.secondary">
            {sorted.length} printer{sorted.length === 1 ? "" : "s"} configured
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Printer</TableCell>
                <TableCell align="right">Power (W)</TableCell>
                <TableCell align="right" width={80}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sorted.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell align="right">{p.powerW}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="delete printer"
                      onClick={() => removePrinter(p.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ py: 3 }} align="center">
                    No printers yet — add your first one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </PageWrapper>
  );
}