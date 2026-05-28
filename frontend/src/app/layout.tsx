import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { ThemeBootstrapScript } from "@/shared/theme/theme-bootstrap-script";
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
  title: "IT Dashboard Enterprise",
  description: "Frontend enterprise integrado con Spring Boot y Oracle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="light-executive"
      data-density="default"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeBootstrapScript />
        <link rel="preload" href="/log.jpeg" as="image" />
        <link rel="preload" href="/logo-negro.jpeg" as="image" />
        <link rel="preload" href="/logo-blanco.jpeg" as="image" />
      </head>
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
