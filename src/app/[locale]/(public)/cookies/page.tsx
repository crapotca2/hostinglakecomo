import type { Metadata } from "next";
import { LegalLanguageDisclaimer } from "@/components/public/legal-language-disclaimer";

const LAST_UPDATED = "5 maggio 2026";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Informativa sui cookie utilizzati sul sito Como Host ai sensi delle linee guida del Garante Privacy del 10 giugno 2021.",
  robots: { index: false, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <div className="pt-20">
      <section className="py-16 border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalLanguageDisclaimer />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Informativa Cookie
          </span>
          <h1 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
            Cookie <span className="font-semibold">Policy</span>
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
              La presente Cookie Policy descrive le tipologie di cookie e di
              tecnologie analoghe utilizzate sul sito{" "}
              <strong>hostinglakecomo.com</strong> e le finalita per cui vengono
              impiegate. Il documento integra l&apos;
              <a href="/privacy" className="text-primary hover:underline">
                informativa privacy
              </a>{" "}
              ed e redatto in conformita alle linee guida del Garante per la
              protezione dei dati personali del 10 giugno 2021 e all&apos;art. 122
              del D.Lgs. 196/2003.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Cosa sono i cookie</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              I cookie sono piccoli file di testo che i siti visitati salvano
              sul dispositivo dell&apos;utente per ricordare informazioni utili al
              funzionamento del servizio o per raccogliere statistiche
              aggregate sull&apos;utilizzo del sito. La normativa distingue tra
              cookie tecnici (necessari al funzionamento del sito, non
              richiedono consenso) e cookie di profilazione o analitici di
              terze parti (richiedono consenso preventivo dell&apos;utente).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Cookie tecnici utilizzati</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il Sito utilizza esclusivamente cookie tecnici di sessione e di
              routing, necessari per garantire il corretto funzionamento delle
              pagine, mantenere lo stato di autenticazione degli utenti
              dell&apos;area clienti e gestire il bilanciamento del traffico verso
              i datacenter del fornitore di hosting Vercel. Questi cookie non
              tracciano l&apos;attivita dell&apos;utente al di fuori del Sito e non sono
              utilizzati per finalita di profilazione.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Nello specifico vengono impostati cookie di sessione di NextAuth
              per gli utenti che accedono all&apos;area riservata, cookie di
              preferenza tema (light/dark) salvati localmente e cookie di
              routing tecnici di Vercel. La durata di tali cookie e limitata
              alla sessione di navigazione o al massimo a trenta giorni per le
              preferenze persistenti.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Cookie analitici e di profilazione</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Al momento il Sito non utilizza cookie analitici, di profilazione
              o di marketing di alcun tipo. Non sono attivi strumenti come
              Google Analytics, Vercel Analytics, Meta Pixel o simili. In caso
              di adozione futura di tali strumenti la presente informativa sara
              aggiornata e verra richiesto il consenso preventivo
              dell&apos;utente tramite il banner cookie presente sul Sito.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Cookie di terze parti</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              L&apos;unica eccezione riguarda l&apos;autenticazione degli utenti
              dell&apos;area clienti tramite Google OAuth: il flusso di login
              comporta una redirezione temporanea verso i server Google, durante
              la quale Google puo impostare propri cookie tecnici. Tali cookie
              sono regolati dalla{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                privacy policy di Google
              </a>{" "}
              e vengono attivati esclusivamente quando l&apos;utente sceglie
              attivamente di accedere tramite Google.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Come gestire o disabilitare i cookie</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              L&apos;utente puo gestire le preferenze sui cookie tramite il banner
              di consenso presente sul Sito alla prima visita o cliccando sul
              link &quot;Gestisci cookie&quot; nel piede di pagina. In aggiunta e sempre
              possibile disabilitare i cookie direttamente dalle impostazioni
              del proprio browser; va tuttavia ricordato che la disattivazione
              dei cookie tecnici puo compromettere il corretto funzionamento del
              Sito, in particolare l&apos;accesso all&apos;area clienti.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Le istruzioni specifiche per la gestione dei cookie sono
              disponibili sui siti dei principali browser:{" "}
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Chrome
              </a>
              ,{" "}
              <a
                href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mozilla Firefox
              </a>
              ,{" "}
              <a
                href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Apple Safari
              </a>
              ,{" "}
              <a
                href="https://support.microsoft.com/it-it/microsoft-edge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Microsoft Edge
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Riferimenti normativi</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              La presente policy e redatta in conformita al Regolamento UE
              2016/679 (GDPR), al D.Lgs. 196/2003 modificato dal D.Lgs.
              101/2018 e alle linee guida del Garante per la protezione dei
              dati personali del 10 giugno 2021 in materia di cookie e altri
              strumenti di tracciamento (provvedimento n. 231 del 10 giugno
              2021, pubblicato in G.U. n. 163 del 9 luglio 2021).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Contatti e modifiche</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Per qualunque richiesta relativa alla presente Cookie Policy e
              possibile scrivere a{" "}
              <a
                href="mailto:angelo.talarico@gmail.com"
                className="text-primary hover:underline"
              >
                angelo.talarico@gmail.com
              </a>
              . La presente informativa puo essere aggiornata in qualunque
              momento; la versione vigente e sempre disponibile su questa
              pagina con indicazione della data di ultimo aggiornamento.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
