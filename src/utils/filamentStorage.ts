import { Filament } from "../types";
import { load, save } from "./storage";

const KEY = "filaments";

export function loadFilaments(): Filament[] {
  return load<Filament[]>(KEY, []);
}

export function saveFilaments(filaments: Filament[]) {
  save(KEY, filaments);
}
