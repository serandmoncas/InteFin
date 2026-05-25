import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InteFin — Inteligencia Financiera para coaches y sus clientes",
    template: "%s · InteFin",
  },
  description:
    "Plataforma para coaches financieros. Diagnósticos, dashboards y seguimiento mensual del método de las 4 cuentas — sin Excel sueltos.",
  metadataBase: new URL("https://intefin.vercel.app"),
  openGraph: {
    title: "InteFin — Inteligencia Financiera",
    description:
      "Convierte tus Excel financieros en una experiencia que tus clientes aman.",
    type: "website",
    locale: "es_CO",
    siteName: "InteFin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
