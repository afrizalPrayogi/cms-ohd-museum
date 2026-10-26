"use client";

import React, { useState, useEffect } from "react";
import InputField from "./InputField";
import ButtonUi from "./ButtonUi";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiXCircle,
} from "react-icons/fi";
import { FaGlobe, FaGoogle, FaShareAlt } from "react-icons/fa";
import { Step } from "../../../types";
import { useSearchParams, useRouter } from "next/navigation"; // jika id dari query
import {
  cleanContent,
  FetchData,
  GetEncrypt,
  getPermission,
  startCmsNavigationLoading,
} from "../../../lib/helper";
import { useDecryptedLoginState } from "../../../lib/authUtils";
import { usePageTitle } from "../../../lib/PageTitelCmsContext";
import { wordingTr } from "app/lib/translationWording";
export const runtime = "node";
type Props = {
  moduleName: string;
  folder: string;
};
export const FormWPM: React.FC<Props> = ({ moduleName, folder }) => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "0";
  const user = useDecryptedLoginState();
  const isPageModule = moduleName === "page";
  const isMenuWebModule = moduleName === "menuweb";
  const isApprovalModule = isPageModule || isMenuWebModule;
  const [langs, setLangs] = useState<{ name: string; data: Step[] }[]>([]);
  const [currentLang, setCurrentLang] = useState<string>("id");
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>(
    {}
  );
  const [previewTab, setPreviewTab] = useState<"google" | "social" | "website">(
    "google"
  );

  const [formData, setFormData] = useState<
    { lang: string; value: { [key: string]: any } }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { setTitle } = usePageTitle();
  const router = useRouter();

  const getAuditLabel = () => {
    const currentValue = formData.find((item) => item.lang === currentLang)?.value;
    const firstValue = formData[0]?.value;
    return String(
      currentValue?.title ||
        firstValue?.title ||
        currentValue?.name ||
        firstValue?.name ||
        id ||
        "-"
    );
  };

  const logFormAction = async (
    action: string,
    urlApi: string,
    bodyApi: any,
    rowIdOverride?: string
  ) => {
    const rowId = rowIdOverride || id;
    if (rowId === "0" || !user?.data?.token) return;
    try {
      await FetchData(
        "api/cms/audit/history",
        "POST",
        GetEncrypt(
          JSON.stringify({
            moduleName,
            folder,
            rowId,
            action,
            urlApi,
            urlFe:
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "-",
            label: getAuditLabel(),
            bodyApi,
          })
        ),
        false,
        user.data.token
      );
    } catch (error) {
      console.warn("Audit log failed", error);
    }
  };

  const handleChange = (
    name: string,
    value: any,
    all?: boolean,
    notCopy?: boolean,
    stepIndex?: number
  ) => {
    const stepFields = currentSteps[stepIndex ?? 0]?.fields ?? [];
    const currentField = stepFields.find((f) => f.name === name); // Field asal

    // Transform value utama
    if (currentField?.replaceValue && typeof value === "string") {
      const { from, to } = currentField.replaceValue;
      value = value.split(from).join(to);
    }

    setFormData((prev) =>
      prev.map((item) => {
        const shouldUpdate = all
          ? notCopy
            ? item.lang === currentLang
            : true
          : item.lang === currentLang;

        if (!shouldUpdate) return item;

        const updatedValue: Record<string, any> = {
          ...item.value,
          [name]: value,
        };

        // Proses sameValue
        if (currentField?.sameValue?.length > 0) {
          for (const sameFieldName of currentField.sameValue) {
            const targetField = stepFields.find((f) => f.name === sameFieldName);

            let copiedValue = value;

            // Gunakan replaceValue milik field tujuan
            if (targetField?.replaceValue && typeof copiedValue === "string") {
              const { from, to } = targetField.replaceValue;
              copiedValue = copiedValue.split(from).join(to);
            }

            updatedValue[sameFieldName] = copiedValue;
          }
        }

        return {
          ...item,
          value: updatedValue,
        };
      })
    );
  };

  const handleInfoChange = async (
    name: string,
    info: { value: string; key?: string },
    activeStepIndex: number
  ) => {
    setLangs((prev) =>
      prev.map((langItem) =>
        ({
          ...langItem,
          data: langItem.data.map((step, stepIndex) =>
            stepIndex !== activeStepIndex
              ? step
              : {
                  ...step,
                  fields: step.fields.map((fieldItem) =>
                    fieldItem.name === name ? { ...fieldItem, info } : fieldItem
                  ),
                }
          ),
        }
      ))
    );

    if (!info?.key) return;

    try {
      const fileName =
        user?.data?.langCode === "EN" ? "form-en" : "form-id";
      const aesraw = GetEncrypt(JSON.stringify({ value: info.value }));
      await FetchData(
        `api/general/wording/json/${fileName}?key=${encodeURIComponent(
          info.key
        )}`,
        "PUT",
        aesraw,
        true,
        user?.data?.token,
        true
      );
    } catch (error) {
      console.error("Failed to save info wording:", error);
    }
  };

  const currentSteps = langs.find((l) => l.name === currentLang)?.data ?? [];
  const currentFormValues =
    formData.find((item) => item.lang === currentLang)?.value ?? {};
  const approvalPermission = isApprovalModule
    ? getPermission(user?.data?.permission, moduleName)
    : null;
  const canApprove = Boolean(approvalPermission?.approve);
  const approvalStatus =
    currentFormValues?.approvalStatus?.value ||
    currentFormValues?.approvalStatus ||
    "APPROVED";

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !(prev[index] ?? true),
    }));
  };

  const getStepColumn = (title: string) => {
    const normalizedTitle = String(title || "").trim().toLowerCase();

    if (["media", "security", "wording", "variabel", "variable"].includes(normalizedTitle)) {
      return "right";
    }

    return "left";
  };

  const getStepLayoutOrder = (title: string, fallbackIndex: number) => {
    const orderMap: Record<string, number> = {
      "page data": 0,
      section: 1,
      "meta data": 2,
      media: 3,
      security: 4,
      wording: 5,
      variabel: 5,
      variable: 5,
    };
    const normalizedTitle = String(title || "").trim().toLowerCase();

    return orderMap[normalizedTitle] ?? fallbackIndex + 100;
  };

  const getStepDomId = (title: string) =>
    `form-step-${String(title || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

  const handleSubmit = async () => {
    try {
      const cleanFormData: { [key: string]: any } = { ...formData };
      // Cek semua field string (terutama yang pakai TinyMCE)
      for (const key in cleanFormData) {
        const value = cleanFormData[key];
        if (typeof value === "string") {
          cleanFormData[key] = cleanContent(value);
        }
      }
      const aesraw = GetEncrypt(JSON.stringify(cleanFormData));
      const methodFetch = id == "0" ? "POST" : "PUT";
      const urlApi = `api/${folder}/${moduleName}/form/${id}`;
      const dataapi = await FetchData(
        urlApi,
        methodFetch,
        aesraw,
        true,
        user?.data?.token,
        true
      );
      if (dataapi.code == "200") {
        const createdId = dataapi?.data?.id || dataapi?.data?.data?.id;
        await logFormAction(
          methodFetch === "POST" ? "CREATE" : "UPDATE",
          urlApi,
          cleanFormData,
          methodFetch === "POST" && createdId ? String(createdId) : undefined
        );
        // router.push("/cms/module/" + moduleName + "/list");
        startCmsNavigationLoading();
        router.back();
      }
    } catch (error) {}
    // console.log("Data terkirim:\n" + JSON.stringify(formData, null, 2));
  };

  const handleApprovalAction = async (status: "REQUESTED" | "APPROVED" | "REJECTED") => {
    if (!isApprovalModule || id === "0") return;
    const entityLabel = isPageModule ? "page" : "menu";
    const note =
      status === "REJECTED"
        ? window.prompt(`Catatan reject ${entityLabel}:`, "") || ""
        : status === "APPROVED"
        ? window.prompt(`Catatan approve ${entityLabel}:`, "") || ""
        : "";

    if (status === "REJECTED" && !note.trim()) return;

    const aesraw = GetEncrypt(JSON.stringify({ id, status, note }));
    const urlApi = `api/cms/${moduleName}/approval`;
    const dataapi = await FetchData(
      urlApi,
      "PUT",
      aesraw,
      true,
      user?.data?.token,
      true
    );

    if (dataapi?.code === "200") {
      await logFormAction(`APPROVAL_${status}`, urlApi, { id, status, note });
      setFormData((prev) =>
        prev.map((item) => ({
          ...item,
          value: {
            ...item.value,
            approvalStatus: { label: status, value: status },
            approvalNote: note,
          },
        }))
      );
    }
  };
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);

      try {
        const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
        const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
        const dataapi = await FetchData(
          `api/${folder}/${moduleName}/form/${id}${rawQs}`,
          "GET",
          "",
          false,
          user?.data?.token
        );
        setTitle(dataapi?.data?.title);
        const stepsLangs = dataapi?.data?.data ?? [];
        setLangs(stepsLangs);
        // console.log("dataapi", dataapi);
        // Ubah ke bentuk array: { lang, value }
        const initialFormData = stepsLangs.map((langObj: any) => {
          const langForm: any = {};
          for (const step of langObj.data) {
            for (const field of step.fields) {
              langForm[field.name] = field.value ?? "";
            }
          }
          return { lang: langObj.name, value: langForm };
        });
        setFormData(initialFormData);
        setCurrentLang(stepsLangs[0]?.name || "id");
        const initialExpandedSteps: Record<number, boolean> = {};
        stepsLangs[0]?.data?.forEach((_: Step, index: number) => {
          initialExpandedSteps[index] = true;
        });
        setExpandedSteps(initialExpandedSteps);
      } catch (err) {
        console.error("Failed to fetch form:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, [id]);

  useEffect(() => {
    if (loading) return;
    const focusStep = searchParams.get("focus");
    if (!focusStep) return;

    const targetIndex = currentSteps.findIndex(
      (step) =>
        String(step.title || "").trim().toLowerCase() ===
        focusStep.trim().toLowerCase()
    );

    if (targetIndex >= 0) {
      setExpandedSteps((prev) => ({ ...prev, [targetIndex]: true }));
      window.setTimeout(() => {
        document
          .getElementById(getStepDomId(currentSteps[targetIndex].title))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [loading, currentLang]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-600">Loading form...</div>
        </div>
      </div>
    );
  }
  const isFieldHidden = (field: any, formValues: any) => {
    if (!field.hideFields) return false;

    return field.hideFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(
          typeof formValues[n] == "object"
            ? formValues[n]?.value
            : formValues[n]
        )
      );
    });
  };

  const isFieldDisabled = (field: any, formValues: any) => {
    if (!field.disableFields) return false;

    return field.disableFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(
          typeof formValues[n] == "object" ? formValues[n].value : formValues[n]
        )
      );
    });
  };

  const orderedSteps = currentSteps
    .map((step, stepIndex) => ({ step, stepIndex }))
    .sort(
      (current, next) =>
        getStepLayoutOrder(current.step.title, current.stepIndex) -
        getStepLayoutOrder(next.step.title, next.stepIndex)
    );

  const getPreviewText = (...names: string[]) => {
    for (const name of names) {
      const value = currentFormValues[name];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number") return String(value);
      if (value?.label) return String(value.label);
      if (value?.value) return String(value.value);
      if (value?.url) return String(value.url);
    }
    return "";
  };

  const getPreviewUrl = () => {
    const canonicalUrl = getPreviewText("canonicalUrl");
    if (canonicalUrl) return canonicalUrl;

    const slugValue = getPreviewText("slug");
    const normalizedSlug = slugValue.replace(/^\/+/, "");
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    return `${origin}/${normalizedSlug}`;
  };

  const stripPreviewHtml = (value: string) =>
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getPreviewHost = (url: string) => {
    try {
      return new URL(url).host;
    } catch {
      return "localhost:3000";
    }
  };

  const getPreviewPath = (url: string) => {
    try {
      const parsed = new URL(url);
      return `${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}`;
    } catch {
      return url.replace(/^https?:\/\//i, "");
    }
  };

  const getSeoAnalysis = () => {
    const metaTitle = getPreviewText("metaTitle", "title");
    const metaDescription = stripPreviewHtml(
      getPreviewText("metaDescription", "description")
    );
    const slug = getPreviewText("slug");
    const canonicalUrl = getPreviewText("canonicalUrl");
    const ogTitle = getPreviewText("ogTitle");
    const ogDescription = stripPreviewHtml(getPreviewText("ogDescription"));
    const ogImage = resolvePreviewImage(currentFormValues.ogImage);
    const twitterCard = getPreviewText("twitterCard");
    const robots = getPreviewText("robots");
    const structuredData = getPreviewText("structuredData");

    const titleLength = metaTitle.length;
    const descriptionLength = metaDescription.length;
    const robotsValue = robots.toLowerCase();
    const robotsAllowsIndex = !robots || !robotsValue.includes("noindex");

    const checks = [
      {
        label: "Meta title",
        detail:
          titleLength >= 30 && titleLength <= 60
            ? `${titleLength} karakter, panjang ideal`
            : `Saat ini ${titleLength} karakter. Ideal 30-60 karakter`,
        score:
          titleLength >= 30 && titleLength <= 60 ? 15 : titleLength > 0 ? 8 : 0,
      },
      {
        label: "Meta description",
        detail:
          descriptionLength >= 120 && descriptionLength <= 160
            ? `${descriptionLength} karakter, panjang ideal`
            : `Saat ini ${descriptionLength} karakter. Ideal 120-160 karakter`,
        score:
          descriptionLength >= 120 && descriptionLength <= 160
            ? 20
            : descriptionLength > 0
              ? 10
              : 0,
      },
      {
        label: "Slug URL",
        detail: slug ? "Slug sudah terisi" : "Slug belum terisi",
        score: slug ? 10 : 0,
      },
      {
        label: "Canonical URL",
        detail: canonicalUrl
          ? "Canonical sudah diatur"
          : "Canonical belum diisi untuk menghindari duplicate URL",
        score: canonicalUrl ? 10 : 0,
      },
      {
        label: "Open Graph",
        detail:
          ogTitle && ogDescription && ogImage
            ? "OG title, description, dan image sudah lengkap"
            : "Lengkapi OG title, OG description, dan OG image untuk share preview",
        score: [ogTitle, ogDescription, ogImage].filter(Boolean).length * 5,
      },
      {
        label: "Twitter/X Card",
        detail: twitterCard
          ? "Twitter card sudah diatur"
          : "Twitter card belum diatur",
        score: twitterCard ? 10 : 0,
      },
      {
        label: "Robots",
        detail: robotsAllowsIndex
          ? "Halaman bisa diindeks search engine"
          : "Robots diset noindex, halaman tidak akan masuk index",
        score: robotsAllowsIndex ? 10 : 0,
      },
      {
        label: "Structured Data",
        detail: structuredData
          ? "JSON-LD tersedia untuk rich result"
          : "Structured data belum diisi",
        score: structuredData ? 10 : 0,
      },
    ];

    const score = Math.min(
      100,
      checks.reduce((total, item) => total + item.score, 0)
    );
    const summary =
      score >= 85
        ? "SEO page sudah kuat. Fokus berikutnya tinggal kualitas konten dan keyword di body halaman."
        : score >= 65
          ? "SEO page cukup baik, tapi masih ada beberapa metadata penting yang perlu dilengkapi."
          : "SEO page masih perlu dilengkapi agar lebih siap untuk search engine dan social sharing.";

    return { checks, score, summary };
  };

  const renderSeoScoreCard = () => {
    const analysis = getSeoAnalysis();
    const scoreColor =
      analysis.score >= 85
        ? "text-emerald-600"
        : analysis.score >= 65
          ? "text-amber-600"
          : "text-red-600";
    const barColor =
      analysis.score >= 85
        ? "bg-emerald-500"
        : analysis.score >= 65
          ? "bg-amber-500"
          : "bg-red-500";

    return (
      <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <div className="border-b border-blue-900/30 bg-card-gradient px-3 py-2">
          <div className="text-sm font-semibold text-white">Score SEO</div>
          <div className="text-[11px] leading-4 text-blue-50/85">
            Analisa berdasarkan metadata page saat ini
          </div>
        </div>
        <div className="space-y-3 p-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className={`text-4xl font-bold leading-none ${scoreColor}`}>
                {analysis.score}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                dari 100
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-2 text-xs leading-5 text-gray-700">
            {analysis.summary}
          </div>

          <div className="space-y-2">
            {analysis.checks.map((item) => {
              const status =
                item.score >= 10 ||
                (item.label === "Open Graph" && item.score === 15)
                  ? "good"
                  : item.score > 0
                    ? "warning"
                    : "bad";
              const Icon =
                status === "good"
                  ? FiCheckCircle
                  : status === "warning"
                    ? FiAlertTriangle
                    : FiXCircle;
              const color =
                status === "good"
                  ? "text-emerald-600"
                  : status === "warning"
                    ? "text-amber-600"
                    : "text-red-600";

              return (
                <div key={item.label} className="flex gap-2 text-xs">
                  <Icon className={`mt-0.5 shrink-0 ${color}`} />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800">
                      {item.label}
                    </div>
                    <div className="leading-4 text-gray-500">{item.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  const resolvePreviewImage = (value: any) => {
    const raw = typeof value === "string" ? value : value?.url;
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith("/") ? raw : `/${raw}`;
  };

  const renderPreviewCard = () => {
    const previewUrl = getPreviewUrl();
    const googleTitle =
      getPreviewText("metaTitle", "title") || "Meta title akan tampil di sini";
    const googleDescription =
      stripPreviewHtml(getPreviewText("metaDescription", "description")) ||
      "Meta description akan tampil di sini.";
    const socialTitle =
      getPreviewText("ogTitle", "twitterTitle", "metaTitle", "title") ||
      "Judul sosial media";
    const socialDescription =
      stripPreviewHtml(
        getPreviewText(
          "ogDescription",
          "twitterDescription",
          "metaDescription",
          "description"
        )
      ) || "Deskripsi sosial media akan tampil di sini.";
    const socialImage = resolvePreviewImage(
      currentFormValues.ogImage || currentFormValues.twitterImage
    );
    const twitterImage = resolvePreviewImage(
      currentFormValues.twitterImage || currentFormValues.ogImage
    );
    const previewHost = getPreviewHost(previewUrl);
    const previewPath = getPreviewPath(previewUrl);
    const tabs: {
      key: typeof previewTab;
      label: string;
      icon: React.ReactNode;
    }[] = [
      { key: "google", label: "Google", icon: <FaGoogle /> },
      { key: "social", label: "Sosmed", icon: <FaShareAlt /> },
      { key: "website", label: "Website", icon: <FaGlobe /> },
    ];

    return (
      <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <div className="border-b border-blue-900/30 bg-card-gradient px-3 py-2">
          <div className="text-sm font-semibold text-white">Preview</div>
          <div className="mt-2 grid grid-cols-3 rounded-md bg-white/15 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPreviewTab(tab.key)}
                className={`flex items-center justify-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition ${
                  previewTab === tab.key
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-blue-50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-[11px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3">
          {previewTab === "google" && (
            <div className="rounded-md border border-gray-100 bg-white p-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                  {previewHost.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] leading-4 text-[#202124]">
                    {previewHost}
                  </div>
                  <div className="truncate text-[11px] leading-4 text-[#4d5156]">
                    {previewPath}
                  </div>
                </div>
              </div>
              <div className="mt-2 line-clamp-2 cursor-pointer text-[20px] leading-[26px] text-[#1a0dab] hover:underline">
                {googleTitle}
              </div>
              <div className="mt-1 line-clamp-3 text-[14px] leading-[22px] text-[#4d5156]">
                {googleDescription}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#1a0dab]">
                <span className="hover:underline">Tentang halaman ini</span>
                <span className="hover:underline">Cache</span>
              </div>
            </div>
          )}

          {previewTab === "social" && (
            <div className="space-y-3">
              <div className="rounded-[18px] bg-[#efeae2] p-3 shadow-inner">
                <div className="mb-2 text-[11px] font-semibold text-[#54656f]">
                  WhatsApp
                </div>
                <div className="max-w-[280px] overflow-hidden rounded-lg bg-[#d9fdd3] shadow-sm">
                  <div className="overflow-hidden rounded-t-lg bg-[#f0f2f5]">
                    <div className="flex aspect-[1.91/1] items-center justify-center bg-[#e9edef]">
                      {socialImage ? (
                        <img
                          src={socialImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-[#667781]">Preview image</div>
                      )}
                    </div>
                    <div className="space-y-1 border-l-4 border-[#25d366] px-3 py-2">
                      <div className="line-clamp-2 text-[13px] font-medium leading-5 text-[#111b21]">
                        {socialTitle}
                      </div>
                      <div className="line-clamp-2 text-[12px] leading-4 text-[#667781]">
                        {socialDescription}
                      </div>
                      <div className="truncate text-[11px] uppercase text-[#8696a0]">
                        {previewHost}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-[13px] text-[#111b21]">
                    {previewUrl}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#cfd9de] bg-white p-3 font-sans">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                    X
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold leading-4 text-[#0f1419]">
                      Twitter / X
                    </div>
                    <div className="text-[12px] leading-4 text-[#536471]">
                      @{previewHost.split(".")[0] || "website"}
                    </div>
                  </div>
                </div>
                <div className="mb-2 text-[13px] leading-5 text-[#0f1419]">
                  {socialTitle}
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#cfd9de]">
                  <div className="flex aspect-[1.91/1] items-center justify-center bg-[#eff3f4]">
                    {twitterImage ? (
                      <img
                        src={twitterImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-[#536471]">Twitter image</div>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <div className="line-clamp-1 text-[13px] font-semibold text-[#0f1419]">
                      {socialTitle}
                    </div>
                    <div className="line-clamp-2 text-[12px] leading-4 text-[#536471]">
                      {socialDescription}
                    </div>
                    <div className="truncate text-[12px] text-[#536471]">
                      {previewHost}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewTab === "website" && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-gray-200 bg-gray-50"
              title="Open preview in new tab"
            >
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-500">
                <span className="truncate">{previewUrl}</span>
                <span className="ml-2 shrink-0 text-blue-600">Open</span>
              </div>
              <div className="h-[260px] overflow-hidden bg-white">
                <iframe
                  src={previewUrl}
                  width={1280}
                  height={900}
                  className="origin-top-left scale-[0.24] pointer-events-none"
                  title="Website preview"
                />
              </div>
            </a>
          )}
        </div>
      </section>
    );
  };

  const renderStepCard = (step: Step, stepIndex: number) => {
    const isOpen = expandedSteps[stepIndex] ?? true;
    const visibleFields = step.fields.filter(
      (field) =>
        field.type !== "hide" && !isFieldHidden(field, currentFormValues)
    );

    return (
      <section
        id={getStepDomId(step.title)}
        key={`${currentLang}-${stepIndex}-${step.title}`}
        className="bg-white border border-gray-200 rounded-md shadow-sm overflow-visible"
      >
        <button
          type="button"
          onClick={() => toggleStep(stepIndex)}
          className="w-full flex items-center justify-between gap-3 rounded-t-md border-b border-blue-900/30 bg-card-gradient px-3 py-2 text-left transition hover:brightness-110"
          aria-expanded={isOpen}
        >
          <div className="flex min-w-0 items-center">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {step.title}
              </div>
              <div className="text-[11px] leading-4 text-blue-50/85">
                {visibleFields.length} field
              </div>
            </div>
          </div>
          <span className="text-blue-50/90">
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </button>

        {isOpen && (
          <form className="grid md:grid-cols-12 gap-x-2 gap-y-2 p-3">
            {step.fields.map((field, index) => {
              const hidden = isFieldHidden(field, currentFormValues);
              const disabled = isFieldDisabled(field, currentFormValues);

              if (hidden || field.type === "hide") return null;

              return (
                <div
                  className={(field?.cols ?? "col-span-6") + " "}
                  key={`${stepIndex}-${index}-${field.name}`}
                >
                  <InputField
                    name={field.name}
                    label={field.label}
                    type={field.type}
                    value={currentFormValues[field.name] ?? ""}
                    onChange={(name: string, val: any, notCopy: boolean) =>
                      handleChange(
                        name,
                        val,
                        field.allLang ?? false,
                        notCopy,
                        stepIndex
                      )
                    }
                    onInfoChange={(name, info) =>
                      handleInfoChange(name, info, stepIndex)
                    }
                    fieldAddRow={field.fieldAddRow}
                    isFieldAddRow={field.isFieldAddRow}
                    uriSelect={field.uriSelect}
                    disabled={field.disabled || disabled}
                    formValues={formData}
                    trigerValue={field.trigerValue}
                    info={field?.info}
                  />
                </div>
              );
            })}
          </form>
        )}
      </section>
    );
  };

  return (
    <div className="w-full mx-auto space-y-3 pb-16">
      {/* Language Tabs */}
      {langs.length > 1 && (
        <div className="flex space-x-2">
          {langs.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setCurrentLang(lang.name)}
              className={`px-3 py-1 uppercase rounded-md border text-xs font-medium transition
                ${
                  currentLang === lang.name
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-10">
        <div className="flex flex-col gap-2 xl:col-span-7">
          {orderedSteps
            .filter(({ step }) => getStepColumn(step.title) === "left")
            .map(({ step, stepIndex }) => renderStepCard(step, stepIndex))}
        </div>
        <div className="flex flex-col gap-2 xl:col-span-3">
          {isPageModule ? renderPreviewCard() : null}
          {isPageModule ? renderSeoScoreCard() : null}
          {orderedSteps
            .filter(({ step }) => getStepColumn(step.title) === "right")
            .map(({ step, stepIndex }) => renderStepCard(step, stepIndex))}
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg z-10">
        <div className="flex justify-end gap-4 ">
          {isApprovalModule && id !== "0" ? (
            <div className="mr-auto flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                Approval: {approvalStatus}
              </span>
              {approvalStatus !== "REQUESTED" ? (
                <ButtonUi
                  variant="secondary"
                  onClick={() => handleApprovalAction("REQUESTED")}
                >
                  Request Approval
                </ButtonUi>
              ) : null}
              {canApprove ? (
                <>
                  <ButtonUi onClick={() => handleApprovalAction("APPROVED")}>
                    Approve
                  </ButtonUi>
                  <ButtonUi
                    variant="secondary"
                    onClick={() => handleApprovalAction("REJECTED")}
                  >
                    Reject
                  </ButtonUi>
                </>
              ) : null}
            </div>
          ) : null}
          <ButtonUi
            variant="secondary"
            onClick={async () => {
              startCmsNavigationLoading();
              router.push(`/cms/module/${moduleName}/${folder}/list`);
            }}
            icon={<FiArrowLeft />}
          >
            {wordingTr(user?.data?.langCode, "back")}
          </ButtonUi>
          <ButtonUi onClick={handleSubmit} icon={<FiCheck />}>
            {wordingTr(user?.data?.langCode, "save")}
          </ButtonUi>
        </div>
      </div>
    </div>
  );
};
