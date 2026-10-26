import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";import {
  cleanContent,
  GetDecrypt,
  toPrismaDateTime,
} from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { ResponseHttp } from "../../../../../lib/response";
import { setLoadFormTranslations } from "app/lib/translationFormWording";

export const dynamic = "force-dynamic";

const isValidFileName = (fileName: string) =>
  /^(form-id|form-en)$/i.test(fileName.trim());

export async function PUT(
  req: Request,
  props: { params: Promise<{ fileName: string }> }
) {
  try {
    const userToken = await verifyAndParseToken(req);
    if (!userToken) {
      const rsp = ResponseHttp(401, "Unauthorized");
      return new NextResponse(rsp, {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }
    const params = await props.params;
    const fileName = String(params.fileName || "").trim();
    
    if (!isValidFileName(fileName)) {
      const rsp = ResponseHttp(400, "Invalid wording file name");
      return new NextResponse(rsp, {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const url = new URL(req.url);
    const key = url.searchParams.get("key")?.trim() || "";
    if (!key) {
      const rsp = ResponseHttp(400, "Missing wording key");
      return new NextResponse(rsp, {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText) || "{}");
    const value =
      rawBody?.value !== undefined && rawBody?.value !== null
        ? rawBody.value
        : "";

    const filePath = path.join(
      process.cwd(),
      "public",
      "wording",
      `${fileName}.json`
    );

    if (!fs.existsSync(filePath)) {
      const rsp = ResponseHttp(404, "Wording file not found");
      return new NextResponse(rsp, {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const fileContents = fs.readFileSync(filePath, "utf-8");
    let jsonData: Record<string, any> = {};
    try {
      jsonData = JSON.parse(fileContents || "{}");
    } catch (err) {
      const rsp = ResponseHttp(500, "Invalid JSON file content");
      return new NextResponse(rsp, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    jsonData[key] = value;
    
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
    setLoadFormTranslations(`${fileName}.json`, JSON.stringify(jsonData, null, 2));
    
    const respon = ResponseHttp(200, "Success", { key, value });
    return new NextResponse(respon, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[Wording JSON update error]", error);
    const rsp = ResponseHttp(500, "Internal Server Error");
    return new NextResponse(rsp, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
