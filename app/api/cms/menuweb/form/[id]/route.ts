import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import { GetDecrypt, toPrismaDateTime } from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { formWordingTr } from "app/lib/translationFormWording";
import { clearMenuCacheForCompany } from "app/lib/controller/menu";
export const dynamic = "force-dynamic";

function hasMenuApprovalPermission(permission: any[] = []) {
  return permission.some((perm) => {
    const slug = perm?.menu?.translations?.[0]?.slug || "";
    return slug.split("/").includes("menuweb") && Boolean(perm?.approval);
  });
}
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userToken = await verifyAndParseToken(req);
    const formLabel = (key: string) => formWordingTr(userToken?.langCode, key);
    const formInfo = (key: string) => ({
      value: formWordingTr(userToken?.langCode, `${key}_info`),
      key: `${key}_info`,
    });
    const id = parseInt(params.id);
    // example get langs array
    const langDat = await prisma.lang.findMany({
      where: { isActive: true },
      orderBy: {
        code: "desc", // atau 'desc' jika ingin urutan menurun
      },
    });
    // Misalnya kita ambil user pertama (atau dari token, params, dll)
    let query = null;
    if (id > 0) {
      query = await prisma.menu.findUnique({
        where: { id },
        include: {
          translations: {
            include: {
              category: { include: { pageTranslations: true } },
              page: { include: { translations: true } },
            },
          },
          typeMenu: true,
          parent: {
            include: { translations: { where: { langCode: "ID" } } },
          },
          medias: true,
        },
      });

      if (!query || query.isDeleted) {
        return new NextResponse(ResponseHttp(404, "Data Not Found"), {
          status: 404,
        });
      }
    }
    // Form step
    const translationMap = (query?.translations || []).reduce((acc, curr) => {
      acc[curr.langCode.toUpperCase()] = curr;
      return acc;
    }, {} as Record<string, any>);
    const approvalDraft = Array.isArray(query?.approvalDraft)
      ? (query.approvalDraft as any[])
      : [];
    const draftMap = approvalDraft.reduce((acc, curr) => {
      const langCode = String(curr?.value?.lang || curr?.lang || "").toUpperCase();
      if (langCode) acc[langCode] = curr?.value?.value || {};
      return acc;
    }, {} as Record<string, any>);
    const mainDraft = approvalDraft[0]?.value?.value || {};

    const langs = langDat.map((lang) => {
      const langCode = lang.code.toUpperCase();
      const trans = translationMap[langCode] || {};
      const draft = draftMap[langCode] || {};
      const steps: Step[] = [
        {
          title: "Main",
          fields: [
            {
              name: "id",
              label: formLabel("id"),
              info: formInfo("id"),
              type: "hide",
              value: query?.id ?? "",
              allLang: true,
            },
            {
              name: "title",
              label: formLabel("title"),
              info: formInfo("title"),
              type: "text",
              value: draft?.title ?? trans?.title ?? "",
            },
            {
              name: "subTitle",
              label: formLabel("sub_title"),
              info: formInfo("sub_title"),
              type: "text",
              value: draft?.subTitle ?? trans?.subTitle ?? "",
            },
            {
              name: "typeMenuId",
              label: formLabel("type_menu"),
              info: formInfo("type_menu"),
              type: "select-single",
              value: draft?.typeMenuId ?? (query?.typeMenuId
                ? { value: query?.typeMenuId, label: query?.typeMenu?.name }
                : null),
              uriSelect: "api/cms/typeMenu/master",
              allLang: true,
            },
            {
              name: "parent",
              label: formLabel("parent_menu"),
              info: formInfo("parent_menu"),
              type: "select-single",
              value: draft?.parent ?? (query?.parentId
                ? {
                    value: query?.parentId,
                    label: query?.parent?.translations[0].title,
                  }
                : null),
              uriSelect: "api/cms/menuweb/master",
              allLang: true,
            },
            {
              name: "linkType",
              label: formLabel("link_type"),
              info: formInfo("link_type"),
              type: "select-single",
              value: draft?.linkType ?? {
                value: trans?.linkType == null ? "URL" : trans?.linkType,
                label: trans?.linkType == null ? "Url" : trans?.linkType,
              },
              uriSelect: "api/cms/linkType/master",
              allLang: true,
            },
            {
              name: "slug",
              label: formLabel("url"),
              info: formInfo("url"),
              type: "text",
              value: draft?.slug ?? trans?.slug ?? "",
              cols: "col-span-6",
              hideFields: [
                {
                  name: "linkType",
                  value: ["PAGE", "CATEGORY"],
                },
              ],
            },
            {
              name: "pageId",
              label: formLabel("page"),
              info: formInfo("page"),
              type: "select-single",
              value: draft?.pageId ?? (trans?.pageId
                ? {
                    value: trans?.pageId == null ? null : trans?.pageId,
                    label:
                      trans?.pageId == null
                        ? "Url"
                        : trans?.page?.translations[0]?.title,
                  }
                : null),
              cols: "col-span-6",
              hideFields: [
                {
                  name: "linkType",
                  value: ["CATEGORY", "URL"],
                },
              ],
              uriSelect: "api/cms/page/master",
              allLang: true,
            },
            {
              name: "categoryId",
              label: formLabel("category"),
              info: formInfo("category"),
              type: "select-single",
              value: draft?.categoryId ?? (trans?.categoryId
                ? {
                    value:
                      trans?.categoryId == null ? "URL" : trans?.categoryId,
                    label:
                      trans?.categoryId == null
                        ? "Url"
                        : trans?.category?.pageTranslations?.title,
                  }
                : null),
              cols: "col-span-6",
              hideFields: [
                {
                  name: "linkType",
                  value: ["URL", "PAGE"],
                },
              ],
              uriSelect: "api/cms/category/master",
              allLang: true,
            },
            {
              name: "overview",
              label: formLabel("overview"),
              info: formInfo("overview"),
              type: "text-editor",
              value: draft?.overview ?? trans?.overview ?? "",
              cols: "col-span-12",
            },
            {
              name: "description",
              label: formLabel("description"),
              info: formInfo("description"),
              type: "text-editor",
              cols: "col-span-12",
              value: draft?.description ?? trans?.description ?? "",
            },
          ],
        },

        {
          title: "Media",
          fields: [
            {
              name: "media_image",
              label: formLabel("image_default"),
              info: formInfo("image_default"),
              type: "upload-fm",
              value: draft?.media_image ?? query?.medias.find(
                (item) =>
                  item.type === "media_image" && item.langCode === langCode
              ),
            },
            {
              name: "media_icon",
              label: formLabel("icon"),
              info: formInfo("icon"),
              type: "upload-fm",
              value: draft?.media_icon ?? query?.medias.find(
                (item) =>
                  item.type === "media_icon" && item.langCode === langCode
              ),
            },
            {
              name: "media_thumbnail",
              label: formLabel("thumbnail"),
              info: formInfo("thumbnail"),
              type: "upload-fm",
              value: draft?.media_thumbnail ?? query?.medias.find(
                (item) =>
                  item.type === "media_thumbnail" && item.langCode === langCode
              ),
            },
            {
              name: "media_imagePhone",
              label: formLabel("image_phone"),
              info: formInfo("image_phone"),
              type: "upload-fm",
              value: draft?.media_imagePhone ?? query?.medias.find(
                (item) =>
                  item.type === "media_imagePhone" && item.langCode === langCode
              ),
            },
            {
              name: "media_banner",
              label: formLabel("banner"),
              info: formInfo("banner"),
              type: "upload-fm",
              value: draft?.media_banner ?? query?.medias.find(
                (item) =>
                  item.type === "media_banner" && item.langCode === langCode
              ),
            },
          ],
        },
        {
          title: "Security",
          fields: [
            {
              name: "publishAt",
              label: formLabel("publish_date"),
              info: formInfo("publish_date"),
              type: "datetime-local",
              value: mainDraft?.publishAt
                ? String(mainDraft.publishAt).slice(0, 16)
                : query?.publishAt
                  ? query?.publishAt.toISOString().slice(0, 16)
                  : "",
              allLang: true,
            },
            {
              name: "unPublishAt",
              label: formLabel("unpublish_date"),
              info: formInfo("unpublish_date"),
              type: "datetime-local",
              value: mainDraft?.unPublishAt
                ? String(mainDraft.unPublishAt).slice(0, 16)
                : query?.unPublishAt
                  ? query?.unPublishAt.toISOString().slice(0, 16)
                  : "",
              allLang: true,
            },
            {
              name: "isActive",
              label: formLabel("active"),
              info: formInfo("active"),
              type: "switch",
              value: mainDraft?.isActive ?? query?.isActive ?? false,
              allLang: true,
            },
            {
              name: "approvalStatus",
              label: "Approval Status",
              info: {
                value:
                  "Status approval menu. Menu non-approved hanya tampil untuk user CMS yang sedang login.",
              },
              type: "select-single",
              cols: "col-span-6",
              options: [
                { label: "Requested", value: "REQUESTED" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
              ],
              value: query?.approvalStatus
                ? { label: query.approvalStatus, value: query.approvalStatus }
                : { label: "Approved", value: "APPROVED" },
              disabled: true,
              allLang: true,
            },
            {
              name: "approvalNote",
              label: "Approval Note",
              info: { value: "Catatan approval/reject menu frontend." },
              type: "textarea",
              cols: "col-span-6",
              value: query?.approvalNote ?? "",
              disabled: true,
              allLang: true,
            },
          ],
        },
      ];

      return {
        name: langCode,
        data: steps,
      };
    });

    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form Menu",
      data: langs,
    });
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log("[Role Create-form error]", error);
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
export async function POST(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); // body: { ID: {...}, EN: {...} }
    const body = Object.entries(rawBody).map(([lang, value]) => ({
      lang: lang.toUpperCase(),
      value,
    }));
    const result = await saveOrUpdateMenuForm(body, userToken);

    if (result.error) {
      const respon = ResponseHttp(400, "Maintenace Server", {});
      const response = new NextResponse(respon, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }

    const respon = ResponseHttp(200, result.success, result.data);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[User POST Error]", error);
    const respon = ResponseHttp(500, "Internal Server Error", {});
    const response = new NextResponse(respon, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
export async function PUT(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); // body: { ID: {...}, EN: {...} }
    const body = Object.entries(rawBody).map(([lang, value]) => ({
      lang: lang.toUpperCase(),
      value,
    }));

    const result = await saveOrUpdateMenuForm(body, userToken);

    if (result.error) {
      const respon = ResponseHttp(400, result.error, {});
      const response = new NextResponse(respon, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }
    const respon = ResponseHttp(200, result.success, result.data);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[User PUT Error]", error);
    const respon = ResponseHttp(500, "Internal Server Error", {});
    const response = new NextResponse(respon, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
export async function saveOrUpdateMenuForm(
  langArray: { lang: string; value: any }[],
  userToken: any,
  options: { forceApprove?: boolean; skipDraft?: boolean } = {}
) {
  //console.log("langArray", langArray);
  if (!Array.isArray(langArray)) {
    return { error: "Field tidak lengkap" };
  }
  try {
    const canApproveMenu =
      options.forceApprove ||
      hasMenuApprovalPermission(userToken?.permission || []);
    if (langArray[0].value.value.id) {
      if (!canApproveMenu && !options.skipDraft) {
        await prisma.menu.update({
          where: { id: langArray[0].value.value.id, companyId: userToken.companyId },
          data: {
            approvalStatus: "REQUESTED",
            approvalDraft: langArray as any,
            requestedAt: new Date(),
            requestedBy: userToken.email ?? "system",
            approvalNote: null,
            updateBy: userToken.email ?? "system",
            updatedAt: new Date(),
          },
        });
        clearMenuCacheForCompany(userToken.companyId);
        return { success: "Menu change requested", data: {} };
      }

      // Loop dan jalankan manual upsert untuk translation dan media
      await prisma.menu.update({
        where: { id: langArray[0].value.value.id },
        data: {
          parentId: langArray[0].value.value.parent?.value ?? null,

          isActive: langArray[0].value.value.isActive ?? true,
          typeMenuId: langArray[0].value.value.typeMenuId.value ?? null,
          ...(canApproveMenu
            ? { approvalDraft: null }
            : {
                approvalStatus: "REQUESTED" as const,
                approvalDraft: langArray as any,
                requestedAt: new Date(),
                requestedBy: userToken.email ?? "system",
                approvalNote: null,
              }),
          updateBy: userToken.email ?? "system",
          updatedAt: new Date(),
        },
      });

      const menuTranslationUpserts = langArray.map((item) =>
        prisma.menuTranslation.upsert({
          where: {
            menuId_langCode: {
              menuId: langArray[0].value.value.id,
              langCode: item.value.lang,
            },
          },
          update: {
            title: item.value.value.title,
            slug: item.value.value.slug ?? "",
            subTitle: item.value.value.subTitle ?? null,
            linkType: item.value.value.linkType?.value ?? "URL",
            pageId: item.value.value.pageId?.value ?? null,
            categoryId: item.value.value.categoryId?.value ?? null,
            description: item.value.value.description ?? null,
            overview: item.value.value.overview ?? null,
            updateBy: userToken.email ?? "system",
            updatedAt: new Date(),
          },
          create: {
            menuId: langArray[0].value.value.id,
            langCode: item.value.lang,
            title: item.value.value.title,
            slug: item.value.value.slug ?? "",
            linkType: item.value.value.linkType?.value ?? "URL",
            pageId: item.value.value.pageId?.value ?? null,
            categoryId: item.value.value.categoryId?.value ?? null,
            subTitle: item.value.value.subTitle ?? null,
            description: item.value.value.description ?? null,
            overview: item.value.value.overview ?? null,
            createBy: userToken.email ?? "system",
            createdAt: new Date(),
            companyId: userToken.companyId ?? null,
          },
        })
      );

      const mediaUpserts = langArray.flatMap((item) => {
        const keys = Object.keys(item.value.value).filter((k) =>
          k.includes("media_")
        );
        return keys
          .map((key) => {
            const url = item.value.value[key]?.url;
            if (!url) return null;

            return prisma.media.upsert({
              where: {
                menuId_type_langCode: {
                  menuId: langArray[0].value.value.id,
                  type: key,
                  langCode: item.value.lang,
                },
              },
              update: {
                url,
                title: item.value.value.title,
                alt: item.value.value.title,
                updateBy: userToken.email ?? "system",
                updatedAt: new Date(),
                isDeleted: false,
                isActive: true,
              },
              create: {
                menuId: langArray[0].value.value.id,
                url,
                type: key,
                langCode: item.value.lang,
                title: item.value.value.title,
                alt: item.value.value.title,
                createBy: userToken.email ?? "system",
                createdAt: new Date(),
                isActive: true,
                isDeleted: false,
                companyId: userToken.companyId ?? null,
              },
            });
          })
          .filter(Boolean); // buang null
      });

      // Gabungkan semua query dalam satu transaksi
      await prisma.$transaction([...menuTranslationUpserts, ...mediaUpserts]);
      clearMenuCacheForCompany(userToken.companyId);

      return { success: "Menu updated", data: {} };
    } else {
      const newMenu = await prisma.menu.create({
        data: {
          parentId: langArray[0].value.value.parent.value ?? null,
          sort: langArray[0].value.value.sort ?? 0,
          order: langArray[0].value.value.order ?? 0,
          isActive: langArray[0].value.value.isActive ?? true,
          typeMenuId: langArray[0].value?.value?.typeMenuId?.value ?? null,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          publishAt: toPrismaDateTime(langArray[0].value.value.publishAt),
          unPublishAt: toPrismaDateTime(
            langArray[0].value.value.unPublishAt
          ),
          approvalStatus: canApproveMenu ? "APPROVED" : "REQUESTED",
          requestedAt: new Date(),
          requestedBy: userToken.email ?? "system",
          ...(canApproveMenu
            ? {
                approvedAt: new Date(),
                approvedBy: userToken.email ?? "system",
              }
            : {}),
          companyId: userToken.companyId ?? null,
          translations: {
            create: langArray.map((item: any) => ({
              langCode: item.value.lang,
              title: item.value.value.title,
              slug: item.value.value.slug ?? "",
              linkType: item.value.value.linkType?.value ?? "URL",
              pageId: item.value.value.pageId?.value ?? null,
              categoryId: item.value.value.categoryId?.value ?? null,
              subTitle: item.value.value.subTitle ?? null,
              description: item.value.value.description ?? null,
              overview: item.value.value.overview ?? null,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },
          medias: {
            create: langArray.flatMap((item: any) =>
              Object.keys(item.value.value)
                .filter(
                  (key) => key.includes("media_") && item.value.value[key]?.url
                )
                .map((key) => ({
                  url: item.value.value[key].url,
                  title: item.value.value.title,
                  alt: item.value.value.title,
                  type: key,
                  langCode: item.value.lang,
                  createBy: userToken.email ?? "system",
                  isActive: true,
                  isDeleted: false,
                  companyId: userToken.companyId ?? null,
                }))
            ),
          },
        },
      });
      clearMenuCacheForCompany(userToken.companyId);
      return { success: "Menu created", data: newMenu };
    }
  } catch (error) {
    console.log("error", error);
    return { error: "Field tidak lengkap" };
  }
}
