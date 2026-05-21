import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Host Como — Property Manager Lago di Como",
    short_name: "Host Como",
    description:
      "Gestione completa affitti brevi sul Lago di Como. 10 anni di esperienza, 350+ recensioni a 5 stelle.",
    start_url: "/",
    display: "standalone",
    background_color: "#1D3A62",
    theme_color: "#1D3A62",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon0.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icon1.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
    ],
  };
}
