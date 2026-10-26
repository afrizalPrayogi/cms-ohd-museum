// app/api/table/data/route.ts
import { prisma } from "../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../lib/response";
import { buildSearchFilter } from "../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../lib/exportXls";
import { handleExportPDF } from "../../../lib/exportPdf";
import { HeaderTable } from "../../../types";
import { formatDateTimeIndo } from "../../../lib/helper";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { getCachedMenuForBE } from "app/lib/controller/menu";
import { filterSidebarTreeByPermission } from "app/lib/sidebarPermission";
export const dynamic = "force-dynamic";

async function getFreshUserPermissions(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roleId: true,
    },
  });

  if (!user?.roleId) return [];

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
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("isdownload"); // pdf / xls

    // colom
    const columns: HeaderTable[] = [
      {
        label: "Title",
        key: "title",
        type: "text",
        sort: true,
        typeForm: "text",
        join: true,
        joinSearch: {
          translations: {
            some: {
              title: {
                contains: "value",
              },
              isDeleted: false,
            },
          },
        },
      },
      {
        label: "Slug",
        key: "slug",
        type: "text",
        sort: true,
        typeForm: "text",
        join: true,
        joinSearch: {
          translations: {
            some: {
              slug: {
                contains: "value",
              },
              isDeleted: false,
            },
          },
        },
      },

      {
        label: "Created At",
        key: "createdAt",
        type: "text",
        sort: true,
        typeForm: "hide",
      },
      {
        label: "Active",
        key: "isActive",
        type: "boolean",
        sort: true,
        typeForm: "switch",
      },
    ];

    const userToken: any = await verifyAndParseToken(req);

    const flatMenus: any = await getCachedMenuForBE(
      userToken?.langCode,
      userToken?.companyId
    );
    const freshPermissions = userToken?.userId
      ? await getFreshUserPermissions(Number(userToken.userId))
      : [];
    const tree: any[] = filterSidebarTreeByPermission(
      Array.isArray(flatMenus) ? flatMenus : [],
      freshPermissions
    );
    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(tree, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(tree, columns);
    }
    //default json text
    const respon = ResponseHttp(200, "Success ", {
      title: "Data Role",
      header: columns,
      body: tree,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: false,
      },
    });
    const response = new NextResponse(await respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    const rsp = ResponseHttp(500, "Application Maintenace");
    const response = new NextResponse(await rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
