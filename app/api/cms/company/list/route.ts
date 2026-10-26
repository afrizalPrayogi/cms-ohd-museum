import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "../../../../lib/response";
import { buildSearchFilter } from "../../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../../lib/exportXls";
import { handleExportPDF } from "../../../../lib/exportPdf";
import { HeaderTable } from "../../../../types";
import { formatDateTimeIndo, getPermission } from "../../../../lib/helper";
import { verifyAndParseToken } from "app/lib/jwtParse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const isDownload = searchParams.get("isdownload");
    const skip = (page - 1) * limit;

    const columns: HeaderTable[] = [
      {
        label: "Name",
        key: "name",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: "Phone",
        key: "phone",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: "Email",
        key: "email",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: "Address",
        key: "address",
        type: "text",
        sort: true,
        typeForm: "text",
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

    const allowedSort = Object.fromEntries(
      columns.filter((col) => col.sort).map((col) => [col.key, true])
    );

    let orderBy: any = { createdAt: "desc" };
    if (allowedSort[sortBy]) {
      orderBy = { [sortBy]: order };
    }

    const whereConditions = buildSearchFilter(searchParams, columns);
    const where: Prisma.CompanyWhereInput = {
      isDeleted: false,
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [items, total, userToken] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          createdAt: true,
          isActive: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
      verifyAndParseToken(req),
    ]);

    const body = items.map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone ?? "-",
      email: item.email ?? "-",
      address: item.address ?? "-",
      createdAt: formatDateTimeIndo(item.createdAt),
      isActive: item.isActive,
    }));

    if (isDownload === "xls") {
      return await handleExportXLS(body, columns);
    }

    if (isDownload === "pdf") {
      return await handleExportPDF(body, columns);
    }

    const permissionCompany = getPermission(
      (userToken as any)?.permission,
      "company"
    );
    const hasConfiguredPermission =
      permissionCompany?.add ||
      permissionCompany?.edit ||
      permissionCompany?.delete ||
      permissionCompany?.view;
    const permissionFallback = hasConfiguredPermission
      ? permissionCompany
      : {
          list: true,
          add: true,
          edit: true,
          delete: true,
          active: true,
          reject: false,
          approve: false,
          view: true,
        };

    const respon = ResponseHttp(200, "Success", {
      title: "Data Company / Client",
      header: columns,
      body,
      total,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: false,
        permission: permissionFallback,
      },
    });

    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[GET /cms/company/list]", error);
    return new NextResponse(ResponseHttp(500, "Application Maintenace"), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
