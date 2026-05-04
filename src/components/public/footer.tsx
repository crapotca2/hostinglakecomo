import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1F1F1F]">
      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/logo-white.png"
                alt="Hosting Lake Como"
                className="h-9 w-9 object-contain"
              />
              <span className="text-lg font-semibold text-white">Hosting Lake Como</span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              L&apos;ospitalita non si improvvisa, affidati a un professionista.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4 text-white" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>

          {/* Proprieta */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              Ville e appartamenti
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Tutte le proprieta
                </Link>
              </li>
              <li>
                <Link href="/properties?type=villa" className="hover:text-white transition-colors">
                  Ville
                </Link>
              </li>
              <li>
                <Link href="/properties?type=apartment" className="hover:text-white transition-colors">
                  Appartamenti
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Esperienze
                </Link>
              </li>
              <li>
                <Link href="/strumenti" className="hover:text-white transition-colors">
                  Strumenti
                </Link>
              </li>
            </ul>
          </div>

          {/* Azienda */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              Azienda
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Servizi Proprietari
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contatti
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Area Proprietari
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-white transition-colors">
                  Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              Contatti
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-white/80" />
                <span>+39 031 547 8072</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-white/80" />
                <span>info@airbibby.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white/80" />
                <span>
                  Via Maurizio Monti 46
                  <br />
                  22100 Como, Italia
                </span>
              </li>
            </ul>
            <Link
              href="/contact?interest=consulenza"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-white text-foreground text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              Richiedi Consulenza
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            &copy; {new Date().getFullYear()} Hosting Lake Como. Tutti i
            diritti riservati. P.IVA IT00000000000
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Termini di Servizio
            </Link>
          </div>
        </div>
      </div>

      {/* Como typography watermark */}
      <div className="px-4 sm:px-6 lg:px-8 pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo/como-typo-white.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="w-full h-auto block opacity-90 select-none pointer-events-none"
        />
      </div>
    </footer>
  );
}
