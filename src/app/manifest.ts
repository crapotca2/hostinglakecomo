import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Host Como — Property Manager Lago di Como",
    short_name: "Host Como",
    description:
      "Gestione completa affitti brevi sul Lago di Como. 9 anni di esperienza, 350+ recensioni a 5 stelle.",
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
        src: "/apple-icon",
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
