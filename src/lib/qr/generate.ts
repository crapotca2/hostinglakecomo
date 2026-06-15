import QRCode from "qrcode";

export type QRColor = {
  dark?: string;
  light?: string;
};

export type QROptions = {
  size?: number;
  margin?: number;
  color?: QRColor;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
};

const DEFAULT_OPTIONS: Required<Omit<QROptions, "color">> & {
  color: Required<QRColor>;
} = {
  size: 400,
  margin: 2,
  color: { dark: "#0F172A", light: "#FFFFFF" },
  errorCorrectionLevel: "M",
};

function mergeOptions(opts?: QROptions) {
  return {
    width: opts?.size ?? DEFAULT_OPTIONS.size,
    margin: opts?.margin ?? DEFAULT_OPTIONS.margin,
    color: {
      dark: opts?.color?.dark ?? DEFAULT_OPTIONS.color.dark,
      light: opts?.color?.light ?? DEFAULT_OPTIONS.color.light,
    },
    errorCorrectionLevel:
      opts?.errorCorrectionLevel ?? DEFAULT_OPTIONS.errorCorrectionLevel,
  };
}

export async function qrPng(payload: string, opts?: QROptions): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    type: "png",
    ...mergeOptions(opts),
  });
}

export async function qrSvg(payload: string, opts?: QROptions): Promise<string> {
  return QRCode.toString(payload, {
    type: "svg",
    ...mergeOptions(opts),
  });
}

export async function qrDataUrl(payload: string, opts?: QROptions): Promise<string> {
  return QRCode.toDataURL(payload, {
    ...mergeOptions(opts),
  });
}

export function buildWifiPayload(args: {
  ssid: string;
  password?: string;
  auth?: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}): string {
  const auth = args.auth ?? "WPA";
  const escape = (s: string) => s.replace(/([\\;:,"])/g, "\\$1");
  const ssid = escape(args.ssid);
  const pwd = args.password ? escape(args.password) : "";
  const hidden = args.hidden ? "true" : "";
  return `WIFI:T:${auth};S:${ssid};P:${pwd};H:${hidden};;`;
}

export function buildTelPayload(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

export function buildMailPayload(email: string, subject?: string): string {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${params}`;
}

export function buildGoogleMapsPayload(args: {
  coordinates?: { lat: number; lng: number };
  name?: string;
  address?: string;
}): string {
  if (args.coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${args.coordinates.lat},${args.coordinates.lng}`;
  }
  const query = encodeURIComponent([args.name, args.address].filter(Boolean).join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
