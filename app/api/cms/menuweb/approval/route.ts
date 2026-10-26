import { NextResponse } from "next/server";
import { clearMenuCacheForCompany } from "app/lib/controller/menu";
import { GetDecrypt } from "app/lib/helper";
import { prisma } from "app/lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { saveOrUpdateMenuForm } from "../form/[id]/route";

function hasMenuApprovalPermission(permission: any[] = []) {
  return permission.some((perm) => {
    const slug = perm?.menu?.translations?.[0]?.slug || "";
    return slug.split("/").includes("menuweb") && Boolean(perm?.approval);
  });
}

export async function PUT(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    if (!userToken?.userId) {
      return new NextResponse(ResponseHttp(401, "Unauthorized"), {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const rawBody = JSON.parse(GetDecrypt(await req.text()));
    const menuId = Number(rawBody?.id);
    const status = String(rawBody?.status || "").toUpperCase();
    const note = String(rawBody?.note || "").trim() || null;

    if (!menuId || !["REQUESTED", "APPROVED", "REJECTED"].includes(status)) {
      return new NextResponse(ResponseHttp(400, "Invalid approval payload"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const canApprove = hasMenuApprovalPermission(userToken.permission || []);
    if (["APPROVED", "REJECTED"].includes(status) && !canApprove) {
      return new NextResponse(ResponseHttp(403, "Forbidden approval action"), {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, companyId: userToken.companyId },
      select: { approvalDraft: true },
    });

    if (!menu) {
      return new NextResponse(ResponseHttp(404, "Menu not found"), {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (status === "APPROVED" && Array.isArray(menu.approvalDraft)) {
      const applyResult = await saveOrUpdateMenuForm(
        menu.approvalDraft as any,
        userToken,
        { forceApprove: true, skipDraft: true }
      );

      if (applyResult?.error) {
        return new NextResponse(ResponseHttp(400, "Apply approval draft failed", applyResult), {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    const data: any = {
      approvalStatus: status,
      approvalNote: note,
      updateBy: userToken.email,
      updatedAt: new Date(),
    };

    if (status === "REQUESTED") {
      Object.assign(data, {
        requestedAt: new Date(),
        requestedBy: userToken.email,
        approvedAt: null,
        approvedBy: null,
        rejectedAt: null,
        rejectedBy: null,
      });
    } else if (status === "APPROVED") {
      Object.assign(data, {
        approvedAt: new Date(),
        approvedBy: userToken.email,
        rejectedAt: null,
        rejectedBy: null,
        approvalDraft: null,
      });
    } else {
      Object.assign(data, {
        rejectedAt: new Date(),
        rejectedBy: userToken.email,
        approvedAt: null,
        approvedBy: null,
        approvalDraft: null,
      });
    }

    const updated = await prisma.menu.update({
      where: { id: menuId, companyId: userToken.companyId },
      data,
    });
    clearMenuCacheForCompany(userToken.companyId);

    return new NextResponse(
      ResponseHttp(200, "Approval menu berhasil diupdate", updated),
      { status: 200, headers: { "Content-Type": "text/plain" } }
    );
  } catch (error) {
    console.error("[Menu Approval Error]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
