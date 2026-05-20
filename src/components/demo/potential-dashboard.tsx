"use client";

import { useLocale } from "next-intl";
import {
  TrendingUp,
  Euro,
  Sparkles,
  AlertCircle,
  BarChart3,
  Database,
} from "lucide-react";

type Locale = "it" | "en" | "ru";

type MonthlyRow = {
  m: { it: string; en: string; ru: string };
  argegnoMedian: number;
  argegnoSampleN: number;
  targetAdr: number;
  days: number;
};

const MONTHLY: MonthlyRow[] = [
  { m: { it: "Gen", en: "Jan", ru: "Янв" }, argegnoMedian: 192, argegnoSampleN: 63, targetAdr: 192, days: 31 },
  { m: { it: "Feb", en: "Feb", ru: "Фев" }, argegnoMedian: 207, argegnoSampleN: 50, targetAdr: 207, days: 28 },
  { m: { it: "Mar", en: "Mar", ru: "Мар" }, argegnoMedian: 208, argegnoSampleN: 49, targetAdr: 208, days: 31 },
  { m: { it: "Apr", en: "Apr", ru: "Апр" }, argegnoMedian: 212, argegnoSampleN: 61, targetAdr: 212, days: 30 },
  { m: { it: "Mag", en: "May", ru: "Май" }, argegnoMedian: 220, argegnoSampleN: 38, targetAdr: 220, days: 31 },
  { m: { it: "Giu", en: "Jun", ru: "Июн" }, argegnoMedian: 249, argegnoSampleN: 31, targetAdr: 249, days: 30 },
  { m: { it: "Lug", en: "Jul", ru: "Июл" }, argegnoMedian: 256, argegnoSampleN: 31, targetAdr: 256, days: 31 },
  { m: { it: "Ago", en: "Aug", ru: "Авг" }, argegnoMedian: 267, argegnoSampleN: 29, targetAdr: 267, days: 31 },
  { m: { it: "Set", en: "Sep", ru: "Сен" }, argegnoMedian: 242, argegnoSampleN: 51, targetAdr: 242, days: 30 },
  { m: { it: "Ott", en: "Oct", ru: "Окт" }, argegnoMedian: 193, argegnoSampleN: 58, targetAdr: 193, days: 31 },
  { m: { it: "Nov", en: "Nov", ru: "Ноя" }, argegnoMedian: 208, argegnoSampleN: 63, targetAdr: 208, days: 30 },
  { m: { it: "Dic", en: "Dec", ru: "Дек" }, argegnoMedian: 209, argegnoSampleN: 56, targetAdr: 209, days: 31 },
];

const MAX_ADR = Math.max(...MONTHLY.map((m) => m.targetAdr));
const PEAK_MONTH = MONTHLY.find((m) => m.targetAdr === MAX_ADR)!;
const TOTAL_SAMPLE = MONTHLY.reduce((s, m) => s + m.argegnoSampleN, 0);

const OCCUPANCY_SCENARIOS = [50, 60, 70] as const;

type ScenarioRow = {
  occupancy: (typeof OCCUPANCY_SCENARIOS)[number];
  monthly: { nights: number; revenue: number }[];
  totalNights: number;
  totalRevenue: number;
};

const SCENARIOS: ScenarioRow[] = OCCUPANCY_SCENARIOS.map((occ) => {
  const monthly = MONTHLY.map((row) => {
    const nights = Math.round((row.days * occ) / 100);
    return { nights, revenue: nights * row.targetAdr };
  });
  const totalNights = monthly.reduce((s, r) => s + r.nights, 0);
  const totalRevenue = monthly.reduce((s, r) => s + r.revenue, 0);
  return { occupancy: occ, monthly, totalNights, totalRevenue };
});

const BASE_SCENARIO = SCENARIOS.find((s) => s.occupancy === 60)!;
const BLENDED_ADR = Math.round(
  BASE_SCENARIO.totalRevenue / BASE_SCENARIO.totalNights,
);

const ARGEGNO_BLENDED_MEDIAN = Math.round(
  MONTHLY.reduce((s, r) => s + r.argegnoMedian, 0) / MONTHLY.length,
);

