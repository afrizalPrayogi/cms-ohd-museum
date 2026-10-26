import { NextResponse } from "next/server";
import { prisma } from "app/lib/prisma";
import { verifyAndParseToken } from "app/lib/jwtParse";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    if (!userToken?.email) {
      return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const sectionIds = Array.isArray(body?.sectionIds)
      ? body.sectionIds.map((id: any) => Number(id)).filter(Boolean)
      : [];

    if (!sectionIds.length) {
      return NextResponse.json(
        { code: 400, message: "sectionIds is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      sectionIds.map((id: number, order: number) =>
        prisma.section.update({
          where: { id },
          data: {
            order,
            updateBy: userToken.email,
            updatedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({ code: 200, message: "Section order updated" });
  } catch (error) {
    console.error("[PUT /api/cms/page/section]", error);
    return NextResponse.json(
      { code: 500, message: "Failed to update section order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    if (!userToken?.email) {
      return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const sectionId = Number(body?.sectionId || 0);

    if (!sectionId) {
      return NextResponse.json(
        { code: 400, message: "sectionId is required" },
        { status: 400 }
      );
    }

    await prisma.section.update({
      where: { id: sectionId },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
        updateBy: userToken.email,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ code: 200, message: "Section deleted" });
  } catch (error) {
    console.error("[DELETE /api/cms/page/section]", error);
    return NextResponse.json(
      { code: 500, message: "Failed to delete section" },
      { status: 500 }
    );
  }
}
