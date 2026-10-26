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

  try {
    const userToken = await verifyAndParseToken(req);
    // Ambil data original
    const original = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        pageTranslations: true,
        medias: true,
        pageCategories: true,
      },
    });

    if (!original) {
      const rsp = ResponseHttp(404, "Not found data");
      const response = new NextResponse(rsp, {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }
    // Duplikasi
    const newCategory = await prisma.category.create({
      data: {
        isActive: true,
        createBy: userToken.email ?? "system",
        createdAt: new Date(),

        pageTranslations: {
          create: original.pageTranslations.map((item) => ({
            langCode: item.langCode,
            title: item.title + " (Copy)",
            slug: (item.slug ?? "").toLowerCase() + "-copy-" + Date.now(),
            subTitle: item.subTitle,
            description: item.description,
            overview: item.overview,
            createBy: userToken.email ?? "system",
            createdAt: new Date(),
            companyId: userToken.companyId ?? null,
          })),
        },

        medias: {
          create: original.medias.map((m) => ({
            url: m.url,
            title: m.title,
            alt: m.alt,
            type: m.type,
            langCode: m.langCode,
            createBy: userToken.email ?? "system",
            isActive: true,
            isDeleted: false,
            companyId: userToken.companyId ?? null,
          })),
        },
        pageCategories: {
          create: original.pageCategories.map((m) => ({
            pageId: m.pageId,
            langCode: m.langCode,
            companyId: m.companyId,
          })),
        },
      },
    });
    const respon = ResponseHttp(200, "Success copy data", newCategory);
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
