import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import {
  cleanContent,
  GetDecrypt,
  toPrismaDateTime,
} from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { url } from "inspector";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
import { isAnyOf } from "@reduxjs/toolkit";
import { slugify } from "app/lib/slug";
import { formWordingTr } from "app/lib/translationFormWording";
export const dynamic = "force-dynamic";

function hasPageApprovalPermission(permission: any[] = []) {
  return permission.some((perm) => {
    const slug = perm?.menu?.translations?.[0]?.slug || "";
    return slug.split("/").includes("page") && Boolean(perm?.approval);
  });
}

function normalizeCustomSectionConfig(value: any) {
  if (!value || typeof value !== "object") return null;
  if (value.mode !== "CUSTOM") return null;

  const columns = Math.min(4, Math.max(1, Number(value.columns || 1)));
  const items = Array.isArray(value.items) ? value.items.slice(0, columns) : [];

  return {
    mode: "CUSTOM",
    backgroundType: value.backgroundType || "color",
    backgroundColor: value.backgroundColor || "#ffffff",
    backgroundImage: value.backgroundImage ?? null,
    width: value.width || "container",
    sectionStyle: value.sectionStyle || "flat",
    columns,
    contentType: value.contentType || "content",
    sourceCategoryId: value.sourceCategoryId ?? null,
    textStyles: value.textStyles ?? {},
    items: Array.from({ length: columns }).map((_, index) => {
      const item = items[index] || {};
      return {
        backgroundType: item.backgroundType || "color",
        backgroundColor: item.backgroundColor || "#ffffff",
        backgroundImage: item.backgroundImage ?? null,
        columnStyle: item.columnStyle || "flat",
        title: item.title || "",
        subTitle: item.subTitle || "",
        content: cleanContent(item.content || ""),
        image: item.image ?? null,
      };
    }),
  };
}

