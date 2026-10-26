import { NextRequest, NextResponse } from "next/server";
import { GetDecrypt } from "app/lib/helper";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { prisma } from "app/lib/prisma";
import { ResponseHttp } from "app/lib/response";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "-"
  );
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(req: NextRequest) {
  try {
    const userToken = await verifyAndParseToken(req);
    if (!userToken?.userId) {
      return new NextResponse(ResponseHttp(401, "Unauthorized"), {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const { searchParams } = new URL(req.url);
    const moduleName = normalizeText(searchParams.get("moduleName"));
    const folder = normalizeText(searchParams.get("folder"));
    const rowId = Number(searchParams.get("rowId") || 0);

    if (!moduleName || !rowId) {
      return new NextResponse(ResponseHttp(400, "Invalid history payload"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const logs = await prisma.auditlog.findMany({
      where: {
        companyId: userToken.companyId,
        pageId: rowId,
        OR: [
          { menuLabel: moduleName },
          { urlApi: { contains: `/api/${folder}/${moduleName}/` } },
          { urlApi: { contains: `api/${folder}/${moduleName}/` } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const data = logs.map((log) => ({
      id: log.id,
      user: log.user,
      action: log.methodApi,
      urlApi: log.urlApi,
      urlFe: log.urlFe,
      bodyApi: log.bodyApi,
      createdAt: log.createdAt,
      ip: log.ip,
      menuLabel: log.menuLabel,
      pageLabel: log.PageLabel,
    }));

    return new NextResponse(ResponseHttp(200, "Success", data), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[Audit History Error]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userToken = await verifyAndParseToken(req);
    if (!userToken?.userId) {
      return new NextResponse(ResponseHttp(401, "Unauthorized"), {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const rawBody = JSON.parse(GetDecrypt(await req.text()));
    const moduleName = normalizeText(rawBody?.moduleName);
    const folder = normalizeText(rawBody?.folder);
    const rowId = Number(rawBody?.rowId || 0);
    const action = normalizeText(rawBody?.action) || "ACTION";
    const label = normalizeText(rawBody?.label) || "-";
    const urlApi = normalizeText(rawBody?.urlApi) || "-";
    const urlFe = normalizeText(rawBody?.urlFe) || "-";

    if (!moduleName || !rowId) {
      return new NextResponse(ResponseHttp(400, "Invalid audit payload"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const bodyApi =
      typeof rawBody?.bodyApi === "string"
        ? rawBody.bodyApi
        : JSON.stringify(rawBody?.bodyApi ?? {});

    await prisma.auditlog.create({
      data: {
        companyId: userToken.companyId,
        userId: Number(userToken.userId),
        user: userToken.email || "-",
        ip: getClientIp(req),
        urlApi,
        urlFe,
        methodApi: action,
        bodyApi,
        menuId: 0,
        menuLabel: moduleName,
        pageId: rowId,
        PageLabel: label,
        createBy: userToken.email || "-",
        updateBy: userToken.email || "-",
      },
    });

    return new NextResponse(ResponseHttp(200, "Audit logged"), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[Audit Create Error]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
