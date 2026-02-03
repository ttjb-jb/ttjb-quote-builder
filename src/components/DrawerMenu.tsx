import { ReactNode, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 260;

type NavItem = { label: string; to: string };

export default function DrawerMenu({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Cost Generator", to: "/cost-generator" },
      { label: "Project History", to: "/projects" },
      { label: "Printers", to: "/printers" },
      { label: "Filament", to: "/filament" },
      { label: "Settings", to: "/settings" }
    ],
    []
  );

  function toggleMobileDrawer() {
    setMobileOpen((v) => !v);
  }

  function closeMobileDrawer() {
    setMobileOpen(false);
  }

  // Use safe-area inset when available (Android/iOS notch/status bar)
  const SAFE_TOP = "env(safe-area-inset-top, 0px)";
  const MOBILE_TOOLBAR_BASE = 56; // default MUI mobile toolbar height

  const drawerContent = (
    <Box sx={{ height: "100%" }}>
      {/* Drawer header: safe-area aware on mobile so it never tucks under the status bar */}
      <Toolbar
        sx={{
          px: 2,
          pt: { xs: SAFE_TOP, md: 0 },
          minHeight: { xs: `calc(${MOBILE_TOOLBAR_BASE}px + ${SAFE_TOP})`, md: 64 },
          alignItems: "center"
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          TTJB Quote Builder
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.to;

          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={selected}
              onClick={!isDesktop ? closeMobileDrawer : undefined}
              sx={{
                borderRadius: 2,
                my: 0.5,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  "&:hover": { bgcolor: "action.selected" }
                }
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 800 : 600 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top bar only for mobile */}
      {!isDesktop ? (
        <AppBar
          position="fixed"
          color="default"
          elevation={0}
          sx={{
            // Push the bar below the system status bar / notch area
            pt: SAFE_TOP
          }}
        >
          <Toolbar
            sx={{
              minHeight: `calc(${MOBILE_TOOLBAR_BASE}px + ${SAFE_TOP})`,
              alignItems: "center"
            }}
          >
            <IconButton edge="start" onClick={toggleMobileDrawer} aria-label="open drawer" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>

            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              TTJB Quote Builder
            </Typography>
          </Toolbar>
        </AppBar>
      ) : null}

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth
            }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box"
            }
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 2, sm: 3 },
          pb: 4,

          // top padding to clear the *safe-area aware* AppBar on mobile
          pt: {
            xs: `calc(${MOBILE_TOOLBAR_BASE}px + ${SAFE_TOP} + 16px)`,
            md: 3
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
