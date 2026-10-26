import { jwtVerify } from "jose";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultSecretKey"
);

export interface JwtPayloadCustom {
  userId: number;
  email: string;
  companyId: string;
  redmineUserId?: number | null;
  roleId?: number | null;
  loginDate: Date;
  permission: object[];
  langCode: string;
}

type ReqLike = NextApiRequest | Request;

async function loadRolePermissions(roleId: number): Promise<object[]> {
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

async function normalizeJwtPayload(payload: any): Promise<JwtPayloadCustom | null> {
  const userId = Number(payload?.userId);
  const tokenEmail = typeof payload?.email === "string" ? payload.email : "";
  const tokenCompanyId = typeof payload?.companyId === "string" ? payload.companyId : "";
  const roleIdRaw = payload?.roleId;
  const tokenRoleId =
    roleIdRaw === null || roleIdRaw === undefined || roleIdRaw === ""
      ? null
      : Number(roleIdRaw);
  const tokenLangCode = typeof payload?.langCode === "string" ? payload.langCode : "";
  const loginDateRaw = payload?.loginDate;

  if (!userId || !tokenEmail || !tokenCompanyId || !tokenLangCode || typeof loginDateRaw !== "string") {
    return null;
  }

  const currentUser = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      isActive: true,
    },
    select: {
      email: true,
      companyId: true,
      roleId: true,
      langCode: true,
    },
  });

  if (!currentUser) return null;

  const currentRoleId = Number(currentUser.roleId || tokenRoleId || 0);
  const permission =
    currentRoleId && !isNaN(currentRoleId)
      ? await loadRolePermissions(currentRoleId)
      : [];

  return {
    userId,
    email: currentUser.email || tokenEmail,
    companyId: currentUser.companyId || tokenCompanyId,
    redmineUserId:
      payload?.redmineUserId === null || payload?.redmineUserId === undefined
        ? null
        : Number(payload.redmineUserId),
    roleId: currentRoleId && !isNaN(currentRoleId) ? currentRoleId : null,
    loginDate: new Date(loginDateRaw),
    permission,
    langCode: currentUser.langCode || tokenLangCode,
  };
}

/**
 * Ambil token dari Authorization header (support Request & NextApiRequest).
 */
export function getTokenFromHeader(req: ReqLike): string | null {
  let authHeader = "";
  if ("headers" in req && typeof req.headers.get === "function") {
    // Web API Request (App Router)
    authHeader = req.headers.get("authorization") || "";
  } else if ("headers" in req && typeof req.headers === "object") {
    // NextApiRequest (Page Router)
    authHeader = (req as NextApiRequest).headers.authorization || "";
  }
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

/**
 * Verifikasi JWT dan kembalikan payload yang telah diparsing.
 */
export async function verifyAndParseToken(
  req: ReqLike
): Promise<JwtPayloadCustom | null> {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return await normalizeJwtPayload(payload);
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}
export async function getCookiesToken(
  req: NextRequest
): Promise<JwtPayloadCustom | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return await normalizeJwtPayload(payload);
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}
