import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { ResponseHttp } from "../../lib/response";
import { GetDecrypt } from "../../lib/helper";
import { SignJWT } from "jose";
import { prisma } from "../../lib/prisma";
const secret = process.env.JWT_SECRET || "defaultSecretKey";
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const decrypted = GetDecrypt(body);
    if (!decrypted || !decrypted.trim()) {
      const rsp = ResponseHttp(400, "Payload login tidak valid");
      return new NextResponse(rsp, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    let reqDecrypt: any = {};
    try {
      reqDecrypt = JSON.parse(decrypted);
    } catch {
      const rsp = ResponseHttp(400, "Payload login tidak valid");
      return new NextResponse(rsp, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const email = String(reqDecrypt?.email || "").trim();
    const password = String(reqDecrypt?.password || "");
    if (!email || !password) {
      const rsp = ResponseHttp(400, "Email dan password wajib diisi");
      return new NextResponse(rsp, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const users: any[] = await prisma.$queryRawUnsafe(
      `
        SELECT
          u.id,
          u.email,
          u.password,
          u.companyId,
          u.roleId,
          u.langCode,
          u.isDeleted
        FROM \`User\` u
        WHERE u.email = ?
        LIMIT 1
      `,
      email
    );

    const user = users?.[0];
    if (!user || user?.isDeleted) {
      const rsp = ResponseHttp(404, "User/Password tidak ditemukan");
      return new NextResponse(rsp, {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }


    if (!user.password || typeof user.password !== "string") {
      const rsp = ResponseHttp(404, "User/Password tidak ditemukan");
      return new NextResponse(rsp, {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const rsp = ResponseHttp(404, "User/Password tidak ditemukan");
      return new NextResponse(rsp, {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

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
      user.roleId
    );

    const permission = permissionRows.map((row: any) => ({
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

    const secretKey = new TextEncoder().encode(secret);
    const token = await new SignJWT({
      userId: user.id.toString(),
      email: user.email,
      companyId: user.companyId,
      roleId: user.roleId,
      loginDate: new Date().toISOString(),
      langCode: user.langCode,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secretKey);

    await prisma.$executeRawUnsafe(
      "UPDATE `User` SET token = ?, tokenAt = NOW(3), loginDate = NOW(3), isLogin = ? WHERE id = ?",
      token,
      true,
      user.id
    );

    const refreshed: any[] = await prisma.$queryRawUnsafe(
      `
        SELECT
          u.*
        FROM \`User\` u
        WHERE u.id = ?
        LIMIT 1
      `,
      user.id
    );
    const dataSuccess = {
      ...(refreshed?.[0] ?? user),
      permission,
      roleId: user.roleId,
    };

    const resString = ResponseHttp(200, "Success Login", dataSuccess);
    const response = new NextResponse(resString, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error("[Auth POST Error]", error);
    const rsp = ResponseHttp(500, "Internal Server Error", {});
    return new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
