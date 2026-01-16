import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import Filament from "./pages/Filament";
import CostGenerator from "./pages/CostGenerator";
import ProjectHistory from "./pages/ProjectHistory";
import DrawerMenu from "./components/DrawerMenu";

export default function App() {
  return (
    <BrowserRouter>
      <DrawerMenu>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/filament" element={<Filament />} />
          <Route path="/cost-generator" element={<CostGenerator />} />
          <Route path="/projects" element={<ProjectHistory />} />
        </Routes>
      </DrawerMenu>
    </BrowserRouter>
  );
}
