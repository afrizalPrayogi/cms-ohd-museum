import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "app/lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";

const secret = process.env.JWT_SECRET || "defaultSecretKey";

async function loadRolePermissions(roleId: number) {
  if (!Number.isInteger(roleId) || roleId <= 0) return [];

  const permissionRows: any[] = await prisma.$queryRawUnsafe(
    `SELECT
      rp.id,
      rp.menuId,
      rp.view,
      rp.deleted,
      rp.create,
      rp.update,
      rp.approval,
      r.name AS roleName,
      mt.title AS menuTitle,
      mt.slug AS menuSlug
    FROM \`RolePermision\` rp
    LEFT JOIN \`Role\` r ON r.id = rp.roleId
    LEFT JOIN \`Menu\` m ON m.id = rp.menuId
    LEFT JOIN \`MenuTranslation\` mt ON mt.menuId = m.id AND mt.langCode = 'ID'
    WHERE rp.roleId = ?
      AND rp.isDeleted = false
      AND rp.isActive = true
      AND r.isDeleted = false
      AND r.isActive = true
      AND m.isDeleted = false
      AND m.isActive = true
      AND (mt.id IS NULL OR (mt.isDeleted = false AND mt.isActive = true))`,
    roleId
  );

  return permissionRows.map((row: any) => ({
    id: row.id,
    menuId: row.menuId,
    role: {
      name: row.roleName ?? "",
    },
    menu: {
      translations:
        row.menuTitle || row.menuSlug
          ? [{ title: row.menuTitle ?? "", slug: row.menuSlug ?? "" }]
          : [],
    },
    view: !!row.view,
    deleted: !!row.deleted,
    create: !!row.create,
    update: !!row.update,
    approval: !!row.approval,
  }));
}

export async function GET(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    if (!userToken?.userId) {
      return new NextResponse(ResponseHttp(401, "Unauthorized"), {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: Number(userToken.userId),
        isDeleted: false,
        isActive: true,
      },
    });

    if (!user) {
      return new NextResponse(ResponseHttp(401, "Unauthorized"), {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const permission = await loadRolePermissions(Number(user.roleId || 0));
    const secretKey = new TextEncoder().encode(secret);
    const token = await new SignJWT({
      userId: user.id.toString(),
      email: user.email,
      companyId: user.companyId,
      redmineUserId: userToken.redmineUserId ?? null,
      roleId: user.roleId,
      loginDate: new Date().toISOString(),
      langCode: user.langCode,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secretKey);

    const refreshedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        token,
        tokenAt: new Date(),
        loginDate: new Date(),
        isLogin: true,
      },
    });

    return new NextResponse(
      ResponseHttp(200, "Session refreshed", {
        ...refreshedUser,
        permission,
        roleId: refreshedUser.roleId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }
    );
  } catch (error) {
    console.error("[Auth Session GET Error]", error);
    return new NextResponse(ResponseHttp(500, "Internal Server Error", {}), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
