import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { StatementData } from "./statement-data";

const BRAND = "#1D3A62";
const ACCENT = "#0C7489";
const MUTED = "#8a8f98";
const LINE = "#e5e8ec";
const ZEBRA = "#f6f8fa";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9,
    color: BRAND,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 2 },
  brandName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: BRAND },
  brandSub: { fontSize: 8, color: MUTED, marginTop: 2 },
  metaBox: {
    marginTop: 14,
    marginBottom: 18,
    padding: 12,
    backgroundColor: ZEBRA,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6 },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    marginTop: 4,
  },
  // Tabella
  tHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND,
    paddingBottom: 4,
  },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 4,
  },
  th: { fontSize: 7.5, color: MUTED, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  td: { fontSize: 8 },
  // colonne
  cDate: { width: "11%" },
  cProp: { width: "20%" },
  cGuest: { width: "17%" },
  cSrc: { width: "10%" },
  cNum: { width: "7%", textAlign: "right" },
  cMoney: { width: "14%", textAlign: "right" },
  cNet: { width: "14%", textAlign: "right" },
  totalsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BRAND,
    paddingTop: 5,
    marginTop: 1,
  },
  tdBold: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  // Riepilogo economico
  summaryBox: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
  },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  sumLabel: { fontSize: 9 },
  sumValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  sumNegative: { color: "#b04242" },
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: ACCENT,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  netLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  netValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  methodology: { marginTop: 20, fontSize: 7.5, color: MUTED, lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: MUTED,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 6,
  },
});

function euro(n: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function itDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function StatementDocument({ data }: { data: StatementData }) {
  const { owner, periodLabel, from, to, rows, totals, generatedAt } = data;
  const totalCommission = totals.otaCommission + totals.airbibbyCommission;
  const totalDeductions = totalCommission + totals.expenses + totals.touristTax;

  return (
    <Document
      title={`Rendiconto ${periodLabel} — ${owner.name}`}
      author="Host Como"
      subject={`Rendiconto proprietario ${periodLabel}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Intestazione */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Rendiconto proprietario</Text>
            <Text style={styles.h1}>{periodLabel}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.brandName}>Host Como</Text>
            <Text style={styles.brandSub}>Gestione affitti brevi · Lago di Como</Text>
          </View>
        </View>

        {/* Meta: proprietario + periodo */}
        <View style={styles.metaBox}>
          <View>
            <Text style={styles.metaLabel}>Proprietario</Text>
            <Text style={styles.metaValue}>{owner.name}</Text>
            <Text style={styles.brandSub}>{owner.email}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.metaLabel}>Periodo di competenza</Text>
            <Text style={styles.metaValue}>
              {itDate(from)} – {itDate(to)}
            </Text>
            <Text style={styles.brandSub}>
              {totals.bookings} prenotazion{totals.bookings === 1 ? "e" : "i"} · {totals.nights} nott{totals.nights === 1 ? "e" : "i"}
            </Text>
          </View>
        </View>

        {/* Dettaglio prenotazioni */}
        <Text style={styles.sectionTitle}>Dettaglio prenotazioni</Text>
        {rows.length === 0 ? (
          <Text style={{ fontSize: 9, color: MUTED, marginVertical: 12 }}>
            Nessuna prenotazione con check-in nel periodo selezionato.
          </Text>
        ) : (
          <View>
            <View style={styles.tHead}>
              <Text style={[styles.th, styles.cDate]}>Check-in</Text>
              <Text style={[styles.th, styles.cProp]}>Immobile</Text>
              <Text style={[styles.th, styles.cGuest]}>Ospite</Text>
              <Text style={[styles.th, styles.cSrc]}>Canale</Text>
              <Text style={[styles.th, styles.cNum]}>Notti</Text>
              <Text style={[styles.th, styles.cMoney]}>Lordo</Text>
              <Text style={[styles.th, styles.cNet]}>Netto</Text>
            </View>
            {rows.map((r, i) => (
              <View
                key={r.bookingId}
                style={[styles.tRow, i % 2 === 1 ? { backgroundColor: ZEBRA } : {}]}
                wrap={false}
              >
                <Text style={[styles.td, styles.cDate]}>{itDate(r.checkIn)}</Text>
                <Text style={[styles.td, styles.cProp]}>{r.propertyName}</Text>
                <Text style={[styles.td, styles.cGuest]}>{r.guestName}</Text>
                <Text style={[styles.td, styles.cSrc]}>{r.source}</Text>
                <Text style={[styles.td, styles.cNum]}>{r.nights}</Text>
                <Text style={[styles.td, styles.cMoney]}>{euro(r.grossRevenue)}</Text>
                <Text style={[styles.td, styles.cNet]}>{euro(r.netPayout)}</Text>
              </View>
            ))}
            <View style={styles.totalsRow}>
              <Text style={[styles.tdBold, styles.cDate]}>Totale</Text>
              <Text style={[styles.tdBold, styles.cProp]}></Text>
              <Text style={[styles.tdBold, styles.cGuest]}></Text>
              <Text style={[styles.tdBold, styles.cSrc]}></Text>
              <Text style={[styles.tdBold, styles.cNum]}>{totals.nights}</Text>
              <Text style={[styles.tdBold, styles.cMoney]}>{euro(totals.grossRevenue)}</Text>
              <Text style={[styles.tdBold, styles.cNet]}>{euro(totals.netPayout)}</Text>
            </View>
          </View>
        )}

        {/* Riepilogo economico */}
        <View style={styles.summaryBox}>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Ricavi lordi</Text>
            <Text style={styles.sumValue}>{euro(totals.grossRevenue)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Commissioni portali (OTA)</Text>
            <Text style={[styles.sumValue, styles.sumNegative]}>− {euro(totals.otaCommission)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Commissione gestione Host Como (10%)</Text>
            <Text style={[styles.sumValue, styles.sumNegative]}>− {euro(totals.airbibbyCommission)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Spese operative (5%)</Text>
            <Text style={[styles.sumValue, styles.sumNegative]}>− {euro(totals.expenses)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Imposta di soggiorno</Text>
            <Text style={[styles.sumValue, styles.sumNegative]}>− {euro(totals.touristTax)}</Text>
          </View>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Netto spettante al proprietario</Text>
            <Text style={styles.netValue}>{euro(totals.netPayout)}</Text>
          </View>
        </View>

        <Text style={styles.methodology}>
          Metodologia: il netto proprietario è calcolato come Ricavi lordi − Commissioni portali (OTA)
          − Commissione di gestione Host Como (10% sul lordo) − Spese operative (5% sul lordo) − Imposta
          di soggiorno. Totale detrazioni: {euro(totalDeductions)}. Gli importi si riferiscono alle
          prenotazioni con data di check-in compresa nel periodo di competenza. Documento generato
          automaticamente; per chiarimenti contattare il team Host Como.
        </Text>

        <View style={styles.footer} fixed>
          <Text>
            Host Como · Rendiconto {periodLabel} · {owner.name}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Generato il ${itDate(generatedAt.slice(0, 10))} · Pag. ${pageNumber}/${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/**
 * Renderizza il rendiconto mensile in un Buffer PDF. Usato dalla route
 * owner-scoped /api/reports/statements/pdf.
 */
export async function renderStatementPdf(data: StatementData): Promise<Buffer> {
  return renderToBuffer(<StatementDocument data={data} />);
}
