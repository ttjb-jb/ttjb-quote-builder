export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = "companyInfo";

const DEFAULT_COMPANY: CompanyInfo = {
  name: "Your Company Name",
  address: "",
  email: "",
  phone: ""
};

export function loadCompanyInfo(): CompanyInfo {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_COMPANY;

  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COMPANY;
  }
}

export function saveCompanyInfo(info: CompanyInfo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}
