import { Link } from "@/i18n/routing";
import { Phone, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");

  return (
    <footer className="relative overflow-hidden bg-[#1D3A62]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center pointer-events-none"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12 lg:items-center">
          {/* Brand */}
          <div className="space-y-3 lg:-mt-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/logo-white.png"
                alt="Host Como"
                className="h-14 w-14 object-contain"
              />
              <span className="text-xl font-semibold text-white">Host Como</span>
            </div>
            <p className="text-base leading-relaxed text-white font-medium">
              {t("tagline")}
            </p>
            <p className="text-sm leading-relaxed text-white/75">
              {t("description")}
            </p>
          </div>

          {/* Naviga */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              {t("navigateTitle")}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {tn("about")}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  {tn("services")}
                </Link>
              </li>
              <li>
                <Link href="/strumenti" className="hover:text-white transition-colors">
                  {tn("tools")}
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  {tn("properties")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t("ownerDashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legale */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              {t("legalTitle")}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  {t("cookiePolicy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link href="/note-legali" className="hover:text-white transition-colors">
                  {t("legalNotes")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              {t("contactsTitle")}
            </h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-white/90" />
                <a
                  href="tel:+393517180435"
                  className="hover:text-white transition-colors"
                >
                  +39 351 718 0435
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-white/90" />
                <a
                  href="mailto:angelo.talarico@gmail.com"
                  className="hover:text-white transition-colors break-all"
                >
                  angelo.talarico@gmail.com
                </a>
              </li>
            </ul>
            <Link
              href="/contact?interest=consulenza"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-white text-[#1D3A62] text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>

      {/* Como wordmark */}
      <div className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo/como-typo-white.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="w-full aspect-[9/1] object-cover object-bottom block opacity-90 select-none pointer-events-none"
        />
      </div>
    </footer>
  );
}
