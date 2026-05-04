"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { XCircle } from "lucide-react";

function CancelledContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  return (
    <div className="max-w-md mx-auto text-center px-4">
      <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
        <XCircle className="h-8 w-8 text-amber-600" />
      </div>
      <h1 className="text-2xl font-semibold mb-2">Pagamento annullato</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Nessun addebito e stato effettuato. Puoi riprovare quando vuoi.
      </p>
      <div className="flex gap-3 justify-center">
        {slug && (
          <Link
            href={`/properties/${slug}/book`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Riprova
          </Link>
        )}
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white transition-colors"
        >
          Altre proprieta
        </Link>
      </div>
    </div>
  );
}

export default function BookingCancelledPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-muted/20">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Caricamento...</div>}>
        <CancelledContent />
      </Suspense>
    </div>
  );
}
