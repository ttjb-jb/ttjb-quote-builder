const KEY = "serviceChargePercent";

export function loadServiceCharge(): number {
  const value = localStorage.getItem(KEY);
  return value ? Number(value) : 20; // default 20%
}

export function saveServiceCharge(value: number) {
  localStorage.setItem(KEY, value.toString());
}
