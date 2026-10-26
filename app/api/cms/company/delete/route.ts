import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
import { GetDecrypt } from "../../../../lib/helper";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const bodyText = await req.text();
  const body = JSON.parse(GetDecrypt(bodyText) || "{}");
  const id = String(body?.id || "").trim();

  if (!id) {
    return new NextResponse(ResponseHttp(400, "Invalid id"), {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  try {
    const userToken: any = await verifyAndParseToken(req);
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
      return new NextResponse(ResponseHttp(404, "Not found data"), {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const data = await prisma.company.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updateBy: userToken?.email ?? "system",
      },
    });

    return new NextResponse(ResponseHttp(200, "Company / Client deleted", data), {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[PUT /cms/company/delete]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
