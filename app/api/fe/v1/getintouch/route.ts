import { NextResponse } from "next/server";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
import { prisma } from "app/lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { GetDecrypt } from "app/lib/helper";
import { Step } from "app/types";
export const dynamic = "force-dynamic";
async function getForm(id: number) {
  const langDat = await prisma.lang.findMany({
    where: { isActive: true, code: "id" },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id > 0) {
    query = await prisma.menuType.findUnique({
      where: { id },
    });

    if (!query || query.isDeleted) {
      return new NextResponse(ResponseHttp(404, "Data Not Found"), {
        status: 404,
      });
    }
  }
  // Form step
  const steps: Step[] = [
    {
      title: "Info Role",
      fields: [
        {
          name: "name",
          label: "Name",
          type: "hide",
          value: query?.name ?? null,
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "text",
          value: query?.email ?? null,
          required: true,
        },
        {
          name: "phone",
          label: "Phone",
          type: "text",
          value: query?.phone ?? null,
          required: true,
        },
        {
          name: "location",
          label: "Location",
          type: "text",
          value: query?.location ?? null,
          required: true,
        },
        {
          name: "messages",
          label: "Messages",
          type: "text",
          value: query?.messages ?? null,
          required: true,
        },
      ],
    },
  ];

  // Bentuk array langs berdasarkan hasil langDat
  const langs = langDat.map((lang) => ({
    name: lang.code, // pastikan kolom di database namanya `code`
    data: steps,
  }));
  return langs;
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); 
    
    const result = await saveOrUpdateGetInTouch(rawBody);

    if (result.error) {
      const respon = ResponseHttp(400, result.error, {});
      const response = new NextResponse(respon, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }

    const respon = ResponseHttp(200, result.success, result.data);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[GetInTouch POST Error]", error);
    const respon = ResponseHttp(500, "Internal Server Error", {});
    const response = new NextResponse(respon, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
async function saveOrUpdateGetInTouch(data: any) {
  const {name, email, phone, location, messages, ip } = data;
  // console.log("data ahja", data);
  const initForm = await getForm(0);
  const schema = generateZodSchema(initForm[0].data);

    try {
      const data = {
        name,
        email,
        phone,
        location,
        messages,
        ip:ip??"",
        createdAt: new Date(),
        createBy: name,
        companyId: "cmeeeatkq0000zidiydh22pbi",
      };
      let valid = validateWithZod(schema, data);
      if (!valid.success) {
        return { error: valid.error };
      }
      const created = await prisma.getInTouch.create({
        data,
      });

      return { success: "Get In Touch created", data: created };
    } catch (error) {
      console.log("", error);
      return { error: "Field tidak lengkap" };
    }
}