async function getForm(id: number, userLangCode = "ID") {
  const formLabel = (key: string) => formWordingTr(userLangCode, key);
  const formInfo = (key: string) => ({
    value: formWordingTr(userLangCode, `${key}_info`),
    key: `${key}_info`,
  });
  const langDat = await prisma.lang.findMany({
    where: { isActive: true },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id > 0) {
    query = await prisma.page.findUnique({
      where: { id },
      include: {
        translations: true,
        mediaPages: true,
        sectionsAsMain: {
          orderBy: [{ order: "asc" }, { id: "asc" }],
          include: {
            template: true,
            page: { include: { translations: true } },
            category: { include: { pageTranslations: true } },
            pageShortLinks: true,
          },
        },
        wording: true,
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
    const draftSections = Array.isArray(draft.sections) ? draft.sections : null;
    const draftWording = Array.isArray(draft.wording) ? draft.wording : null;
    const sec = query?.sectionsAsMain
      ?.filter((section) => section.langCode === langCode)
      ?.map((section) => ({
        ...section,
        idLangData: section, // di sini udah pasti langCode match
      }));
    const words = query?.wording
      ?.filter((word) => word.langCode === langCode)
      ?.map((word) => ({
        ...word,
        idLangData: word, // di sini udah pasti langCode match
      }));
    const steps: Step[] = [
      {
        title: "Page Data",
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
            sameValue: [
              "slug",
              "metaTitle",
              "ogTitle",
              "metaKeyword",
              "metaDescription",
            ],
            required: true,
          },
          {
            name: "subTitle",
            label: formLabel("sub_title"),
            info: formInfo("sub_title"),
            type: "text",
            value: draft?.subTitle ?? trans?.subTitle ?? "",
          },
          {
            name: "slug",
            label: formLabel("slug"),
            info: formInfo("slug"),
            type: "text",
            value: draft?.slug ?? trans?.slug ?? "",
            replaceValue: { from: " ", to: "-" },
            required: true,
          },
          {
            name: "overview",
            label: formLabel("overview"),
            info: formInfo("overview"),
            type: "text-editor",
            value: draft?.overview ?? trans?.overview ?? "",
            cols: "col-span-12",
          },
          // {
          //   name: "description",
          //   label: "Description",
          //   type: "text-editor",
          //   cols: "col-span-12",
          //   value: trans?.description ?? "",
          // },
        ],
      },
      {
        title: "Section",
        fields: [
          {
            name: "sections",
            label: formLabel("add_section"),
            info: formInfo("add_section"),
            type: "addRowTable",
            allLang: true,
            value: draftSections
              ? draftSections
              : sec
              ? sec.map((rw, i) => ({
                  sectionMode:
                    (rw.customConfig as any)?.mode === "CUSTOM"
                      ? { value: "CUSTOM", label: "Custom" }
                      : { value: "TEMPLATE", label: "Template" },
                  templateId: rw.template?.id
                    ? {
                        value: rw.template.id,
                        label: rw.template.name ?? "",
                      }
                    : null,
                  id: rw.id ?? "",
                  type: rw.type ? { value: rw.type, label: rw.type } : null,
                  categoryId: rw?.category?.id
                    ? {
                        value: rw.category.id,
                        label:
                          rw.category.pageTranslations?.find(
                            (p) => p.langCode === langCode
                          )?.title ?? "",
                      }
                    : null,
                  pageIdData: rw?.page?.id
                    ? {
                        value: rw.page.id,
                        label:
                          rw.page.translations?.find(
                            (p) => p.langCode === langCode
                          )?.title ?? "",
                      }
                    : null,
                  title: rw.title ?? "",
                  subTitle: rw?.subTitle ?? "",
                  description: rw?.description ?? "",
                  shortLink: rw?.pageShortLinks?.[0]?.link ?? "",
                  image: { url: rw?.image },
                  secondImage: { url: rw?.secondImage },
                  customConfig:
                    (rw.customConfig as any)?.mode === "CUSTOM"
                      ? {
                          ...(rw.customConfig as any),
                          sourceCategoryId:
                            (rw.customConfig as any)?.sourceCategoryId ||
                            (rw.category?.id
                              ? {
                                  value: rw.category.id,
                                  label:
                                    rw.category.pageTranslations?.find(
                                      (p) => p.langCode === langCode
                                    )?.title ?? "",
                                }
                              : null),
                        }
                      : null,
                  titleTextStyle: (rw.customConfig as any)?.textStyles?.title ?? {},
                  subTitleTextStyle:
                    (rw.customConfig as any)?.textStyles?.subTitle ?? {},
                  descriptionTextStyle:
                    (rw.customConfig as any)?.textStyles?.description ?? {},
                  isActive: rw?.isActive ?? true 
                }))
              : [],

            fieldAddRow: [
              {
                name: "sectionMode",
                label: "Section Mode",
                info: { value: "Pilih Template untuk layout hardcode, atau Custom untuk layout dinamis dari CMS." },
                type: "select-single",
                cols: "col-span-6",
                options: [
                  { value: "TEMPLATE", label: "Template" },
                  { value: "CUSTOM", label: "Custom" },
                ],
                value: null,
                allLang: true,
              },
              {
                name: "templateId",
                label: formLabel("template"),
                info: formInfo("template"),
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/template/master",
                allLang: true,
                hideFields: [
                  {
                    name: "sectionMode",
                    value: ["CUSTOM", "", null],
                  },
                ],
              },
              {
                name: "type",
                label: formLabel("type_section"),
                info: formInfo("type_section"),
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/typeSection/master",
                allLang: true,
                hideFields: [
                  {
                    name: "sectionMode",
                    value: ["CUSTOM", "", null],
                  },
                ],
              },
              {
                name: "customConfig",
                label: "Custom Section",
                info: { value: "Setup background, style, jumlah kolom, dan isi konten custom section." },
                type: "custom-section-builder",
                cols: "col-span-12",
                allLang: true,
                hideFields: [
                  {
                    name: "sectionMode",
                    value: ["TEMPLATE", "", null],
                  },
                ],
              },
              {
                name: "categoryId",
                label: formLabel("category"),
                info: formInfo("category"),
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/category/master",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CONTENT", "PAGE"],
                  },
                  {
                    name: "sectionMode",
                    value: ["CUSTOM"],
                  },
                ],
              },
              {
                name: "pageIdData",
                label: formLabel("page"),
                info: formInfo("page"),
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/page/master",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CONTENT", "CATEGORY"],
                  },
                  {
                    name: "sectionMode",
                    value: ["CUSTOM"],
                  },
                ],
              },
              {
                name: "title",
                label: formLabel("title"),
                info: formInfo("title"),
                type: "text",
                cols: "col-span-6",
                styleFieldName: "titleTextStyle",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "subTitle",
                label: formLabel("sub_title"),
                info: formInfo("sub_title"),
                type: "text",
                cols: "col-span-6",
                styleFieldName: "subTitleTextStyle",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              
              {
                name: "shortLink",
                label: formLabel("short_link"),
                info: formInfo("short_link"),
                type: "text",
                cols: "col-span-12",
                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
                allLang: true,
              },
              {
                name: "description",
                label: formLabel("description"),
                info: formInfo("description"),
                type: "text-editor",
                cols: "col-span-12",
                styleFieldName: "descriptionTextStyle",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "image",
                label: formLabel("first_image_file"),
                info: formInfo("first_image_file"),
                type: "upload-fm",
                cols: "col-span-6",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "secondImage",
                label: formLabel("second_image_file"),
                info: formInfo("second_image_file"),
                type: "upload-fm",
                cols: "col-span-6",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "isActive",
                label: formLabel("active"),
                info: formInfo("active"),
                type: "switch",
                value: true,
                allLang: true
              },
            ],
            cols: "col-span-12",
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
            allLang: true,
            value: draft?.media_image ?? query?.mediaPages.find(
              (item) =>
                item.type === "media_image" && item.langCode === langCode
            ),
          },
          {
            name: "media_icon",
            label: formLabel("icon"),
            info: formInfo("icon"),
            allLang: true,
            type: "upload-fm",
            value: draft?.media_icon ?? query?.mediaPages.find(
              (item) => item.type === "media_icon" && item.langCode === langCode
            ),
          },
          {
            name: "media_thumbnail",
            label: formLabel("thumbnail"),
            info: formInfo("thumbnail"),
            allLang: true,
            type: "upload-fm",
            value: draft?.media_thumbnail ?? query?.mediaPages.find(
              (item) =>
                item.type === "media_thumbnail" && item.langCode === langCode
            ),
          },
          {
            name: "media_imagePhone",
            label: formLabel("image_phone"),
            info: formInfo("image_phone"),
            allLang: true,
            type: "upload-fm",
            value: draft?.media_imagePhone ?? query?.mediaPages.find(
              (item) =>
                item.type === "media_imagePhone" && item.langCode === langCode
            ),
          },
          {
            name: "media_banner",
            label: formLabel("banner"),
            info: formInfo("banner"),
            allLang: true,
            type: "upload-fm",
            value: draft?.media_banner ?? query?.mediaPages.find(
              (item) =>
                item.type === "media_banner" && item.langCode === langCode
            ),
          },
        ],
      },
      {
        title: "Meta Data",
        fields: [
          {
            name: "metaTitle",
            label: formLabel("meta_title"),
            info: formInfo("meta_title"),
            type: "text",
            cols: "col-span-6",
            value: draft?.metaTitle ?? trans.metaTitle,
            required: true,
          },
          {
            name: "metaDescription",
            label: formLabel("meta_description"),
            info: formInfo("meta_description"),
            type: "textarea",
            cols: "col-span-6",
            sameValue: ["ogDescription"],
            value: draft?.metaDescription ?? trans.metaDescription,
          },
          {
            name: "metaKeywords",
            label: formLabel("meta_keywords"),
            info: formInfo("meta_keywords"),
            type: "text",
            cols: "col-span-6",
            value: draft?.metaKeywords ?? trans.metaKeywords,
          },
          {
            name: "ogTitle",
            label: formLabel("og_title"),
            info: formInfo("og_title"),
            type: "text",
            cols: "col-span-6",
            value: draft?.ogTitle ?? trans.ogTitle,
          },
          {
            name: "ogDescription",
            label: formLabel("og_description"),
            info: formInfo("og_description"),
            type: "textarea",
            cols: "col-span-6",
            value: draft?.ogDescription ?? trans.ogDescription,
          },
          {
            name: "ogImage",
            label: formLabel("og_image_url"),
            info: formInfo("og_image_url"),
            type: "upload-fm", // atau file jika pakai file manager
            cols: "col-span-6",
            value: draft?.ogImage ?? { url: trans.ogImage },
          },
          {
            name: "ogType",
            label: formLabel("og_type"),
            info: formInfo("og_type"),
            type: "text", // atau bisa pakai select jika perlu opsi tetap seperti 'website', 'article'
            cols: "col-span-6",
            value: draft?.ogType ?? trans.ogType,
          },
          {
            name: "canonicalUrl",
            label: formLabel("canonical_url"),
            info: formInfo("canonical_url"),
            type: "text",
            cols: "col-span-6",
            value: draft?.canonicalUrl ?? trans.canonicalUrl,
          },
          {
            name: "robots",
            label: formLabel("robots"),
            info: formInfo("robots"),
            type: "select-single",
            cols: "col-span-6",
            options: [
              { label: "Index, Follow", value: "index, follow" },
              { label: "Noindex, Follow", value: "noindex, follow" },
              { label: "Index, Nofollow", value: "index, nofollow" },
              { label: "Noindex, Nofollow", value: "noindex, nofollow" },
            ],
            value: (draft?.robots ?? trans.robots)
              ? {
                  label: draft?.robots?.label ?? draft?.robots?.value ?? draft?.robots ?? trans.robots,
                  value: draft?.robots?.value ?? draft?.robots ?? trans.robots,
                }
              : { label: "Index, Follow", value: "index, follow" },
          },
          {
            name: "twitterCard",
            label: formLabel("twitter_card"),
            info: formInfo("twitter_card"),
            type: "select-single",
            cols: "col-span-6",
            options: [
              { label: "Summary Large Image", value: "summary_large_image" },
              { label: "Summary", value: "summary" },
            ],
            value: (draft?.twitterCard ?? trans.twitterCard)
              ? {
                  label:
                    draft?.twitterCard?.label ??
                    draft?.twitterCard?.value ??
                    draft?.twitterCard ??
                    trans.twitterCard,
                  value: draft?.twitterCard?.value ?? draft?.twitterCard ?? trans.twitterCard,
                }
              : { label: "Summary Large Image", value: "summary_large_image" },
          },
          {
            name: "twitterTitle",
            label: formLabel("twitter_title"),
            info: formInfo("twitter_title"),
            type: "text",
            cols: "col-span-6",
            value: draft?.twitterTitle ?? trans.twitterTitle,
          },
          {
            name: "twitterDescription",
            label: formLabel("twitter_description"),
            info: formInfo("twitter_description"),
            type: "textarea",
            cols: "col-span-6",
            value: draft?.twitterDescription ?? trans.twitterDescription,
          },
          {
            name: "twitterImage",
            label: formLabel("twitter_image"),
            info: formInfo("twitter_image"),
            type: "upload-fm",
            cols: "col-span-6",
            value: draft?.twitterImage ?? { url: trans.twitterImage },
          },
          {
            name: "structuredData",
            label: formLabel("structured_data"),
            info: formInfo("structured_data"),
            type: "textarea",
            cols: "col-span-12",
            value: draft?.structuredData ?? trans.structuredData,
          },
        ],
      },
      {
        title: "Wording",
        fields: [
          {
            name: "wording",
            label: formLabel("add_wording"),
            info: formInfo("add_wording"),
            type: "addRowTable",
            allLang: true,
              value: draftWording
                ? draftWording
                : words
                ? words.map((rw, i) => ({
                  key: rw.key ?? "",
                  label: rw.label ?? "",
                }))
              : [],
            fieldAddRow: [
              {
                name: "key",
                label: formLabel("key"),
                info: formInfo("key"),
                type: "text",
                cols: "col-span-6",
                allLang: true,
                replaceValue: { from: " ", to: "" },
              },
              {
                name: "label",
                label: formLabel("label"),
                info: formInfo("label"),
                type: "text",
                cols: "col-span-6",
              },
            ],
            cols: "col-span-12",
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
            info: { value: "Status approval page. Page non-approved hanya tampil untuk user CMS yang sedang login." },
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
            info: { value: "Catatan approval/reject page." },
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
  return langs;
}
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    const userToken = await verifyAndParseToken(req);
    // example get langs array
    const langs = await getForm(id, userToken?.langCode);
    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form Page",
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
    const result = await saveOrUpdatePageForm(body, userToken);

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

    const result = await saveOrUpdatePageForm(body, userToken);

    if (result.error) {
      const respon = ResponseHttp(400, result.error, {});
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

export async function saveOrUpdatePageForm(
  langArray: { lang: string; value: any }[],
  userToken: any,
  options: { forceApprove?: boolean; skipDraft?: boolean } = {}
) {
  //console.log("test", langArray);
  const mainPage = langArray[0]?.value?.value;
  const pageId = mainPage?.id;
  const initForm = await getForm(0);
  const schema = generateZodSchema(initForm[0].data);
  const canApprovePage =
    options.forceApprove || hasPageApprovalPermission(userToken?.permission || []);

  try {
    if (pageId) {
      console.log("📌 Update Page ID:", pageId);
      try {
        if (!canApprovePage && !options.skipDraft) {
          await prisma.page.update({
            where: { id: pageId, companyId: userToken.companyId },
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
          return { success: "Page change requested", data: {} };
        }

        // ✅ 1. Update page utama
        const dataMpage = {
          sort: mainPage.sort ?? 0,
          order: mainPage.order ?? 0,
          isActive: mainPage.isActive ?? true,
          publishAt: toPrismaDateTime(mainPage.publishAt),
          unPublishAt: toPrismaDateTime(mainPage.unPublishAt),
          ...(canApprovePage
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
        };

        let valid = validateWithZod(schema, dataMpage);
        if (!valid.success) {
          return { error: valid.error };
        }
        // ✅ 2. Upsert page translation
        const menuTranslationUpserts = langArray
          .map((item) => {
            const value = item?.value?.value;
            const langCode = item?.value?.lang;

            if (!value?.id || !langCode) return null;
            const dataEd = {
              title: value.title,
              slug: slugify(value.slug.toLowerCase() ?? ""),
              subTitle: value.subTitle ?? null,
              description: cleanContent(value.description ?? ""),
              overview: cleanContent(value.overview ?? ""),
              metaDescription: value.metaDescription ?? null,
              metaKeywords: value.metaKeywords ?? null,
              metaTitle: value.metaTitle ?? null,
              canonicalUrl: value.canonicalUrl ?? null,
              ogDescription: value.ogDescription ?? null,
              ogImage: value.ogImage?.url ?? null,
              ogTitle: value.ogTitle ?? null,
              ogType: value.ogType ?? null,
              robots: value.robots?.value ?? value.robots ?? null,
              twitterCard: value.twitterCard?.value ?? value.twitterCard ?? null,
              twitterTitle: value.twitterTitle ?? null,
              twitterDescription: value.twitterDescription ?? null,
              twitterImage: value.twitterImage?.url ?? null,
              structuredData: value.structuredData ?? null,
              updateBy: userToken.email ?? "system",
              updatedAt: new Date(),
            };
            const datacr = {
              pageId: value.id,
              langCode,
              title: value.title,
              slug: slugify(value.slug.toLowerCase() ?? ""),
              subTitle: value.subTitle ?? null,
              description: cleanContent(value.description ?? ""),
              overview: cleanContent(value.overview ?? ""),
              metaDescription: value.metaDescription ?? null,
              metaKeywords: value.metaKeywords ?? null,
              metaTitle: value.metaTitle ?? null,
              canonicalUrl: item.value.value.canonicalUrl ?? null,
              ogDescription: value.ogDescription ?? null,
              ogImage: value.ogImage?.url ?? null,
              ogTitle: value.ogTitle ?? null,
              ogType: value.ogType ?? null,
              robots: value.robots?.value ?? value.robots ?? null,
              twitterCard: value.twitterCard?.value ?? value.twitterCard ?? null,
              twitterTitle: value.twitterTitle ?? null,
              twitterDescription: value.twitterDescription ?? null,
              twitterImage: value.twitterImage?.url ?? null,
              structuredData: value.structuredData ?? null,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            };
            const valided = validateWithZod(schema, dataEd);
            const validcr = validateWithZod(schema, datacr);
            if (!valided.success) {
              throw new Error(valided.error);
            }
            if (!validcr.success) {
              throw new Error(validcr.error);
            }
            return prisma.pageTranslation.upsert({
              where: {
                pageId_langCode: {
                  pageId: value.id,
                  langCode,
                },
              },
              update: dataEd,
              create: datacr,
            });
          })
          .filter(Boolean);

        // ✅ 3. Upsert media per bahasa
        const mediaUpserts = langArray.flatMap((item) => {
          const keys = Object.keys(item?.value?.value || {}).filter((k) =>
            k.includes("media_")
          );

          return keys
            .map((key) => {
              const url = item.value.value[key]?.url;
              if (!url) return null;
              const dataEd = {
                url,
                title: item.value.value.title,
                alt: item.value.value.title,
                updateBy: userToken.email ?? "system",
                updatedAt: new Date(),
                isDeleted: false,
                isActive: true,
              };
              const datacr = {
                pageId,
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
              };
              const valided = validateWithZod(schema, dataEd);
              const validcr = validateWithZod(schema, datacr);
              if (!valided.success) {
                throw new Error(valided.error);
              }
              if (!validcr.success) {
                throw new Error(validcr.error);
              }
              return prisma.mediaPage.upsert({
                where: {
                  pageId_type_langCode: {
                    pageId,
                    type: key,
                    langCode: item.value.lang,
                  },
                },
                update: dataEd,
                create: datacr,
              });
            })
            .filter(Boolean);
        });

        // ✅ 4. Section ops
        const sectionOps = langArray.flatMap((item) => {
          const sections = item?.value?.value?.sections;
          const langCode = item?.value?.lang;

          if (!sections || !Array.isArray(sections)) return [];

          return sections.map((section, isec: number) => {
            const {
              title,
              subTitle,
              description,
              templateId,
              categoryId,
              pageIdData,
              type,
              image,
              isActive,
              secondImage,
              customConfig,
              sectionMode,
              titleTextStyle,
              subTitleTextStyle,
              descriptionTextStyle,
            } = section;
            const modeValue = sectionMode?.value || sectionMode || "TEMPLATE";
            const normalizedCustomConfig =
              modeValue === "CUSTOM"
                ? normalizeCustomSectionConfig({
                    ...(customConfig || {}),
                    mode: "CUSTOM",
                    textStyles: {
                      title: titleTextStyle || {},
                      subTitle: subTitleTextStyle || {},
                      description: descriptionTextStyle || {},
                    },
                  })
                : null;
            let datacr: any = {
              pageId: pageId,
              langCode,
              type: type?.value,
              title: title ?? null,
              subTitle: subTitle ?? null,
              description: cleanContent(description) ?? null,
              overview: null,
              image: image?.url ?? null,
              secondImage: secondImage?.url ?? null,
              customConfig: normalizedCustomConfig,
              isActive:
                typeof isActive === "boolean" ? isActive : isActive?.value ?? true,
              isDeleted: false,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              order: isec,
              templateId: normalizedCustomConfig ? null : templateId?.value ?? null,
              categoryId:
                normalizedCustomConfig?.contentType === "category"
                  ? normalizedCustomConfig?.sourceCategoryId?.value ?? null
                  : categoryId?.value ?? null,
              pageIdData: pageIdData?.value ?? null,
              companyId: userToken.companyId ?? null,
            };
            if (section.shortLink && !normalizedCustomConfig) {
              datacr.pageShortLinks = {
                create: [{
                  link: section.shortLink,
                  createBy: userToken.email ?? "system",
                  updateBy: userToken.email ?? "system",
                }],
              };
            }
            // const validcr = validateWithZod(schema, datacr);
            // if (!validcr.success) {
            //   throw new Error(validcr.error);
            // }
            return prisma.section.create({
              data: datacr,
            });
          });
        });
        const wording = langArray.flatMap((item) => {
          const wording = item?.value?.value?.wording;
          const langCode = item?.value?.lang;

          if (!wording || !Array.isArray(wording)) return [];

          return wording.map((section, isec: number) => {
            const { key, label } = section;
            const datacr = {
              pageId: pageId,
              langCode,
              key: key,
              label: label,
            };
            const validcr = validateWithZod(schema, datacr);
            if (!validcr.success) {
              throw new Error(validcr.error);
            }
            return prisma.wordingPage.create({
              data: datacr,
            });
          });
        });

        // ✅ 5. Transaksi gabungan
        // Hapus PageShortLink terlebih dahulu sebelum hapus Section
        const sectionsToDelete = await prisma.section.findMany({
          where: { pageId },
          select: { id: true },
        });
        const sectionIds = sectionsToDelete.map(s => s.id);

        await prisma.$transaction([
          // Hapus PageShortLink yang terkait dengan sections yang akan dihapus
          prisma.pageShortLink.deleteMany({
            where: { sectionId: { in: sectionIds } },
          }),
          prisma.page.update({
            where: { id: pageId },
            data: dataMpage,
          }),
          prisma.section.deleteMany({
            where: { pageId },
          }),
          prisma.wordingPage.deleteMany({
            where: { pageId },
          }),
          ...sectionOps,
          ...wording,
          ...menuTranslationUpserts,
          ...mediaUpserts,
        ]);

        console.log("✅ Semua data berhasil diupdate.");
        return { success: "Page updated", data: {} };
      } catch (error) {
        console.error("🔥 ERROR di proses update Page:", error);
        return { error: "Update page failed", details: error };
      }
    } else {
      const newMenu = await prisma.page.create({
        data: {
          sort: langArray[0].value.value.sort ?? 0,
          order: langArray[0].value.value.order ?? 0,
          isActive: langArray[0].value.value.isActive ?? true,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          publishAt: toPrismaDateTime(langArray[0].value.value.publishAt),
          unPublishAt: toPrismaDateTime(langArray[0].value.value.unPublishAt),
          approvalStatus: canApprovePage ? "APPROVED" : "REQUESTED",
          requestedAt: new Date(),
          requestedBy: userToken.email ?? "system",
          ...(canApprovePage
            ? {
                approvedAt: new Date(),
                approvedBy: userToken.email ?? "system",
              }
            : {}),
          pageType: "PAGE",
          companyId: userToken.companyId ?? null,
          translations: {
            create: langArray.map((item: any) => ({
              langCode: item.value.lang,
              title: item.value.value.title,
              slug: slugify(item.value.value.slug.toLowerCase() ?? ""),
              subTitle: item.value.value.subTitle ?? null,
              description: cleanContent(item.value.value.description ?? ""),
              metaDescription: item.value.value.metaDescription ?? null,
              metaKeywords: item.value.value.metaKeywords ?? null,
              metaTitle: item.value.value.metaTitle ?? null,
              ogDescription: item.value.value.ogDescription ?? null,
              canonicalUrl: item.value.value.canonicalUrl ?? null,
              ogImage: item?.value?.value?.ogImage?.url ?? null,
              ogTitle: item?.value?.value?.ogTitle ?? null,
              ogType: item.value.value.ogType ?? null,
              robots: item.value.value.robots?.value ?? item.value.value.robots ?? null,
              twitterCard:
                item.value.value.twitterCard?.value ??
                item.value.value.twitterCard ??
                null,
              twitterTitle: item.value.value.twitterTitle ?? null,
              twitterDescription: item.value.value.twitterDescription ?? null,
              twitterImage: item.value.value.twitterImage?.url ?? null,
              structuredData: item.value.value.structuredData ?? null,
              overview: cleanContent(item.value.value.overview) ?? null,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },
          mediaPages: {
            create: langArray.flatMap((item: any) =>
              Object.keys(item.value.value)
                .filter(
                  (key) => key.includes("media_") && item.value.value[key]?.url
                )
                .map((key) => ({
                  url: item.value.value[key]?.url ?? null,
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
          sectionsAsMain: {
            create: langArray.flatMap((item: any) =>
              (item.value.value.sections ?? []).map((section: any) => {
                const modeValue =
                  section.sectionMode?.value || section.sectionMode || "TEMPLATE";
                const normalizedCustomConfig =
                  modeValue === "CUSTOM"
                    ? normalizeCustomSectionConfig({
                        ...(section.customConfig || {}),
                        mode: "CUSTOM",
                        textStyles: {
                          title: section.titleTextStyle || {},
                          subTitle: section.subTitleTextStyle || {},
                          description: section.descriptionTextStyle || {},
                        },
                      })
                    : null;

                return {
                  langCode: item.value.lang,
                  pageIdData: section.pageIdData?.value ?? null,
                  categoryId:
                    normalizedCustomConfig?.contentType === "category"
                      ? normalizedCustomConfig?.sourceCategoryId?.value ?? null
                      : section.categoryId?.value ?? null,
                  templateId: normalizedCustomConfig
                    ? null
                    : section.templateId?.value ?? null,
                  type: section.type?.value,
                  order: section.order ?? 0,
                  title: section.title ?? null,
                  subTitle: section.subTitle ?? null,
                  description: cleanContent(section.description) ?? null,
                  image: section.image?.url ?? null,
                  secondImage: section.secondImage?.url ?? null,
                  customConfig: normalizedCustomConfig,
                  isActive:
                    typeof section.isActive === "boolean"
                      ? section.isActive
                      : section.isActive?.value ?? true,
                  isDeleted: false,
                  createBy: userToken.email ?? "system",
                  createdAt: new Date(),
                  companyId: userToken.companyId ?? null,
                  ...(section.shortLink && !normalizedCustomConfig
                    ? {
                        pageShortLinks: {
                          create: [
                            {
                              link: section.shortLink,
                              createBy: userToken.email ?? "system",
                              createdAt: new Date(),
                              updateBy: userToken.email ?? "system",
                              updatedAt: new Date(),
                            },
                          ],
                        },
                      }
                    : {}),
                };
              })
            ),
          },
          wording: {
            create: langArray.flatMap((item: any) =>
              (item.value.value.wording ?? []).map((section: any) => ({
                key: slugify(section.key),
                label: section.label,
                langCode: item.value.lang,
                companyId: userToken.companyId ?? null,
              }))
            ),
          },
        },
      });

      return { success: "Page created", data: newMenu };
    }
  } catch (error) {
    console.log("error", error);
    return { error: (error as Error).message };
  }
}
