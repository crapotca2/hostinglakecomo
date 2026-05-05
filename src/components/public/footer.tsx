import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1D3A62]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12 lg:items-center">
          {/* Brand */}
          <div className="space-y-3 lg:-mt-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/logo-white.png"
                alt="Hosting Lake Como"
                className="h-14 w-14 object-contain"
              />
              <span className="text-xl font-semibold text-white">Hosting Lake Como</span>
            </div>
            <p className="text-base leading-relaxed text-white font-medium">
              L&apos;ospitalita non si improvvisa, affidati a un professionista.
            </p>
            <p className="text-sm leading-relaxed text-white/75">
              Consultaci per valutare il potenziale di rendita del tuo
              immobile sul Lago di Como. Ti rispondiamo entro 48 ore con
              un&apos;analisi personalizzata e senza impegno.
            </p>
          </div>

          {/* Naviga */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              Naviga
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Servizi
                </Link>
              </li>
              <li>
                <Link href="/strumenti" className="hover:text-white transition-colors">
                  Strumenti
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Proprieta
                </Link>
              </li>
            </ul>
          </div>

          {/* Legale */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              Legale
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Termini di Servizio
                </Link>
              </li>
              <li>
                <Link href="/note-legali" className="hover:text-white transition-colors">
                  Note Legali
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              Contatti
            </h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-white/90" />
                <span>+39 031 547 8072</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-white/90" />
                <span>info@airbibby.com</span>
              </li>
            </ul>
            <Link
              href="/contact?interest=consulenza"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-white text-[#1D3A62] text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              Richiedi Consulenza
            </Link>
          </div>
        </div>
      </div>

      {/* Como wordmark — full width, slightly shorter than the natural 7.5:1 (anchored bottom so the cut happens at the top, matching the original watermark feel) */}
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
