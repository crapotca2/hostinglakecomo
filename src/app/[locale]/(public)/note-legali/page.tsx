import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    docTitle: "Note Legali",
    description:
      "Informazioni identificative del gestore del sito Host Como ai sensi del D.Lgs. 70/2003 in materia di commercio elettronico.",
    eyebrow: "Trasparenza",
    title1: "Note",
    title2: "Legali",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdated: "5 maggio 2026",
    intro: (
      <>
        Le presenti Note Legali sono pubblicate ai sensi degli articoli 7 e 8
        del D.Lgs. 70/2003 in materia di commercio elettronico e forniscono le
        informazioni identificative del gestore del sito{" "}
        <strong>hostcomo.com</strong>.
      </>
    ),
    sections: [
      {
        h: "1. Identificazione del gestore",
        body: (
          <>
            Il sito hostcomo.com è gestito da{" "}
            <span className="text-foreground font-medium">Angelo Talarico</span>
            , persona fisica residente a Como (Italia), che opera in proprio
            nell&apos;ambito dell&apos;attività di co-hosting e gestione di
            affitti brevi sul Lago di Como. Trattandosi di un&apos;attività
            gestita da persona fisica e non da società di capitali, non
            sussistono ragione sociale, partita IVA, codice REA, sede legale
            né PEC formali da indicare. Per le comunicazioni si fa riferimento
            ai recapiti indicati al punto successivo.
          </>
        ),
      },
      {
        h: "2. Recapiti di contatto",
        body: (
          <>
            Per qualunque comunicazione formale e informale relativa al Sito e
            ai Servizi è possibile utilizzare i seguenti recapiti: indirizzo
            email{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            , telefono <strong>+39 351 718 0435</strong>, sede operativa{" "}
            <strong>Como, Italia</strong>.
          </>
        ),
      },
      {
        h: "3. Hosting e infrastruttura",
        body: (
          <>
            Il Sito è ospitato presso l&apos;infrastruttura cloud di Vercel
            Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, Stati Uniti
            d&apos;America, con datacenter primari nella regione UE Frankfurt
            (eu-west). I dati transitano in chiaro tramite protocollo HTTPS
            con certificato TLS rilasciato automaticamente da Let&apos;s
            Encrypt. L&apos;autenticazione degli utenti dell&apos;area clienti
            è gestita tramite OAuth di Google LLC.
          </>
        ),
      },
      {
        h: "4. Diritti d'autore e marchi",
        body: (
          <>
            I marchi &quot;Host Como&quot; e &quot;Como Host&quot;, il logo, il
            wordmark &quot;como&quot; e tutti i contenuti grafici e testuali
            pubblicati sul Sito sono protetti dalle norme italiane ed europee
            in materia di diritto d&apos;autore e proprietà industriale. Le
            fotografie delle proprietà gestite sono pubblicate con
            autorizzazione dei rispettivi proprietari, ai quali resta in capo
            la titolarità degli scatti. Eventuali contenuti di terze parti
            (loghi di Airbnb, Booking.com, Expedia, Google e altri partner)
            sono utilizzati a fini puramente identificativi e restano di
            proprietà dei rispettivi titolari.
          </>
        ),
      },
      {
        h: "5. Natura dei servizi e limitazione di responsabilità",
        body: (
          <>
            <p>
              Il Sito ha funzione informativa e di vetrina dei servizi di
              co-hosting offerti sul Lago di Como. Non costituisce piattaforma
              di intermediazione immobiliare né piattaforma di prenotazione
              diretta: le prenotazioni di soggiorno presso le proprietà
              gestite avvengono sui canali ufficiali Airbnb, Booking.com ed
              Expedia tramite i listing dei singoli proprietari, regolati dai
              termini e condizioni di tali piattaforme.
            </p>
            <p className="mt-4">
              I codici identificativi (CIN, CIR e analoghi) richiesti dalla
              normativa italiana per le strutture ricettive sono di competenza
              dei singoli proprietari e vengono esposti sui rispettivi listing
              e contratti. Il Sito non si assume responsabilità per la
              compliance ricettiva delle singole proprietà gestite, che resta
              in capo al titolare di ciascun immobile.
            </p>
          </>
        ),
      },
      {
        h: "6. Documenti correlati",
        body: (
          <>
            <p>
              Le presenti Note Legali sono complementari ai seguenti documenti,
              tutti disponibili sul Sito:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
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
          </>
        ),
      },
    ],
  },
  en: {
    docTitle: "Legal Notice",
    description:
      "Identifying information about the operator of the Host Como website under Italian Legislative Decree 70/2003 on electronic commerce.",
    eyebrow: "Transparency",
    title1: "Legal",
    title2: "Notice",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "May 5, 2026",
    intro: (
      <>
        This Legal Notice is published pursuant to articles 7 and 8 of Italian
        Legislative Decree 70/2003 on electronic commerce and provides
        identifying information about the operator of the website{" "}
        <strong>hostcomo.com</strong>.
      </>
    ),
    sections: [
      {
        h: "1. Operator identification",
        body: (
          <>
            The hostcomo.com website is operated by{" "}
            <span className="text-foreground font-medium">Angelo Talarico</span>
            , a natural person resident in Como (Italy), acting on his own
            behalf in the field of co-hosting and short-term rental management
            on Lake Como. Since the activity is run by a natural person and
            not by a corporate entity, there is no company name, VAT number,
            REA code, registered office or certified email (PEC) to disclose.
            For all communications please refer to the contact details
            indicated in the next section.
          </>
        ),
      },
      {
        h: "2. Contact details",
        body: (
          <>
            For any formal or informal communication regarding the Site and the
            Services, the following channels may be used: email{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            , phone <strong>+39 351 718 0435</strong>, operating base{" "}
            <strong>Como, Italy</strong>.
          </>
        ),
      },
      {
        h: "3. Hosting and infrastructure",
        body: (
          <>
            The Site is hosted on the cloud infrastructure of Vercel Inc., 440
            N Barranca Avenue #4133, Covina, CA 91723, United States of
            America, with primary datacenters in the EU Frankfurt region
            (eu-west). Data travels over HTTPS with a TLS certificate
            automatically issued by Let&apos;s Encrypt. Authentication of
            client area users is handled via Google LLC OAuth.
          </>
        ),
      },
      {
        h: "4. Copyright and trademarks",
        body: (
          <>
            The trademarks &quot;Host Como&quot; and &quot;Como Host&quot;, the
            logo, the &quot;como&quot; wordmark and all graphic and textual
            content published on the Site are protected under Italian and
            European copyright and industrial property laws. Photographs of
            the managed properties are published with the authorisation of the
            respective owners, who retain ownership of the images. Any
            third-party content (logos of Airbnb, Booking.com, Expedia, Google
            and other partners) is used purely for identification purposes and
            remains the property of the respective holders.
          </>
        ),
      },
      {
        h: "5. Nature of the services and limitation of liability",
        body: (
          <>
            <p>
              The Site has an informational and showcase function for the
              co-hosting services offered on Lake Como. It is not a real
              estate intermediation platform nor a direct booking platform:
              accommodation bookings at the managed properties take place on
              the official Airbnb, Booking.com and Expedia channels via the
              listings of the individual owners, governed by the terms and
              conditions of those platforms.
            </p>
            <p className="mt-4">
              The identification codes (CIN, CIR and similar) required by
              Italian regulation for tourist accommodation are the
              responsibility of the individual owners and are displayed on
              their respective listings and contracts. The Site assumes no
              liability for the regulatory compliance of the individual
              managed properties, which remains with the holder of each
              property.
            </p>
          </>
        ),
      },
      {
        h: "6. Related documents",
        body: (
          <>
            <p>
              This Legal Notice is complementary to the following documents,
              all available on the Site:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-6">
              <li>
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>{" "}
                — GDPR notice on personal data processing
              </li>
              <li>
                <a href="/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </a>{" "}
                — notice on cookies and tracking technologies
              </li>
              <li>
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                — conditions of use of the Site and the simulators
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale];
  return {
    title: c.docTitle,
    description: c.description,
    robots: { index: false, follow: true },
  };
}

export default async function NoteLegaliPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const c = COPY[locale];

  return (
    <div className="pt-20">
      <section className="py-16 border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {c.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
            {c.title1} <span className="font-semibold">{c.title2}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {c.lastUpdatedLabel}: {c.lastUpdated}
          </p>
        </div>
      </section>

      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <section className="space-y-4">
            <p className="text-base leading-relaxed text-foreground">
              {c.intro}
            </p>
          </section>
          {c.sections.map((s) => (
            <section key={s.h} className="space-y-4">
              <h2 className="text-xl font-semibold">{s.h}</h2>
              <div className="text-base leading-relaxed text-muted-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
