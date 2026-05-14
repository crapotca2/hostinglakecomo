import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

const COPY = {
  it: {
    docTitle: "Cookie Policy",
    description:
      "Informativa sui cookie utilizzati sul sito Host Como ai sensi delle linee guida del Garante Privacy del 10 giugno 2021.",
    eyebrow: "Informativa Cookie",
    title1: "Cookie",
    title2: "Policy",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdated: "5 maggio 2026",
    intro: (
      <>
        La presente Cookie Policy descrive le tipologie di cookie e di
        tecnologie analoghe utilizzate sul sito{" "}
        <strong>hostcomo.com</strong> e le finalità per cui vengono impiegate.
        Il documento integra l&apos;
        <a href="/privacy" className="text-primary hover:underline">
          informativa privacy
        </a>{" "}
        ed è redatto in conformità alle linee guida del Garante per la
        protezione dei dati personali del 10 giugno 2021 e all&apos;art. 122
        del D.Lgs. 196/2003.
      </>
    ),
    sections: [
      {
        h: "1. Cosa sono i cookie",
        body: (
          <>
            I cookie sono piccoli file di testo che i siti visitati salvano sul
            dispositivo dell&apos;utente per ricordare informazioni utili al
            funzionamento del servizio o per raccogliere statistiche aggregate
            sull&apos;utilizzo del sito. La normativa distingue tra cookie
            tecnici (necessari al funzionamento del sito, non richiedono
            consenso) e cookie di profilazione o analitici di terze parti
            (richiedono consenso preventivo dell&apos;utente).
          </>
        ),
      },
      {
        h: "2. Cookie tecnici utilizzati",
        body: (
          <>
            <p>
              Il Sito utilizza esclusivamente cookie tecnici di sessione e di
              routing, necessari per garantire il corretto funzionamento delle
              pagine, mantenere lo stato di autenticazione degli utenti
              dell&apos;area clienti e gestire il bilanciamento del traffico
              verso i datacenter del fornitore di hosting Vercel. Questi cookie
              non tracciano l&apos;attività dell&apos;utente al di fuori del
              Sito e non sono utilizzati per finalità di profilazione.
            </p>
            <p className="mt-4">
              Nello specifico vengono impostati cookie di sessione di NextAuth
              per gli utenti che accedono all&apos;area riservata, cookie di
              preferenza tema (light/dark) salvati localmente e cookie di
              routing tecnici di Vercel. La durata di tali cookie è limitata
              alla sessione di navigazione o al massimo a trenta giorni per le
              preferenze persistenti.
            </p>
          </>
        ),
      },
      {
        h: "3. Cookie analitici e di profilazione",
        body: (
          <>
            Al momento il Sito non utilizza cookie analitici, di profilazione o
            di marketing di alcun tipo. Non sono attivi strumenti come Google
            Analytics, Vercel Analytics, Meta Pixel o simili. In caso di
            adozione futura di tali strumenti la presente informativa sarà
            aggiornata e verrà richiesto il consenso preventivo dell&apos;utente
            tramite il banner cookie presente sul Sito.
          </>
        ),
      },
      {
        h: "4. Cookie di terze parti",
        body: (
          <>
            L&apos;unica eccezione riguarda l&apos;autenticazione degli utenti
            dell&apos;area clienti tramite Google OAuth: il flusso di login
            comporta una redirezione temporanea verso i server Google, durante
            la quale Google può impostare propri cookie tecnici. Tali cookie
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
          </>
        ),
      },
      {
        h: "5. Come gestire o disabilitare i cookie",
        body: (
          <>
            <p>
              L&apos;utente può gestire le preferenze sui cookie tramite il
              banner di consenso presente sul Sito alla prima visita o
              cliccando sul link &quot;Gestisci cookie&quot; nel piede di
              pagina. In aggiunta è sempre possibile disabilitare i cookie
              direttamente dalle impostazioni del proprio browser; va tuttavia
              ricordato che la disattivazione dei cookie tecnici può
              compromettere il corretto funzionamento del Sito, in particolare
              l&apos;accesso all&apos;area clienti.
            </p>
            <p className="mt-4">
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
          </>
        ),
      },
      {
        h: "6. Riferimenti normativi",
        body: (
          <>
            La presente policy è redatta in conformità al Regolamento UE
            2016/679 (GDPR), al D.Lgs. 196/2003 modificato dal D.Lgs. 101/2018
            e alle linee guida del Garante per la protezione dei dati
            personali del 10 giugno 2021 in materia di cookie e altri
            strumenti di tracciamento (provvedimento n. 231 del 10 giugno
            2021, pubblicato in G.U. n. 163 del 9 luglio 2021).
          </>
        ),
      },
      {
        h: "7. Contatti e modifiche",
        body: (
          <>
            Per qualunque richiesta relativa alla presente Cookie Policy è
            possibile scrivere a{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            . La presente informativa può essere aggiornata in qualunque
            momento; la versione vigente è sempre disponibile su questa pagina
            con indicazione della data di ultimo aggiornamento.
          </>
        ),
      },
    ],
  },
  en: {
    docTitle: "Cookie Policy",
    description:
      "Information on the cookies used on the Host Como website pursuant to the Italian Data Protection Authority's guidelines of 10 June 2021.",
    eyebrow: "Cookie Notice",
    title1: "Cookie",
    title2: "Policy",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "May 5, 2026",
    intro: (
      <>
        This Cookie Policy describes the types of cookies and similar
        technologies used on the website <strong>hostcomo.com</strong> and the
        purposes for which they are employed. The document supplements the{" "}
        <a href="/privacy" className="text-primary hover:underline">
          privacy notice
        </a>{" "}
        and is drafted in accordance with the guidelines of the Italian Data
        Protection Authority of 10 June 2021 and with art. 122 of Legislative
        Decree 196/2003.
      </>
    ),
    sections: [
      {
        h: "1. What cookies are",
        body: (
          <>
            Cookies are small text files that visited websites save on the
            user&apos;s device to remember information useful for the operation
            of the service or to collect aggregate statistics on the use of
            the website. The legislation distinguishes between technical
            cookies (necessary for the operation of the site, no consent
            required) and third-party profiling or analytics cookies (require
            prior user consent).
          </>
        ),
      },
      {
        h: "2. Technical cookies used",
        body: (
          <>
            <p>
              The Site uses exclusively technical session and routing cookies,
              necessary to ensure the correct functioning of the pages,
              maintain the authentication state of client area users and
              handle traffic balancing across the Vercel hosting provider
              datacenters. These cookies do not track user activity outside
              the Site and are not used for profiling purposes.
            </p>
            <p className="mt-4">
              Specifically, NextAuth session cookies are set for users
              accessing the reserved area, theme preference cookies (light /
              dark) are saved locally, and Vercel technical routing cookies
              are used. The duration of such cookies is limited to the
              browsing session or at most thirty days for persistent
              preferences.
            </p>
          </>
        ),
      },
      {
        h: "3. Analytics and profiling cookies",
        body: (
          <>
            At present the Site does not use any analytics, profiling or
            marketing cookies. No tools such as Google Analytics, Vercel
            Analytics, Meta Pixel or similar are active. Should such tools be
            adopted in the future, this notice will be updated and the
            user&apos;s prior consent will be requested via the cookie banner
            displayed on the Site.
          </>
        ),
      },
      {
        h: "4. Third-party cookies",
        body: (
          <>
            The only exception concerns the authentication of client area
            users via Google OAuth: the login flow involves a temporary
            redirect to Google servers, during which Google may set its own
            technical cookies. Such cookies are governed by the{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google privacy policy
            </a>{" "}
            and are activated exclusively when the user actively chooses to
            log in via Google.
          </>
        ),
      },
      {
        h: "5. How to manage or disable cookies",
        body: (
          <>
            <p>
              The user can manage cookie preferences through the consent
              banner displayed on the Site on first visit or by clicking the
              &quot;Manage cookies&quot; link in the footer. In addition it is
              always possible to disable cookies directly from the browser
              settings; however, it should be noted that disabling technical
              cookies may impair the correct functioning of the Site, in
              particular access to the client area.
            </p>
            <p className="mt-4">
              Specific instructions on cookie management are available on the
              websites of the main browsers:{" "}
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
                href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mozilla Firefox
              </a>
              ,{" "}
              <a
                href="https://support.apple.com/en-us/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Apple Safari
              </a>
              ,{" "}
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Microsoft Edge
              </a>
              .
            </p>
          </>
        ),
      },
      {
        h: "6. Regulatory references",
        body: (
          <>
            This policy is drafted in accordance with EU Regulation 2016/679
            (GDPR), Italian Legislative Decree 196/2003 as amended by
            Legislative Decree 101/2018, and the guidelines of the Italian
            Data Protection Authority of 10 June 2021 on cookies and other
            tracking tools (measure no. 231 of 10 June 2021, published in
            Official Gazette no. 163 of 9 July 2021).
          </>
        ),
      },
      {
        h: "7. Contacts and amendments",
        body: (
          <>
            For any request relating to this Cookie Policy you may write to{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            . This notice may be updated at any time; the current version is
            always available on this page with the indication of the last
            update date.
          </>
        ),
      },
    ],
  },
  ru: {
    docTitle: "Политика cookies",
    description:
      "Информация о cookies, используемых на сайте Хост Комо в соответствии с руководящими принципами Итальянского управления по защите данных от 10 июня 2021 года.",
    eyebrow: "Уведомление о cookies",
    title1: "Политика",
    title2: "cookies",
    lastUpdatedLabel: "Последнее обновление",
    lastUpdated: "5 мая 2026",
    intro: (
      <>
        Настоящая Политика cookies описывает типы cookies и аналогичных
        технологий, используемых на сайте <strong>hostcomo.com</strong>, и
        цели, для которых они применяются. Документ дополняет{" "}
        <a href="/privacy" className="text-primary hover:underline">
          уведомление о конфиденциальности
        </a>{" "}
        и составлен в соответствии с руководящими принципами Итальянского
        управления по защите данных от 10 июня 2021 года и со ст. 122
        Законодательного декрета 196/2003.
      </>
    ),
    sections: [
      {
        h: "1. Что такое cookies",
        body: (
          <>
            Cookies — это небольшие текстовые файлы, которые посещаемые сайты
            сохраняют на устройстве пользователя для запоминания информации,
            полезной для работы сервиса, или для сбора агрегированной
            статистики по использованию сайта. Законодательство различает
            технические cookies (необходимые для работы сайта, не требуют
            согласия) и профилирующие или аналитические cookies третьих
            сторон (требуют предварительного согласия пользователя).
          </>
        ),
      },
      {
        h: "2. Используемые технические cookies",
        body: (
          <>
            <p>
              Сайт использует исключительно технические cookies сессии и
              маршрутизации, необходимые для обеспечения корректной работы
              страниц, поддержания состояния аутентификации пользователей
              клиентского раздела и управления балансировкой трафика между
              датацентрами хостинг-провайдера Vercel. Эти cookies не
              отслеживают активность пользователя за пределами Сайта и не
              используются для целей профилирования.
            </p>
            <p className="mt-4">
              В частности, устанавливаются cookies сессии NextAuth для
              пользователей, имеющих доступ к закрытому разделу, cookies
              предпочтения темы (светлая/тёмная), сохраняемые локально, и
              технические cookies маршрутизации Vercel. Срок действия таких
              cookies ограничен сессией просмотра или максимум тридцатью
              днями для постоянных настроек.
            </p>
          </>
        ),
      },
      {
        h: "3. Аналитические и профилирующие cookies",
        body: (
          <>
            В настоящее время Сайт не использует никаких аналитических,
            профилирующих или маркетинговых cookies. Не активированы
            инструменты, такие как Google Analytics, Vercel Analytics, Meta
            Pixel или аналогичные. В случае будущего внедрения таких
            инструментов настоящее уведомление будет обновлено, и
            предварительное согласие пользователя будет запрашиваться через
            cookie-баннер, отображаемый на Сайте.
          </>
        ),
      },
      {
        h: "4. Cookies третьих сторон",
        body: (
          <>
            Единственное исключение касается аутентификации пользователей
            клиентского раздела через Google OAuth: процесс входа включает
            временное перенаправление на серверы Google, во время которого
            Google может устанавливать свои технические cookies. Такие
            cookies регулируются{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              политикой конфиденциальности Google
            </a>{" "}
            и активируются исключительно когда пользователь активно
            выбирает вход через Google.
          </>
        ),
      },
      {
        h: "5. Как управлять или отключить cookies",
        body: (
          <>
            <p>
              Пользователь может управлять настройками cookies через баннер
              согласия, отображаемый на Сайте при первом посещении, или
              нажав на ссылку «Управление cookies» в нижнем колонтитуле.
              Кроме того, всегда можно отключить cookies напрямую из
              настроек браузера; однако следует помнить, что отключение
              технических cookies может нарушить корректную работу Сайта, в
              частности доступ к клиентскому разделу.
            </p>
            <p className="mt-4">
              Конкретные инструкции по управлению cookies доступны на сайтах
              основных браузеров:{" "}
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
                href="https://support.mozilla.org/ru/kb/vklyuchenie-i-otklyuchenie-cookie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mozilla Firefox
              </a>
              ,{" "}
              <a
                href="https://support.apple.com/ru-ru/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Apple Safari
              </a>
              ,{" "}
              <a
                href="https://support.microsoft.com/ru-ru/microsoft-edge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Microsoft Edge
              </a>
              .
            </p>
          </>
        ),
      },
      {
        h: "6. Нормативные ссылки",
        body: (
          <>
            Настоящая политика составлена в соответствии с Регламентом ЕС
            2016/679 (GDPR), Законодательным декретом Италии 196/2003 с
            изменениями, внесёнными Законодательным декретом 101/2018, и
            руководящими принципами Итальянского управления по защите
            данных от 10 июня 2021 года по cookies и другим инструментам
            отслеживания (мера № 231 от 10 июня 2021 года, опубликованная в
            Официальной газете № 163 от 9 июля 2021 года).
          </>
        ),
      },
      {
        h: "7. Контакты и изменения",
        body: (
          <>
            По любому вопросу, касающемуся настоящей Политики cookies, можно
            писать на адрес{" "}
            <a
              href="mailto:info@hostcomo.com"
              className="text-primary hover:underline"
            >
              info@hostcomo.com
            </a>
            . Настоящее уведомление может быть обновлено в любое время;
            актуальная версия всегда доступна на этой странице с указанием
            даты последнего обновления.
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

export default async function CookiePolicyPage({
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
