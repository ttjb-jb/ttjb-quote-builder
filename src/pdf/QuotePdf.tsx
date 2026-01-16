import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";
import { Project } from "../types";
import { CompanyInfo } from "../types/company";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11
  },
  header: {
    marginBottom: 20
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold"
  },
  section: {
    marginBottom: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  tableHeader: {
    marginTop: 6,
    marginBottom: 6,
    fontWeight: "bold"
  },
  total: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: "bold"
  },
  muted: {
    fontSize: 10,
    color: "#555"
  }
});

interface Props {
  project: Project;
  company: CompanyInfo;
  serviceChargePercent: number;
}

export function QuotePdf({
  project,
  company,
  serviceChargePercent
}: Props) {
  const baseTotal = project.totalCost;
  const finalTotal =
    baseTotal * (1 + serviceChargePercent / 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text>{company.email}</Text>
          <Text>{company.phone}</Text>
        </View>

        {/* DETAILS */}
        <View style={styles.section}>
          <Text>Project name: {project.name}</Text>
          <Text>
            Date:{" "}
            {new Date(project.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* COST BREAKDOWN */}
        <View style={styles.section}>
          <Text style={styles.tableHeader}>
            Cost Breakdown
          </Text>

          <View style={styles.row}>
            <Text>Electricity</Text>
            <Text>£{project.electricityCost.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text>Filament</Text>
            <Text>£{project.filamentCost.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text>Assembly & accessories</Text>
            <Text>£{project.assemblyCost.toFixed(2)}</Text>
          </View>

          <Text style={{ marginTop: 6 }}>
            Delivery: Subject to additional delivery cost
          </Text>
        </View>

        {/* SERVICE CHARGE */}
        <View style={styles.section}>
          <Text>
            Service & handling charge ({serviceChargePercent}%)
          </Text>
        </View>

        {/* TOTAL */}
        <View style={styles.section}>
          <Text style={styles.total}>
            £{finalTotal.toFixed(2)}
          </Text>
          <Text style={styles.muted}>
            (Includes service & handling charge)
          </Text>
        </View>

        {/* NOTES */}
        {project.accessoryNote && (
          <View style={styles.section}>
            <Text style={styles.tableHeader}>Notes</Text>
            <Text>{project.accessoryNote}</Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.section}>
          <Text style={styles.muted}>
            Thank you for your business.
          </Text>
          <Text style={styles.muted}>
            Quote valid for 30 days.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
