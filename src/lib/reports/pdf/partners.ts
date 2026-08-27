// Soci Host Como che emettono la Nota spese (compenso) per la consulenza di
// ospitalità. Ogni socio fattura la propria metà della commissione Host Como
// (15% sui ricavi alloggio) + rivalsa INPS 4%. Dati bancari per l'accredito.

export interface PartnerConfig {
  key: "angelo" | "andrei";
  name: string;
  bank: string;
  filiale?: string;
  bic: string;
  cc: string;
  iban: string;
}

export const PARTNERS: Record<string, PartnerConfig> = {
  angelo: {
    key: "angelo",
    name: "Angelo Talarico",
    bank: "Banca Monte dei Paschi di Siena",
    filiale: "410",
    bic: "PASCITMMCOM",
    cc: "921336",
    iban: "IT20J0103010900000000921336",
  },
  andrei: {
    key: "andrei",
    name: "Andrei Crapotca",
    bank: "Intesa Sanpaolo",
    bic: "BCITITMM",
    cc: "00002734",
    iban: "IT33K0306951292100000002734",
  },
};

// Rivalsa contributo previdenziale INPS gestione separata (4%).
export const INPS_RATE = 0.04;
