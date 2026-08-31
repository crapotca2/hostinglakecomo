import type { SupportedLocale } from "@/types/database";

const LABELS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  guideTo: {
    it: "Guida a",
    en: "Guide to",
    ru: "Гид по",
    de: "Reiseführer",
    pl: "Przewodnik po",
    es: "Guía de",
    fr: "Guide de",
  },
  welcomeTo: {
    it: "Benvenuti a",
    en: "Welcome to",
    ru: "Добро пожаловать в",
    de: "Willkommen im",
    pl: "Witamy w",
    es: "Bienvenidos a",
    fr: "Bienvenue à",
  },
  ssid: {
    it: "Rete",
    en: "Network",
    ru: "Сеть",
    de: "Netzwerk",
    pl: "Sieć",
    es: "Red",
    fr: "Réseau",
  },
  password: {
    it: "Password",
    en: "Password",
    ru: "Пароль",
    de: "Passwort",
    pl: "Hasło",
    es: "Contraseña",
    fr: "Mot de passe",
  },
  scanToConnect: {
    it: "Scansiona per connetterti al Wi-Fi",
    en: "Scan to connect to Wi-Fi",
    ru: "Сканируйте для подключения к Wi-Fi",
    de: "Scannen, um mit dem WLAN zu verbinden",
    pl: "Zeskanuj, aby połączyć się z Wi-Fi",
    es: "Escanea para conectarte al Wi-Fi",
    fr: "Scannez pour vous connecter au Wi-Fi",
  },
};

export function sharedLabel(key: string, locale: SupportedLocale): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.it ?? key;
}

// "Benvenuti a <name>" with the Italian euphonic "d" (ad) added only before a
// name that starts with a vowel (so "a Casa" but "ad Aqua"/"ad Antica").
export function welcomeTitle(propertyName: string, locale: SupportedLocale): string {
  const prefix = sharedLabel("welcomeTo", locale);
  if (locale === "it" && /^[aeiouàèéìòù]/i.test(propertyName.trim())) {
    return `${prefix}d ${propertyName}`;
  }
  return `${prefix} ${propertyName}`;
}
