export const AUTH_SESSION_KEY = "weportal-auth-session";
export const AUTH_REMEMBER_KEY = "weportal-auth-remember";
export const REDUX_PERSIST_KEY = "persist:dips-wdy";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

export function saveAuthSession(payload: string, remember: boolean) {
  if (!canUseBrowserStorage()) return;

  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_SESSION_KEY);

  if (remember) {
    window.localStorage.setItem(AUTH_SESSION_KEY, payload);
    window.localStorage.setItem(AUTH_REMEMBER_KEY, "1");
  } else {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, payload);
    window.localStorage.removeItem(AUTH_REMEMBER_KEY);
  }

  window.localStorage.removeItem(REDUX_PERSIST_KEY);
}

export function readStoredAuthSession(): string {
  if (!canUseBrowserStorage()) return "";

  const remembered = window.localStorage.getItem(AUTH_REMEMBER_KEY) === "1";
  if (remembered) {
    return window.localStorage.getItem(AUTH_SESSION_KEY) || "";
  }

  return (
    window.sessionStorage.getItem(AUTH_SESSION_KEY) ||
    window.localStorage.getItem(AUTH_SESSION_KEY) ||
    ""
  );
}

export function clearStoredAuthSession() {
  if (!canUseBrowserStorage()) return;

  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_REMEMBER_KEY);
  window.localStorage.removeItem(REDUX_PERSIST_KEY);
}
