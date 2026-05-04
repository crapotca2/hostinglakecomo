import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-muted/20">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Prenotazione confermata!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ti abbiamo inviato una email di conferma con tutti i dettagli del soggiorno.
          A breve riceverai anche le istruzioni per il check-in.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
