import type { Metadata } from "next";

const LAST_UPDATED = "5 maggio 2026";

export const metadata: Metadata = {
  title: "Privacy Policy — Hosting Lake Como",
  description:
    "Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR) per gli utenti del sito Hosting Lake Como.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-20">
      <section className="py-16 border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Informativa Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
            Privacy <span className="font-semibold">Policy</span>
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
              La presente informativa descrive le modalita con cui vengono
              trattati i dati personali degli utenti che visitano il sito{" "}
              <strong>hostinglakecomo.com</strong> (di seguito, il &quot;Sito&quot;) e che
              richiedono i servizi di co-hosting e gestione di affitti brevi sul
              Lago di Como offerti tramite questa piattaforma. Il documento e
              redatto ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679
              (di seguito, il &quot;GDPR&quot;) e del D.Lgs. 196/2003 come modificato dal
              D.Lgs. 101/2018.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Titolare del trattamento</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il titolare del trattamento dei dati personali e{" "}
              <span className="text-foreground font-medium">[NOME COGNOME]</span>,
              persona fisica che gestisce il Sito a Como, Italia. Per qualsiasi
              richiesta in materia di protezione dei dati personali e possibile
              scrivere all&apos;indirizzo{" "}
              <a
                href="mailto:angelo.talarico@gmail.com"
                className="text-primary hover:underline"
              >
                angelo.talarico@gmail.com
              </a>
              . Non e nominato un Responsabile della Protezione dei Dati (DPO)
              ai sensi dell&apos;art. 37 GDPR in quanto non ricorrono i presupposti
              di obbligatorieta previsti dalla norma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Categorie di dati raccolti</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Tramite il modulo di contatto presente nel Sito raccogliamo
              direttamente nome, indirizzo email, numero di telefono e
              l&apos;eventuale messaggio scritto dall&apos;utente. Per gli utenti che
              accedono all&apos;area clienti riservata ai proprietari in gestione
              vengono trattati anche i dati dell&apos;account autenticato tramite
              NextAuth e provider di identita Google OAuth (nome, email,
              identificativo univoco).
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Vengono inoltre raccolti automaticamente i cookie tecnici di
              sessione e di routing necessari al funzionamento del Sito,
              descritti in dettaglio nella{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </a>
              . Non utilizziamo al momento cookie analitici, di profilazione o
              di marketing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Finalita del trattamento</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              I dati raccolti vengono trattati per dare seguito alle richieste
              di consulenza inviate tramite il Sito, gestire l&apos;accesso alla
              dashboard riservata ai proprietari in gestione e mantenere le
              comunicazioni operative connesse al servizio di co-hosting. I
              dati di contatto possono inoltre essere utilizzati per inviare
              comunicazioni di servizio relative alle prenotazioni, ai report
              periodici e ad eventuali aggiornamenti contrattuali.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Base giuridica</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il trattamento dei dati di contatto raccolti tramite il modulo di
              richiesta consulenza si fonda sull&apos;art. 6.1.b GDPR, in quanto
              necessario all&apos;esecuzione di misure precontrattuali adottate su
              richiesta dell&apos;interessato. Il trattamento dei dati di account
              dei proprietari in gestione si fonda sul contratto di co-hosting
              sottoscritto separatamente. L&apos;eventuale invio di comunicazioni di
              marketing si fondera sul consenso esplicito dell&apos;interessato (art.
              6.1.a GDPR), revocabile in qualunque momento.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Il trattamento dei cookie tecnici si fonda sul legittimo interesse
              del titolare a fornire un servizio funzionante e sicuro (art.
              6.1.f GDPR), come previsto dalle linee guida del Garante Privacy
              del 10 giugno 2021.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Destinatari dei dati</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              I dati raccolti possono essere comunicati a Vercel Inc., fornitore
              di hosting del Sito (datacenter in Unione Europea), e a Google LLC
              limitatamente all&apos;autenticazione degli utenti dell&apos;area clienti
              tramite OAuth. Entrambi i fornitori operano in qualita di
              responsabili del trattamento ai sensi dell&apos;art. 28 GDPR e con essi
              sono in essere accordi di trattamento conformi alla normativa
              europea.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Trasferimenti extra UE</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Nei limiti necessari all&apos;erogazione del servizio i dati possono
              essere trasferiti negli Stati Uniti d&apos;America presso le
              infrastrutture di Vercel e di Google. Tali trasferimenti sono
              regolati dalle Standard Contractual Clauses approvate dalla
              Commissione Europea e dalla certificazione Data Privacy Framework
              (DPF), che garantiscono un livello di protezione adeguato ai sensi
              dell&apos;art. 45 GDPR.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Periodo di conservazione</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              I dati raccolti tramite il modulo di contatto vengono conservati
              per ventiquattro mesi dall&apos;ultimo contatto utile, salvo richiesta
              anticipata di cancellazione da parte dell&apos;interessato. I dati di
              account dei proprietari in gestione vengono conservati per tutta
              la durata del rapporto contrattuale e fino a un anno successivo
              alla sua cessazione, salvo obblighi di legge che impongano periodi
              di conservazione piu lunghi.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Diritti dell&apos;interessato</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              In qualunque momento l&apos;interessato puo esercitare i diritti
              previsti dagli articoli da 15 a 22 del GDPR: diritto di accesso,
              rettifica, cancellazione, limitazione del trattamento, portabilita
              dei dati, opposizione al trattamento e diritto di non essere
              sottoposto a decisioni automatizzate. Le richieste possono essere
              inviate all&apos;indirizzo{" "}
              <a
                href="mailto:angelo.talarico@gmail.com"
                className="text-primary hover:underline"
              >
                angelo.talarico@gmail.com
              </a>{" "}
              e verranno evase entro un mese dalla ricezione, prorogabile di due
              mesi in caso di richieste particolarmente complesse.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Reclamo all&apos;Autorita di controllo</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              L&apos;interessato che ritenga che il trattamento dei propri dati
              personali avvenga in violazione del GDPR ha diritto di proporre
              reclamo al Garante per la protezione dei dati personali, con sede
              in Piazza Venezia 11, 00187 Roma, oppure online tramite il sito{" "}
              <a
                href="https://www.garanteprivacy.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.garanteprivacy.it
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Modifiche all&apos;informativa</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              La presente informativa puo essere aggiornata in caso di modifiche
              normative o di nuove modalita di trattamento dei dati. La versione
              piu recente sara sempre disponibile su questa pagina con
              indicazione della data di ultimo aggiornamento riportata in testa
              al documento.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
