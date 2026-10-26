import { NextResponse } from "next/server";
import { prisma } from "app/lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { getPermission } from "app/lib/helper";

export const dynamic = "force-dynamic";

function asString(value: unknown) {
  return String(value || "").trim();
}

type TreeNode = {
  id: number;
  parentId: number | null;
  title: string;
  slug: string;
  sort: number;
  permissionId: number | null;
  flags: {
    view: boolean;
    create: boolean;
    update: boolean;
    deleted: boolean;
    isActive: boolean;
  } | null;
  children: TreeNode[];
};

export async function GET(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    const { searchParams } = new URL(req.url);
    const companyId = asString(userToken?.companyId);
    const langCode = asString(userToken?.langCode || "ID");
    const selectedRoleId = Number(searchParams.get("roleId") || 0) || null;

    const [roles, menus] = await Promise.all([
      prisma.role.findMany({
        where: {
          companyId,
          isActive: true,
          isDeleted: false,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.menu.findMany({
        where: {
          companyId,
          typeMenuId: 1,
          isActive: true,
          isDeleted: false,
        },
        orderBy: [{ order: "asc" }, { parentId: "asc" }, { id: "asc" }],
        select: {
          id: true,
          parentId: true,
          order: true,
          translations: {
            where: {
              langCode,
              isActive: true,
              isDeleted: false,
            },
            select: {
              title: true,
              slug: true,
            },
            take: 1,
          },
        },
      }),
    ]);

    const effectiveRoleId = selectedRoleId || roles[0]?.id || null;

    const permissions = effectiveRoleId
      ? await prisma.rolePermision.findMany({
          where: {
            companyId,
            roleId: effectiveRoleId,
            isDeleted: false,
          },
          select: {
            id: true,
            menuId: true,
            view: true,
            create: true,
            update: true,
            deleted: true,
            isActive: true,
          },
        })
      : [];

    const permissionByMenuId = new Map(permissions.map((item) => [item.menuId, item] as const));

    const nodes: TreeNode[] = menus.map((menu) => {
      const translation = menu.translations[0];
      const permission = permissionByMenuId.get(menu.id);

      return {
        id: menu.id,
        parentId: menu.parentId ?? null,
        title: asString(translation?.title) || `Menu #${menu.id}`,
        slug: asString(translation?.slug) || "-",
        sort: Number(menu.order || 0),
        permissionId: permission?.id ?? null,
        flags: permission
          ? {
              view: Boolean(permission.view),
              create: Boolean(permission.create),
              update: Boolean(permission.update),
              deleted: Boolean(permission.deleted),
              isActive: Boolean(permission.isActive),
            }
          : null,
        children: [],
      };
    });

    const map = new Map(nodes.map((item) => [item.id, item] as const));
    const roots: TreeNode[] = [];

    nodes.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return new NextResponse(
      ResponseHttp(200, "Success", {
        permission: getPermission(userToken?.permission, "permission"),
        selectedRoleId: effectiveRoleId,
        roles: roles.map((item) => ({
          value: item.id,
          label: item.name,
        })),
        tree: roots,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/cms/permission/tree]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
