import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { ResponseHttp } from "../../../../../lib/response";
import { GetDecrypt } from "../../../../../lib/helper";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const decryptedBody = GetDecrypt(body);
    const { linkId } = JSON.parse(decryptedBody);

    if (!linkId) {
      return new NextResponse(
        ResponseHttp(400, "Link ID is required"),
        { status: 400 }
      );
    }

    // Increment count
    await prisma.pageShortLink.update({
      where: { id: linkId },
      data: {
        count: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    });

    return new NextResponse(
      ResponseHttp(200, "Count updated successfully", {}),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking click:", error);
    return new NextResponse(
      ResponseHttp(500, "Internal Server Error"),
      { status: 500 }
    );
  }
}
