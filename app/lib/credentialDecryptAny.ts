import { decryptCredential } from "./credentialCrypto";
import { decryptCredentialLegacy } from "./credentialLegacyCrypto";

function isLikelyGcmCipher(value: string) {
  return /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value);
}

function isLikelyLegacyCipher(value: string) {
  return value.startsWith("U2FsdGVkX1") || /^[0-9a-f]+:[0-9a-f]+$/i.test(value);
}

export function decryptCredentialAny(value: unknown) {
  let current = String(value ?? "").trim();
  if (!current) return "";

  // Toleransi data lama yang bisa terenkripsi berlapis (legacy <-> gcm).
  for (let i = 0; i < 3; i += 1) {
    if (isLikelyGcmCipher(current)) {
      const gcm = decryptCredential(current).trim();
      if (gcm && gcm !== current) {
        current = gcm;
        continue;
      }
    }

    if (isLikelyLegacyCipher(current)) {
      const legacy = decryptCredentialLegacy(current).trim();
      if (legacy && legacy !== current) {
        current = legacy;
        continue;
      }
    }

    break;
  }

  return current;
}
