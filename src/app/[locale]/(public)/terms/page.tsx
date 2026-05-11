import type { Metadata } from "next";
import { LegalLanguageDisclaimer } from "@/components/public/legal-language-disclaimer";

const LAST_UPDATED = "5 maggio 2026";

export const metadata: Metadata = {
  title: "Termini di Servizio",
  description:
    "Termini e condizioni di utilizzo del sito Como Host e dei servizi di property management offerti sul Lago di Como.",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="pt-20">
      <section className="py-16 border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalLanguageDisclaimer />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Condizioni di utilizzo
          </span>
          <h1 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
            Termini di <span className="font-semibold">Servizio</span>
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
              I presenti Termini di Servizio (di seguito, i &quot;Termini&quot;) regolano
              l&apos;accesso e l&apos;utilizzo del sito{" "}
              <strong>hostcomo.com</strong> (di seguito, il &quot;Sito&quot;) e
              dei contenuti e simulatori in esso pubblicati. La navigazione del
              Sito e l&apos;invio di richieste di consulenza implicano
              l&apos;accettazione integrale dei presenti Termini, che possono
              essere aggiornati in qualunque momento con pubblicazione sul Sito.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Definizioni</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Ai fini dei presenti Termini si intende per &quot;Sito&quot; la piattaforma
              raggiungibile all&apos;indirizzo hostcomo.com, per &quot;Utente&quot;
              qualunque visitatore del Sito, per &quot;Cliente&quot; il proprietario
              immobiliare che richiede o ha sottoscritto un contratto di
              co-hosting, e per &quot;Servizi&quot; le prestazioni di gestione di affitti
              brevi descritte nelle pagine del Sito ed erogate sulla base di
              specifici contratti separati.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Oggetto del Sito</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il Sito ha funzione informativa e di vetrina dei Servizi di
              co-hosting offerti sul Lago di Como. Il Sito non e una
              piattaforma di prenotazione: le prenotazioni di soggiorno presso
              le proprieta gestite avvengono esclusivamente sui canali ufficiali
              dei Clienti (Airbnb, Booking.com, Expedia e altri portali
              equivalenti) ai termini e condizioni di tali piattaforme. Le
              richieste di consulenza inviate tramite il Sito non costituiscono
              prenotazioni di servizi e non generano automaticamente alcun
              obbligo contrattuale fino alla sottoscrizione di un contratto
              separato.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Accesso al Sito</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              L&apos;accesso alle pagine pubbliche del Sito e libero e gratuito.
              L&apos;accesso all&apos;area clienti riservata ai proprietari in gestione
              richiede invece l&apos;autenticazione tramite credenziali Google OAuth
              fornite o associate al Cliente al momento dell&apos;attivazione del
              servizio. L&apos;Utente si impegna a utilizzare le credenziali in modo
              riservato e a comunicare tempestivamente qualunque sospetto di
              accesso non autorizzato al proprio account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Proprieta intellettuale</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Tutti i contenuti pubblicati sul Sito, inclusi testi, layout,
              loghi, marchi, fotografie e codice sorgente, sono protetti dalle
              norme italiane ed europee in materia di diritto d&apos;autore e
              proprieta industriale. La riproduzione, distribuzione,
              modificazione o utilizzo dei contenuti per finalita commerciali e
              vietata senza il preventivo consenso scritto del titolare del
              Sito. Le fotografie delle proprieta gestite sono pubblicate con
              autorizzazione del proprietario e restano di proprieta del
              medesimo.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Simulatori e strumenti</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              I simulatori pubblici disponibili nella sezione Strumenti del
              Sito (Simulatore Rendita, Simulatore Investimento, Profit Diretto
              vs OTA e analoghi) forniscono <strong>stime preliminari di
              massima</strong> basate su parametri medi del mercato del Lago di
              Como e su algoritmi semplificati. I valori restituiti dai
              simulatori non costituiscono in alcun modo una garanzia di
              rendita reale, una proiezione vincolante, una consulenza
              finanziaria, fiscale o di investimento, ne un&apos;offerta
              contrattuale.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il valore effettivo di rendita di un immobile dipende da numerosi
              fattori non interamente catturati dai simulatori, tra cui lo
              storico prenotazioni reale dell&apos;area, l&apos;attivita dei
              competitor diretti, il pricing dinamico stagionale e la qualita
              della gestione operativa. Per un&apos;analisi accurata e
              raccomandata la richiesta di una consulenza dedicata.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              L&apos;Utente accetta espressamente, ai sensi e per gli effetti
              degli articoli 1341 e 1342 del codice civile, le clausole della
              presente sezione 5 (limitazione del valore probatorio delle
              stime), della sezione 6 (limitazione di responsabilita) e della
              sezione 8 (foro competente).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Limitazione di responsabilita</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il titolare del Sito si impegna a mantenere i contenuti aggiornati
              e accurati ma non garantisce l&apos;esattezza, la completezza o
              l&apos;attualita di tutte le informazioni pubblicate. Eventuali
              errori, omissioni o malfunzionamenti temporanei del Sito non
              danno luogo a responsabilita per danni diretti o indiretti subiti
              dall&apos;Utente, salvo i casi di dolo o colpa grave previsti dalla
              legge italiana.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il Sito puo contenere link verso siti di terze parti (Airbnb,
              Booking.com, Google Maps, OpenStreetMap, social network e altri).
              Il titolare non controlla i contenuti dei siti collegati e declina
              ogni responsabilita relativa al loro funzionamento, alla loro
              accuratezza e alle loro pratiche in materia di privacy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Modifiche dei Termini</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              I presenti Termini possono essere modificati in qualunque momento
              per adeguarli a nuove disposizioni normative o all&apos;evoluzione
              dei Servizi offerti. La versione aggiornata sara pubblicata su
              questa pagina con indicazione della data di ultimo aggiornamento.
              La continuazione dell&apos;utilizzo del Sito dopo la pubblicazione
              dei Termini modificati comporta l&apos;accettazione delle nuove
              condizioni.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Legge applicabile e foro competente</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              I presenti Termini sono regolati dalla legge italiana. Per
              qualunque controversia relativa all&apos;interpretazione,
              all&apos;esecuzione o alla validita dei Termini il foro competente
              e quello del Tribunale di Como, salvo l&apos;applicazione di norme
              inderogabili a tutela del consumatore che individuino un foro
              diverso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Contatti</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Per qualunque richiesta relativa ai presenti Termini di Servizio
              e possibile scrivere a{" "}
              <a
                href="mailto:info@hostcomo.com"
                className="text-primary hover:underline"
              >
                info@hostcomo.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
