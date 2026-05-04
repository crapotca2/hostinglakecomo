import { FileText } from "lucide-react";
import { LockedToolPreview } from "@/components/strumenti/locked-tool-preview";

export default function WelcomeLetterPage() {
  return (
    <LockedToolPreview
      icon={FileText}
      title="Welcome Letter"
      tagline="Lettera di benvenuto multilingua per i tuoi ospiti"
      description="Per ogni proprieta in gestione predisponiamo una welcome letter firmata, tradotta in quattro lingue e calibrata sul profilo dell'ospite. E' parte del kit di accoglienza Hosting Lake Como, non un template generico."
      bullets={[
        "Tono di voce personalizzato per tipologia di ospite (coppie, famiglie, business)",
        "Istruzioni check-in/check-out, WiFi e regole casa integrate",
        "Sezione consigli locali curata dal nostro concierge",
        "Versioni in italiano, inglese, francese, tedesco",
      ]}
    />
  );
}
