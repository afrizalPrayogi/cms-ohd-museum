// app/api/table/data/route.ts
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    const { searchParams } = new URL(req.url);
    const search = String(searchParams.get("search") || "").trim();
    const whereUser: any = {
      isActive: true,
      isDeleted: false,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              {
                email: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
    };

    if (userToken?.companyId) {
      whereUser.companyId = userToken.companyId;
    }

    const roles = await prisma.user.findMany({
      where: whereUser,
      orderBy: {
        name: "asc",
      },
      take: 300,
    });

    const options = roles.map((role) => ({
      value: role.id,
      label: role.name,
    }));

    const respon = ResponseHttp(200, "Success Login", options);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[GET /user/option]", error);
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
