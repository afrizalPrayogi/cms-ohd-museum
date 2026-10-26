import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { ResponseHttp } from "../../../../../lib/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = String(params.id || "").trim();

  if (!id) {
    return new NextResponse(ResponseHttp(400, "Invalid id"), {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  try {
    const query = await prisma.company.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!query) {
      return new NextResponse(ResponseHttp(404, "Not found data"), {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    return new NextResponse(ResponseHttp(200, "Success", query), {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[GET /cms/company/view/[id]]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
