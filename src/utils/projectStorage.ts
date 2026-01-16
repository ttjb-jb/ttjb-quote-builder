import { Project } from "../types";
import { load, save } from "./storage";

const KEY = "projects";

export function loadProjects(): Project[] {
  return load<Project[]>(KEY, []);
}

export function saveProjects(projects: Project[]) {
  save(KEY, projects);
}
