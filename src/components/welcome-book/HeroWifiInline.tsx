import { Wifi } from "lucide-react";
import { ScannableQr } from "./ScannableQr";

const NAVY = "#1D3A62";

function buildWifiQrPayload(ssid: string, password: string, auth: "WPA" | "WEP" | "nopass" = "WPA") {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
  return `WIFI:T:${auth};S:${esc(ssid)};P:${esc(password)};;`;
}

/**
 * While real credentials are pending (ssid empty, "HIDDEN" or "(da comunicare)"),
 * the Wi-Fi QR should point somewhere useful instead of encoding a bogus
 * network — for now, the site homepage. Returns undefined when the SSID is real.
 */
export function wifiQrOverride(ssid?: string): string | undefined {
  const s = (ssid ?? "").trim();
  if (!s || /^(hidden|\(da comunicare\))$/i.test(s)) return "https://hostcomo.com";
  return undefined;
}

export function HeroWifiInline({
  ssid,
  password,
  ssidLabel,
  passwordLabel,
  scanLabel,
  qrUrl,
}: {
  ssid: string;
  password: string;
  ssidLabel: string;
  passwordLabel: string;
  scanLabel: string;
  /**
   * When set, the QR encodes this URL instead of a Wi-Fi join payload. Used as
   * a placeholder (e.g. the site homepage) while real credentials are pending.
   */
  qrUrl?: string;
}) {
  const payload = qrUrl ?? buildWifiQrPayload(ssid, password, "WPA");
  // In placeholder mode (qrUrl set = credentials pending) mask the values with
  // a realistic run of dots rather than showing the literal "HIDDEN".
  const placeholder = qrUrl != null;
  const ssidShown = placeholder ? "•".repeat(10) : ssid;
  const passwordShown = placeholder ? "•".repeat(12) : password;
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 max-w-md w-full mx-auto lg:mx-0 text-left">
      <div className="flex items-center gap-2 mb-3">
        <Wifi className="w-4 h-4" style={{ color: NAVY }} strokeWidth={2.2} />
        <span
          className="text-[10px] uppercase tracking-[0.22em] font-bold"
          style={{ color: NAVY }}
        >
          Wi-Fi
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="space-y-2.5 min-w-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mb-0.5">
              {ssidLabel}
            </p>
            <p className="font-mono text-sm font-bold text-slate-900 break-all">{ssidShown}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mb-0.5">
              {passwordLabel}
            </p>
            <p className="font-mono text-sm font-bold text-slate-900 break-all">{passwordShown}</p>
          </div>
        </div>
        <ScannableQr
          url={payload}
          ariaLabel={scanLabel}
          className="w-20 h-20 sm:w-24 sm:h-24"
          size={240}
        />
      </div>
    </div>
  );
}
