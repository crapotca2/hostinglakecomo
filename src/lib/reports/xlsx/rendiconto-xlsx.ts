// Generatore XLSX del rendiconto proprietario, fedele al template ufficiale
// `Rendiconto-Splendore-Luglio.xlsx` (2 fogli IT/EN, sezioni A·Prenotazioni,
// B·Rendiconto, C·Parcheggi, E·KPI + 4 grafici nativi per foglio). La sezione
// D (payout interno Host Como) è VOLUTAMENTE esclusa: non deve finire al
// proprietario. Tutto formula-driven ("clicca la cella per verificare"),
// esattamente come l'originale generato con openpyxl.
//
// Costruito in OOXML grezzo + JSZip perché exceljs non sa scrivere grafici e la
// libreria openpyxl (Python) non gira su Vercel. Riusa verbatim styles.xml /
// theme1.xml del template così gli stili combaciano al pixel.

import JSZip from "jszip";
import { STYLES_XML, THEME_XML } from "./template";

export interface XlsxBooking {
  guest: string;
  channel: string; // "Airbnb" | "Booking" | "Diretto"
  checkIn: string; // dd/mm
  checkOut: string; // dd/mm
  nights: number;
  guests: number;
  room: number; // ricavi alloggio (ex pulizie)
  cleaning: number;
  ota: number; // commissione OTA
  cedolare: number; // ritenuta 21%
  parking: number;
  extra: number; // notte extra diretta
  counts: boolean; // Conta? (false = cancellata/esclusa dai totali)
}

export interface XlsxParking {
  guest: string;
  nights: number;
  amount: number;
}

export interface RendicontoXlsxInput {
  titleIt: string;
  titleEn: string;
  feeRate: number; // 0.15 per Splendore
  bookings: XlsxBooking[]; // in ordine cronologico
  parking: XlsxParking[];
  nightGrid: { label: string; bookingIndex: number | null }[]; // notti disponibili nel periodo
  availLabelIt: string; // es. "08/07–24/07"
  availLabelEn: string; // es. "08–24 Jul"
}

