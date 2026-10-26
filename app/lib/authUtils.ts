import { useSelector } from "react-redux";
import { GetDecrypt } from "./helper";
import { readStoredAuthSession } from "./authSession";

export function useDecryptedLoginState<T = any>(): T | null {
  const loginstate = useSelector((state: any) => state?.value);
  const effectiveState =
    typeof loginstate === "string" && loginstate.trim()
      ? loginstate
      : readStoredAuthSession();

  if (typeof effectiveState === "string" && effectiveState.trim()) {
    try {
      const decrypted = GetDecrypt(effectiveState);
      return JSON.parse(decrypted ?? "{}") as T;
    } catch (err) {
      console.error("Failed to parse decrypted login state:", err);
    }
  }
  return null;
}