const COPY: Record<Locale, {
  badge: string;
  heading: string;
  intro: (sample: number) => React.ReactNode;
  kpiAdr: string;
  kpiAdrSub: string;
  kpiRev50: string;
  kpiRev60: string;
  kpiRev70: string;
  scenarioConservative: string;
  scenarioBase: string;
  scenarioPremium: string;
  nightsLabel: string;
  histogramTitle: string;
  histogramPeak: string;
  histogramStandard: string;
  histogramTooltip: string;
  scenarioTableTitle: string;
  scenarioCol50: string;
  scenarioCol60: string;
  scenarioCol70: string;
  scenarioMonth: string;
  scenarioPerNight: string;
  scenarioNights: string;
  scenarioRevenue: string;
  scenarioTotal: string;
  argegnoTableTitle: string;
  argegnoCol1: string;
  argegnoCol2: string;
  argegnoCol3: string;
  argegnoSampleAvg: string;
  methodologyTitle: string;
  methodologyP1: React.ReactNode;
  honestyTitle: string;
  honestyP1: React.ReactNode;
}> = {
  it: {
    badge: "Demo · Valutazione potenziale di rendita",
    heading: "Casa del Pozzo — proiezione annua",
    intro: (sample) => (
      <>
        Benchmark costruito su <strong>{sample} prezzi reali</strong>{" "}
        raccolti dai listing degli altri proprietari di Argegno attivi su
        Airbnb, una settimana di riferimento per ogni mese da giugno 2026 a
        maggio 2027. Per ogni mese prendiamo la{" "}
        <strong>mediana €/notte di Argegno</strong> e la usiamo come prezzo
        target per Casa del Pozzo: l&apos;obiettivo è restare{" "}
        <strong>in linea col mercato standard del comune</strong>, coerente
        con un primo anno di operatività dove serve volume di booking per
        accumulare recensioni e reputazione. Le pulizie sono fatturate al
        guest separatamente a <strong>€70 per prenotazione</strong>{" "}
        (pass-through, non riportate nei revenue lordi qui sotto).
      </>
    ),
    kpiAdr: "ADR medio annuo target",
    kpiAdrSub: "In linea con mediana mercato Argegno",
    kpiRev50: "Revenue lordo @ 50%",
    kpiRev60: "Revenue lordo @ 60%",
    kpiRev70: "Revenue lordo @ 70%",
    scenarioConservative: "scenario conservativo",
    scenarioBase: "scenario base",
    scenarioPremium: "scenario premium",
    nightsLabel: "notti",
    histogramTitle: "Prezzo target Casa del Pozzo — distribuzione mensile",
    histogramPeak: `Picco stagionale (€${MAX_ADR}/notte · agosto)`,
    histogramStandard: "Mesi standard",
    histogramTooltip: "Tooltip su ogni barra mostra mediana Argegno + sample size",
    scenarioTableTitle: "Revenue lordo per scenario di occupancy",
    scenarioCol50: "Scenario 50%",
    scenarioCol60: "Scenario 60%",
    scenarioCol70: "Scenario 70%",
    scenarioMonth: "Mese",
    scenarioPerNight: "€/notte",
    scenarioNights: "Notti",
    scenarioRevenue: "Revenue",
    scenarioTotal: "Totale annuo",
    argegnoTableTitle: "Mediana €/notte Argegno — dati dai listing Airbnb del paese",
    argegnoCol1: "# listing Argegno",
    argegnoCol2: "Mediana €/notte Argegno",
    argegnoCol3: "Target Casa del Pozzo",
    argegnoSampleAvg: "Media campione",
    methodologyTitle: "Come abbiamo ricavato il prezzo medio per notte.",
    methodologyP1: (
      <>
        Per stimare quanto può rendere Casa del Pozzo siamo partiti dai
        prezzi che gli altri proprietari di Argegno stanno applicando in
        questo momento per le loro case in affitto breve su Airbnb. Per ogni
        mese abbiamo raccolto le quotazioni reali di decine di appartamenti
        del paese — dalla bassa stagione al picco di agosto — e abbiamo
        preso il prezzo mediano: cioè il valore centrale che rappresenta il
        mercato senza farsi influenzare dagli estremi (le ville di lusso in
        alto, gli affitti più economici in basso). Quel valore è il prezzo
        che proponiamo per Casa del Pozzo, in linea col mercato standard di
        Argegno e pensato per il primo anno di operatività dove
        l&apos;obiettivo è guadagnare booking e accumulare recensioni
        positive.
      </>
    ),
    honestyTitle: "Una stima onesta, non una promessa.",
    honestyP1: (
      <>
        I numeri che vedi qui sopra sono una proiezione costruita sui dati
        reali del mercato Argegno di oggi: ogni euro che proponiamo è
        ancorato a quello che gli host della tua zona stanno effettivamente
        facendo sulla piattaforma. Detto questo vogliamo essere trasparenti:
        nessuno può promettere con certezza quanto renderà una casa
        l&apos;anno prossimo. I prezzi cambiano ogni giorno, e
        l&apos;occupazione dipende anche da qualità delle foto, tempistica
        di pubblicazione, prime recensioni ed eventi sul lago. Per questo
        abbiamo presentato tre scenari (50%, 60%, 70% di occupazione media)
        che coprono l&apos;intero range plausibile, dal più prudente al più
        ottimistico. Dopo i primi 3-6 mesi di booking reali ricaliberemo
        insieme i numeri sui dati che entreranno davvero.
      </>
    ),
  },
  en: {
    badge: "Demo · Revenue potential analysis",
    heading: "Casa del Pozzo — annual projection",
    intro: (sample) => (
      <>
        Benchmark built on <strong>{sample} real prices</strong> collected
        from other Argegno owners currently active on Airbnb, one reference
        week per month from June 2026 to May 2027. For each month we take
        the <strong>median €/night for Argegno</strong> and use it as the
        target price for Casa del Pozzo: the goal is to stay{" "}
        <strong>in line with the standard market of the village</strong>,
        consistent with a first year of operation where you need booking
        volume to build up reviews and reputation. Cleanings are charged to
        the guest separately at <strong>€70 per booking</strong>{" "}
        (pass-through, not included in the gross revenue below).
      </>
    ),
    kpiAdr: "Target annual ADR",
    kpiAdrSub: "In line with Argegno market median",
    kpiRev50: "Gross revenue @ 50%",
    kpiRev60: "Gross revenue @ 60%",
    kpiRev70: "Gross revenue @ 70%",
    scenarioConservative: "conservative scenario",
    scenarioBase: "base scenario",
    scenarioPremium: "premium scenario",
    nightsLabel: "nights",
    histogramTitle: "Casa del Pozzo target price — monthly distribution",
    histogramPeak: `Seasonal peak (€${MAX_ADR}/night · August)`,
    histogramStandard: "Standard months",
    histogramTooltip: "Hover each bar to see Argegno median + sample size",
    scenarioTableTitle: "Gross revenue per occupancy scenario",
    scenarioCol50: "Scenario 50%",
    scenarioCol60: "Scenario 60%",
    scenarioCol70: "Scenario 70%",
    scenarioMonth: "Month",
    scenarioPerNight: "€/night",
    scenarioNights: "Nights",
    scenarioRevenue: "Revenue",
    scenarioTotal: "Annual total",
    argegnoTableTitle: "Median €/night for Argegno — data from local Airbnb listings",
    argegnoCol1: "# Argegno listings",
    argegnoCol2: "Argegno median €/night",
    argegnoCol3: "Casa del Pozzo target",
    argegnoSampleAvg: "Sample average",
    methodologyTitle: "How we calculated the average price per night.",
    methodologyP1: (
      <>
        To estimate how much Casa del Pozzo can earn, we started from the
        prices the other Argegno owners are currently charging for their
        short-term rentals on Airbnb. For every month we collected the real
        nightly rates of dozens of village apartments — from low season to
        the August peak — and took the median: the central value that
        represents the market without being skewed by the extremes (luxury
        villas at the top, budget rentals at the bottom). That value is the
        price we propose for Casa del Pozzo, in line with the standard
        Argegno market and designed for a first year of operation where the
        goal is winning bookings and accumulating positive reviews.
      </>
    ),
    honestyTitle: "An honest estimate, not a promise.",
    honestyP1: (
      <>
        The numbers above are a projection built on real market data from
        Argegno today: every euro we propose is anchored to what hosts in
        your area are actually doing on the platform. That said, we want to
        be transparent: nobody can promise with certainty how much a home
        will earn next year. Prices change daily, and occupancy also
        depends on photo quality, listing timing, early reviews and lake
        events. That&apos;s why we present three scenarios (50%, 60%, 70%
        average occupancy) covering the plausible range, from cautious to
        optimistic. After the first 3-6 months of real bookings we&apos;ll
        recalibrate the numbers together using the data that actually
        comes in.
      </>
    ),
  },
  ru: {
    badge: "Демо · Оценка потенциала дохода",
    heading: "Casa del Pozzo — годовой прогноз",
    intro: (sample) => (
      <>
        Бенчмарк построен на <strong>{sample} реальных ценах</strong>,
        собранных с объявлений других владельцев в Ардженьо, активных на
        Airbnb сейчас: по одной справочной неделе на каждый месяц с июня
        2026 по май 2027. Для каждого месяца берём{" "}
        <strong>медианную цену €/ночь в Ардженьо</strong> и используем её
        как целевую цену для Casa del Pozzo: цель — оставаться{" "}
        <strong>в линии со стандартным рынком коммуны</strong>, что логично
        для первого года работы, когда нужен объём бронирований для
        накопления отзывов и репутации. Уборка оплачивается гостем отдельно{" "}
        <strong>€70 за бронирование</strong> (passthrough, не учтена в
        валовом доходе ниже).
      </>
    ),
    kpiAdr: "Целевой средний ADR в год",
    kpiAdrSub: "В линии с медианой рынка Ардженьо",
    kpiRev50: "Валовый доход @ 50%",
    kpiRev60: "Валовый доход @ 60%",
    kpiRev70: "Валовый доход @ 70%",
    scenarioConservative: "консервативный сценарий",
    scenarioBase: "базовый сценарий",
    scenarioPremium: "премиальный сценарий",
    nightsLabel: "ночей",
    histogramTitle: "Целевая цена Casa del Pozzo — распределение по месяцам",
    histogramPeak: `Сезонный пик (€${MAX_ADR}/ночь · август)`,
    histogramStandard: "Стандартные месяцы",
    histogramTooltip: "Наведите на столбец, чтобы увидеть медиану Ардженьо и размер выборки",
    scenarioTableTitle: "Валовый доход по сценариям загрузки",
    scenarioCol50: "Сценарий 50%",
    scenarioCol60: "Сценарий 60%",
    scenarioCol70: "Сценарий 70%",
    scenarioMonth: "Месяц",
    scenarioPerNight: "€/ночь",
    scenarioNights: "Ночей",
    scenarioRevenue: "Доход",
    scenarioTotal: "Итого за год",
    argegnoTableTitle: "Медианная цена €/ночь в Ардженьо — данные из объявлений Airbnb коммуны",
    argegnoCol1: "# объявлений Ардженьо",
    argegnoCol2: "Медиана €/ночь Ардженьо",
    argegnoCol3: "Цель Casa del Pozzo",
    argegnoSampleAvg: "Среднее по выборке",
    methodologyTitle: "Как мы рассчитали среднюю цену за ночь.",
    methodologyP1: (
      <>
        Чтобы оценить, сколько может зарабатывать Casa del Pozzo, мы
        отправились от цен, которые другие владельцы в Ардженьо в данный
        момент устанавливают для своих краткосрочных аренд на Airbnb. Для
        каждого месяца мы собрали реальные расценки за ночь по десяткам
        квартир деревни — от низкого сезона до августовского пика — и взяли
        медиану: центральное значение, которое представляет рынок, не
        перекошённое крайними значениями (роскошные виллы сверху, бюджетная
        аренда снизу). Это значение мы и предлагаем как цену для Casa del
        Pozzo: в линии со стандартным рынком Ардженьо и рассчитанная на
        первый год работы, где цель — выиграть бронирования и накопить
        положительные отзывы.
      </>
    ),
    honestyTitle: "Честная оценка, а не обещание.",
    honestyP1: (
      <>
        Цифры выше — это прогноз, построенный на реальных рыночных данных
        Ардженьо сегодня: каждый евро, который мы предлагаем, привязан к
        тому, что хосты в вашем районе действительно делают на платформе.
        При этом хотим быть прозрачными: никто не может с уверенностью
        обещать, сколько дом будет приносить в следующем году. Цены меняются
        ежедневно, а загрузка зависит также от качества фотографий, времени
        публикации объявления, первых отзывов и событий на озере. Поэтому
        мы представили три сценария (50%, 60%, 70% средней загрузки),
        охватывающих весь разумный диапазон — от осторожного до
        оптимистичного. После первых 3-6 месяцев реальных бронирований мы
        вместе пересчитаем цифры на фактически поступивших данных.
      </>
    ),
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        accent
          ? "bg-primary text-white border-primary"
          : "bg-white border-border/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            accent ? "bg-white/15" : "bg-primary/[0.08]"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${accent ? "text-white" : "text-primary"}`}
          />
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-white/85" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        className={`text-2xl sm:text-3xl font-bold mb-1 ${
          accent ? "" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div
          className={`text-xs ${accent ? "text-white/85" : "text-muted-foreground"}`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function PotentialDashboard() {
  const locale = (useLocale() as Locale) ?? "it";
  const t = COPY[locale] ?? COPY.it;
  const numFmt = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "it-IT";
  const peakLabel = PEAK_MONTH.m[locale] ?? PEAK_MONTH.m.it;
  // Replace "agosto/August/август" placeholder in localized strings.
  const peakLine = t.histogramPeak.replace(
    /(agosto|August|август)/i,
    peakLabel,
  );

  return (
    <section className="bg-white rounded-2xl border border-border/50 p-5 sm:p-8 mt-8">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.08] text-primary text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          {t.badge}
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          {t.heading}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t.intro(TOTAL_SAMPLE)}
        </p>
      </header>

      {/* KPI top row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={Euro}
          label={t.kpiAdr}
          value={`€${BLENDED_ADR}`}
          sub={t.kpiAdrSub}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label={t.kpiRev50}
          value={`€${SCENARIOS[0].totalRevenue.toLocaleString(numFmt)}`}
          sub={`${SCENARIOS[0].totalNights} ${t.nightsLabel} · ${t.scenarioConservative}`}
        />
        <StatCard
          icon={TrendingUp}
          label={t.kpiRev60}
          value={`€${SCENARIOS[1].totalRevenue.toLocaleString(numFmt)}`}
          sub={`${SCENARIOS[1].totalNights} ${t.nightsLabel} · ${t.scenarioBase}`}
        />
        <StatCard
          icon={TrendingUp}
          label={t.kpiRev70}
          value={`€${SCENARIOS[2].totalRevenue.toLocaleString(numFmt)}`}
          sub={`${SCENARIOS[2].totalNights} ${t.nightsLabel} · ${t.scenarioPremium}`}
        />
      </div>

      {/* Monthly ADR histogram */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t.histogramTitle}
          </h3>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-b from-primary/[0.02] to-transparent p-5 sm:p-6">
          <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-64">
            {MONTHLY.map((row) => {
              const heightPct = Math.round((row.targetAdr / MAX_ADR) * 100);
              const isPeak = row.targetAdr === MAX_ADR;
              const monthLabel = row.m[locale] ?? row.m.it;
              return (
                <div
                  key={monthLabel}
                  className="flex flex-col items-center justify-end h-full gap-1.5 group"
                >
                  <span className="text-[10px] sm:text-xs font-semibold tabular-nums text-foreground">
                    €{row.targetAdr}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isPeak
                        ? "bg-primary"
                        : "bg-primary/40 group-hover:bg-primary/70"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${monthLabel}: €${row.targetAdr} · n=${row.argegnoSampleN}`}
                  />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {monthLabel}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              {peakLine}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
              {t.histogramStandard}
            </span>
            <span className="ml-auto">{t.histogramTooltip}</span>
          </div>
        </div>
      </div>

      {/* Occupancy scenario table */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          {t.scenarioTableTitle}
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">{t.scenarioMonth}</th>
                <th className="px-3 py-3 font-semibold text-right">
                  {t.scenarioPerNight}
                </th>
                <th
                  className="px-3 py-3 font-semibold text-right border-l border-border/30"
                  colSpan={2}
                >
                  {t.scenarioCol50}
                </th>
                <th
                  className="px-3 py-3 font-semibold text-right border-l border-border/30"
                  colSpan={2}
                >
                  {t.scenarioCol60}
                </th>
                <th
                  className="px-3 py-3 font-semibold text-right border-l border-border/30"
                  colSpan={2}
                >
                  {t.scenarioCol70}
                </th>
              </tr>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-t border-border/30">
                <th />
                <th />
                <th className="px-3 py-2 text-right border-l border-border/30">
                  {t.scenarioNights}
                </th>
                <th className="px-3 py-2 text-right">{t.scenarioRevenue}</th>
                <th className="px-3 py-2 text-right border-l border-border/30">
                  {t.scenarioNights}
                </th>
                <th className="px-3 py-2 text-right">{t.scenarioRevenue}</th>
                <th className="px-3 py-2 text-right border-l border-border/30">
                  {t.scenarioNights}
                </th>
                <th className="px-3 py-2 text-right">{t.scenarioRevenue}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {MONTHLY.map((row, idx) => {
                const monthLabel = row.m[locale] ?? row.m.it;
                return (
                  <tr key={monthLabel} className="hover:bg-muted/20">
                    <td className="px-3 py-3 font-medium">{monthLabel}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      €{row.targetAdr}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums border-l border-border/30 text-muted-foreground">
                      {SCENARIOS[0].monthly[idx].nights}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      €
                      {SCENARIOS[0].monthly[idx].revenue.toLocaleString(numFmt)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums border-l border-border/30 text-muted-foreground">
                      {SCENARIOS[1].monthly[idx].nights}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      €
                      {SCENARIOS[1].monthly[idx].revenue.toLocaleString(numFmt)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums border-l border-border/30 text-muted-foreground">
                      {SCENARIOS[2].monthly[idx].nights}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      €
                      {SCENARIOS[2].monthly[idx].revenue.toLocaleString(numFmt)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-primary/[0.04] font-semibold">
                <td className="px-3 py-3" colSpan={2}>
                  {t.scenarioTotal}
                </td>
                <td className="px-3 py-3 text-right tabular-nums border-l border-border/30">
                  {SCENARIOS[0].totalNights}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  €{SCENARIOS[0].totalRevenue.toLocaleString(numFmt)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums border-l border-border/30">
                  {SCENARIOS[1].totalNights}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-primary">
                  €{SCENARIOS[1].totalRevenue.toLocaleString(numFmt)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums border-l border-border/30">
                  {SCENARIOS[2].totalNights}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-primary">
                  €{SCENARIOS[2].totalRevenue.toLocaleString(numFmt)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Argegno scraped data table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t.argegnoTableTitle}
          </h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">{t.scenarioMonth}</th>
                <th className="px-3 py-3 font-semibold text-right">
                  {t.argegnoCol1}
                </th>
                <th className="px-3 py-3 font-semibold text-right">
                  {t.argegnoCol2}
                </th>
                <th className="px-3 py-3 font-semibold text-right">
                  {t.argegnoCol3}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {MONTHLY.map((row) => {
                const monthLabel = row.m[locale] ?? row.m.it;
                return (
                  <tr key={monthLabel} className="hover:bg-muted/20">
                    <td className="px-3 py-3 font-medium">{monthLabel}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                      {row.argegnoSampleN}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      €{row.argegnoMedian}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-primary">
                      €{row.targetAdr}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-muted/30 font-semibold">
                <td className="px-3 py-3">{t.argegnoSampleAvg}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {Math.round(TOTAL_SAMPLE / MONTHLY.length)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  €{ARGEGNO_BLENDED_MEDIAN}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-primary">
                  €{BLENDED_ADR}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Informational note for owners */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-900 leading-relaxed space-y-3">
          <p>
            <strong>{t.methodologyTitle}</strong> {t.methodologyP1}
          </p>
          <p>
            <strong>{t.honestyTitle}</strong> {t.honestyP1}
          </p>
        </div>
      </div>
    </section>
  );
}
