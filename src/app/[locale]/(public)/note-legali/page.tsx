import type { Metadata } from "next";
import { LegalLanguageDisclaimer } from "@/components/public/legal-language-disclaimer";

const LAST_UPDATED = "5 maggio 2026";

export const metadata: Metadata = {
  title: "Note Legali — Hosting Lake Como",
  description:
    "Informazioni identificative del gestore del sito Hosting Lake Como ai sensi del D.Lgs. 70/2003 in materia di commercio elettronico.",
};

export default function NoteLegaliPage() {
  return (
    <div className="pt-20">
      <section className="py-16 border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalLanguageDisclaimer />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Trasparenza
          </span>
          <h1 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
            Note <span className="font-semibold">Legali</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Ultimo aggiornamento: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <section className="space-y-4">
            <p className="text-base leading-relaxed text-foreground">
              Le presenti Note Legali sono pubblicate ai sensi degli articoli 7
              e 8 del D.Lgs. 70/2003 in materia di commercio elettronico e
              forniscono le informazioni identificative del gestore del sito{" "}
              <strong>hostinglakecomo.com</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Identificazione del gestore</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il sito hostinglakecomo.com e gestito da{" "}
              <span className="text-foreground font-medium">[NOME COGNOME]</span>,
              persona fisica residente a Como (Italia), che opera in proprio
              nell&apos;ambito dell&apos;attivita di co-hosting e gestione di affitti
              brevi sul Lago di Como. Trattandosi di un&apos;attivita gestita da
              persona fisica e non da societa di capitali, non sussistono
              ragione sociale, partita IVA, codice REA, sede legale ne PEC
              formali da indicare. Per le comunicazioni si fa riferimento ai
              recapiti indicati al punto successivo.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Recapiti di contatto</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Per qualunque comunicazione formale e informale relativa al Sito
              e ai Servizi e possibile utilizzare i seguenti recapiti:
              indirizzo email{" "}
              <a
                href="mailto:angelo.talarico@gmail.com"
                className="text-primary hover:underline"
              >
                angelo.talarico@gmail.com
              </a>
              , telefono <strong>+39 351 718 0435</strong>, indirizzo postale{" "}
              <strong>Via Maurizio Monti 46, 22100 Como, Italia</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Hosting e infrastruttura</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il Sito e ospitato presso l&apos;infrastruttura cloud di Vercel
              Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, Stati Uniti
              d&apos;America, con datacenter primari nella regione UE Frankfurt
              (eu-west). I dati transitano in chiaro tramite protocollo HTTPS
              con certificato TLS rilasciato automaticamente da Let&apos;s
              Encrypt. L&apos;autenticazione degli utenti dell&apos;area clienti e
              gestita tramite OAuth di Google LLC.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Diritti d&apos;autore e marchi</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il marchio &quot;Hosting Lake Como&quot;, il logo, il wordmark &quot;como&quot; e
              tutti i contenuti grafici e testuali pubblicati sul Sito sono
              protetti dalle norme italiane ed europee in materia di diritto
              d&apos;autore e proprieta industriale. Le fotografie delle
              proprieta gestite sono pubblicate con autorizzazione dei rispettivi
              proprietari, ai quali resta in capo la titolarita degli scatti.
              Eventuali contenuti di terze parti (loghi di Airbnb,
              Booking.com, Expedia, Google e altri partner) sono utilizzati a
              fini puramente identificativi e restano di proprieta dei
              rispettivi titolari.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Natura dei servizi e limitazione di responsabilita</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il Sito ha funzione informativa e di vetrina dei servizi di
              co-hosting offerti sul Lago di Como. Non costituisce piattaforma
              di intermediazione immobiliare ne piattaforma di prenotazione
              diretta: le prenotazioni di soggiorno presso le proprieta gestite
              avvengono sui canali ufficiali Airbnb, Booking.com ed Expedia
              tramite i listing dei singoli proprietari, regolati dai termini e
              condizioni di tali piattaforme.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              I codici identificativi (CIN, CIR e analoghi) richiesti dalla
              normativa italiana per le strutture ricettive sono di competenza
              dei singoli proprietari e vengono esposti sui rispettivi listing
              e contratti. Il Sito non si assume responsabilita per la
              compliance ricettiva delle singole proprieta gestite, che resta
              in capo al titolare di ciascun immobile.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Documenti correlati</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Le presenti Note Legali sono complementari ai seguenti documenti,
              tutti disponibili sul Sito:
            </p>
            <ul className="space-y-2 text-base text-muted-foreground list-disc pl-6">
              <li>
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>{" "}
                — informativa GDPR sul trattamento dei dati personali
              </li>
              <li>
                <a href="/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </a>{" "}
                — informativa sui cookie e sulle tecnologie di tracciamento
              </li>
              <li>
                <a href="/terms" className="text-primary hover:underline">
                  Termini di Servizio
                </a>{" "}
                — condizioni di utilizzo del Sito e dei simulatori
              </li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
