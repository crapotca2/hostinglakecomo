import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    docTitle: "Privacy Policy",
    description:
      "Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR) per gli utenti del sito Host Como.",
    eyebrow: "Informativa Privacy",
    title1: "Privacy",
    title2: "Policy",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdated: "5 maggio 2026",
    intro: (
      <>
        La presente informativa descrive le modalità con cui vengono trattati i
        dati personali degli utenti che visitano il sito{" "}
        <strong>hostcomo.com</strong> (di seguito, il &quot;Sito&quot;) e che
        richiedono i servizi di co-hosting e gestione di affitti brevi sul
        Lago di Como offerti tramite questa piattaforma. Il documento è
        redatto ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679
        (di seguito, il &quot;GDPR&quot;) e del D.Lgs. 196/2003 come modificato
        dal D.Lgs. 101/2018.
      </>
    ),
    sections: [
      {
        h: "1. Titolare del trattamento",
        body: (
          <>
            Il titolare del trattamento dei dati personali è{" "}
            <span className="text-foreground font-medium">Angelo Talarico</span>
            , persona fisica che gestisce il Sito a Como, Italia. Per qualsiasi
            richiesta in materia di protezione dei dati personali è possibile
            scrivere all&apos;indirizzo{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            . Non è nominato un Responsabile della Protezione dei Dati (DPO)
            ai sensi dell&apos;art. 37 GDPR in quanto non ricorrono i
            presupposti di obbligatorietà previsti dalla norma.
          </>
        ),
      },
      {
        h: "2. Categorie di dati raccolti",
        body: (
          <>
            <p>
              Tramite il modulo di contatto presente nel Sito raccogliamo
              direttamente nome, indirizzo email, numero di telefono e
              l&apos;eventuale messaggio scritto dall&apos;utente. Per gli
              utenti che accedono all&apos;area clienti riservata ai
              proprietari in gestione vengono trattati anche i dati
              dell&apos;account autenticato tramite NextAuth e provider di
              identità Google OAuth (nome, email, identificativo univoco).
            </p>
            <p className="mt-4">
              Vengono inoltre raccolti automaticamente i cookie tecnici di
              sessione e di routing necessari al funzionamento del Sito,
              descritti in dettaglio nella{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </a>
              . Non utilizziamo al momento cookie analitici, di profilazione o
              di marketing.
            </p>
          </>
        ),
      },
      {
        h: "3. Categorie di interessati",
        body: (
          <>
            <p>
              I dati trattati attraverso il Sito si riferiscono a tre distinte
              categorie di interessati, con finalità e periodi di
              conservazione propri di ciascuna categoria:
            </p>
            <ul className="space-y-3 list-disc pl-6 mt-3">
              <li>
                <strong className="text-foreground">
                  Visitatori del Sito
                </strong>{" "}
                — utenti che navigano le pagine pubbliche senza inviare moduli
                né autenticarsi. I dati trattati si limitano ai cookie tecnici
                di sessione e di routing necessari al funzionamento del Sito,
                descritti nella Cookie Policy.
              </li>
              <li>
                <strong className="text-foreground">
                  Proprietari potenziali (lead)
                </strong>{" "}
                — utenti che inviano una richiesta di consulenza tramite il
                modulo di contatto. I dati trattati sono quelli forniti
                volontariamente nel form (nome, email, telefono, indirizzo
                dell&apos;immobile, eventuali link annunci esistenti) ed
                eventuale messaggio scritto.
              </li>
              <li>
                <strong className="text-foreground">
                  Proprietari clienti (gestione in corso)
                </strong>{" "}
                — proprietari che hanno sottoscritto un contratto di
                co-hosting e accedono all&apos;area clienti riservata. I dati
                trattati comprendono i dati identificativi del proprietario,
                le credenziali OAuth Google, i dati catastali e contrattuali
                dell&apos;immobile gestito, i prospetti economici e i
                rendiconti operativi.
              </li>
            </ul>
            <p className="mt-4">
              I dati degli{" "}
              <strong className="text-foreground">ospiti finali</strong> che
              prenotano le proprietà gestite{" "}
              <strong className="text-foreground">non</strong> vengono
              trattati direttamente da Host Como attraverso il Sito: tali dati
              sono raccolti e trattati dai canali di prenotazione (Airbnb,
              Booking.com, Expedia e analoghi) sulla base delle rispettive
              informative, e ci vengono comunicati nei limiti necessari alla
              gestione operativa del soggiorno (check-in, comunicazioni
              alloggiati, adempimenti normativi come Alloggiati Web e tassa di
              soggiorno).
            </p>
          </>
        ),
      },
      {
        h: "4. Finalità del trattamento",
        body: (
          <>
            I dati raccolti vengono trattati per dare seguito alle richieste
            di consulenza inviate tramite il Sito, gestire l&apos;accesso alla
            dashboard riservata ai proprietari in gestione e mantenere le
            comunicazioni operative connesse al servizio di co-hosting. I
            dati di contatto possono inoltre essere utilizzati per inviare
            comunicazioni di servizio relative alle prenotazioni, ai report
            periodici e ad eventuali aggiornamenti contrattuali.
          </>
        ),
      },
      {
        h: "5. Base giuridica",
        body: (
          <>
            <p>
              Il trattamento dei dati di contatto raccolti tramite il modulo
              di richiesta consulenza si fonda sull&apos;art. 6.1.b GDPR, in
              quanto necessario all&apos;esecuzione di misure precontrattuali
              adottate su richiesta dell&apos;interessato. Il trattamento dei
              dati di account dei proprietari in gestione si fonda sul
              contratto di co-hosting sottoscritto separatamente.
              L&apos;eventuale invio di comunicazioni di marketing si fonderà
              sul consenso esplicito dell&apos;interessato (art. 6.1.a GDPR),
              revocabile in qualunque momento.
            </p>
            <p className="mt-4">
              Il trattamento dei cookie tecnici si fonda sul legittimo
              interesse del titolare a fornire un servizio funzionante e
              sicuro (art. 6.1.f GDPR), come previsto dalle linee guida del
              Garante Privacy del 10 giugno 2021.
            </p>
          </>
        ),
      },
      {
        h: "6. Destinatari dei dati",
        body: (
          <>
            <p>
              I dati raccolti possono essere comunicati ai seguenti fornitori,
              tutti operanti in qualità di responsabili del trattamento ai
              sensi dell&apos;art. 28 GDPR, con accordi di trattamento
              conformi alla normativa europea:
            </p>
            <ul className="space-y-3 list-disc pl-6 mt-3">
              <li>
                <strong className="text-foreground">Vercel Inc.</strong> —
                fornitore di hosting del Sito, con datacenter primari in
                Unione Europea (Francoforte).
              </li>
              <li>
                <strong className="text-foreground">Google LLC</strong> —
                limitatamente all&apos;autenticazione degli utenti
                dell&apos;area clienti tramite OAuth.
              </li>
              <li>
                <strong className="text-foreground">Resend Inc.</strong> —
                fornitore del servizio di invio email transazionali
                utilizzato per recapitare al titolare i messaggi inviati
                tramite il modulo di contatto. Resend è basato su
                infrastruttura Amazon Web Services nella region UE (Irlanda),
                è certificato SOC 2 Type II e non legge il contenuto delle
                email se non per gli aspetti tecnici di consegna (firma DKIM,
                gestione dei bounce, log dei metadati di invio).
              </li>
              <li>
                <strong className="text-foreground">IONOS SE</strong> —
                fornitore del servizio email del dominio hostcomo.com
                (datacenter in Germania), gestisce l&apos;inoltro dei
                messaggi indirizzati a{" "}
                <a
                  href="mailto:info@hostcomo.com"
                  className="text-primary hover:underline"
                >
                  info@hostcomo.com
                </a>{" "}
                verso le caselle dei gestori del Sito.
              </li>
            </ul>
          </>
        ),
      },
      {
        h: "7. Trasferimenti extra UE",
        body: (
          <>
            Nei limiti necessari all&apos;erogazione del servizio i dati
            possono essere trasferiti negli Stati Uniti d&apos;America presso
            le infrastrutture di Vercel, Google e Resend. Tali trasferimenti
            sono regolati dalle Standard Contractual Clauses approvate dalla
            Commissione Europea e dalla certificazione Data Privacy Framework
            (DPF), che garantiscono un livello di protezione adeguato ai
            sensi dell&apos;art. 45 GDPR. I dati gestiti da IONOS restano
            invece sul territorio dell&apos;Unione Europea.
          </>
        ),
      },
      {
        h: "8. Periodo di conservazione",
        body: (
          <>
            I dati raccolti tramite il modulo di contatto vengono conservati
            per ventiquattro mesi dall&apos;ultimo contatto utile, salvo
            richiesta anticipata di cancellazione da parte
            dell&apos;interessato. I dati di account dei proprietari in
            gestione vengono conservati per tutta la durata del rapporto
            contrattuale e fino a un anno successivo alla sua cessazione,
            salvo obblighi di legge che impongano periodi di conservazione
            più lunghi.
          </>
        ),
      },
      {
        h: "9. Diritti dell'interessato",
        body: (
          <>
            In qualunque momento l&apos;interessato può esercitare i diritti
            previsti dagli articoli da 15 a 22 del GDPR: diritto di accesso,
            rettifica, cancellazione, limitazione del trattamento,
            portabilità dei dati, opposizione al trattamento e diritto di non
            essere sottoposto a decisioni automatizzate. Le richieste possono
            essere inviate all&apos;indirizzo{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>{" "}
            e verranno evase entro un mese dalla ricezione, prorogabile di
            due mesi in caso di richieste particolarmente complesse.
          </>
        ),
      },
      {
        h: "10. Reclamo all'Autorità di controllo",
        body: (
          <>
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
          </>
        ),
      },
      {
        h: "11. Modifiche all'informativa",
        body: (
          <>
            La presente informativa può essere aggiornata in caso di modifiche
            normative o di nuove modalità di trattamento dei dati. La
            versione più recente sarà sempre disponibile su questa pagina con
            indicazione della data di ultimo aggiornamento riportata in testa
            al documento.
          </>
        ),
      },
    ],
  },
  en: {
    docTitle: "Privacy Policy",
    description:
      "Information on personal data processing under EU Regulation 2016/679 (GDPR) for users of the Host Como website.",
    eyebrow: "Privacy Notice",
    title1: "Privacy",
    title2: "Policy",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "May 5, 2026",
    intro: (
      <>
        This notice describes how the personal data of users who visit the
        website <strong>hostcomo.com</strong> (hereinafter, the
        &quot;Site&quot;) and request the co-hosting and short-term rental
        management services offered through this platform on Lake Como is
        processed. The document is drafted pursuant to articles 13 and 14 of
        EU Regulation 2016/679 (hereinafter, the &quot;GDPR&quot;) and Italian
        Legislative Decree 196/2003 as amended by Legislative Decree
        101/2018.
      </>
    ),
    sections: [
      {
        h: "1. Data controller",
        body: (
          <>
            The personal data controller is{" "}
            <span className="text-foreground font-medium">Angelo Talarico</span>
            , a natural person operating the Site in Como, Italy. For any
            request relating to personal data protection you may write to{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            . No Data Protection Officer (DPO) has been appointed under
            art. 37 GDPR as the mandatory conditions set out in that
            provision do not apply.
          </>
        ),
      },
      {
        h: "2. Categories of data collected",
        body: (
          <>
            <p>
              Through the contact form on the Site we directly collect name,
              email address, phone number and any message written by the
              user. For users who access the reserved client area for managed
              property owners we also process the authenticated account data
              via NextAuth and the Google OAuth identity provider (name,
              email, unique identifier).
            </p>
            <p className="mt-4">
              We also automatically collect the technical session and routing
              cookies necessary for the operation of the Site, described in
              detail in the{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </a>
              . We currently use no analytics, profiling or marketing
              cookies.
            </p>
          </>
        ),
      },
      {
        h: "3. Categories of data subjects",
        body: (
          <>
            <p>
              The data processed through the Site relate to three distinct
              categories of data subjects, with their own purposes and
              retention periods for each category:
            </p>
            <ul className="space-y-3 list-disc pl-6 mt-3">
              <li>
                <strong className="text-foreground">Site visitors</strong> —
                users browsing public pages without submitting forms or
                authenticating. The data processed is limited to the
                technical session and routing cookies necessary for the
                operation of the Site, described in the Cookie Policy.
              </li>
              <li>
                <strong className="text-foreground">
                  Prospective owners (leads)
                </strong>{" "}
                — users who submit a consultation request via the contact
                form. The processed data is what is voluntarily provided in
                the form (name, email, phone, property address, any existing
                listing links) and any written message.
              </li>
              <li>
                <strong className="text-foreground">
                  Client owners (management in progress)
                </strong>{" "}
                — owners who have signed a co-hosting agreement and access
                the reserved client area. The processed data includes
                identifying data of the owner, Google OAuth credentials,
                cadastral and contractual data of the managed property,
                financial statements and operational reports.
              </li>
            </ul>
            <p className="mt-4">
              The data of{" "}
              <strong className="text-foreground">end guests</strong> who
              book the managed properties is{" "}
              <strong className="text-foreground">not</strong> processed
              directly by Host Como through the Site: such data is collected
              and processed by the booking channels (Airbnb, Booking.com,
              Expedia and similar) under their respective notices, and is
              shared with us within the limits necessary for the
              operational management of the stay (check-in, alloggiati
              communications, regulatory obligations such as Alloggiati Web
              and tourist tax).
            </p>
          </>
        ),
      },
      {
        h: "4. Purposes of processing",
        body: (
          <>
            The data collected is processed to follow up on consultation
            requests submitted through the Site, manage access to the
            reserved dashboard for managed owners, and maintain the
            operational communications connected to the co-hosting service.
            Contact data may also be used to send service communications
            regarding bookings, periodic reports and any contractual
            updates.
          </>
        ),
      },
      {
        h: "5. Legal basis",
        body: (
          <>
            <p>
              Processing of contact data collected via the consultation
              request form is based on art. 6.1.b GDPR, as it is necessary
              to perform pre-contractual measures taken at the request of
              the data subject. Processing of account data of managed
              owners is based on the co-hosting agreement signed
              separately. Any marketing communications will be based on the
              data subject&apos;s explicit consent (art. 6.1.a GDPR),
              revocable at any time.
            </p>
            <p className="mt-4">
              Processing of technical cookies is based on the legitimate
              interest of the controller in providing a functional and
              secure service (art. 6.1.f GDPR), as set out in the
              guidelines of the Italian Data Protection Authority of 10
              June 2021.
            </p>
          </>
        ),
      },
      {
        h: "6. Data recipients",
        body: (
          <>
            <p>
              The data collected may be disclosed to the following
              providers, all acting as data processors under art. 28 GDPR,
              with data processing agreements compliant with European
              regulation:
            </p>
            <ul className="space-y-3 list-disc pl-6 mt-3">
              <li>
                <strong className="text-foreground">Vercel Inc.</strong> —
                provider of Site hosting, with primary datacenters in the
                European Union (Frankfurt).
              </li>
              <li>
                <strong className="text-foreground">Google LLC</strong> —
                limited to the authentication of client area users via
                OAuth.
              </li>
              <li>
                <strong className="text-foreground">Resend Inc.</strong> —
                provider of the transactional email service used to deliver
                to the controller the messages sent through the contact
                form. Resend is based on Amazon Web Services infrastructure
                in the EU region (Ireland), is SOC 2 Type II certified and
                does not read the content of the emails except for
                technical delivery aspects (DKIM signing, bounce handling,
                send-metadata logs).
              </li>
              <li>
                <strong className="text-foreground">IONOS SE</strong> —
                email service provider for the hostcomo.com domain
                (datacenters in Germany), handles the forwarding of
                messages addressed to{" "}
                <a
                  href="mailto:info@hostcomo.com"
                  className="text-primary hover:underline"
                >
                  info@hostcomo.com
                </a>{" "}
                to the mailboxes of the Site operators.
              </li>
            </ul>
          </>
        ),
      },
      {
        h: "7. Transfers outside the EU",
        body: (
          <>
            Within the limits necessary to provide the service, data may be
            transferred to the United States of America to the
            infrastructure of Vercel, Google and Resend. Such transfers are
            governed by the Standard Contractual Clauses approved by the
            European Commission and by the Data Privacy Framework (DPF)
            certification, which ensure an adequate level of protection
            under art. 45 GDPR. The data handled by IONOS remains within
            the territory of the European Union.
          </>
        ),
      },
      {
        h: "8. Retention period",
        body: (
          <>
            Data collected through the contact form is retained for
            twenty-four months from the last useful contact, unless an
            earlier deletion request is submitted by the data subject.
            Account data of managed owners is retained for the entire
            duration of the contractual relationship and up to one year
            after its termination, except for legal obligations imposing
            longer retention periods.
          </>
        ),
      },
      {
        h: "9. Data subject rights",
        body: (
          <>
            At any time the data subject may exercise the rights set out in
            articles 15 to 22 GDPR: right of access, rectification,
            erasure, restriction of processing, data portability,
            objection to processing and the right not to be subject to
            automated decisions. Requests may be sent to{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>{" "}
            and will be handled within one month of receipt, extendable by
            two months for particularly complex requests.
          </>
        ),
      },
      {
        h: "10. Complaint to the supervisory authority",
        body: (
          <>
            A data subject who considers that the processing of their
            personal data is in violation of GDPR has the right to file a
            complaint with the Italian Data Protection Authority (Garante
            per la protezione dei dati personali), based at Piazza Venezia
            11, 00187 Rome, or online via{" "}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.garanteprivacy.it
            </a>
            .
          </>
        ),
      },
      {
        h: "11. Amendments to the notice",
        body: (
          <>
            This notice may be updated in case of regulatory changes or new
            data processing methods. The most recent version will always
            be available on this page indicating the date of the last
            update shown at the top of the document.
          </>
        ),
      },
    ],
  },
  ru: {
    docTitle: "Политика конфиденциальности",
    description:
      "Информация об обработке персональных данных в соответствии с Регламентом ЕС 2016/679 (GDPR) для пользователей сайта Хост Комо.",
    eyebrow: "Уведомление о конфиденциальности",
    title1: "Политика",
    title2: "конфиденциальности",
    lastUpdatedLabel: "Последнее обновление",
    lastUpdated: "5 мая 2026",
    intro: (
      <>
        Настоящее уведомление описывает порядок обработки персональных данных
        пользователей, посещающих сайт <strong>hostcomo.com</strong> (далее —
        «Сайт») и запрашивающих услуги co-hosting и управления краткосрочной
        арендой на озере Комо, предлагаемые через эту платформу. Документ
        составлен в соответствии со статьями 13 и 14 Регламента ЕС 2016/679
        (далее — «GDPR») и Законодательным декретом Италии 196/2003 с
        изменениями, внесёнными Законодательным декретом 101/2018.
      </>
    ),
    sections: [
      {
        h: "1. Контролёр данных",
        body: (
          <>
            Контролёром обработки персональных данных является{" "}
            <span className="text-foreground font-medium">Angelo Talarico</span>
            , физическое лицо, управляющее Сайтом в Комо, Италия. По любым
            вопросам, касающимся защиты персональных данных, можно писать на
            адрес{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            . Сотрудник по защите данных (DPO) согласно ст. 37 GDPR не
            назначался, поскольку обязательные условия, установленные данным
            положением, не применимы.
          </>
        ),
      },
      {
        h: "2. Категории собираемых данных",
        body: (
          <>
            <p>
              Через контактную форму на Сайте мы напрямую собираем имя, адрес
              электронной почты, номер телефона и любое сообщение, написанное
              пользователем. Для пользователей, имеющих доступ к закрытому
              разделу для собственников в управлении, также обрабатываются
              данные аутентифицированного аккаунта через NextAuth и провайдера
              идентификации Google OAuth (имя, email, уникальный
              идентификатор).
            </p>
            <p className="mt-4">
              Также автоматически собираются технические cookies сессии и
              маршрутизации, необходимые для функционирования Сайта, подробно
              описанные в{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Политике cookies
              </a>
              . В настоящее время мы не используем аналитические,
              профилирующие или маркетинговые cookies.
            </p>
          </>
        ),
      },
      {
        h: "3. Категории субъектов данных",
        body: (
          <>
            <p>
              Данные, обрабатываемые через Сайт, относятся к трём различным
              категориям субъектов данных, с собственными целями и сроками
              хранения для каждой категории:
            </p>
            <ul className="space-y-3 list-disc pl-6 mt-3">
              <li>
                <strong className="text-foreground">Посетители Сайта</strong>{" "}
                — пользователи, просматривающие публичные страницы без
                отправки форм и без аутентификации. Обрабатываемые данные
                ограничены техническими cookies сессии и маршрутизации,
                необходимыми для функционирования Сайта, описанными в
                Политике cookies.
              </li>
              <li>
                <strong className="text-foreground">
                  Потенциальные собственники (лиды)
                </strong>{" "}
                — пользователи, отправляющие запрос на консультацию через
                контактную форму. Обрабатываемые данные — это те, что
                добровольно предоставлены в форме (имя, email, телефон, адрес
                объекта, любые ссылки на существующие объявления) и любое
                написанное сообщение.
              </li>
              <li>
                <strong className="text-foreground">
                  Собственники-клиенты (управление в процессе)
                </strong>{" "}
                — собственники, подписавшие соглашение о co-hosting и
                имеющие доступ к закрытому разделу клиентов. Обрабатываемые
                данные включают идентификационные данные собственника,
                учётные данные Google OAuth, кадастровые и контрактные
                данные управляемого объекта, финансовые отчёты и
                операционные сводки.
              </li>
            </ul>
            <p className="mt-4">
              Данные{" "}
              <strong className="text-foreground">конечных гостей</strong>,
              бронирующих управляемые объекты,{" "}
              <strong className="text-foreground">не</strong>{" "}
              обрабатываются напрямую Хост Комо через Сайт: такие данные
              собираются и обрабатываются каналами бронирования (Airbnb,
              Booking.com, Expedia и аналогичными) в соответствии с их
              уведомлениями и передаются нам в пределах, необходимых для
              операционного управления проживанием (заезд, сообщения
              Alloggiati, нормативные обязательства, такие как Alloggiati Web
              и туристический налог).
            </p>
          </>
        ),
      },
      {
        h: "4. Цели обработки",
        body: (
          <>
            Собранные данные обрабатываются для обработки запросов на
            консультацию, отправленных через Сайт, управления доступом к
            закрытому личному кабинету для собственников в управлении и
            поддержки операционной коммуникации, связанной с услугой
            co-hosting. Контактные данные также могут использоваться для
            отправки служебных сообщений, касающихся бронирований,
            периодических отчётов и любых контрактных обновлений.
          </>
        ),
      },
      {
        h: "5. Правовая основа",
        body: (
          <>
            <p>
              Обработка контактных данных, собранных через форму запроса
              консультации, основана на ст. 6.1.b GDPR, поскольку она
              необходима для выполнения преддоговорных мер, принятых по
              запросу субъекта данных. Обработка данных аккаунтов
              собственников в управлении основана на соглашении о
              co-hosting, подписанном отдельно. Любые маркетинговые
              сообщения будут основаны на явном согласии субъекта данных
              (ст. 6.1.a GDPR), отзываемом в любой момент.
            </p>
            <p className="mt-4">
              Обработка технических cookies основана на законном интересе
              контролёра в предоставлении функциональной и безопасной
              услуги (ст. 6.1.f GDPR), как это предусмотрено руководящими
              принципами Итальянского управления по защите данных от 10
              июня 2021 года.
            </p>
          </>
        ),
      },
      {
        h: "6. Получатели данных",
        body: (
          <>
            <p>
              Собранные данные могут быть раскрыты следующим поставщикам, все
              из которых действуют в качестве обработчиков данных согласно
              ст. 28 GDPR, с соглашениями об обработке данных, соответствующими
              европейскому регулированию:
            </p>
            <ul className="space-y-3 list-disc pl-6 mt-3">
              <li>
                <strong className="text-foreground">Vercel Inc.</strong> —
                поставщик хостинга Сайта, с основными датацентрами в
                Европейском Союзе (Франкфурт).
              </li>
              <li>
                <strong className="text-foreground">Google LLC</strong> —
                ограниченно для аутентификации пользователей клиентского
                раздела через OAuth.
              </li>
              <li>
                <strong className="text-foreground">Resend Inc.</strong> —
                поставщик транзакционной email-службы, используемой для
                доставки контролёру сообщений, отправленных через контактную
                форму. Resend работает на инфраструктуре Amazon Web Services
                в регионе ЕС (Ирландия), сертифицирован SOC 2 Type II и не
                читает содержимое email, кроме технических аспектов доставки
                (подпись DKIM, обработка bounce, логи метаданных отправки).
              </li>
              <li>
                <strong className="text-foreground">IONOS SE</strong> —
                поставщик email-службы для домена hostcomo.com (датацентры в
                Германии), осуществляет пересылку сообщений, адресованных на{" "}
                <a
                  href="mailto:info@hostcomo.com"
                  className="text-primary hover:underline"
                >
                  info@hostcomo.com
                </a>{" "}
                на почтовые ящики операторов Сайта.
              </li>
            </ul>
          </>
        ),
      },
      {
        h: "7. Передача за пределы ЕС",
        body: (
          <>
            В пределах, необходимых для предоставления услуги, данные могут
            передаваться в Соединённые Штаты Америки на инфраструктуру
            Vercel, Google и Resend. Такие передачи регулируются Стандартными
            Договорными Положениями, утверждёнными Европейской Комиссией, и
            сертификацией Data Privacy Framework (DPF), которые
            обеспечивают адекватный уровень защиты согласно ст. 45 GDPR.
            Данные, обрабатываемые IONOS, остаются на территории
            Европейского Союза.
          </>
        ),
      },
      {
        h: "8. Срок хранения",
        body: (
          <>
            Данные, собранные через контактную форму, хранятся в течение
            двадцати четырёх месяцев с момента последнего полезного
            контакта, если только субъект данных не подаст более раннее
            требование об удалении. Данные аккаунтов собственников в
            управлении хранятся в течение всего срока действия контрактных
            отношений и до одного года после их прекращения, за исключением
            правовых обязательств, предусматривающих более длительные
            периоды хранения.
          </>
        ),
      },
      {
        h: "9. Права субъекта данных",
        body: (
          <>
            В любой момент субъект данных может осуществить права,
            предусмотренные статьями с 15 по 22 GDPR: право на доступ,
            исправление, удаление, ограничение обработки, переносимость
            данных, возражение против обработки и право не быть подвергнутым
            автоматизированным решениям. Запросы могут быть отправлены на
            адрес{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>{" "}
            и будут обработаны в течение одного месяца с момента получения,
            с возможностью продления на два месяца для особо сложных
            запросов.
          </>
        ),
      },
      {
        h: "10. Жалоба в надзорный орган",
        body: (
          <>
            Субъект данных, считающий, что обработка его персональных
            данных нарушает GDPR, имеет право подать жалобу в Итальянское
            управление по защите данных (Garante per la protezione dei dati
            personali), расположенное по адресу Piazza Venezia 11, 00187
            Рим, или онлайн через сайт{" "}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.garanteprivacy.it
            </a>
            .
          </>
        ),
      },
      {
        h: "11. Изменения в уведомлении",
        body: (
          <>
            Настоящее уведомление может быть обновлено в случае
            нормативных изменений или новых методов обработки данных.
            Наиболее актуальная версия всегда будет доступна на этой
            странице с указанием даты последнего обновления, отображённой
            в начале документа.
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

export default async function PrivacyPolicyPage({
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
