// src/pdf/QuotePdf.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Project } from "../types";
import { loadCompanyInfo } from "../utils/storage";

type Props = {
  project: Project;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 34,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#111827"
  },

  row: { flexDirection: "row" },
  col: { flexDirection: "column" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18
  },

  brandBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    maxWidth: 320
  },

  logo: {
    width: 64,
    height: 64,
    objectFit: "contain",
    borderRadius: 8
  },

  brandText: {
    flexDirection: "column",
    gap: 2
  },

  companyName: { fontSize: 14, fontWeight: 700 },
  muted: { color: "#6B7280" },

  quoteBlock: {
    alignItems: "flex-end",
    gap: 2,
    minWidth: 160
  },

  quoteTitle: { fontSize: 16, fontWeight: 700 },
  quoteMeta: { fontSize: 10.5 },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8
  },

  infoGrid: {
    flexDirection: "row",
    gap: 18
  },

  infoCol: { flex: 1, gap: 6 },

  label: { fontSize: 9.5, color: "#6B7280" },
  value: { fontSize: 11 },

  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden"
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 10
  },

  thLeft: { flex: 1, fontWeight: 700 },
  thRight: { width: 90, textAlign: "right", fontWeight: 700 },

  tr: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },

  tdLeft: { flex: 1 },
  tdRight: { width: 90, textAlign: "right" },

  trLast: {
    borderBottomWidth: 0
  },

  totalRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F3F4F6"
  },

  totalLabel: { flex: 1, fontSize: 12, fontWeight: 700 },
  totalValue: { width: 90, textAlign: "right", fontSize: 12, fontWeight: 700 },

  notesBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    gap: 6
  },

  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#6B7280",
    fontSize: 9
  }
});

function gbp(n: any) {
  const v = Number(n ?? 0);
  return `£${(Number.isFinite(v) ? v : 0).toFixed(2)}`;
}

function safeStr(v: any) {
  return String(v ?? "").trim();
}

function safeDate(ts: any) {
  try {
    const d = typeof ts === "number" ? new Date(ts) : new Date(String(ts));
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

export function QuotePdf({ project }: Props) {
  const info = loadCompanyInfo();

  const companyName = safeStr(info.companyName) || "Company";
  const companyAddress = safeStr(info.companyAddress);
  const companyEmail = safeStr(info.companyEmail);
  const companyPhone = safeStr(info.companyPhone);
  const logoDataUrl = safeStr((info as any).companyLogoDataUrl);

  const quoteNumber = safeStr((project as any).quoteNumber) || "—";
  const projectName = safeStr((project as any).name) || "—";
  const createdAt = safeDate((project as any).createdAt);

  // Costs (support older keys too)
  const electricityCost = Number((project as any).electricityCost ?? 0);
  const filamentCost = Number((project as any).filamentCost ?? 0);
  const assemblyCost = Number((project as any).assemblyCost ?? 0);

  const accessoryCost = Number((project as any).accessoryCost ?? 0);

  const serviceAndHandlingCost = Number(
    (project as any).serviceAndHandlingCost ??
      (project as any).ServiceAndHandlingCost ??
      0
  );

  const totalCost = Number((project as any).totalCost ?? 0);

  const notes = safeStr((project as any).notes);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            {logoDataUrl ? <Image src={logoDataUrl} style={styles.logo} /> : null}

            <View style={styles.brandText}>
              <Text style={styles.companyName}>{companyName}</Text>

              {companyAddress ? <Text style={styles.muted}>{companyAddress}</Text> : null}

              <View style={{ marginTop: 2 }}>
                {companyEmail ? <Text style={styles.muted}>{companyEmail}</Text> : null}
                {companyPhone ? <Text style={styles.muted}>{companyPhone}</Text> : null}
              </View>
            </View>
          </View>

          <View style={styles.quoteBlock}>
            <Text style={styles.quoteTitle}>Quote</Text>
            <Text style={styles.quoteMeta}>Quote: {quoteNumber}</Text>
            {createdAt ? <Text style={styles.quoteMeta}>Date: {createdAt}</Text> : null}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Project */}
        <Text style={styles.sectionTitle}>Project</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Project name</Text>
            <Text style={styles.value}>{projectName}</Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.label}>Delivery</Text>
            <Text style={styles.value}>
              Delivery not included. Collection available or delivery quoted on request.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Breakdown */}
        <Text style={styles.sectionTitle}>Cost breakdown</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thLeft}>Item</Text>
            <Text style={styles.thRight}>Cost</Text>
          </View>

          <View style={styles.tr}>
            <Text style={styles.tdLeft}>Electricity</Text>
            <Text style={styles.tdRight}>{gbp(electricityCost)}</Text>
          </View>

          <View style={styles.tr}>
            <Text style={styles.tdLeft}>Filament</Text>
            <Text style={styles.tdRight}>{gbp(filamentCost)}</Text>
          </View>

          <View style={styles.tr}>
            <Text style={styles.tdLeft}>Assembly</Text>
            <Text style={styles.tdRight}>{gbp(assemblyCost)}</Text>
          </View>

          <View style={styles.tr}>
            <Text style={styles.tdLeft}>Accessories</Text>
            <Text style={styles.tdRight}>{gbp(accessoryCost)}</Text>
          </View>

          <View style={[styles.tr, styles.trLast]}>
            <Text style={styles.tdLeft}>Service & handling</Text>
            <Text style={styles.tdRight}>{gbp(serviceAndHandlingCost)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{gbp(totalCost)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={styles.notesBox}>
            <Text style={{ fontSize: 11.5, fontWeight: 700 }}>Notes</Text>
            <Text style={{ color: "#374151" }}>{notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Quote {quoteNumber}</Text>
          <Text>{companyName}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default QuotePdf;