import {
  Drawer,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

const drawerWidth = 240;

export default function DrawerMenu({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth }
        }}
      >
        <List>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Landing" />
          </ListItemButton>
          <ListItemButton component={Link} to="/settings">
            <ListItemText primary="Settings" />
          </ListItemButton>
          <ListItemButton component={Link} to="/filament">
            <ListItemText primary="Filament" />
          </ListItemButton>
          <ListItemButton component={Link} to="/cost-generator">
            <ListItemText primary="Cost Generator" />
          </ListItemButton>
          <ListItemButton component={Link} to="/projects">
            <ListItemText primary="Project History" />
          </ListItemButton>
        </List>
      </Drawer>

      <main style={{ marginLeft: drawerWidth, padding: 24 }}>
        {children}
      </main>
    </div>
  );
}
