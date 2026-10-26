import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextRequest, NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { getCachedMenuForFE } from "../../../../lib/controller/menu";
import { getCookiesToken } from "app/lib/jwtParse";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get("ip") || "1.1.1.1"; // default ip
    const slugQs = searchParams.get("slug") || "beranda"; // default slug
    const slug = slugQs;
    const now = new Date();
    const cmsUser = await getCookiesToken(req);
    const canPreviewUnapproved = Boolean(cmsUser?.userId);

    const pageWhere: any = {
      page: {
        isDeleted: false,
        deletedAt: null,
        publishAt: { lte: now },
        OR: [{ unPublishAt: null }, { unPublishAt: { gt: now } }],
        ...(canPreviewUnapproved ? {} : { approvalStatus: "APPROVED" }),
      },
    };

    let data: any = await prisma.pageTranslation.findFirst({
      where: {
        slug,
        ...pageWhere,
      },
      include: {
        page: {
          include: {
            wording: true,
            sectionsAsMain: {
              where: {
                isActive: true,
                isDeleted: false,
              },
              orderBy: [{ order: "asc" }, { id: "asc" }],
              include: {
                category: {
                  where: {
                    isActive: true,
                    isDeleted: false,
                  },
                  include: {
                    pageCategories: {
                      include: {
                        page: {
                          where: {
                            isActive: true,
                            isDeleted: false,
                          },
                          include: {
                            wording: true,
                            translations: {
                              where: {
                                isActive: true,
                                isDeleted: false,
                              },
                              include: {
                                page: {
                                  where: {
                                    isActive: true,
                                    isDeleted: false,
                                  },
                                  include: {
                                    wording: true,
                                    mediaPages: true
                                  }
                                },
                              },
                            },
                            mediaPages: {
                              where: {
                                isActive: true,
                                isDeleted: false,
                              }
                            },
                          },
                        },
                      },
                      orderBy: { page: { order: "asc" } }
                    },
                    medias: true,
                    pageTranslations: true,
                  },
                },
                template: true,
                pageShortLinks: true,
              },
            },
            mediaPages: true,
          },
        },
      },
    });

    if (!data) {
      data = await prisma.pageTranslation.findFirst({
        where: {
          slug: { contains: slug },
          ...pageWhere,
        },
        include: {
          page: {
            include: {
              wording: true,
              sectionsAsMain: {
                where: {
                  isActive: true,
                  isDeleted: false,
                },
                orderBy: [{ order: "asc" }, { id: "asc" }],
                include: {
                  category: {
                    where: {
                      isActive: true,
                      isDeleted: false,
                    },
                    include: {
                      pageCategories: {
                        include: {
                          page: {
                            where: {
                              isActive: true,
                              isDeleted: false,
                            },
                            include: {
                              wording: true,
                              translations: {
                                where: {
                                  isActive: true,
                                  isDeleted: false,
                                },
                                include: {
                                  page: {
                                    where: {
                                      isActive: true,
                                      isDeleted: false,
                                    },
                                    include: {
                                      wording: true,
                                      mediaPages: true
                                    }
                                  },
                                },
                              },
                              mediaPages: {
                                where: {
                                  isActive: true,
                                  isDeleted: false,
                                }
                              },
                            },
                          },
                        },
                        orderBy: { page: { order: "asc" } }
                      },
                      medias: true,
                      pageTranslations: true,
                    },
                  },
                  template: true,
                  pageShortLinks: true,
                },
              },
              mediaPages: true,
            },
          },
        },
      });
    }
    let langCode = "ID";
    if (data) {

      await prisma.page.update({
        where: { id: data.page.id },
        data: {
          count: data.page.count + 1,
        },
      });
      langCode = data.langCode;

      // filter manual semua nested
      data.page.wording = data.page.wording.filter(
        (sec) => sec.langCode === langCode
      );

      data.page.sectionsAsMain = data.page.sectionsAsMain.filter(
        (sec) => sec.langCode === langCode
      ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
      data.page.mediaPages = data.page.mediaPages.filter(
        (mp) => mp.langCode === langCode
      );
    }

    const emptyPage = {
      sectionsAsMain: [],
      wording: [],
      mediaPages: [],
    };

    let dataRsp: any = data ?? {};
    dataRsp.page = dataRsp?.page ?? emptyPage;
    dataRsp.page.sectionsAsMain = Array.isArray(dataRsp.page.sectionsAsMain)
      ? dataRsp.page.sectionsAsMain
      : [];
    dataRsp.page.wording = Array.isArray(dataRsp.page.wording)
      ? dataRsp.page.wording
      : [];
    dataRsp.page.mediaPages = Array.isArray(dataRsp.page.mediaPages)
      ? dataRsp.page.mediaPages
      : [];
    dataRsp.navigation = await getCachedMenuForFE(
      langCode,
      dataRsp.page.companyId,
      canPreviewUnapproved
    );

    dataRsp.page.sectionsAsMain.forEach((sec: any) => {
      if (sec.category) {
        sec.category.pageCategories = sec.category.pageCategories
          .filter((pc) => pc.langCode === langCode)
          .map((pc) => {
            if (pc.page && Array.isArray(pc.page.translations)) {
              pc.page.translations = pc.page.translations.filter(
                (tr) => tr.langCode === langCode
              );
              pc.page.translations.forEach((trans) => {
                if (trans.page && Array.isArray(trans.page?.wording)) {
                  trans.page.wording = trans?.page?.wording.filter(
                    (sec) => sec.langCode === langCode
                  );

                  trans.page.wording = Object.fromEntries(trans.page.wording.map(item => [item.key, item.label]));
                }
              })
            }
            return pc;
          });
        sec.category.pageTranslations = sec.category.pageTranslations.filter(
          (pt) => pt.langCode === langCode
        );
        sec.category.medias = sec.category.medias.filter(
          (pt) => pt.langCode === langCode
        );
      }
    });
    dataRsp.page.wording = Object.fromEntries(
      dataRsp.page.wording.map((item: any) => [item.key, item.label])
    );
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
