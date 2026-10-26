import fs from "fs";
import path from "path";

type Lang = "ID" | "EN";
const formCache: Partial<Record<Lang, Record<string, string>>> = {};

function formatKey(key: string): string {
  return key
    .replaceAll("_", " ") // ganti underscore jadi spasi
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() // kapitalisasi tiap kata
    );
}

function loadFormTranslations(lang: Lang): Record<string, string> {
  if (formCache[lang]) return formCache[lang]!;

  const fileName = lang === "EN" ? "form-en.json" : "form-id.json";
  const filePath = path.join(process.cwd(), "public", "wording", fileName);

  try {
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileContents || "{}");
    formCache[lang] = parsed;
    return parsed;
  } catch (error) {
    console.error("Failed to load form wording file:", fileName, error);
    formCache[lang] = {};
    return {};
  }
}

export function formWordingTr(lang: string, key: string) {
  const safeLang: Lang = lang === "EN" ? "EN" : "ID";
  const translations = loadFormTranslations(safeLang);
  return translations[key] || formatKey(key);
}

export function setLoadFormTranslations(fileName: string, fileContents:string): Record<string, string> {

  const lang = fileName === "form-en.json" ? "EN": "ID";

  try {
    const parsed = JSON.parse(fileContents || "{}");
    
    formCache[lang] = parsed;
    return parsed;
  } catch (error) {
    console.error("Failed to load form wording file:", fileName, error);
    formCache[lang] = {};
    return {};
  }
}
