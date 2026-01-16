import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Paper
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

import { PDFDownloadLink } from "@react-pdf/renderer";

import { Project } from "../types";
import { loadProjects, saveProjects } from "../utils/projectStorage";
import { loadCompanyInfo } from "../utils/companyStorage";
import { loadServiceCharge } from "../utils/serviceChargeStorage";
import { QuotePdf } from "../pdf/QuotePdf";

const COLORS = ["#1976d2", "#2e7d32", "#ed6c02"];

export default function ProjectHistory() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const company = loadCompanyInfo();
  const defaultServiceCharge = loadServiceCharge();

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  function deleteProject(id: string) {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);

    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  }

  function editProject(project: Project) {
    localStorage.setItem(
      "editProject",
      JSON.stringify(project)
    );
    window.location.href = "/cost-generator";
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const effectiveServiceCharge =
    selectedProject?.serviceChargePercent ??
    defaultServiceCharge;

  const chartData = selectedProject
    ? [
        {
          name: "Electricity",
          value: Number(
            selectedProject.electricityCost.toFixed(2)
          )
        },
        {
          name: "Filament",
          value: Number(
            selectedProject.filamentCost.toFixed(2)
          )
        },
        {
          name: "Assembly + Accessories",
          value: Number(
            selectedProject.assemblyCost.toFixed(2)
          )
        }
      ]
    : [];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Typography variant="h5" gutterBottom>
        Project History
      </Typography>

      <TextField
        fullWidth
        label="Search projects"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3
        }}
      >
        {/* PROJECT LIST */}
        <Box sx={{ flex: 1 }}>
          <List>
            {filteredProjects.map(project => (
              <Box key={project.id}>
                <ListItem
                  button
                  onClick={() =>
                    setSelectedProject(project)
                  }
                  secondaryAction={
                    <>
                      <IconButton
                        onClick={() => editProject(project)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() =>
                          deleteProject(project.id)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={project.name}
                    secondary={`Base cost: £${project.totalCost.toFixed(
                      2
                    )}`}
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </Box>

        {/* DETAILS + CHART */}
        <Box sx={{ flex: 1 }}>
          {selectedProject ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cost Breakdown
              </Typography>

              <PieChart width={400} height={300}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ value }) =>
                    `£${Number(value).toFixed(2)}`
                  }
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `£${value.toFixed(2)}`
                  }
                />
                <Legend />
              </PieChart>

              <Typography sx={{ mt: 2 }}>
                Base cost: £
                {selectedProject.totalCost.toFixed(2)}
              </Typography>

              <Typography>
                Service & handling charge:{" "}
                {effectiveServiceCharge}%
              </Typography>

              <Typography sx={{ fontWeight: "bold", mt: 1 }}>
                Quoted price: £
                {(
                  selectedProject.totalCost *
                  (1 + effectiveServiceCharge / 100)
                ).toFixed(2)}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <PDFDownloadLink
                  document={
                    <QuotePdf
                      project={selectedProject}
                      company={company}
                      serviceChargePercent={
                        effectiveServiceCharge
                      }
                    />
                  }
                  fileName={`${selectedProject.name}-quote.pdf`}
                >
                  {({ loading }) =>
                    loading
                      ? "Preparing PDF..."
                      : "Export Quote PDF"
                  }
                </PDFDownloadLink>
              </Box>
            </Paper>
          ) : (
            <Typography>
              Select a project to view details
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