// ---- indici di stile (cellXfs) del template riusato — NON cambiare ----
const S = {
  title: 1, note: 2, secA: 3, secBar: 4, colH: 5,
  txt: 6, eur: 7, ctr: 8,
  txtCanc: 9, eurCanc: 10, ctrCanc: 11,
  totTxt: 12, totEur: 13, subLbl: 14, netLbl: 15, netEur: 16,
  totEur2: 17, totEurFill: 18, int: 19, pct: 20, dec1: 21, eurChart: 22,
} as const;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---- helper celle ----
const num = (ref: string, s: number, v: number) => `<c r="${ref}" s="${s}"><v>${v}</v></c>`;
const str = (ref: string, s: number, v: string) =>
  `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
const fml = (ref: string, s: number, f: string) => `<c r="${ref}" s="${s}"><f>${esc(f)}</f></c>`;
const emptyC = (ref: string, s: number) => `<c r="${ref}" s="${s}"/>`;

interface Labels {
  secA: string; secB: string; secC: string; secE: string;
  colHeaders: string[]; // 17 (A..Q)
  sideNight: string; sidePrice: string;
  totalRow: string;
  revenue: string; roomRev: string; extraNight: string; totalRevenue: string;
  costs: string; otaComm: string; flatTax: string; hostFee: (r: number) => string; totalCosts: string; netOwner: string;
  passthrough: string; cleaning: string; cityTax: string;
  pGuest: string; pNights: string; pAmount: string; pTotal: string; pOwner: string; pMgmt: string;
  kpiRoomRev: string; kpiNightsSold: string; kpiNightsAvail: (a: string) => string; kpiOcc: string;
  kpiAdr: string; kpiRevpar: string; kpiMin: string; kpiMax: string; kpiAvgGuests: string;
  chartData: string; chAirbnb: string; chBooking: string; chOta: string; chCedolare: string; chFee: (r: number) => string; chNet: string;
  chartTitlePrice: string; chartAxisPrice: string; chartTitleChannel: string; chartTitleComp: string; chartTitlePerGuest: string;
  seriesPrice: string;
}

const IT: Labels = {
  secA: "A · PRENOTAZIONI", secB: "B · RENDICONTO PROPRIETARIO", secC: "C · PARCHEGGI  (partita separata · 50/50)", secE: "E · KPI / STATISTICHE",
  colHeaders: ["Ospite", "Canale", "Check-in", "Check-out", "Notti", "Ospiti", "Alloggio", "Pulizie", "Comm. OTA", "Cedolare", "Parcheggio", "Notte extra", "Conta?", "Tassa sogg.", "Tassa payout", "Netto a banca", "€/notte"],
  sideNight: "Notte", sidePrice: "€/notte",
  totalRow: "Totale (escl. cancellate)",
  revenue: "RICAVI", roomRev: "Ricavi alloggio", extraNight: "Notte extra diretta", totalRevenue: "TOTALE RICAVI",
  costs: "COSTI", otaComm: "Commissioni OTA", flatTax: "Cedolare secca 21%", hostFee: (r) => `Commissione Host Como ${Math.round(r * 100)}%`, totalCosts: "TOTALE COSTI", netOwner: "NETTO AL PROPRIETARIO",
  passthrough: "Partite di giro (entrano ed escono, fuori dal netto)", cleaning: "Pulizie", cityTax: "Tassa di soggiorno",
  pGuest: "Ospite", pNights: "Notti", pAmount: "Importo", pTotal: "TOTALE", pOwner: "Quota proprietario 50%", pMgmt: "Quota gestione 50%",
  kpiRoomRev: "Ricavi alloggio", kpiNightsSold: "Notti vendute", kpiNightsAvail: (a) => `Notti disponibili (${a})`, kpiOcc: "Occupancy",
  kpiAdr: "ADR medio (alloggio ÷ notti)", kpiRevpar: "RevPAR (ricavi ÷ notti disponibili)", kpiMin: "€/notte minimo (per prenotazione)", kpiMax: "€/notte massimo (per prenotazione)", kpiAvgGuests: "Ospiti medi per prenotazione",
  chartData: "Dati grafici", chAirbnb: "Airbnb", chBooking: "Booking", chOta: "Commissioni OTA", chCedolare: "Cedolare 21%", chFee: (r) => `Commissione ${Math.round(r * 100)}%`, chNet: "Netto proprietario",
  chartTitlePrice: "Prezzo per notte nel tempo", chartAxisPrice: "€/notte", chartTitleChannel: "Ricavi alloggio per canale", chartTitleComp: "Composizione: costi vs netto proprietario", chartTitlePerGuest: "€/notte per ospite",
  seriesPrice: "€/notte",
};

const EN: Labels = {
  secA: "A · BOOKINGS", secB: "B · OWNER STATEMENT", secC: "C · PARKING  (separate item · 50/50)", secE: "E · KPI / STATISTICS",
  colHeaders: ["Guest", "Channel", "Check-in", "Check-out", "Nights", "Guests", "Room rev.", "Cleaning", "OTA comm.", "Flat tax", "Parking", "Extra night", "Count?", "City tax", "Tax in payout", "Net to bank", "€/night"],
  sideNight: "Night", sidePrice: "€/night",
  totalRow: "Total (excl. cancelled)",
  revenue: "REVENUE", roomRev: "Room revenue", extraNight: "Direct extra night", totalRevenue: "TOTAL REVENUE",
  costs: "COSTS", otaComm: "OTA commissions", flatTax: "Flat tax 21%", hostFee: (r) => `Host Como fee ${Math.round(r * 100)}%`, totalCosts: "TOTAL COSTS", netOwner: "NET TO OWNER",
  passthrough: "Pass-through items (in and out, excluded from net)", cleaning: "Cleaning", cityTax: "City tax",
  pGuest: "Guest", pNights: "Nights", pAmount: "Amount", pTotal: "TOTAL", pOwner: "Owner share 50%", pMgmt: "Management share 50%",
  kpiRoomRev: "Room revenue", kpiNightsSold: "Nights sold", kpiNightsAvail: (a) => `Nights available (${a})`, kpiOcc: "Occupancy",
  kpiAdr: "Average ADR (room rev. ÷ nights)", kpiRevpar: "RevPAR (revenue ÷ nights available)", kpiMin: "€/night minimum (per booking)", kpiMax: "€/night maximum (per booking)", kpiAvgGuests: "Average guests per booking",
  chartData: "Chart data", chAirbnb: "Airbnb", chBooking: "Booking", chOta: "OTA commissions", chCedolare: "Flat tax 21%", chFee: (r) => `Fee ${Math.round(r * 100)}%`, chNet: "Net to owner",
  chartTitlePrice: "Price per night over time", chartAxisPrice: "€/night", chartTitleChannel: "Room revenue by channel", chartTitleComp: "Breakdown: costs vs owner net", chartTitlePerGuest: "€/night per guest",
  seriesPrice: "€/night",
};

interface SheetGeo {
  N: number; TOT: number; D: number; lastSideRow: number;
  bStart: number; cStart: number; parkTotRow: number; eStart: number; chStart: number;
  maxRow: number;
}

function geometry(input: RendicontoXlsxInput): SheetGeo {
  const N = input.bookings.length;
  const TOT = 5 + N; // riga Totale
  const D = input.nightGrid.length;
  const lastSideRow = 4 + D;
  const lastA = Math.max(TOT, lastSideRow);
  const bStart = lastA + 2; // header sezione B
  // B occupa: header + RICAVI + roomRev + extra + TOTALE + COSTI + OTA + tax + fee + TOTALE + NETTO + blank + passthrough + cleaning + citytax
  const cStart = bStart + 16; // header sezione C
  const P = input.parking.length;
  const parkTotRow = cStart + 2 + P; // riga TOTALE parcheggi
  const eStart = parkTotRow + 3; // header sezione E (dopo quota prop/gest + blank)
  const chStart = eStart + 11; // "Dati grafici"
  const maxRow = chStart + 6;
  return { N, TOT, D, lastSideRow, bStart, cStart, parkTotRow, eStart, chStart, maxRow };
}

function buildSheet(input: RendicontoXlsxInput, L: Labels, title: string): string {
  const g = geometry(input);
  const { N, TOT, D } = g;
  const rows: Map<number, string[]> = new Map();
  const put = (r: number, xml: string) => {
    const a = rows.get(r) || [];
    a.push(xml);
    rows.set(r, a);
  };
  const COLS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"];

  // R1 titolo, R2 nota
  put(1, str("A1", S.title, title));
  put(2, str("A2", S.note, "Valori calcolati da formule Excel (clicca sulle celle per verificarli)."));

  // R3 barra sezione A (A verde + B..Q continuazione)
  put(3, str("A3", S.secA, L.secA));
  for (let i = 1; i < 17; i++) put(3, emptyC(`${COLS[i]}3`, S.secBar));

  // R4 intestazioni colonne + laterale S/T
  L.colHeaders.forEach((h, i) => put(4, str(`${COLS[i]}4`, S.colH, h)));
  put(4, str("S4", S.colH, L.sideNight));
  put(4, str("T4", S.colH, L.sidePrice));

  // R5.. prenotazioni
  input.bookings.forEach((b, i) => {
    const r = 5 + i;
    const sTxt = b.counts ? S.txt : S.txtCanc;
    const sEur = b.counts ? S.eur : S.eurCanc;
    const sCtr = b.counts ? S.ctr : S.ctrCanc;
    put(r, str(`A${r}`, sTxt, b.guest));
    put(r, str(`B${r}`, sTxt, b.channel));
    put(r, str(`C${r}`, sTxt, b.checkIn));
    put(r, str(`D${r}`, sTxt, b.checkOut));
    put(r, num(`E${r}`, sTxt, b.nights));
    put(r, num(`F${r}`, sTxt, b.guests));
    put(r, num(`G${r}`, sEur, b.room));
    put(r, num(`H${r}`, sEur, b.cleaning));
    put(r, num(`I${r}`, sEur, b.ota));
    put(r, num(`J${r}`, sEur, b.cedolare));
    put(r, num(`K${r}`, sEur, b.parking));
    put(r, num(`L${r}`, sEur, b.extra));
    put(r, num(`M${r}`, sCtr, b.counts ? 1 : 0));
    put(r, fml(`N${r}`, sEur, `3*F${r}*E${r}`));
    put(r, fml(`O${r}`, sEur, `IF(B${r}="Airbnb",N${r},0)`));
    put(r, fml(`P${r}`, sEur, `G${r}+H${r}+O${r}-I${r}-J${r}`));
    put(r, fml(`Q${r}`, sEur, `G${r}/E${r}`));
  });

  // Riga Totale (SUMIF su M=1)
  const sumif = (col: string) => `SUMIF($M$5:$M$${4 + N},1,${col}5:${col}${4 + N})`;
  put(TOT, str(`A${TOT}`, S.totTxt, L.totalRow));
  for (const col of ["E", "F"]) put(TOT, fml(`${col}${TOT}`, S.totTxt, sumif(col)));
  for (const col of ["G", "H", "I", "J", "K", "L", "N", "O", "P"]) put(TOT, fml(`${col}${TOT}`, S.totEur, sumif(col)));
  put(TOT, emptyC(`M${TOT}`, S.totTxt));
  put(TOT, emptyC(`Q${TOT}`, S.totTxt));

  // Laterale S/T: notti disponibili del periodo (griglia calcolata a monte)
  input.nightGrid.forEach((n, i) => {
    const r = 5 + i;
    put(r, str(`S${r}`, S.txt, n.label));
    if (n.bookingIndex != null) put(r, fml(`T${r}`, S.eur, `Q${5 + n.bookingIndex}`));
    else put(r, emptyC(`T${r}`, S.eur));
  });

  // ---- Sezione B ----
  const b0 = g.bStart;
  put(b0, str(`A${b0}`, S.secA, L.secB));
  for (const c of ["B", "C", "D"]) put(b0, emptyC(`${c}${b0}`, S.secBar));
  put(b0 + 1, str(`A${b0 + 1}`, S.subLbl, L.revenue));
  put(b0 + 2, str(`A${b0 + 2}`, S.txt, L.roomRev)); put(b0 + 2, fml(`B${b0 + 2}`, S.eur, `G${TOT}`));
  put(b0 + 3, str(`A${b0 + 3}`, S.txt, L.extraNight)); put(b0 + 3, fml(`B${b0 + 3}`, S.eur, `L${TOT}`));
  put(b0 + 4, str(`A${b0 + 4}`, S.totTxt, L.totalRevenue)); put(b0 + 4, fml(`B${b0 + 4}`, S.totEur, `B${b0 + 2}+B${b0 + 3}`));
  put(b0 + 5, str(`A${b0 + 5}`, S.subLbl, L.costs));
  put(b0 + 6, str(`A${b0 + 6}`, S.txt, L.otaComm)); put(b0 + 6, fml(`B${b0 + 6}`, S.eur, `I${TOT}`));
  put(b0 + 7, str(`A${b0 + 7}`, S.txt, L.flatTax)); put(b0 + 7, fml(`B${b0 + 7}`, S.eur, `J${TOT}`));
  put(b0 + 8, str(`A${b0 + 8}`, S.txt, L.hostFee(input.feeRate))); put(b0 + 8, fml(`B${b0 + 8}`, S.eur, `G${TOT}*${input.feeRate}`));
  put(b0 + 9, str(`A${b0 + 9}`, S.totTxt, L.totalCosts)); put(b0 + 9, fml(`B${b0 + 9}`, S.totEur, `B${b0 + 6}+B${b0 + 7}+B${b0 + 8}`));
  put(b0 + 10, str(`A${b0 + 10}`, S.netLbl, L.netOwner)); put(b0 + 10, fml(`B${b0 + 10}`, S.netEur, `B${b0 + 4}-B${b0 + 9}`));
  put(b0 + 12, str(`A${b0 + 12}`, S.note, L.passthrough));
  put(b0 + 13, str(`A${b0 + 13}`, S.txt, L.cleaning)); put(b0 + 13, fml(`B${b0 + 13}`, S.eur, `H${TOT}`));
  put(b0 + 14, str(`A${b0 + 14}`, S.txt, L.cityTax)); put(b0 + 14, fml(`B${b0 + 14}`, S.eur, `N${TOT}`));

  // ---- Sezione C parcheggi ----
  const c0 = g.cStart;
  put(c0, str(`A${c0}`, S.secA, L.secC));
  for (const c of ["B", "C", "D"]) put(c0, emptyC(`${c}${c0}`, S.secBar));
  put(c0 + 1, str(`A${c0 + 1}`, S.colH, L.pGuest));
  put(c0 + 1, str(`B${c0 + 1}`, S.colH, L.pNights));
  put(c0 + 1, str(`C${c0 + 1}`, S.colH, L.pAmount));
  input.parking.forEach((p, i) => {
    const r = c0 + 2 + i;
    put(r, str(`A${r}`, S.txt, p.guest));
    put(r, num(`B${r}`, S.txt, p.nights));
    put(r, num(`C${r}`, S.eur, p.amount));
  });
  const pt = g.parkTotRow;
  put(pt, str(`A${pt}`, S.totTxt, L.pTotal));
  put(pt, emptyC(`B${pt}`, S.totTxt));
  put(pt, fml(`C${pt}`, S.totEurFill, input.parking.length ? `SUM(C${c0 + 2}:C${pt - 1})` : "0"));
  put(pt + 1, str(`A${pt + 1}`, S.txt, L.pOwner)); put(pt + 1, fml(`C${pt + 1}`, S.eur, `C${pt}*0.5`));
  put(pt + 2, str(`A${pt + 2}`, S.txt, L.pMgmt)); put(pt + 2, fml(`C${pt + 2}`, S.eur, `C${pt}*0.5`));

  // ---- Sezione E KPI ----
  const e0 = g.eStart;
  put(e0, str(`A${e0}`, S.secA, L.secE));
  for (const c of ["B", "C", "D"]) put(e0, emptyC(`${c}${e0}`, S.secBar));
  const sideS = `S5:S${g.lastSideRow}`;
  const sideT = `T5:T${g.lastSideRow}`;
  const countedQ = input.bookings.map((b, i) => (b.counts ? `Q${5 + i}` : null)).filter(Boolean).join(",") || `Q5`;
  put(e0 + 1, str(`A${e0 + 1}`, S.txt, L.kpiRoomRev)); put(e0 + 1, fml(`B${e0 + 1}`, S.eur, `G${TOT}`));
  put(e0 + 2, str(`A${e0 + 2}`, S.txt, L.kpiNightsSold)); put(e0 + 2, fml(`B${e0 + 2}`, S.int, `E${TOT}`));
  put(e0 + 3, str(`A${e0 + 3}`, S.txt, L.kpiNightsAvail(L === IT ? input.availLabelIt : input.availLabelEn))); put(e0 + 3, fml(`B${e0 + 3}`, S.int, `COUNTA(${sideS})`));
  put(e0 + 4, str(`A${e0 + 4}`, S.txt, L.kpiOcc)); put(e0 + 4, fml(`B${e0 + 4}`, S.pct, `COUNTIF(${sideT},">0")/COUNTA(${sideS})`));
  put(e0 + 5, str(`A${e0 + 5}`, S.txt, L.kpiAdr)); put(e0 + 5, fml(`B${e0 + 5}`, S.eur, `G${TOT}/E${TOT}`));
  put(e0 + 6, str(`A${e0 + 6}`, S.txt, L.kpiRevpar)); put(e0 + 6, fml(`B${e0 + 6}`, S.eur, `SUM(${sideT})/COUNTA(${sideS})`));
  put(e0 + 7, str(`A${e0 + 7}`, S.txt, L.kpiMin)); put(e0 + 7, fml(`B${e0 + 7}`, S.eur, `MIN(${countedQ})`));
  put(e0 + 8, str(`A${e0 + 8}`, S.txt, L.kpiMax)); put(e0 + 8, fml(`B${e0 + 8}`, S.eur, `MAX(${countedQ})`));
  put(e0 + 9, str(`A${e0 + 9}`, S.txt, L.kpiAvgGuests)); put(e0 + 9, fml(`B${e0 + 9}`, S.dec1, `AVERAGEIF($M$5:$M$${4 + N},1,F5:F${4 + N})`));

  // ---- blocco dati grafici ----
  const ch = g.chStart;
  put(ch, str(`A${ch}`, S.note, L.chartData));
  const rng = (col: string) => `${col}5:${col}${4 + N}`;
  put(ch + 1, str(`A${ch + 1}`, S.txt, L.chAirbnb)); put(ch + 1, fml(`B${ch + 1}`, S.eurChart, `SUMIFS(${rng("G")},${rng("B")},"Airbnb",${rng("M")},1)`));
  put(ch + 2, str(`A${ch + 2}`, S.txt, L.chBooking)); put(ch + 2, fml(`B${ch + 2}`, S.eurChart, `SUMIFS(${rng("G")},${rng("B")},"Booking",${rng("M")},1)`));
  put(ch + 3, str(`A${ch + 3}`, S.txt, L.chOta)); put(ch + 3, fml(`B${ch + 3}`, S.eurChart, `I${TOT}`));
  put(ch + 4, str(`A${ch + 4}`, S.txt, L.chCedolare)); put(ch + 4, fml(`B${ch + 4}`, S.eurChart, `J${TOT}`));
  put(ch + 5, str(`A${ch + 5}`, S.txt, L.chFee(input.feeRate))); put(ch + 5, fml(`B${ch + 5}`, S.eurChart, `B${g.bStart + 8}`));
  put(ch + 6, str(`A${ch + 6}`, S.txt, L.chNet)); put(ch + 6, fml(`B${ch + 6}`, S.eurChart, `B${g.bStart + 10}`));

  // ---- serializza righe ----
  const rowNums = Array.from(rows.keys()).sort((a, b) => a - b);
  const sheetData = rowNums
    .map((r) => `<row r="${r}">${rows.get(r)!.join("")}</row>`)
    .join("");

  const cols =
    `<cols>` +
    `<col min="1" max="1" width="22" customWidth="1"/>` +
    `<col min="2" max="2" width="10" customWidth="1"/>` +
    `<col min="3" max="4" width="9" customWidth="1"/>` +
    `<col min="5" max="6" width="7" customWidth="1"/>` +
    `<col min="7" max="17" width="12" customWidth="1"/>` +
    `<col min="19" max="19" width="8" customWidth="1"/>` +
    `<col min="20" max="20" width="9" customWidth="1"/>` +
    `</cols>`;

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<dimension ref="A1:T${g.maxRow}"/>` +
    `<sheetViews><sheetView workbookViewId="0"/></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="15"/>` +
    cols +
    `<sheetData>${sheetData}</sheetData>` +
    `<mergeCells count="2"><mergeCell ref="A1:Q1"/><mergeCell ref="A2:Q2"/></mergeCells>` +
    `<drawing r:id="rId1"/>` +
    `</worksheet>`
  );
}

