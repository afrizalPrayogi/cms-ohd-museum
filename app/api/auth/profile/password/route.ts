import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "app/lib/prisma";
import { GetDecrypt } from "app/lib/helper";
import { ResponseHttp } from "app/lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    if (!userToken?.userId) {
      return new NextResponse(ResponseHttp(401, "Token invalid"), {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const rawBody = await req.text();
    const payload = rawBody ? JSON.parse(GetDecrypt(rawBody)) : {};
    const currentPassword = String(payload?.currentPassword || "").trim();
    const newPassword = String(payload?.newPassword || "").trim();
    const confirmPassword = String(payload?.confirmPassword || "").trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return new NextResponse(ResponseHttp(400, "Semua field password wajib diisi"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }
    if (newPassword !== confirmPassword) {
      return new NextResponse(ResponseHttp(400, "Konfirmasi password baru tidak sama"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }
    if (newPassword.length < 6) {
      return new NextResponse(ResponseHttp(400, "Password baru minimal 6 karakter"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: Number(userToken.userId),
        isDeleted: false,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return new NextResponse(ResponseHttp(404, "User tidak ditemukan"), {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return new NextResponse(ResponseHttp(400, "Password saat ini tidak sesuai"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        updateBy: userToken?.email || "system",
        updateAt: new Date(),
      },
    });

    return new NextResponse(
      ResponseHttp(200, "Password berhasil diperbarui"),
      {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }
    );
  } catch (error: any) {
    console.error("[PUT /auth/profile/password]", error);
    return new NextResponse(
      ResponseHttp(500, "Gagal update password", {}, String(error?.message || error)),
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }
}
