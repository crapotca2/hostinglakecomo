import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { PartnerNoteData } from "./partner-note-data";

const INK = "#1a1a1a";
const MUTED = "#6b7280";
const LINE = "#d1d5db";
const ZEBRA = "#f6f8fa";

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 48, paddingHorizontal: 46, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  issuer: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 18 },
  recipientLabel: { fontSize: 10, marginBottom: 2 },
  recipient: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  recipientLine: { fontSize: 10, marginTop: 1 },
  place: { fontSize: 10, marginTop: 16 },
  oggetto: { fontSize: 10, marginTop: 16, lineHeight: 1.4 },
  oggettoBold: { fontFamily: "Helvetica-Bold" },
  body: { marginTop: 20, marginBottom: 8 },
  bodyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: LINE },
  bodyRowTotal: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, marginTop: 2 },
  bodyLabel: { fontSize: 10 },
  bodyLabelBold: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  bodyVal: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  bodyValTotal: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  payTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 4 },
  payLine: { fontSize: 9.5, marginTop: 1.5, color: INK },
  sign: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 26 },
  // dettaglio
  detailTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 6 },
  tHead: { flexDirection: "row", backgroundColor: ZEBRA, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: LINE, paddingVertical: 4 },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 4 },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase" },
  td: { fontSize: 8.5 },
  entrate: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6, gap: 10 },
  entrateTxt: { fontSize: 9.5, color: MUTED },
  entrateVal: { fontSize: 10, fontFamily: "Helvetica-Bold" },
});

// larghezze colonne (somma ~ 100)
const COL = { guest: "26%", ci: "15%", nights: "8%", pax: "7%", alloggio: "16%", ch: "12%", pct: "6%", pay: "10%" } as const;

function eur(n: number): string {
  return new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function NoteDoc({ data }: { data: PartnerNoteData }) {
  return (
    <Document title={`Nota spese ${data.partner.name} — ${data.propertyName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.issuer}>{data.partner.name}</Text>

        <Text style={styles.recipientLabel}>Spett.le</Text>
        <Text style={styles.recipient}>{data.recipient.name}</Text>
        {data.recipient.addressLines.map((l, i) => (
          <Text key={i} style={styles.recipientLine}>{l}</Text>
        ))}
        {data.recipient.fiscalCode ? <Text style={styles.recipientLine}>CF: {data.recipient.fiscalCode}</Text> : null}

        <Text style={styles.place}>{data.place}, {data.dateLabel}</Text>

        <Text style={styles.oggetto}>
          <Text style={styles.oggettoBold}>Oggetto: </Text>
          Nota spese del {data.dateLabel} relativa a Consulenza Ospitalità {data.periodLabel} – {data.propertyName}
        </Text>

        <View style={styles.body}>
          <View style={styles.bodyRow}>
            <Text style={styles.bodyLabel}>Consulenza</Text>
            <Text style={styles.bodyVal}>€ {eur(data.consulenza)}</Text>
          </View>
          <View style={styles.bodyRow}>
            <Text style={styles.bodyLabel}>Rivalsa contr. previd. 4%</Text>
            <Text style={styles.bodyVal}>€ {eur(data.inps)}</Text>
          </View>
          <View style={styles.bodyRow}>
            <Text style={styles.bodyLabelBold}>Lordo da versare</Text>
            <Text style={styles.bodyVal}>€ {eur(data.lordo)}</Text>
          </View>
          {data.parcheggio > 0 ? (
            <View style={styles.bodyRow}>
              <Text style={styles.bodyLabel}>Quota parcheggio (25%)</Text>
              <Text style={styles.bodyVal}>+ € {eur(data.parcheggio)}</Text>
            </View>
          ) : null}
          {data.favore > 0 ? (
            <View style={styles.bodyRow}>
              <Text style={styles.bodyLabel}>{data.favoreNote || "Voce aggiuntiva"}</Text>
              <Text style={styles.bodyVal}>+ € {eur(data.favore)}</Text>
            </View>
          ) : null}
          {data.acconto > 0 ? (
            <View style={styles.bodyRow}>
              <Text style={styles.bodyLabel}>Acconto incassato in loco</Text>
              <Text style={styles.bodyVal}>- € {eur(data.acconto)}</Text>
            </View>
          ) : null}
          <View style={styles.bodyRowTotal}>
            <Text style={styles.bodyLabelBold}>Totale Netto</Text>
            <Text style={styles.bodyValTotal}>€ {eur(data.totale)}</Text>
          </View>
        </View>

        <Text style={styles.payTitle}>Modalità di pagamento:</Text>
        <Text style={styles.payLine}>Accredito su: {data.partner.bank}</Text>
        <Text style={styles.payLine}>CC di {data.partner.name}</Text>
        {data.partner.filiale ? <Text style={styles.payLine}>Filiale {data.partner.filiale}</Text> : null}
        <Text style={styles.payLine}>BIC/SWIFT: {data.partner.bic}</Text>
        <Text style={styles.payLine}>Conto Corrente {data.partner.cc}</Text>
        <Text style={styles.payLine}>IBAN: {data.partner.iban}</Text>

        <Text style={styles.sign}>{data.partner.name}</Text>

        {/* Dettaglio di calcolo per mese */}
        {data.months.map((m, mi) => (
          <View key={mi} wrap={false}>
            <Text style={styles.detailTitle}>{m.label}</Text>
            <View style={styles.tHead}>
              <Text style={[styles.th, { width: COL.guest }]}>Nome</Text>
              <Text style={[styles.th, { width: COL.ci }]}>Check-in</Text>
              <Text style={[styles.th, { width: COL.nights, textAlign: "center" }]}>Notti</Text>
              <Text style={[styles.th, { width: COL.pax, textAlign: "center" }]}>PAX</Text>
              <Text style={[styles.th, { width: COL.alloggio, textAlign: "right" }]}>Alloggio</Text>
              <Text style={[styles.th, { width: COL.ch }]}>Provenienza</Text>
              <Text style={[styles.th, { width: COL.pct, textAlign: "center" }]}>%</Text>
              <Text style={[styles.th, { width: COL.pay, textAlign: "right" }]}>Pagamento</Text>
            </View>
            {m.rows.map((r, ri) => (
              <View key={ri} style={styles.tRow}>
                <Text style={[styles.td, { width: COL.guest }]}>{r.guest}</Text>
                <Text style={[styles.td, { width: COL.ci }]}>{r.checkIn}</Text>
                <Text style={[styles.td, { width: COL.nights, textAlign: "center" }]}>{r.nights}</Text>
                <Text style={[styles.td, { width: COL.pax, textAlign: "center" }]}>{r.pax}</Text>
                <Text style={[styles.td, { width: COL.alloggio, textAlign: "right" }]}>€ {eur(r.alloggio)}</Text>
                <Text style={[styles.td, { width: COL.ch }]}>{r.channel}</Text>
                <Text style={[styles.td, { width: COL.pct, textAlign: "center" }]}>{r.feePct}</Text>
                <Text style={[styles.td, { width: COL.pay, textAlign: "right" }]}>€ {eur(r.pagamento)}</Text>
              </View>
            ))}
            <View style={styles.entrate}>
              <Text style={styles.entrateTxt}>Subtotale {m.label.toLowerCase()}</Text>
              <Text style={styles.entrateVal}>€ {eur(m.total)}</Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderPartnerNotePdf(data: PartnerNoteData): Promise<Buffer> {
  return renderToBuffer(<NoteDoc data={data} />) as Promise<Buffer>;
}
