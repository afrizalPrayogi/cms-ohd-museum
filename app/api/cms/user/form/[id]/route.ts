import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import bcrypt from "bcrypt";
import { GetDecrypt } from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
import { decryptCredentialAny } from "app/lib/credentialDecryptAny";
import { encryptCredential } from "app/lib/credentialCrypto";
import { formWordingTr } from "app/lib/translationFormWording";
export const dynamic = "force-dynamic";

function parseIncomingBody(bodyText: string) {
  const decrypted = GetDecrypt(bodyText || "");
  const candidate = String(decrypted || bodyText || "").trim();
  if (!candidate) return {};
  return JSON.parse(candidate);
}

function normalizeUserPayloadToLangArray(rawBody: any) {
  if (Array.isArray(rawBody)) {
    return rawBody as { lang: string; value: any }[];
  }

  if (!rawBody || typeof rawBody !== "object") {
    return [];
  }

  const directFieldNames = [
    "id",
    "name",
    "email",
    "phone",
    "password",
    "role",
    "companyId",
    "isActive",
    "emailCredentialPassword",
    "emailImapHost",
    "emailImapPort",
    "emailImapSecure",
    "emailSmtpHost",
    "emailSmtpPort",
    "emailSmtpSecure",
  ];

  const hasDirectFields = directFieldNames.some(
    (field) => Object.prototype.hasOwnProperty.call(rawBody, field)
  );

  if (hasDirectFields) {
    return [{ lang: "ID", value: rawBody }];
  }

  return Object.entries(rawBody).map(([lang, value]) => ({
    lang: String(lang || "").toUpperCase(),
    value,
  }));
}

