import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dauson Farm OS · Rabbit Management",
  description: "Complete digital rabbit farm operations, records, health, breeding, inventory, finance and reports.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  themeColor: "#123f34",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
