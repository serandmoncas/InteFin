import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
    default: "InteliFin — Inteligencia Financiera para coaches y sus clientes",
    template: "%s · InteliFin",
  },
  description:
    "Plataforma para coaches financieros. Diagnósticos, dashboards y seguimiento mensual del método de las 4 cuentas — sin Excel sueltos.",
  metadataBase: new URL("https://intelifin.online"),
  openGraph: {
    title: "InteliFin — Inteligencia Financiera",
    description:
      "Convierte tus Excel financieros en una experiencia que tus clientes aman.",
    type: "website",
    locale: "es_CO",
    siteName: "InteliFin",
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
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#f1f5f9",
            },
          }}
        />
      </body>
    </html>
  );
}