// ---- grafici (forma openpyxl, senza numCache: Excel ricalcola al load) ----
const A_NS = `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"`;
const richTitle = (t: string) =>
  `<title><tx><rich><a:bodyPr ${A_NS}/><a:p ${A_NS}><a:pPr><a:defRPr/></a:pPr><a:r><a:t>${esc(t)}</a:t></a:r></a:p></rich></tx></title>`;

function lineChartXml(sheet: string, catRange: string, valRange: string, serCell: string, title: string, yTitle: string): string {
  const q = (r: string) => `'${sheet}'!${r}`;
  return (
    `<chartSpace xmlns="http://schemas.openxmlformats.org/drawingml/2006/chart"><chart>` +
    richTitle(title) +
    `<plotArea><lineChart><grouping val="standard"/><ser><idx val="0"/><order val="0"/>` +
    `<tx><strRef><f>${q(serCell)}</f></strRef></tx>` +
    `<spPr><a:ln ${A_NS}><a:prstDash val="solid"/></a:ln></spPr>` +
    `<marker><symbol val="none"/></marker>` +
    `<cat><numRef><f>${q(catRange)}</f></numRef></cat>` +
    `<val><numRef><f>${q(valRange)}</f></numRef></val></ser>` +
    `<axId val="10"/><axId val="100"/></lineChart>` +
    `<catAx><axId val="10"/><scaling><orientation val="minMax"/></scaling><axPos val="b"/><majorTickMark val="none"/><minorTickMark val="none"/><crossAx val="100"/><lblOffset val="100"/></catAx>` +
    `<valAx><axId val="100"/><scaling><orientation val="minMax"/></scaling><axPos val="l"/><majorGridlines/>` +
    richTitle(yTitle) +
    `<majorTickMark val="none"/><minorTickMark val="none"/><crossAx val="10"/></valAx></plotArea>` +
    `<legend><legendPos val="r"/></legend><plotVisOnly val="1"/><dispBlanksAs val="gap"/></chart></chartSpace>`
  );
}

