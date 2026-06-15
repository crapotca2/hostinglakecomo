import { notFound } from "next/navigation";
import {
  ScrollText,
  Recycle,
  Baby,
  Video,
  Receipt,
  Siren,
  KeyRound,
  Phone,
  Pill,
  Headphones,
  Mail,
  MessageCircle,
  Globe,
  LogIn,
} from "lucide-react";
import { collections } from "@/lib/mongodb/collections";
import {
  pickLocalized,
  DEFAULT_LOCALE,
  isSupportedLocale,
} from "@/lib/welcome-book/i18n";
import type { SupportedLocale, HouseGuideDoc, WelcomeBookDoc, WelcomeBookContact, PharmacyShift } from "@/types/database";
import type { Locale } from "@/i18n/routing";
import { getPortfolioEntry } from "@/lib/portfolio";
import { BrandHero } from "@/components/welcome-book/BrandDecorations";
import { LocaleSwitcher } from "@/components/welcome-book/LocaleSwitcher";
import { HubNav } from "@/components/welcome-book/HubNav";
import { HeroWifiInline } from "@/components/welcome-book/HeroWifiInline";
import { TileCard } from "@/components/welcome-book/TileCard";
import { sharedLabel } from "@/components/welcome-book/sharedLabels";
import { ReviewBlock } from "@/components/welcome-book/ReviewBlock";
import { TexturedSection, GroupHeader } from "@/components/welcome-book/TexturedSection";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string; locale: Locale };
  searchParams: { lang?: string };
}

