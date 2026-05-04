import { collections } from "@/lib/mongodb/collections";
import type { BookingDoc } from "@/types/database";

function pad(s: string, len: number, char = " "): string {
  return (s || "").slice(0, len).padEnd(len, char);
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export interface AlloggiatiRecord {
  bookingId: string;
  checkIn: string;
  guestName: string;
  line: string;
}

export async function generateAlloggiatiExport(
  from: Date,
  to: Date
): Promise<{ content: string; records: AlloggiatiRecord[] }> {
  const bookingsCol = await collections.bookings();
  const allBookings = (await bookingsCol.find({}).toArray()) as BookingDoc[];
  const bookings = allBookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      b.checkIn >= from &&
      b.checkIn <= to
  );

  const records: AlloggiatiRecord[] = [];
  const lines: string[] = [];

  for (const b of bookings) {
    const recordType = "16";
    const arrival = formatDate(b.checkIn);
    const nights = String(b.nights).padStart(2, "0");
    const [cognome, ...nomeParts] = b.guestInfo.name.split(" ");
    const nome = nomeParts.join(" ") || "—";
    const sesso = "1";
    const nascitaData = "01/01/1990";
    const comuneNascita = "999999999";
    const provNascita = "EE";
    const statoNascita = b.guestInfo.nationality || "100000100";
    const cittadinanza = b.guestInfo.nationality || "100000100";
    const tipoDocumento = b.guestInfo.documentType || "IDEL";
    const numeroDocumento = b.guestInfo.documentNumber || "XXX000000";
    const luogoRilascio = "100000100";

    const line =
      pad(recordType, 2) +
      pad(arrival, 10) +
      pad(nights, 2) +
      pad(cognome, 50) +
      pad(nome, 30) +
      pad(sesso, 1) +
      pad(nascitaData, 10) +
      pad(comuneNascita, 9) +
      pad(provNascita, 2) +
      pad(statoNascita, 9) +
      pad(cittadinanza, 9) +
      pad(tipoDocumento, 5) +
      pad(numeroDocumento, 20) +
      pad(luogoRilascio, 9);

    lines.push(line);
    records.push({
      bookingId: b._id!.toString(),
      checkIn: arrival,
      guestName: b.guestInfo.name,
      line,
    });
  }

  return { content: lines.join("\n"), records };
}
