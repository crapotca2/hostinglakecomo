import { Sparkles } from "lucide-react";
import { LockedToolPreview } from "@/components/strumenti/locked-tool-preview";

export default function NomeProprietaPage() {
  return (
    <LockedToolPreview
      icon={Sparkles}
      title="Nome Proprieta"
      tagline="Generatore creativo per il naming della tua casa vacanza"
      description="Il nostro team naming costruisce per ogni proprieta un'identita verbale coerente con la zona, il target di clientela e il posizionamento premium sul Lago di Como."
      bullets={[
        "Analisi del posizionamento competitivo della zona",
        "Proposta di 6-10 nomi con rationale linguistico e culturale",
        "Verifica disponibilita dominio e handle social",
        "Coerenza con identita visiva e tono di voce della gestione Hosting Lake Como",
      ]}
    />
  );
}
