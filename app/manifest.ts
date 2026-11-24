import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rabbit Farm OS",
    short_name: "Rabbit Farm",
    description: "Complete digital rabbit farm operations, records, health, breeding, inventory, finance and reports.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f7f3",
    theme_color: "#123f34",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}