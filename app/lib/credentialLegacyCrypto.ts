import CryptoJS from "crypto-js";
import crypto from "crypto";

const secretKey =
  process.env.NEXT_PUBLIC_API_PASS_AES || process.env.JWT_SECRET || "";
const legacyCbcSecret = "lbwyBzfgzUIvXZFShJuikaWvLJhIVq36";

function isLegacyCbcCipher(value: string) {
  return /^[0-9a-f]+:[0-9a-f]+$/i.test(value);
}

function decryptLegacyCbcCipher(value: string) {
  if (!isLegacyCbcCipher(value)) return "";
  try {
    const parts = value.split(":");
    const ivHex = parts.shift() || "";
    const dataHex = parts.join(":");
    if (!ivHex || !dataHex) return "";

    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(dataHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(legacyCbcSecret),
      iv
    );
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}

function normalizeText(value: unknown) {
  return String(value ?? "");
}

export function encryptCredentialLegacy(value: unknown) {
  return CryptoJS.AES.encrypt(normalizeText(value), secretKey).toString();
}

export function decryptCredentialLegacy(value: unknown) {
  const text = normalizeText(value).trim();
  if (!text) return "";

  try {
    const bytes = CryptoJS.AES.decrypt(text, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (decrypted) return decrypted;
  } catch {
    // fallback ke legacy cbc ada di bawah
  }

  try {
    return decryptLegacyCbcCipher(text);
  } catch {
    return "";
  }
}

export function ensureCredentialCipher(value: unknown) {
  const text = normalizeText(value);
  if (!text) return encryptCredentialLegacy("");
  if (text.startsWith("U2FsdGVkX1")) return text;
  if (/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(text)) return text;
  return encryptCredentialLegacy(text);
}

export function decryptCredentialWithFallback(value: unknown) {
  const text = normalizeText(value);
  if (!text) return "";

  const decrypted = decryptCredentialLegacy(text);
  return decrypted || text;
}
