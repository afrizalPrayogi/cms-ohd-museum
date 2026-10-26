import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "../../../../lib/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    const data = companies.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    return new NextResponse(ResponseHttp(200, "Success", data), {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[GET /cms/company/master]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
