import { Metadata } from "next";
import CMSLayout from "../components/cms/CMSLayout";
import { PageTitleProvider } from "../lib/PageTitelCmsContext";
import { Providers } from "../lib/Providers";
import ClientToast from "../components/cms/ui/toastContainer";
export const metadata: Metadata = {
  metadataBase: new URL("https://weportal.co.id"),
  title: "WePortal CMS",
  description:
    "WePortal CMS adalah panel administrasi terintegrasi untuk mengelola konten website, operasional Redmine, WhatsApp AI, Finance Reminder, dan aktivitas bisnis dalam satu dashboard.",
  keywords: [
    "WePortal",
    "WePortal CMS",
    "portal bisnis",
    "dashboard operasional",
    "CMS terintegrasi",
    "Redmine dashboard",
    "WhatsApp AI",
    "finance reminder",
    "aplikasi operasional bisnis",
    "portal admin perusahaan",
  ],
  authors: [{ name: "WePortal", url: "https://weportal.co.id/" }],
  creator: "WePortal",
  publisher: "WePortal",
  robots: "noindex, nofollow",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // opsional
  },
  openGraph: {
    title: "WePortal CMS | Panel Operasional Bisnis Terintegrasi",
    description:
      "Kelola website, proyek, WhatsApp AI, reminder finance, dan aktivitas tim dari satu panel administrasi WePortal.",
    url: "https://weportal.co.id/",
    siteName: "WePortal",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Pastikan file ini ada di /public
        width: 1200,
        height: 630,
        alt: "WePortal CMS - Panel Operasional Bisnis Terintegrasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WePortal CMS | Panel Operasional Bisnis Terintegrasi",
    description:
      "WePortal membantu tim mengelola konten, proyek, WhatsApp AI, dan operasional bisnis dari satu dashboard.",
    creator: "@weportal", // opsional
    images: ["/og-image.jpg"],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <PageTitleProvider>
        <CMSLayout>
          {children}
          <ClientToast />
        </CMSLayout>
      </PageTitleProvider>
    </Providers>
  );
}
