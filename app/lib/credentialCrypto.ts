import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function getSecret() {
  return (
    process.env.CREDENTIAL_SECRET ||
    process.env.JWT_SECRET ||
    process.env.NEXT_PUBLIC_API_PASS_AES ||
    "default-credential-secret"
  );
}

function getKey() {
  return crypto.createHash("sha256").update(getSecret()).digest();
}

export function encryptCredential(plainText: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plainText || ""), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString(
    "hex"
  )}`;
}

export function decryptCredential(cipherText: string) {
  const raw = String(cipherText || "").trim();
  if (!raw) return "";

  const parts = raw.split(":");
  if (parts.length !== 3) return "";

  const [ivHex, tagHex, dataHex] = parts;
  if (!ivHex || !tagHex || !dataHex) return "";

  try {
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(tagHex, "hex");
    const data = Buffer.from(dataHex, "hex");

    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}
