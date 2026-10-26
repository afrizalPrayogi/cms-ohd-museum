// app/cms/login/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login WePortal CMS",
  description:
    "Masuk ke WePortal CMS untuk mengelola konten, proyek, WhatsApp AI, dan operasional bisnis dalam satu dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
