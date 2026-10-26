import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { getCachedMenuForFE } from "../../../../lib/controller/menu";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get("ip") || "1.1.1.1"; // default ip
    const slugQs = searchParams.get("keyword") || "beranda"; // default slug
    const page = searchParams.get("page") || "1"; // default slug
    const slug = slugQs;
    const now = new Date();

    const pageSize = 10;
    const currentPage = Number(page ?? 1);
    const skip = (currentPage - 1) * pageSize;

    const where = {
      OR: [
        { slug: { contains: slug } },
        { title: { contains: slug } },
        { description: { contains: slug } },
        { overview: { contains: slug } },
        { subTitle: { contains: slug } },
        { isDeleted: false },
      ],
      page: {
        isDeleted: false,
        publishAt: { lte: now },
        OR: [{ unPublishAt: null }, { unPublishAt: { gt: now } }],
        sectionsAsMain: {
          some: {
            OR: [
              { slug: { contains: slug } },
              { title: { contains: slug } },
              { description: { contains: slug } },
              { overview: { contains: slug } },
              { subTitle: { contains: slug } },
              {
                category: {
                  pageCategories: {
                    some: {
                      page: {
                        isActive: true,
                        isDeleted: false,
                        translations: {
                          some: {
                            OR: [
                              { slug: { contains: slug } },
                              { title: { contains: slug } },
                              { description: { contains: slug } },
                              { overview: { contains: slug } },
                              { subTitle: { contains: slug } },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    };

    const totalCount = await prisma.pageTranslation.count({ where });

    // Ambil data paginated
    const data = await prisma.pageTranslation.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where,
      include: {
        page: {
          include: {
            sectionsAsMain: {
              where: {
                OR: [
                  { slug: { contains: slug } },
                  { title: { contains: slug } },
                  { description: { contains: slug } },
                  { overview: { contains: slug } },
                  { subTitle: { contains: slug } },
                ],
                isDeleted: false,
              },
              include: {
                category: {
                  include: {
                    pageCategories: {
                      include: {
                        page: {
                          where: {
                            isActive: true,
                            isDeleted: false,
                          },
                          include: {
                            translations: {
                              where: {
                                OR: [
                                  { slug: { contains: slug } },
                                  { title: { contains: slug } },
                                  { description: { contains: slug } },
                                  { overview: { contains: slug } },
                                  { subTitle: { contains: slug } },
                                ],
                                isDeleted: false,
                                page: {
                                  isDeleted: false,
                                  publishAt: { lte: now },
                                  OR: [
                                    { unPublishAt: null },
                                    { unPublishAt: { gt: now } },
                                  ],
                                },
                              },
                              include: {
                                page: { include: { mediaPages: true } },
                              },
                            },
                            mediaPages: {
                              where: {
                                isActive: true,
                                isDeleted: false,
                              },
                            },
                          },
                        },
                      },
                    },
                    medias: true,
                    pageTranslations: {
                      where: {
                        OR: [
                          { slug: { contains: slug } },
                          { title: { contains: slug } },
                          { description: { contains: slug } },
                          { overview: { contains: slug } },
                          { subTitle: { contains: slug } },
                        ],
                        isDeleted: false,
                        page: {
                          isDeleted: false,
                          publishAt: { lte: now },
                          OR: [
                            { unPublishAt: null },
                            { unPublishAt: { gt: now } },
                          ],
                        },
                      },
                    },
                  },
                },
                template: true,
              },
            },
            mediaPages: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    let langCode = "ID";
    let dataRsp: any = { result: data };
    dataRsp = { ...dataRsp, ...{ totalPages: totalPages } };
    // console.log('search', dataRsp);
    const respon = ResponseHttp(200, "Success", dataRsp);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[GET /page/option]", error);
    const rsp = ResponseHttp(500, "Application Maintenace", "", error);
    const response = new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
