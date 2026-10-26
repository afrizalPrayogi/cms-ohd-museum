import { NextResponse } from "next/server";
import { prisma } from "app/lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { GetDecrypt } from "app/lib/helper";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { clearMenuCacheForCompany } from "app/lib/controller/menu";

export const dynamic = "force-dynamic";

function parseBody(text: string) {
  const decrypted = GetDecrypt(text || "");
  return JSON.parse(decrypted || "{}");
}

async function upsertRolePermission(params: {
  companyId: string | null | undefined;
  roleId: number;
  menuId: number;
  payload: {
    view: boolean;
    create: boolean;
    update: boolean;
    deleted: boolean;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: null;
    updateAt: Date;
    updateBy: string;
  };
  createBy: string;
}) {
  const existing = await prisma.rolePermision.findFirst({
    where: {
      companyId: params.companyId,
      roleId: params.roleId,
      menuId: params.menuId,
    },
    select: {
      id: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  if (existing) {
    return prisma.rolePermision.update({
      where: {
        id: existing.id,
      },
      data: params.payload,
    });
  }

  return prisma.rolePermision.create({
    data: {
      companyId: params.companyId ?? null,
      roleId: params.roleId,
      menuId: params.menuId,
      ...params.payload,
      createBy: params.createBy,
    },
  });
}

async function getAncestorMenuIds(menuId: number, companyId: string | null | undefined) {
  const ancestors: number[] = [];
  let current = await prisma.menu.findFirst({
    where: {
      id: menuId,
      companyId,
      isDeleted: false,
    },
    select: {
      parentId: true,
    },
  });

  while (current?.parentId) {
    ancestors.push(current.parentId);
    current = await prisma.menu.findFirst({
      where: {
        id: current.parentId,
        companyId,
        isDeleted: false,
      },
      select: {
        parentId: true,
      },
    });
  }

  return ancestors;
}

export async function PUT(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    const body = parseBody(await req.text());

    const roleId = Number(body.roleId || 0);
    const menuId = Number(body.menuId || 0);

    if (!roleId || !menuId) {
      return new NextResponse(ResponseHttp(400, "roleId dan menuId wajib diisi"), {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const payload = {
      view: body.view === true,
      create: body.create === true,
      update: body.update === true,
      deleted: body.deleted === true,
      isActive: body.isActive !== false,
      isDeleted: false,
      deletedAt: null,
      updateAt: new Date(),
      updateBy: userToken?.email ?? "system",
    };

    const result = await upsertRolePermission({
      companyId: userToken?.companyId,
      roleId,
      menuId,
      payload,
      createBy: userToken?.email ?? "system",
    });

    if (payload.view && payload.isActive) {
      const ancestorMenuIds = await getAncestorMenuIds(menuId, userToken?.companyId);
      for (const ancestorMenuId of ancestorMenuIds) {
        await upsertRolePermission({
          companyId: userToken?.companyId,
          roleId,
          menuId: ancestorMenuId,
          payload: {
            ...payload,
            view: true,
            create: false,
            update: false,
            deleted: false,
          },
          createBy: userToken?.email ?? "system",
        });
      }
    }

    clearMenuCacheForCompany(userToken?.companyId);

    return new NextResponse(ResponseHttp(200, "Permission berhasil diupdate", result), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[PUT /api/cms/permission/toggle]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