function barChartXml(sheet: string, catRange: string, valRange: string, title: string): string {
  const q = (r: string) => `'${sheet}'!${r}`;
  return (
    `<chartSpace xmlns="http://schemas.openxmlformats.org/drawingml/2006/chart"><chart>` +
    richTitle(title) +
    `<plotArea><barChart><barDir val="col"/><grouping val="clustered"/><ser><idx val="0"/><order val="0"/>` +
    `<spPr><a:ln ${A_NS}><a:prstDash val="solid"/></a:ln></spPr>` +
    `<cat><numRef><f>${q(catRange)}</f></numRef></cat>` +
    `<val><numRef><f>${q(valRange)}</f></numRef></val></ser>` +
    `<gapWidth val="150"/><axId val="10"/><axId val="100"/></barChart>` +
    `<catAx><axId val="10"/><scaling><orientation val="minMax"/></scaling><axPos val="b"/><majorTickMark val="none"/><minorTickMark val="none"/><crossAx val="100"/><lblOffset val="100"/></catAx>` +
    `<valAx><axId val="100"/><scaling><orientation val="minMax"/></scaling><axPos val="l"/><majorGridlines/><majorTickMark val="none"/><minorTickMark val="none"/><crossAx val="10"/></valAx></plotArea>` +
    `<plotVisOnly val="1"/><dispBlanksAs val="gap"/></chart></chartSpace>`
  );
}

