import type { SupportedLocale } from "@/types/database";

const LABELS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  guideTo: {
    it: "Guida a",
    en: "Guide to",
    ru: "Гид по",
    de: "Reiseführer",
    es: "Guía de",
    fr: "Guide de",
  },
  welcomeTo: {
    it: "Benvenuti ad",
    en: "Welcome to",
    ru: "Добро пожаловать в",
    de: "Willkommen im",
    es: "Bienvenidos a",
    fr: "Bienvenue à",
  },
  ssid: {
    it: "Rete",
    en: "Network",
    ru: "Сеть",
    de: "Netzwerk",
    es: "Red",
    fr: "Réseau",
  },
  password: {
    it: "Password",
    en: "Password",
    ru: "Пароль",
    de: "Passwort",
    es: "Contraseña",
    fr: "Mot de passe",
  },
  scanToConnect: {
    it: "Scansiona per connetterti al Wi-Fi",
    en: "Scan to connect to Wi-Fi",
    ru: "Сканируйте для подключения к Wi-Fi",
    de: "Scannen, um mit dem WLAN zu verbinden",
    es: "Escanea para conectarte al Wi-Fi",
    fr: "Scannez pour vous connecter au Wi-Fi",
  },
};

export function sharedLabel(key: string, locale: SupportedLocale): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.it ?? key;
}
