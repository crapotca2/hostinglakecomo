import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    docTitle: "Termini di Servizio",
    description:
      "Termini e condizioni di utilizzo del sito Host Como e dei servizi di property management offerti sul Lago di Como.",
    eyebrow: "Condizioni di utilizzo",
    title1: "Termini di",
    title2: "Servizio",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdated: "5 maggio 2026",
    intro: (
      <>
        I presenti Termini di Servizio (di seguito, i &quot;Termini&quot;)
        regolano l&apos;accesso e l&apos;utilizzo del sito{" "}
        <strong>hostcomo.com</strong> (di seguito, il &quot;Sito&quot;) e dei
        contenuti e simulatori in esso pubblicati. La navigazione del Sito e
        l&apos;invio di richieste di consulenza implicano l&apos;accettazione
        integrale dei presenti Termini, che possono essere aggiornati in
        qualunque momento con pubblicazione sul Sito.
      </>
    ),
    sections: [
      {
        h: "1. Definizioni",
        body: (
          <>
            Ai fini dei presenti Termini si intende per &quot;Sito&quot; la
            piattaforma raggiungibile all&apos;indirizzo hostcomo.com, per
            &quot;Utente&quot; qualunque visitatore del Sito, per
            &quot;Cliente&quot; il proprietario immobiliare che richiede o ha
            sottoscritto un contratto di co-hosting, e per &quot;Servizi&quot;
            le prestazioni di gestione di affitti brevi descritte nelle pagine
            del Sito ed erogate sulla base di specifici contratti separati.
          </>
        ),
      },
      {
        h: "2. Oggetto del Sito",
        body: (
          <>
            Il Sito ha funzione informativa e di vetrina dei Servizi di
            co-hosting offerti sul Lago di Como. Il Sito non è una piattaforma
            di prenotazione: le prenotazioni di soggiorno presso le proprietà
            gestite avvengono esclusivamente sui canali ufficiali dei Clienti
            (Airbnb, Booking.com, Expedia e altri portali equivalenti) ai
            termini e condizioni di tali piattaforme. Le richieste di
            consulenza inviate tramite il Sito non costituiscono prenotazioni
            di servizi e non generano automaticamente alcun obbligo
            contrattuale fino alla sottoscrizione di un contratto separato.
          </>
        ),
      },
      {
        h: "3. Accesso al Sito",
        body: (
          <>
            L&apos;accesso alle pagine pubbliche del Sito è libero e gratuito.
            L&apos;accesso all&apos;area clienti riservata ai proprietari in
            gestione richiede invece l&apos;autenticazione tramite credenziali
            Google OAuth fornite o associate al Cliente al momento
            dell&apos;attivazione del servizio. L&apos;Utente si impegna a
            utilizzare le credenziali in modo riservato e a comunicare
            tempestivamente qualunque sospetto di accesso non autorizzato al
            proprio account.
          </>
        ),
      },
      {
        h: "4. Proprietà intellettuale",
        body: (
          <>
            Tutti i contenuti pubblicati sul Sito, inclusi testi, layout,
            loghi, marchi, fotografie e codice sorgente, sono protetti dalle
            norme italiane ed europee in materia di diritto d&apos;autore e
            proprietà industriale. La riproduzione, distribuzione,
            modificazione o utilizzo dei contenuti per finalità commerciali è
            vietata senza il preventivo consenso scritto del titolare del
            Sito. Le fotografie delle proprietà gestite sono pubblicate con
            autorizzazione del proprietario e restano di proprietà del
            medesimo.
          </>
        ),
      },
      {
        h: "5. Simulatori e strumenti",
        body: (
          <>
            <p>
              I simulatori pubblici disponibili nella sezione Strumenti del
              Sito (Simulatore Rendita, Simulatore Investimento, Profit
              Diretto vs OTA e analoghi) forniscono{" "}
              <strong>stime preliminari di massima</strong> basate su
              parametri medi del mercato del Lago di Como e su algoritmi
              semplificati. I valori restituiti dai simulatori non
              costituiscono in alcun modo una garanzia di rendita reale, una
              proiezione vincolante, una consulenza finanziaria, fiscale o di
              investimento, né un&apos;offerta contrattuale.
            </p>
            <p className="mt-4">
              Il valore effettivo di rendita di un immobile dipende da
              numerosi fattori non interamente catturati dai simulatori, tra
              cui lo storico prenotazioni reale dell&apos;area,
              l&apos;attività dei competitor diretti, il pricing dinamico
              stagionale e la qualità della gestione operativa. Per
              un&apos;analisi accurata è raccomandata la richiesta di una
              consulenza dedicata.
            </p>
            <p className="mt-4">
              L&apos;Utente accetta espressamente, ai sensi e per gli effetti
              degli articoli 1341 e 1342 del codice civile, le clausole della
              presente sezione 5 (limitazione del valore probatorio delle
              stime), della sezione 6 (limitazione di responsabilità) e della
              sezione 8 (foro competente).
            </p>
          </>
        ),
      },
      {
        h: "6. Limitazione di responsabilità",
        body: (
          <>
            <p>
              Il titolare del Sito si impegna a mantenere i contenuti
              aggiornati e accurati ma non garantisce l&apos;esattezza, la
              completezza o l&apos;attualità di tutte le informazioni
              pubblicate. Eventuali errori, omissioni o malfunzionamenti
              temporanei del Sito non danno luogo a responsabilità per danni
              diretti o indiretti subiti dall&apos;Utente, salvo i casi di
              dolo o colpa grave previsti dalla legge italiana.
            </p>
            <p className="mt-4">
              Il Sito può contenere link verso siti di terze parti (Airbnb,
              Booking.com, Google Maps, OpenStreetMap, social network e altri).
              Il titolare non controlla i contenuti dei siti collegati e
              declina ogni responsabilità relativa al loro funzionamento, alla
              loro accuratezza e alle loro pratiche in materia di privacy.
            </p>
          </>
        ),
      },
      {
        h: "7. Modifiche dei Termini",
        body: (
          <>
            I presenti Termini possono essere modificati in qualunque momento
            per adeguarli a nuove disposizioni normative o all&apos;evoluzione
            dei Servizi offerti. La versione aggiornata sarà pubblicata su
            questa pagina con indicazione della data di ultimo aggiornamento.
            La continuazione dell&apos;utilizzo del Sito dopo la pubblicazione
            dei Termini modificati comporta l&apos;accettazione delle nuove
            condizioni.
          </>
        ),
      },
      {
        h: "8. Legge applicabile e foro competente",
        body: (
          <>
            I presenti Termini sono regolati dalla legge italiana. Per
            qualunque controversia relativa all&apos;interpretazione,
            all&apos;esecuzione o alla validità dei Termini il foro competente
            è quello del Tribunale di Como, salvo l&apos;applicazione di norme
            inderogabili a tutela del consumatore che individuino un foro
            diverso.
          </>
        ),
      },
      {
        h: "9. Contatti",
        body: (
          <>
            Per qualunque richiesta relativa ai presenti Termini di Servizio è
            possibile scrivere a{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            .
          </>
        ),
      },
    ],
  },
  en: {
    docTitle: "Terms of Service",
    description:
      "Terms and conditions of use of the Host Como website and of the property management services offered on Lake Como.",
    eyebrow: "Conditions of use",
    title1: "Terms of",
    title2: "Service",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "May 5, 2026",
    intro: (
      <>
        These Terms of Service (hereinafter, the &quot;Terms&quot;) govern
        access to and use of the website <strong>hostcomo.com</strong>{" "}
        (hereinafter, the &quot;Site&quot;) and of the content and simulators
        published on it. Browsing the Site and submitting consultation
        requests imply full acceptance of these Terms, which may be updated
        at any time by publication on the Site.
      </>
    ),
    sections: [
      {
        h: "1. Definitions",
        body: (
          <>
            For the purposes of these Terms, &quot;Site&quot; means the
            platform reachable at hostcomo.com, &quot;User&quot; any visitor
            of the Site, &quot;Client&quot; the property owner who requests
            or has signed a co-hosting agreement, and &quot;Services&quot; the
            short-term rental management services described on the Site and
            provided on the basis of specific separate contracts.
          </>
        ),
      },
      {
        h: "2. Purpose of the Site",
        body: (
          <>
            The Site has an informational and showcase function for the
            co-hosting Services offered on Lake Como. The Site is not a
            booking platform: accommodation bookings at the managed properties
            take place exclusively on the official channels of the Clients
            (Airbnb, Booking.com, Expedia and other equivalent portals) under
            the terms and conditions of those platforms. Consultation
            requests submitted through the Site do not constitute service
            bookings and do not automatically generate any contractual
            obligation until a separate contract is signed.
          </>
        ),
      },
      {
        h: "3. Access to the Site",
        body: (
          <>
            Access to the public pages of the Site is free of charge. Access
            to the client area reserved for managed property owners requires
            authentication via Google OAuth credentials provided or
            associated with the Client at the time of service activation. The
            User undertakes to use credentials confidentially and to promptly
            report any suspected unauthorised access to their account.
          </>
        ),
      },
      {
        h: "4. Intellectual property",
        body: (
          <>
            All content published on the Site, including text, layout, logos,
            trademarks, photographs and source code, is protected under
            Italian and European copyright and industrial property laws.
            Reproduction, distribution, modification or use of the content
            for commercial purposes is prohibited without prior written
            consent of the Site owner. Photographs of managed properties are
            published with the owner&apos;s authorisation and remain the
            owner&apos;s property.
          </>
        ),
      },
      {
        h: "5. Simulators and tools",
        body: (
          <>
            <p>
              The public simulators available in the Tools section of the
              Site (Yield Simulator, Investment Simulator, Direct Profit vs
              OTA and similar) provide{" "}
              <strong>preliminary indicative estimates</strong> based on
              average parameters of the Lake Como market and on simplified
              algorithms. The values returned by the simulators do not in
              any way constitute a guarantee of actual yield, a binding
              projection, a financial, tax or investment advisory service,
              nor a contractual offer.
            </p>
            <p className="mt-4">
              The actual yield of a property depends on numerous factors not
              fully captured by the simulators, including the real booking
              history of the area, direct competitor activity, seasonal
              dynamic pricing and the quality of operational management. For
              an accurate analysis, requesting a dedicated consultation is
              recommended.
            </p>
            <p className="mt-4">
              The User expressly accepts, pursuant to and for the purposes of
              articles 1341 and 1342 of the Italian Civil Code, the clauses
              of this section 5 (limitation of the probative value of
              estimates), of section 6 (limitation of liability) and of
              section 8 (court of jurisdiction).
            </p>
          </>
        ),
      },
      {
        h: "6. Limitation of liability",
        body: (
          <>
            <p>
              The Site owner undertakes to keep the content updated and
              accurate but does not guarantee the exactness, completeness or
              currentness of all published information. Any temporary
              errors, omissions or malfunctions of the Site do not give rise
              to liability for direct or indirect damages suffered by the
              User, except in cases of wilful misconduct or gross negligence
              as provided under Italian law.
            </p>
            <p className="mt-4">
              The Site may contain links to third-party websites (Airbnb,
              Booking.com, Google Maps, OpenStreetMap, social networks and
              others). The owner does not control the content of the linked
              sites and disclaims any responsibility regarding their
              functioning, their accuracy and their privacy practices.
            </p>
          </>
        ),
      },
      {
        h: "7. Amendments to the Terms",
        body: (
          <>
            These Terms may be amended at any time to adapt to new regulatory
            provisions or to the evolution of the offered Services. The
            updated version will be published on this page indicating the
            date of the last update. Continued use of the Site after
            publication of the amended Terms entails acceptance of the new
            conditions.
          </>
        ),
      },
      {
        h: "8. Applicable law and court of jurisdiction",
        body: (
          <>
            These Terms are governed by Italian law. For any dispute
            relating to the interpretation, execution or validity of the
            Terms, the competent court is the Court of Como, subject to the
            application of mandatory consumer protection rules that identify
            a different competent court.
          </>
        ),
      },
      {
        h: "9. Contacts",
        body: (
          <>
            For any request relating to these Terms of Service you may write
            to{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            .
          </>
        ),
      },
    ],
  },
  ru: {
    docTitle: "Условия использования",
    description:
      "Условия использования сайта Хост Комо и услуг управления недвижимостью на озере Комо.",
    eyebrow: "Условия использования",
    title1: "Условия",
    title2: "использования",
    lastUpdatedLabel: "Последнее обновление",
    lastUpdated: "5 мая 2026",
    intro: (
      <>
        Настоящие Условия использования (далее — «Условия») регулируют доступ
        к сайту <strong>hostcomo.com</strong> (далее — «Сайт») и его
        использование, а также содержимое и калькуляторы, на нём
        опубликованные. Просмотр Сайта и отправка запросов на консультацию
        подразумевают полное принятие настоящих Условий, которые могут быть
        обновлены в любое время путём публикации на Сайте.
      </>
    ),
    sections: [
      {
        h: "1. Определения",
        body: (
          <>
            В целях настоящих Условий «Сайт» означает платформу, доступную по
            адресу hostcomo.com, «Пользователь» — любой посетитель Сайта,
            «Клиент» — собственник недвижимости, запрашивающий или
            подписавший соглашение о co-hosting, и «Услуги» — услуги
            управления краткосрочной арендой, описанные на Сайте и
            предоставляемые на основе конкретных отдельных договоров.
          </>
        ),
      },
      {
        h: "2. Назначение Сайта",
        body: (
          <>
            Сайт имеет информационную и витринную функцию для Услуг
            co-hosting, предлагаемых на озере Комо. Сайт не является
            платформой бронирования: бронирование проживания в управляемых
            объектах осуществляется исключительно на официальных каналах
            Клиентов (Airbnb, Booking.com, Expedia и других эквивалентных
            порталах) на условиях этих платформ. Запросы на консультацию,
            отправленные через Сайт, не являются бронированием услуг и не
            создают автоматически каких-либо контрактных обязательств до
            подписания отдельного договора.
          </>
        ),
      },
      {
        h: "3. Доступ к Сайту",
        body: (
          <>
            Доступ к публичным страницам Сайта бесплатный. Доступ к
            закрытому разделу для собственников в управлении требует
            аутентификации через учётные данные Google OAuth, предоставленные
            или связанные с Клиентом в момент активации услуги. Пользователь
            обязуется использовать учётные данные конфиденциально и
            своевременно сообщать о любом подозрении в несанкционированном
            доступе к своему аккаунту.
          </>
        ),
      },
      {
        h: "4. Интеллектуальная собственность",
        body: (
          <>
            Всё содержимое, опубликованное на Сайте, включая тексты, дизайн,
            логотипы, товарные знаки, фотографии и исходный код, защищено
            итальянским и европейским законодательством об авторском праве и
            промышленной собственности. Воспроизведение, распространение,
            модификация или использование содержимого в коммерческих целях
            запрещены без предварительного письменного согласия владельца
            Сайта. Фотографии управляемых объектов публикуются с разрешения
            собственника и остаются его собственностью.
          </>
        ),
      },
      {
        h: "5. Калькуляторы и инструменты",
        body: (
          <>
            <p>
              Публичные калькуляторы, доступные в разделе Инструменты Сайта
              (Калькулятор доходности, Калькулятор инвестиций, Прямые продажи
              vs OTA и аналогичные), предоставляют{" "}
              <strong>предварительные ориентировочные оценки</strong> на
              основе средних параметров рынка озера Комо и упрощённых
              алгоритмов. Значения, возвращаемые калькуляторами, никоим
              образом не являются гарантией фактической доходности,
              обязывающим прогнозом, финансовой, налоговой или
              инвестиционной консультацией, а также контрактным
              предложением.
            </p>
            <p className="mt-4">
              Фактическая доходность объекта зависит от множества факторов,
              не полностью учитываемых калькуляторами, включая реальную
              историю бронирований в зоне, активность прямых конкурентов,
              сезонное динамическое ценообразование и качество операционного
              управления. Для точного анализа рекомендуется заказать
              индивидуальную консультацию.
            </p>
            <p className="mt-4">
              Пользователь явно принимает, в соответствии со статьями 1341 и
              1342 Гражданского кодекса Италии, положения настоящего раздела
              5 (ограничение доказательной силы оценок), раздела 6
              (ограничение ответственности) и раздела 8 (компетентный суд).
            </p>
          </>
        ),
      },
      {
        h: "6. Ограничение ответственности",
        body: (
          <>
            <p>
              Владелец Сайта обязуется поддерживать содержание актуальным и
              точным, но не гарантирует точность, полноту или актуальность
              всей опубликованной информации. Любые ошибки, упущения или
              временные сбои Сайта не порождают ответственности за прямой
              или косвенный ущерб, понесённый Пользователем, за исключением
              случаев умышленных действий или грубой небрежности,
              предусмотренных итальянским законодательством.
            </p>
            <p className="mt-4">
              Сайт может содержать ссылки на сайты третьих сторон (Airbnb,
              Booking.com, Google Maps, OpenStreetMap, социальные сети и
              другие). Владелец не контролирует содержимое связанных сайтов
              и снимает с себя ответственность за их функционирование, их
              точность и их практики в отношении конфиденциальности.
            </p>
          </>
        ),
      },
      {
        h: "7. Изменения Условий",
        body: (
          <>
            Настоящие Условия могут быть изменены в любой момент для
            приведения в соответствие с новыми нормативными положениями или
            эволюцией предлагаемых Услуг. Обновлённая версия будет
            опубликована на этой странице с указанием даты последнего
            обновления. Продолжение использования Сайта после публикации
            изменённых Условий влечёт принятие новых условий.
          </>
        ),
      },
      {
        h: "8. Применимое право и компетентный суд",
        body: (
          <>
            Настоящие Условия регулируются итальянским правом. Для любого
            спора, касающегося толкования, исполнения или действительности
            Условий, компетентным судом является Суд Комо, за исключением
            применения императивных норм защиты потребителей, определяющих
            другой компетентный суд.
          </>
        ),
      },
      {
        h: "9. Контакты",
        body: (
          <>
            По любому вопросу, касающемуся настоящих Условий использования,
            можно писать на адрес{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            .
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

export default async function TermsPage({
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
