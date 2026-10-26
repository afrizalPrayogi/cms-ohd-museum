import Script from "next/script";
import PageProvider from "../PageProvider";
import { buildApiUrl, GetDecrypt } from "../lib/helper";
import { headers } from "next/headers";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { meta } = await getPageData(params);
  return meta;
}

async function getPageData(params: { slug?: string[] }) {
  const slug = params.slug?.join("/") || "home";

  let dataapi: any = null;
  let errorMessage: string | null = null;

  try {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") || "";
    const uri = `api/fe/v1/page${slug && slug !== "" ? "?slug=" + slug : ""}`;
    const response = await fetch(buildApiUrl(uri), {
      method: "GET",
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    });
    const raw = await response.text();
    const decrypted = GetDecrypt(raw);
    const datauri = JSON.parse(decrypted || raw);

    dataapi = datauri?.data;

    if (!dataapi) {
      throw new Error("API response kosong atau tidak valid");
    }
  } catch (err: any) {
    errorMessage = err?.message || "Unknown error saat fetch API";
  }

  const twitterImage = dataapi?.twitterImage ?? dataapi?.ogImage;
  const meta = {
    metadataBase: new URL(dataapi?.baseUrl ?? "https://weportal.co.id"),
    title: dataapi?.metaTitle ?? "WePortal | Portal Operasional Bisnis Terintegrasi",
    description:
      dataapi?.metaDescription ??
      "WePortal adalah aplikasi portal bisnis terintegrasi untuk mengelola website, proyek, WhatsApp AI, reminder finance, dan aktivitas operasional tim.",
    keywords: dataapi?.metaKeywords,
    authors: dataapi?.authors ? [{ name: dataapi.authors }] : [],
    creator: dataapi?.creator ?? undefined,
    publisher: dataapi?.publisher ?? undefined,
    robots: dataapi?.robots ?? "index, follow",
    alternates: {
      canonical: dataapi?.canonicalUrl ?? undefined,
    },
    openGraph: {
      title: dataapi?.ogTitle ?? dataapi?.metaTitle,
      description: dataapi?.ogDescription ?? dataapi?.metaDescription,
      url: dataapi?.baseUrl ?? "https://weportal.co.id",
      siteName: dataapi?.siteName ?? "WePortal",
      locale: dataapi?.locale ?? "id_ID",
      type: dataapi?.ogType ?? "website",
      images: dataapi?.ogImage
        ? [{ url: dataapi?.ogImage, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: dataapi?.twitterCard ?? "summary_large_image",
      title: dataapi?.twitterTitle ?? dataapi?.metaTitle ?? "WePortal | Portal Operasional Bisnis Terintegrasi",
      description:
        dataapi?.twitterDescription ??
        dataapi?.metaDescription ??
        "WePortal membantu tim mengelola website, proyek, WhatsApp AI, dan operasional bisnis dalam satu platform.",
      images: twitterImage ? [twitterImage] : [],
    },
  };

  return { meta, page: dataapi, errorMessage };
}

export default async function RootLayout(props: Props) {
  const params = await props.params;

  const {
    children
  } = props;

  const { page, errorMessage } = await getPageData(params);

  return (
    <html lang="id">
      <head>
        {/* Google Analytics */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];
          w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-111111111111');
        `,
          }}
        />
        {/* Debug Mode selalu aktif */}
        <Script id="debug-page-data" strategy="afterInteractive">
          {`
            console.log("%c[DEBUG PAGE DATA]", "color: #4CAF50; font-weight: bold;", ${JSON.stringify(
            page
          )});
            ${errorMessage
              ? `console.error("%c[API ERROR]", "color: red; font-weight: bold;", "${errorMessage}");`
              : ""
            }
          `}
        </Script>
        {page?.structuredData ? (
          <Script
            id="page-structured-data"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: page.structuredData }}
          />
        ) : null}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-111111111111"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <PageProvider value={page}>{children}</PageProvider>

      </body>
    </html>
  );
}