export default async function InfoUtiliPage({ params, searchParams }: PageProps) {
  const { slug, locale: routeLocale } = params;
  const { lang } = searchParams;
  const locale: SupportedLocale = isSupportedLocale(lang)
    ? lang
    : (routeLocale as SupportedLocale);

  const guidesCol = await collections.houseGuides();
  const guide = (await guidesCol.findOne({ propertySlug: slug })) as HouseGuideDoc | null;
  if (!guide) return notFound();

  const wbCol = await collections.welcomeBooks();
  const wb = (await wbCol.findOne({ propertySlug: slug })) as WelcomeBookDoc | null;

  const portfolioEntry = getPortfolioEntry(slug);
  const propertyName = portfolioEntry?.name ?? "Aqua Vista";
  const propertyCity = portfolioEntry?.address.city ?? "Argegno";

  const t = (text: Parameters<typeof pickLocalized>[0]) => pickLocalized(text, locale, DEFAULT_LOCALE);
  const hostEntry = guide.sections.emergencies.find((e: WelcomeBookContact) => e.category === "host");
  const hostPhone = hostEntry?.phone;
  const hostWhatsapp = hostEntry?.whatsapp && !hostEntry.whatsapp.includes("DA_INSERIRE")
    ? hostEntry.whatsapp
    : undefined;
  const hostNotes = hostEntry?.notes ? t(hostEntry.notes) : undefined;
  const hostEmail = "info@hostcomo.com";

  const basePath = `/properties/${slug}/welcome/info-utili`;

  const taxModal = (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">{label("tax", locale)}</h2>
      <p className="text-3xl font-extrabold text-[#1D3A62]">
        €{guide.sections.touristTax.eurPerPersonPerNight.toFixed(2)}
        <span className="text-base font-medium text-slate-600 ml-2">
          / {label("perPersonPerNight", locale)}
        </span>
      </p>
      {guide.sections.touristTax.seasonPeriod && (
        <p className="mt-4 text-sm text-slate-700 leading-relaxed">
          {t(guide.sections.touristTax.seasonPeriod)}
        </p>
      )}
      {guide.sections.touristTax.exemptions && (
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
          {t(guide.sections.touristTax.exemptions)}
        </p>
      )}
      {guide.sections.touristTax.paymentMethod && (
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
          {t(guide.sections.touristTax.paymentMethod)}
        </p>
      )}
    </div>
  );

  const textModal = (title: string, body: string) => (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
      <RichBody body={body} />
    </div>
  );

  const emergenciesModal = (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Siren className="w-6 h-6 text-red-600" />
        {label("emergencies", locale)}
      </h2>
      <div className="rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-4 sm:p-5">
        <div className="space-y-3">
          {guide.sections.emergencies.map((c: WelcomeBookContact, i: number) => (
            <div
              key={i}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-red-100 last:border-0 pb-3 last:pb-0"
            >
              <span className="font-bold text-slate-900">{c.name}</span>
              {c.phone && (
                <a
                  href={`tel:${c.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white font-mono text-sm font-bold hover:bg-red-700"
                >
                  <Phone className="w-3 h-3" />
                  {c.phone}
                </a>
              )}
              {c.address && <span className="text-sm text-slate-600">— {c.address}</span>}
              {c.notes && (
                <p className="basis-full text-sm text-slate-700 mt-1">{t(c.notes)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const hostComoModal = (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
        <Headphones className="w-6 h-6 text-[#1D3A62]" />
        {label("hostComo", locale)}
      </h2>
      <p className="text-sm text-slate-600 mb-5">{label("hostComoTagline", locale)}</p>

      <div className="space-y-3">
        {hostPhone && (
          <a
            href={`tel:${hostPhone.replace(/\s+/g, "")}`}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[#1D3A62] to-[#2E5A8C] text-white hover:from-[#2E5A8C] hover:to-[#1D3A62] transition-colors"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 ring-1 ring-white/30 flex-shrink-0">
              <Phone className="w-5 h-5" strokeWidth={2.2} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide font-semibold text-white/80">
                {label("call", locale)}
              </p>
              <p className="font-mono font-bold text-base sm:text-lg whitespace-nowrap">{hostPhone}</p>
            </div>
          </a>
        )}

        {hostWhatsapp && (
          <a
            href={`https://wa.me/${hostWhatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-colors"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white flex-shrink-0">
              <MessageCircle className="w-5 h-5" strokeWidth={2.2} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700/80">
                WhatsApp
              </p>
              <p className="font-mono font-bold text-base sm:text-lg whitespace-nowrap">{hostWhatsapp}</p>
            </div>
          </a>
        )}

        <a
          href={`mailto:${hostEmail}`}
          className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1D3A62] text-white flex-shrink-0">
            <Mail className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Email</p>
            <p className="font-mono font-bold text-sm sm:text-base break-all">{hostEmail}</p>
          </div>
        </a>

        <a
          href="https://hostcomo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1D3A62] text-white flex-shrink-0">
            <Globe className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">
              {label("website", locale)}
            </p>
            <p className="font-bold text-base">hostcomo.com</p>
          </div>
        </a>
      </div>

      {hostNotes && (
        <p className="mt-5 text-sm leading-relaxed text-slate-700 bg-[#E8EDF5] rounded-xl p-4 border border-[#1D3A62]/15">
          {hostNotes}
        </p>
      )}
    </div>
  );

  const pharmaciesModal = wb && wb.sections.emergencyPharmacies && wb.sections.emergencyPharmacies.length > 0 ? (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Pill className="w-6 h-6 text-[#1D3A62]" />
        {label("pharmacies", locale)}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {wb.sections.emergencyPharmacies.map((p: PharmacyShift, i: number) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-bold text-base text-slate-900">{p.pharmacyName}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {p.distanceFromPropertyKm != null && (
                <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-[#E8EDF5] text-[#1D3A62] font-semibold">
                  {p.distanceFromPropertyKm} km
                </span>
              )}
              {p.phone && (
                <a
                  href={`tel:${p.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold"
                >
                  <Phone className="w-3 h-3" /> {p.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <main className="font-[family-name:var(--font-outfit)] bg-white">
      <BrandHero
        eyebrow={`${sharedLabel("guideTo", locale).toUpperCase()} ${propertyCity.toUpperCase()}`}
        title={`${sharedLabel("welcomeTo", locale)} ${propertyName}`}
        heroImage="/images/welcome/aqua-vista-di-splendore/destinations/aqua-vista-spritz.webp"
        wifiBlock={
          <HeroWifiInline
            ssid={guide.sections.wifi.ssid}
            password={guide.sections.wifi.password}
            ssidLabel={sharedLabel("ssid", locale)}
            passwordLabel={sharedLabel("password", locale)}
            scanLabel={sharedLabel("scanToConnect", locale)}
          />
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-4 print:hidden">
        <div className="flex flex-col items-center gap-4">
          <LocaleSwitcher currentLocale={locale} basePath={basePath} centered />
        </div>
      </div>
      <HubNav slug={slug} routeLocale={routeLocale} contentLocale={locale} current="info" />

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        <TexturedSection textured>
          <GroupHeader label={label("groupRules", locale)} onDark />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {guide.sections.checkin && (
              <TileCard
                icon={<LogIn />}
                title={label("checkin", locale)}
                subtitle="14:30 - 21:00"
              >
                {textModal(label("checkin", locale), t(guide.sections.checkin))}
              </TileCard>
            )}
            <TileCard
              icon={<Receipt />}
              title={label("tax", locale)}
              subtitle={`€${guide.sections.touristTax.eurPerPersonPerNight.toFixed(2)}`}
            >
              {taxModal}
            </TileCard>
            <TileCard
              icon={<ScrollText />}
              title={label("rules", locale)}
            >
              {textModal(label("rules", locale), t(guide.sections.rules))}
            </TileCard>
            <TileCard
              icon={<KeyRound />}
              title={label("checkout", locale)}
              subtitle="11:00"
            >
              {textModal(label("checkout", locale), t(guide.sections.checkout))}
            </TileCard>
          </div>
        </TexturedSection>

        <TexturedSection>
          <GroupHeader label={label("groupHome", locale)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <TileCard
              icon={<Recycle />}
              title={label("waste", locale)}
            >
              {textModal(label("waste", locale), t(guide.sections.waste))}
            </TileCard>
            {guide.sections.babyEquipment && (
              <TileCard
                icon={<Baby />}
                title={label("baby", locale)}
              >
                {textModal(label("baby", locale), t(guide.sections.babyEquipment))}
              </TileCard>
            )}
            {guide.sections.ringCameraDisclosure && (
              <TileCard
                icon={<Video />}
                title={label("ring", locale)}
              >
                {textModal(label("ring", locale), t(guide.sections.ringCameraDisclosure))}
              </TileCard>
            )}
          </div>
        </TexturedSection>

        <TexturedSection textured>
          <GroupHeader label={label("groupSafety", locale)} onDark />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <TileCard
              icon={<Siren />}
              title={label("emergencies", locale)}
            >
              {emergenciesModal}
            </TileCard>
            <TileCard
              icon={<Headphones />}
              title={label("hostComo", locale)}
              subtitle={label("hostComoTagline", locale)}
            >
              {hostComoModal}
            </TileCard>
            {pharmaciesModal && (
              <TileCard
                icon={<Pill />}
                title={label("pharmacies", locale)}
              >
                {pharmaciesModal}
              </TileCard>
            )}
          </div>
        </TexturedSection>
      </article>

      {guide.sections.feedback && (
        <ReviewBlock feedback={t(guide.sections.feedback)} locale={locale} />
      )}
    </main>
  );
}

function RichBody({ body }: { body: string }) {
  type Block =
    | { type: "p"; lines: string[] }
    | { type: "ul"; items: string[] }
    | { type: "h"; text: string };

  const blocks: Block[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "p") last.lines.push("");
      continue;
    }
    const isBullet = line.startsWith("•") || line.startsWith("- ");
    const isHeader =
      /^[A-ZÀ-Ý][A-ZÀ-Ý\s]+$/.test(line) && line.length > 3 && !line.endsWith(":");

    if (isBullet) {
      const text = line.replace(/^•\s*/, "").replace(/^-\s*/, "");
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(text);
      else blocks.push({ type: "ul", items: [text] });
    } else if (isHeader) {
      blocks.push({ type: "h", text: line });
    } else {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "p") last.lines.push(line);
      else blocks.push({ type: "p", lines: [line] });
    }
  }

  return (
    <div className="space-y-3 text-base leading-relaxed text-slate-700">
      {blocks.map((b, i) => {
        if (b.type === "ul") {
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#1D3A62] flex-shrink-0" />
                  <span className="flex-1">{it}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "h") {
          return (
            <h3 key={i} className="text-sm font-bold uppercase tracking-wider text-[#1D3A62] mt-4 first:mt-0">
              {b.text}
            </h3>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {b.lines.join("\n")}
          </p>
        );
      })}
    </div>
  );
}

const LABELS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  guideTo: { it: "Guida a", en: "Guide to", ru: "Гид по", de: "Reiseführer", es: "Guía de", fr: "Guide de" },
  practical: { it: "Info pratiche", en: "Practical info", ru: "Полезная информация", de: "Praktisches", es: "Info práctica", fr: "Infos pratiques" },
  tax: { it: "Tassa di soggiorno", en: "Tourist tax", ru: "Туристический налог", de: "Kurtaxe", es: "Tasa turística", fr: "Taxe de séjour" },
  rules: { it: "Regole della casa", en: "House rules", ru: "Правила дома", de: "Hausregeln", es: "Reglas de la casa", fr: "Règles de la maison" },
  waste: { it: "Raccolta differenziata", en: "Waste sorting", ru: "Сортировка мусора", de: "Mülltrennung", es: "Recogida selectiva", fr: "Tri des déchets" },
  baby: { it: "Bambini", en: "Children", ru: "Дети", de: "Kinder", es: "Niños", fr: "Enfants" },
  ring: { it: "Videocamera esterna", en: "External camera", ru: "Внешняя камера", de: "Außenkamera", es: "Cámara exterior", fr: "Caméra extérieure" },
  checkin: { it: "Check-in", en: "Check-in", ru: "Заезд", de: "Check-in", es: "Check-in", fr: "Check-in" },
  checkout: { it: "Check-out", en: "Check-out", ru: "Выезд", de: "Check-out", es: "Check-out", fr: "Check-out" },
  emergencies: { it: "Contatti di emergenza", en: "Emergency contacts", ru: "Экстренные контакты", de: "Notfallkontakte", es: "Contactos de emergencia", fr: "Contacts d'urgence" },
  pharmacies: { it: "Farmacie vicine", en: "Nearby pharmacies", ru: "Ближайшие аптеки", de: "Nahe Apotheken", es: "Farmacias cercanas", fr: "Pharmacies proches" },
  perPersonPerNight: { it: "persona / notte", en: "person / night", ru: "чел. / ночь", de: "Pers. / Nacht", es: "persona / noche", fr: "personne / nuit" },
  groupRules: { it: "Pagamenti e regole", en: "Payments & rules", ru: "Оплата и правила", de: "Zahlungen & Regeln", es: "Pagos y reglas", fr: "Paiements & règles" },
  groupHome: { it: "Vivere la casa", en: "Living in the house", ru: "Жизнь в доме", de: "Im Haus leben", es: "Vivir la casa", fr: "Vivre la maison" },
  groupSafety: { it: "Emergenze, farmacie e Host Como", en: "Emergencies, pharmacies & Host Como", ru: "Экстренные службы, аптеки и Host Como", de: "Notfälle, Apotheken & Host Como", es: "Emergencias, farmacias y Host Como", fr: "Urgences, pharmacies & Host Como" },
  hostComo: { it: "Contattaci", en: "Contact us", ru: "Связаться", de: "Kontakt", es: "Contáctenos", fr: "Contactez-nous" },
  hostComoTagline: { it: "Risposta 8-23", en: "Reply 8 AM - 11 PM", ru: "Ответ 8:00 — 23:00", de: "Antwort 8-23 Uhr", es: "Respuesta 8-23 h", fr: "Réponse 8h-23h" },
  call: { it: "Chiama", en: "Call", ru: "Позвонить", de: "Anrufen", es: "Llamar", fr: "Appeler" },
  website: { it: "Sito web", en: "Website", ru: "Сайт", de: "Website", es: "Sitio web", fr: "Site web" },
};

function label(key: string, locale: SupportedLocale): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.it ?? key;
}