async function getForm(id: number, userLangCode = "ID") {
  const formLabel = (key: string) => formWordingTr(userLangCode, key);
  const formInfo = (key: string) => ({
    value: formWordingTr(userLangCode, `${key}_info`),
    key: `${key}_info`,
  });
  // example get langs array
  const langDat = await prisma.lang.findMany({
    where: { isActive: true, code: "id" },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id > 0) {
    query = await prisma.user.findUnique({
      where: { id },
      include: { role: true, company: true },
    });

    if (!query || query.isDeleted) {
      return new NextResponse(ResponseHttp(404, "Data Not Found"), {
        status: 404,
      });
    }
  }
  // Form step
  const steps: Step[] = [
    {
      title: "Info User",
      fields: [
        {
          name: "id",
          label: formLabel("id"),
          info: formInfo("id"),
          type: "hide",
          value: query?.id ?? null,
        },
        {
          name: "name",
          label: formLabel("name"),
          info: formInfo("name"),
          type: "text",
          value: query?.name ?? null,
          required: true,
        },
        {
          name: "email",
          label: formLabel("email"),
          info: formInfo("email"),
          type: "email",
          value: query?.email ?? null,
          required: true,
        },
        {
          name: "phone",
          label: formLabel("phone"),
          info: formInfo("phone"),
          type: "text",
          value: query?.phone ?? null,
          required: false,
        },
        {
          name: "companyId",
          label: formLabel("company"),
          info: formInfo("company"),
          type: "select-single",
          value: query?.companyId
            ? { value: query.companyId, label: query.company?.name }
            : {},
          required: true,
          uriSelect: "api/cms/company/master",
        },
      ],
    },
    {
      title: "Security",
      fields: [
        {
          name: "password",
          label: formLabel("password"),
          info: formInfo("password"),
          type: "password-repassword",
          value: null,
          required: true,
        },
        {
          name: "role",
          label: formLabel("role"),
          info: formInfo("role"),
          type: "select-single",
          value: { value: query?.role?.id, label: query?.role?.name },
          uriSelect: "api/cms/role/master",
          required: true,
        },
        {
          name: "isActive",
          label: formLabel("active"),
          info: formInfo("active"),
          type: "switch",
          value: query?.isActive,
        },
      ],
    },
    // {
    //   title: "Email Credential",
    //   fields: [
    //     {
    //       name: "emailCredentialPassword",
    //       label: formLabel("email_credential_password"),
    //       info: formInfo("email_credential_password"),
    //       type: "password",
    //       value: query?.emailCredentialPasswordCipher
    //         ? decryptCredentialAny(query.emailCredentialPasswordCipher)
    //         : null,
    //       required: false,
    //     },
    //     {
    //       name: "emailImapHost",
    //       label: formLabel("imap_host"),
    //       info: formInfo("imap_host"),
    //       type: "text",
    //       value: query?.emailImapHost ?? null,
    //       required: false,
    //     },
    //     {
    //       name: "emailImapPort",
    //       label: formLabel("imap_port"),
    //       info: formInfo("imap_port"),
    //       type: "text",
    //       value: query?.emailImapPort != null ? String(query.emailImapPort) : null,
    //       required: false,
    //     },
    //     {
    //       name: "emailImapSecure",
    //       label: formLabel("imap_secure"),
    //       info: formInfo("imap_secure"),
    //       type: "switch",
    //       value: query?.emailImapSecure ?? true,
    //     },
    //     {
    //       name: "emailSmtpHost",
    //       label: formLabel("smtp_host"),
    //       info: formInfo("smtp_host"),
    //       type: "text",
    //       value: query?.emailSmtpHost ?? null,
    //       required: false,
    //     },
    //     {
    //       name: "emailSmtpPort",
    //       label: formLabel("smtp_port"),
    //       info: formInfo("smtp_port"),
    //       type: "text",
    //       value: query?.emailSmtpPort != null ? String(query.emailSmtpPort) : null,
    //       required: false,
    //     },
    //     {
    //       name: "emailSmtpSecure",
    //       label: formLabel("smtp_secure"),
    //       info: formInfo("smtp_secure"),
    //       type: "switch",
    //       value: query?.emailSmtpSecure ?? true,
    //     },
    //   ],
    // },
  ];

  // Bentuk array langs berdasarkan hasil langDat
  const langs = langDat.map((lang) => ({
    name: lang.code, // pastikan kolom di database namanya `code`
    data: steps,
  }));
  return langs;
}
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    const langs = await getForm(id);

    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form User",
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
    console.log("[User Create-form error]", error);
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
    const rawBody = parseIncomingBody(bodyText);
    const body = normalizeUserPayloadToLangArray(rawBody);
    const result = await saveOrUpdateUser(body, userToken);

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
    const rawBody = parseIncomingBody(bodyText);
    const body = normalizeUserPayloadToLangArray(rawBody);

    const result = await saveOrUpdateUser(body, userToken);

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

async function saveOrUpdateUser(
  langArray: { lang: string; value: any }[],
  userToken: any
) {
  const getSelectValue = (input: any) => {
    if (input === null || input === undefined) return null;
    if (typeof input === "object" && "value" in input) {
      return input.value ?? null;
    }
    return input;
  };

  const initForm = await getForm(0);
  const schema = generateZodSchema(initForm[0].data);

  if (!Array.isArray(langArray)) {
    throw new Error("Invalid body format. Expected array.");
  }

  const selectedData =
    langArray.find((d) => d.lang === "ID")?.value || langArray[0]?.value;
  const payload = selectedData?.value ?? selectedData;

  if (!payload || typeof payload !== "object") {
    return { error: "Payload user tidak valid" };
  }

  const {
    id,
    name,
    email,
    phone,
    password,
    role,
    companyId,
    isActive,
    emailCredentialPassword,
    emailImapHost,
    emailImapPort,
    emailImapSecure,
    emailSmtpHost,
    emailSmtpPort,
    emailSmtpSecure,
  } = payload;
  const normalizedLangCode = String(userToken?.langCode || "id")
    .trim()
    .toUpperCase();
  const normalizedName = String(name || "").trim();
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedPhone = String(phone || "").trim();
  const normalizedEmailCredentialPassword = String(emailCredentialPassword || "").trim();
  let normalizedEmailImapHost = String(emailImapHost || "").trim();
  let normalizedEmailImapPort = Number(String(emailImapPort || "").trim() || 0);
  let normalizedEmailSmtpHost = String(emailSmtpHost || "").trim();
  let normalizedEmailSmtpPort = Number(String(emailSmtpPort || "").trim() || 0);
  const normalizedCompanyId = String(getSelectValue(companyId) || "").trim();
  const normalizedRoleId = Number(getSelectValue(role));
  const normalizedEmailImapSecure = !!emailImapSecure;
  const normalizedEmailSmtpSecure = !!emailSmtpSecure;
  const hasImapHost = normalizedEmailImapHost.length > 0;
  const hasImapPort = normalizedEmailImapPort > 0;
  const hasSmtpHost = normalizedEmailSmtpHost.length > 0;
  const hasSmtpPort = normalizedEmailSmtpPort > 0;

  const isLikelyNumericHost = (value: string) => /^\d+$/.test(value.trim());

  // Auto-clean common mistakes on optional email credential fields.
  if (isLikelyNumericHost(normalizedEmailImapHost) && !hasImapPort) {
    normalizedEmailImapHost = "";
  }
  if (isLikelyNumericHost(normalizedEmailSmtpHost) && !hasSmtpPort) {
    normalizedEmailSmtpHost = "";
  }
  if (!normalizedEmailImapHost) {
    normalizedEmailImapPort = 0;
  }
  if (!normalizedEmailSmtpHost) {
    normalizedEmailSmtpPort = 0;
  }

  const hasCleanImapHost = normalizedEmailImapHost.length > 0;
  const hasCleanImapPort = normalizedEmailImapPort > 0;
  const hasCleanSmtpHost = normalizedEmailSmtpHost.length > 0;
  const hasCleanSmtpPort = normalizedEmailSmtpPort > 0;

  if (!normalizedName || !normalizedEmail || !normalizedCompanyId || isNaN(normalizedRoleId) || normalizedRoleId <= 0) {
    return { error: "Field user belum lengkap" };
  }

  if (hasCleanImapHost !== hasCleanImapPort) {
    return { error: "IMAP Host dan IMAP Port harus diisi berpasangan." };
  }

  if (hasCleanSmtpHost !== hasCleanSmtpPort) {
    return { error: "SMTP Host dan SMTP Port harus diisi berpasangan." };
  }

  if (hasCleanImapHost && isLikelyNumericHost(normalizedEmailImapHost)) {
    return { error: "IMAP Host tidak valid. Host harus berupa domain/server, bukan angka port." };
  }

  if (hasCleanSmtpHost && isLikelyNumericHost(normalizedEmailSmtpHost)) {
    return { error: "SMTP Host tidak valid. Host harus berupa domain/server, bukan angka port." };
  }

  if (hasCleanImapPort && (normalizedEmailImapPort < 1 || normalizedEmailImapPort > 65535)) {
    return { error: "IMAP Port tidak valid. Gunakan angka port antara 1 sampai 65535." };
  }

  if (hasCleanSmtpPort && (normalizedEmailSmtpPort < 1 || normalizedEmailSmtpPort > 65535)) {
    return { error: "SMTP Port tidak valid. Gunakan angka port antara 1 sampai 65535." };
  }

  let hashedPassword: string | undefined = undefined;

  if (
    typeof password === "object" &&
    typeof password.password === "string" &&
    password.password.trim() !== ""
  ) {
    hashedPassword = await bcrypt.hash(password.password, 10);
  }

  if (id) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        isDeleted: false,
        NOT: { id: parseInt(id) },
      },
      select: { id: true },
    });
    if (existingEmail) {
      return { error: "Email sudah digunakan user lain" };
    }

    const updateData: any = {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone || null,
      emailImapHost: normalizedEmailImapHost || null,
      emailImapPort: normalizedEmailImapPort > 0 ? normalizedEmailImapPort : null,
      emailImapSecure: normalizedEmailImapSecure,
      emailSmtpHost: normalizedEmailSmtpHost || null,
      emailSmtpPort: normalizedEmailSmtpPort > 0 ? normalizedEmailSmtpPort : null,
      emailSmtpSecure: normalizedEmailSmtpSecure,
      companyId: normalizedCompanyId,
      roleId: normalizedRoleId,
      langCode: normalizedLangCode,
      updateBy: userToken?.email ?? "system",
      updateAt: new Date(),
      isActive,
    };
    let valid = validateWithZod(schema, updateData);
    if (!valid.success) {
      return { error: valid.error };
    }
    if (hashedPassword) {
      updateData.password = hashedPassword;
    }
    if (normalizedEmailCredentialPassword) {
      updateData.emailCredentialPasswordCipher = encryptCredential(
        normalizedEmailCredentialPassword
      );
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return { success: "User updated", data: updated };
  } else {
    if (!hashedPassword) {
      return { error: "Password wajib diisi untuk user baru" };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        isDeleted: false,
      },
      select: { id: true },
    });
    if (existingEmail) {
      return { error: "Email sudah digunakan" };
    }

    const dataAdd: any = {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone || null,
      emailCredentialPasswordCipher: normalizedEmailCredentialPassword
        ? encryptCredential(normalizedEmailCredentialPassword)
        : null,
      emailImapHost: normalizedEmailImapHost || null,
      emailImapPort: normalizedEmailImapPort > 0 ? normalizedEmailImapPort : null,
      emailImapSecure: normalizedEmailImapSecure,
      emailSmtpHost: normalizedEmailSmtpHost || null,
      emailSmtpPort: normalizedEmailSmtpPort > 0 ? normalizedEmailSmtpPort : null,
      emailSmtpSecure: normalizedEmailSmtpSecure,
      companyId: normalizedCompanyId,
      password: hashedPassword,
      roleId: normalizedRoleId,
      langCode: normalizedLangCode,
      isActive: isActive,
      isDeleted: false,
      createBy: userToken?.email ?? "system",
      updateBy: "-",
    };
    let valid = validateWithZod(schema, dataAdd);
    if (!valid.success) {
      return { error: valid.error };
    }
    const created = await prisma.user.create({
      data: dataAdd,
    });

    return { success: "User created", data: created };
  }
}
