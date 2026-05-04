import { Map } from "lucide-react";
import { LockedToolPreview } from "@/components/strumenti/locked-tool-preview";

export default function PercorsoMapsPage() {
  return (
    <LockedToolPreview
      icon={Map}
      title="Percorso Google Maps"
      tagline="Link ottimizzato per guidare gli ospiti alla tua proprieta"
      description="Per ogni proprieta in gestione Hosting Lake Como genera un link Google Maps curato: coordinate esatte, waypoint con riferimenti visivi e indicazioni dedicate ai parcheggi pubblici. Non un semplice pin automatico, ma un percorso verificato dal nostro team."
      bullets={[
        "Pin sulla posizione esatta dell'ingresso, non del civico catastale",
        "Waypoint per parcheggi pubblici e zone ZTL in prossimita",
        "Accessi alternativi in caso di chiusure o traffico stagionale",
        "Link pronto da incollare in messaggi pre-arrivo su tutte le OTA",
      ]}
    />
  );
}
