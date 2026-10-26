// app/layout.tsx
import { Metadata } from "next";
import "./globals.css"; // contoh global CSS import

export const metadata: Metadata = {
  title: "CMS Soleram",
  description:
    "CMS Soleram adalah aplikasi portal bisnis terintegrasi untuk mengelola CMS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        {/* Global header / footer bisa disini */}
        {children}
      </body>
    </html>
  );
}
