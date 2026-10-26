import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import { GetDecrypt } from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";

export const dynamic = "force-dynamic";

async function getForm(id: string) {
  const langDat = await prisma.lang.findMany({
    where: { isActive: true, code: "id" },
    orderBy: {
      code: "desc",
    },
  });

  let query = null;
  if (id !== "0") {
    query = await prisma.company.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!query) {
      return new NextResponse(ResponseHttp(404, "Data Not Found"), {
        status: 404,
      });
    }
  }

  const steps: Step[] = [
    {
      title: "Info Company / Client",
      fields: [
        {
          name: "id",
          label: "id",
          type: "hide",
          value: query?.id ?? null,
        },
        {
          name: "name",
          label: "Name",
          type: "text",
          value: query?.name ?? null,
          required: true,
        },
        {
          name: "phone",
          label: "Phone",
          type: "text",
          value: query?.phone ?? null,
        },
        {
          name: "email",
          label: "Email",
          type: "text",
          value: query?.email ?? null,
        },
        {
          name: "address",
          label: "Address",
          type: "text",
          value: query?.address ?? null,
        },
        {
          name: "isActive",
          label: "Active",
          type: "switch",
          value: query?.isActive ?? true,
        },
      ],
    },
  ];

  return langDat.map((lang) => ({
    name: lang.code,
    data: steps,
  }));
}

function normalizePayload(rawBody: any) {
  const entries = Object.entries(rawBody || {}).map(([lang, value]) => ({
    lang: lang.toUpperCase(),
    value: value as any,
  }));

  const current = entries.find((item) => item.lang === "ID") || entries[0];
  return (current?.value as any)?.value || {};
}

async function saveOrUpdateCompany(payload: any, userToken: any) {
  const initForm = await getForm("0");
  const schema = generateZodSchema(initForm[0].data);

  const id = String(payload?.id || "").trim();
  const name = String(payload?.name || "").trim();
  const phone = String(payload?.phone || "").trim();
  const email = String(payload?.email || "").trim();
  const address = String(payload?.address || "").trim();
  const isActive =
    typeof payload?.isActive === "boolean" ? payload.isActive : true;

  const dataValidate = {
    name,
    phone,
    email,
    address,
    isActive,
  };

  const valid = validateWithZod(schema, dataValidate);
  if (!valid.success) {
    return { error: valid.error };
  }

  if (id) {
    const exists = await prisma.company.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      return { error: "Data Not Found" };
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        isActive,
        updateBy: userToken?.email ?? "system",
        updatedAt: new Date(),
      },
    });

    return { success: "Company / Client updated", data: updated };
  }

  const created = await prisma.company.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      isActive,
      isDeleted: false,
      createBy: userToken?.email ?? "system",
      updateBy: "-",
    },
  });

  return { success: "Company / Client created", data: created };
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const langs = await getForm(params.id);
    if (langs instanceof NextResponse) return langs;

    return new NextResponse(
      ResponseHttp(200, "Success", {
        title: "Form Company / Client",
        data: langs,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
  } catch (error) {
    console.error("[GET /cms/company/form/[id]]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText) || "{}");
    const result = await saveOrUpdateCompany(normalizePayload(rawBody), userToken);

    if (result.error) {
      return new NextResponse(ResponseHttp(400, result.error, {}), {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    return new NextResponse(ResponseHttp(200, result.success, result.data), {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[POST /cms/company/form/[id]]", error);
    return new NextResponse(ResponseHttp(500, "Internal Server Error", {}), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

export async function PUT(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText) || "{}");
    const result = await saveOrUpdateCompany(normalizePayload(rawBody), userToken);

    if (result.error) {
      return new NextResponse(ResponseHttp(400, result.error, {}), {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    return new NextResponse(ResponseHttp(200, result.success, result.data), {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[PUT /cms/company/form/[id]]", error);
    return new NextResponse(ResponseHttp(500, "Internal Server Error", {}), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
