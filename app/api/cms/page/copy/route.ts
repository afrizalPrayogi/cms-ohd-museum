import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
import { cleanContent, GetDecrypt } from "../../../../lib/helper";

export async function PUT(
  req: NextRequest
) {
  const bodyText = await req.text();
  const body = JSON.parse(GetDecrypt(bodyText));
  const id = parseInt(body.id);

  if (isNaN(id)) {
    const rsp = ResponseHttp(400, "Invalid id");
    const response = new NextResponse(rsp, {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
  {
    try {
      const userToken = await verifyAndParseToken(req);
      const oldPage = await prisma.page.findUnique({
        where: { id },
        include: {
          translations: true,
          mediaPages: true,
          sectionsAsMain: true,
          wording: true,
        },
      });

      if (!oldPage) {
        const rsp = ResponseHttp(404, "Not found data");
        const response = new NextResponse(rsp, {
          status: 404,
          headers: {
            "Content-Type": "text/plain",
          },
        });
        return response;
      }
      // 2. Siapkan data untuk create baru
      // 2. Buat page baru dengan data hasil copy
      const newPage = await prisma.page.create({
        data: {
          sort: oldPage.sort,
          order: oldPage.order,
          isActive: oldPage.isActive,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          publishAt: oldPage.publishAt,
          unPublishAt: oldPage.unPublishAt,
          approvalStatus: "REQUESTED",
          requestedAt: new Date(),
          requestedBy: userToken.email ?? "system",
          pageType: oldPage.pageType,
          companyId: userToken.companyId ?? null,

          // copy translations
          translations: {
            create: oldPage.translations.map((t) => ({
              langCode: t.langCode,
              title: t.title + " (Copy)",
              slug: (t.slug ?? "") + "-copy-" + Date.now(),
              subTitle: t.subTitle,
              description: cleanContent(t.description ?? ""),
              metaDescription: t.metaDescription,
              metaKeywords: t.metaKeywords,
              metaTitle: t.metaTitle,
              ogDescription: t.ogDescription,
              canonicalUrl: t.canonicalUrl,
              ogImage: t.ogImage,
              ogTitle: t.ogTitle,
              ogType: t.ogType,
              robots: t.robots,
              twitterCard: t.twitterCard,
              twitterTitle: t.twitterTitle,
              twitterDescription: t.twitterDescription,
              twitterImage: t.twitterImage,
              structuredData: t.structuredData,
              overview: cleanContent(t.overview ?? ""),
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },

          // copy medias
          mediaPages: {
            create: oldPage.mediaPages.map((m) => ({
              url: m.url,
              title: m.title,
              alt: m.alt,
              type: m.type,
              langCode: m.langCode,
              createBy: userToken.email ?? "system",
              isActive: m.isActive,
              isDeleted: m.isDeleted,
              companyId: userToken.companyId ?? null,
            })),
          },

          // copy sections
          sectionsAsMain: {
            create: oldPage.sectionsAsMain.map((s) => ({
              langCode: s.langCode,
              pageIdData: s.pageIdData,
              categoryId: s.categoryId,
              templateId: s.templateId,
              type: s.type,
              order: s.order,
              title: s.title,
              subTitle: s.subTitle,
              description: cleanContent(s.description ?? ""),
              overview: cleanContent(s.overview ?? ""),
              image: s.image,
              secondImage: s.secondImage,
              customConfig: s.customConfig ?? undefined,
              isActive: s.isActive,
              isDeleted: s.isDeleted,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },

          // copy wording
          wording: {
            create: oldPage.wording.map((w) => ({
              key: w.key,
              label: w.label,
              langCode: w.langCode,
              companyId: userToken.companyId ?? null,
            })),
          },
        },
      });

      const respon = ResponseHttp(200, "Success copy data", newPage);
      const response = new NextResponse(respon, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    } catch (error) {
      console.log("error update role[id]", error);
      const rsp = ResponseHttp(500, "Application Maintenace");
      const response = new NextResponse(rsp, {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }
  }
}