function drawingXml(): string {
  // 4 grafici ancorati in colonna V (idx 21), righe 3/19/35/51 (come il template).
  const anchor = (row: number, cx: number, rid: number, id: number) =>
    `<oneCellAnchor><from><col>21</col><colOff>0</colOff><row>${row}</row><rowOff>0</rowOff></from><ext cx="${cx}" cy="2520000"/>` +
    `<graphicFrame><nvGraphicFramePr><cNvPr id="${id}" name="Chart ${id}"/><cNvGraphicFramePr/></nvGraphicFramePr><xfrm/>` +
    `<a:graphic ${A_NS}><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">` +
    `<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId${rid}"/></a:graphicData></a:graphic></graphicFrame><clientData/></oneCellAnchor>`;
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<wsDr xmlns="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">` +
    anchor(3, 6120000, 1, 1) + anchor(19, 3960000, 2, 2) + anchor(35, 4680000, 3, 3) + anchor(51, 4680000, 4, 4) +
    `</wsDr>`
  );
}

function chartsForSheet(input: RendicontoXlsxInput, L: Labels, sheetName: string): string[] {
  const g = geometry(input);
  const ch = g.chStart;
  return [
    lineChartXml(sheetName, `$S$5:$S$${g.lastSideRow}`, `$T$5:$T$${g.lastSideRow}`, "$T$4", L.chartTitlePrice, L.chartAxisPrice),
    barChartXml(sheetName, `$A$${ch + 1}:$A$${ch + 2}`, `$B$${ch + 1}:$B$${ch + 2}`, L.chartTitleChannel),
    barChartXml(sheetName, `$A$${ch + 3}:$A$${ch + 6}`, `$B$${ch + 3}:$B$${ch + 6}`, L.chartTitleComp),
    barChartXml(sheetName, `$A$5:$A$${4 + g.N}`, `$Q$5:$Q$${4 + g.N}`, L.chartTitlePerGuest),
  ];
}

export async function buildRendicontoXlsx(input: RendicontoXlsxInput): Promise<Buffer> {
  const zip = new JSZip();
  const SHEET_IT = "Rendiconto (IT)";
  const SHEET_EN = "Statement (EN)";

  zip.file("[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>` +
    [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<Override PartName="/xl/charts/chart${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`).join("") +
    [1, 2].map((n) => `<Override PartName="/xl/drawings/drawing${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`).join("") +
    `</Types>`
  );

  zip.file("_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`
  );

  zip.file("xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets>` +
    `<sheet name="${esc(SHEET_IT)}" sheetId="1" r:id="rId1"/>` +
    `<sheet name="${esc(SHEET_EN)}" sheetId="2" r:id="rId2"/>` +
    `</sheets><calcPr calcId="124519" fullCalcOnLoad="1"/></workbook>`
  );

  zip.file("xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>` +
    `</Relationships>`
  );

  zip.file("xl/styles.xml", STYLES_XML);
  zip.file("xl/theme/theme1.xml", THEME_XML);

  // fogli
  zip.file("xl/worksheets/sheet1.xml", buildSheet(input, IT, input.titleIt));
  zip.file("xl/worksheets/sheet2.xml", buildSheet(input, EN, input.titleEn));

  // rels foglio → drawing
  for (const [sheet, drw] of [[1, 1], [2, 2]] as const) {
    zip.file(`xl/worksheets/_rels/sheet${sheet}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drw}.xml"/>` +
      `</Relationships>`
    );
  }

  // drawings + rels
  const chartsIt = chartsForSheet(input, IT, SHEET_IT);
  const chartsEn = chartsForSheet(input, EN, SHEET_EN);
  for (const drw of [1, 2] as const) {
    zip.file(`xl/drawings/drawing${drw}.xml`, drawingXml());
    const base = drw === 1 ? 0 : 4; // chart1-4 vs chart5-8
    zip.file(`xl/drawings/_rels/drawing${drw}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      [1, 2, 3, 4].map((i) => `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${base + i}.xml"/>`).join("") +
      `</Relationships>`
    );
  }
  chartsIt.forEach((c, i) => zip.file(`xl/charts/chart${i + 1}.xml`, c));
  chartsEn.forEach((c, i) => zip.file(`xl/charts/chart${i + 5}.xml`, c));

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
