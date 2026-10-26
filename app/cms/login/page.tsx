"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaGoogle,
  FaFacebookF,
  FaTwitter,
  FaGithub,
  FaSpinner,
} from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { DebugLog, FetchData, GetDecrypt, GetEncrypt } from "../../lib/helper";
import { setLocal } from "../../lib/redux/counterSlice";
import { useRouter } from "next/navigation";
import {
  AUTH_REMEMBER_KEY,
  clearStoredAuthSession,
  readStoredAuthSession,
  saveAuthSession,
} from "app/lib/authSession";

export default function LoginPage() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoad, setBtnLoad] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ show/hide
  const [rememberMe, setRememberMe] = useState(true);
  const [load, setLoad] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const loginstate = useSelector((state: any) => state?.value);
  const [localData, setLocalData] = useState<any>(null); // ⬅️ taruh hasil decrypt di state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      if (!email.trim()) {
        setErrorMessage("Email wajib diisi.");
        emailRef.current?.focus();
        return;
      }

      if (!password.trim()) {
        setErrorMessage("Password wajib diisi.");
        passwordRef.current?.focus();
        return;
      }

      setBtnLoad(true);
      const raw = JSON.stringify({
        email: email,
        password: password,
      });
      const aesraw = GetEncrypt(raw);
      const data = FetchData("api/auth", "POST", aesraw, false, "", true);
      const datajson = await data;
      if (datajson?.code == "200") {
        const encryptedSession = GetEncrypt(JSON.stringify(datajson));
        saveAuthSession(encryptedSession, rememberMe);
        dispatch(setLocal(encryptedSession));
      } else {
        setErrorMessage("Email atau password tidak valid.");
        setBtnLoad(false);
      }
    } catch (error) {
      setErrorMessage("Login gagal. Silakan coba lagi.");
      setBtnLoad(false);
      DebugLog(error);
    }
  };

  const router = useRouter();
  const handleEnterSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    formRef.current?.requestSubmit();
  };

  useEffect(() => {
    try {
      const effectiveState =
        typeof loginstate === "string" && loginstate.trim()
          ? loginstate
          : readStoredAuthSession();

      if (typeof effectiveState !== "string" || !effectiveState.trim()) {
        setLocalData(null);
        setLoad(false);
        return;
      }

      const decryptedRaw = GetDecrypt(effectiveState);
      if (!decryptedRaw) {
        setLocalData(null);
        clearStoredAuthSession();
        dispatch(setLocal({}));
        setLoad(false);
        return;
      }

      const decrypted = JSON.parse(decryptedRaw);
      setLocalData(decrypted);
      dispatch(setLocal(effectiveState));

      if (decrypted?.data?.token) {
        router.push("/cms/dashboard");
      } else {
        setLoad(false);
      }
    } catch (error) {
      console.error("Failed to restore login session:", error);
      setLocalData(null);
      clearStoredAuthSession();
      dispatch(setLocal({}));
      setLoad(false);
    }
  }, [loginstate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRememberMe(window.localStorage.getItem(AUTH_REMEMBER_KEY) === "1");
    }
  }, []);

  useEffect(() => {
    if (!load) {
      emailRef.current?.focus();
    }
  }, [load]);
  if (load) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4efe6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.16),_transparent_28%)]" />
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="rounded-[2rem] border border-white/60 bg-white/80 px-10 py-12 text-center shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <FaSpinner className="mx-auto animate-spin text-3xl text-[#0f766e]" />
            <p className="mt-4 font-medium text-slate-700">Checking session...</p>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4efe6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_32%),radial-gradient(circle_at_85%_15%,_rgba(190,24,93,0.12),_transparent_26%),linear-gradient(135deg,_rgba(148,163,184,0.10),_transparent_55%)]" />
        <div className="absolute left-[-8rem] top-16 h-64 w-64 rounded-full bg-[#0f766e]/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-2rem] h-72 w-72 rounded-full bg-[#b45309]/10 blur-3xl" />

        <div className="relative mx-auto grid min-h-screen w-full items-center gap-8 px-4 py-8 md:px-8">
          
          <div className="mx-auto w-full max-w-xl rounded-[2.25rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
                  Secure Application Login
                </div>
                <h2 className="mt-3 font-['Georgia'] text-4xl leading-tight text-slate-900">
                  Welcome back
                </h2>
              </div>
              <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-[#12343b] text-white md:flex">
                <FaSignInAlt className="text-xl" />
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1}>
                hidden submit
              </button>

              <div>
                <label
                  className="mb-2 flex items-center text-sm font-semibold text-slate-700"
                  htmlFor="email"
                >
                  <FaEnvelope className="mr-3 text-[#0f766e]" />
                  Email Address
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onKeyDown={handleEnterSubmit}
                />
              </div>

              <div className="relative">
                <label
                  className="mb-2 flex items-center text-sm font-semibold text-slate-700"
                  htmlFor="password"
                >
                  <FaLock className="mr-3 text-[#0f766e]" />
                  Password
                </label>
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-800 shadow-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onKeyDown={handleEnterSubmit}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[68%] -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <label className="inline-flex items-center text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e]"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-[#0f766e] hover:text-[#115e59]">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={btnLoad}
                className={`flex w-full items-center justify-center space-x-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition ${
                  btnLoad
                    ? "bg-[#0f766e]/65"
                    : "bg-[#12343b] hover:bg-[#0f766e]"
                }`}
              >
                {btnLoad ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    <span>Sign In To CMS</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
