import { NextResponse } from "next/server";
import { GetDecrypt } from "app/lib/helper";
import { prisma } from "app/lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { saveOrUpdatePageForm } from "../form/[id]/route";

function hasPageApprovalPermission(permission: any[] = []) {
  return permission.some((perm) => {
    const slug = perm?.menu?.translations?.[0]?.slug || "";
    return slug.split("/").includes("page") && Boolean(perm?.approval);
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
    const pageId = Number(rawBody?.id);
    const status = String(rawBody?.status || "").toUpperCase();
    const note = String(rawBody?.note || "").trim() || null;

    if (!pageId || !["REQUESTED", "APPROVED", "REJECTED"].includes(status)) {
      return new NextResponse(ResponseHttp(400, "Invalid approval payload"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const canApprove = hasPageApprovalPermission(userToken.permission || []);
    if (["APPROVED", "REJECTED"].includes(status) && !canApprove) {
      return new NextResponse(ResponseHttp(403, "Forbidden approval action"), {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, companyId: userToken.companyId },
      select: { approvalDraft: true },
    });

    if (!page) {
      return new NextResponse(ResponseHttp(404, "Page not found"), {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (status === "APPROVED" && Array.isArray(page.approvalDraft)) {
      const applyResult = await saveOrUpdatePageForm(
        page.approvalDraft as any,
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
      data.requestedAt = new Date();
      data.requestedBy = userToken.email;
      data.approvedAt = null;
      data.approvedBy = null;
      data.rejectedAt = null;
      data.rejectedBy = null;
    }

    if (status === "APPROVED") {
      data.approvedAt = new Date();
      data.approvedBy = userToken.email;
      data.rejectedAt = null;
      data.rejectedBy = null;
      data.approvalDraft = null;
    }

    if (status === "REJECTED") {
      data.rejectedAt = new Date();
      data.rejectedBy = userToken.email;
      data.approvedAt = null;
      data.approvedBy = null;
      data.approvalDraft = null;
    }

    const updated = await prisma.page.update({
      where: {
        id: pageId,
        companyId: userToken.companyId,
      },
      data,
    });

    return new NextResponse(ResponseHttp(200, "Approval page berhasil diupdate", updated), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[Page Approval Error]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
