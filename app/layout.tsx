import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

// Syne: heading, angka besar, section statement.
// Manrope: body, tombol, label, form.
const syne = Syne({ subsets: ["latin"], variable: "--font-display" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "TODOnya Rangga",
  description: "Kelola fokus, tugas, dan ritme harianmu dalam satu orbit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${syne.variable} ${manrope.variable} bg-obsidian font-sans text-ivory antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
