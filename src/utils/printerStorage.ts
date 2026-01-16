import { Printer } from "../types";
import { load, save } from "./storage";

const KEY = "printers";

export function loadPrinters(): Printer[] {
  return load<Printer[]>(KEY, []);
}

export function savePrinters(printers: Printer[]) {
  save(KEY, printers);
}
