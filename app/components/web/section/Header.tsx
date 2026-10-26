"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiEdit2,
  FiMenu,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { FetchData, GetEncrypt } from "../../../lib/helper";
import { usePathname } from "next/navigation";

type NavigationItem = {
  id?: string;
  title?: string;
  type?: string;
  url?: string;
  children?: NavigationItem[];
};

type Props = {
  dataApi: any;
  canEditCms?: boolean;
  cmsToken?: string;
  onOpenCmsForm?: (url: string, title: string) => void;
};

function isActiveMenu(pathname: string, href: string) {
  if (!href) return false;
  const normalizedHref = href.startsWith("http") ? href : href.replace(/\/+$/, "") || "/";
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedHref === "/") return normalizedPath === "/";
  if (normalizedHref.startsWith("/#")) return normalizedPath === "/";
  return normalizedPath === normalizedHref;
}

function removeMenuById(items: NavigationItem[], menuId: string) {
  return items
    .filter((item) => String(item.id || "") !== menuId)
    .map((item) => ({
      ...item,
      children: Array.isArray(item.children)
        ? removeMenuById(item.children, menuId)
        : [],
    }));
}

export default function Header({
  dataApi,
  canEditCms = false,
  cmsToken = "",
  onOpenCmsForm,
}: Props) {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [isLangLoading, setIsLangLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [lang, setLang] = useState<"ID" | "EN">(dataApi?.langCode || "ID");
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(
    Array.isArray(dataApi?.navigation) ? dataApi.navigation : []
  );
  const [activeMenuEditorKey, setActiveMenuEditorKey] = useState<string | null>(
    null
  );
  const pathname = usePathname();
  const currentSlug = pathname === "/" ? "beranda" : pathname.replace(/^\/+/, "");

  useEffect(() => {
    setNavigationItems(Array.isArray(dataApi?.navigation) ? dataApi.navigation : []);
  }, [dataApi?.navigation]);

  useEffect(() => {
    if (!activeMenuEditorKey) return;

    const closeMenuEditor = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-menu-editor-root]")) return;
      setActiveMenuEditorKey(null);
    };

    document.addEventListener("mousedown", closeMenuEditor);
    document.addEventListener("touchstart", closeMenuEditor);

    return () => {
      document.removeEventListener("mousedown", closeMenuEditor);
      document.removeEventListener("touchstart", closeMenuEditor);
    };
  }, [activeMenuEditorKey]);

  const navigation = navigationItems;
  const topLinks = navigation.filter((item: NavigationItem) => item.type === "Web-Header-Top");
  const mainLinks = navigation.filter((item: NavigationItem) => item.type === "Web-Header");
  const rightLinks = navigation.filter((item: NavigationItem) => item.type === "Web-Header-Right");

  const primaryCta = rightLinks[0];
  const secondaryCta = rightLinks[1];
  const nextLang = lang === "ID" ? "EN" : "ID";

  const brandDescription = useMemo(
    () =>
      lang === "ID"
        ? "Portal operasional bisnis terintegrasi"
        : "Integrated business operations portal",
    [lang]
  );

  const onClickLang = async () => {
    setIsLangLoading(true);

    try {
      const url =
        "api/fe/v1/changelang?slug=" +
        encodeURIComponent(currentSlug || "beranda") +
        "&lang=" +
        encodeURIComponent(nextLang);

      const data = await FetchData(url, "GET", "", false, "", false);
      if (data?.data?.slug) {
        window.location.assign("/" + data.data.slug);
        return;
      }

      setLang(nextLang);
    } finally {
      setIsLangLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keyword.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(keyword.trim())}`;
    }
  };

  const openMenuForm = (item?: NavigationItem) => {
    const url = item?.id
      ? `/cms/module/menuweb/cms/form?id=${item.id}`
      : "/cms/module/menuweb/cms/form";
    const title = item?.id ? `Edit Menu ${item.title || ""}` : "Tambah Menu FE";
    setActiveMenuEditorKey(null);

    if (onOpenCmsForm) {
      onOpenCmsForm(url, title);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const deleteMenu = async (item: NavigationItem) => {
    if (!item?.id || !cmsToken) return;
    const confirmed = window.confirm(`Hapus menu "${item.title || "Menu"}"?`);
    if (!confirmed) return;

    const response = await FetchData(
      "api/cms/menuweb/delete",
      "PUT",
      GetEncrypt(JSON.stringify({ id: item.id })),
      false,
      cmsToken,
      true
    );

    if (!response) return;
    setNavigationItems((current) => removeMenuById(current, String(item.id)));
    setActiveMenuEditorKey(null);
  };

  const renderMenuAdminButtons = (item?: NavigationItem) => {
    if (!canEditCms) return null;

    const editorKey = String(item?.id || item?.title || "new-menu");
    const isOpen = activeMenuEditorKey === editorKey;

    return (
      <span
        className="relative ml-1 inline-flex shrink-0 items-center"
        data-menu-editor-root
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setActiveMenuEditorKey((current) =>
              current === editorKey ? null : editorKey
            );
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-950"
          title="Menu editor"
          aria-label="Menu editor"
        >
          <FiEdit2 size={13} />
        </button>
        {isOpen ? (
          <div className="absolute right-0 top-9 z-[9999] w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openMenuForm(item);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
            >
              <FiEdit2 size={14} />
              Edit Menu
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openMenuForm();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
            >
              <FiPlus size={14} />
              Tambah Menu
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                deleteMenu(item || {});
              }}
              disabled={!item?.id}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiTrash2 size={14} />
              Delete Menu
            </button>
          </div>
        ) : null}
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-md">
        <div className="border-b border-slate-100 bg-[linear-gradient(90deg,#0f172a,#1e3a8a,#0f172a)] text-white">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2 lg:px-16">
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/80 lg:text-xs">
              {brandDescription}
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              {topLinks.map((item: NavigationItem, index: number) => (
                <span
                  key={`${item.id || item.title || "top"}-${index}`}
                  className="inline-flex items-center"
                >
                  <a
                    href={item.url || "#"}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white hover:text-slate-900"
                  >
                    {item.title}
                  </a>
                  {renderMenuAdminButtons(item)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto] items-center gap-6 px-4 py-4 md:grid-cols-[220px_1fr_auto] lg:grid-cols-[260px_1fr_auto] lg:px-16">
          <a href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-lg font-black text-white shadow-[0_18px_38px_-20px_rgba(37,99,235,0.9)]">
              WP
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black tracking-tight text-slate-950">WePortal</div>
              <div className="truncate text-xs font-medium text-slate-500">{brandDescription}</div>
            </div>
          </a>

          <nav className="hidden items-center justify-center gap-2 md:flex">
            {mainLinks.map((item: NavigationItem, index: number) => {
              const active = isActiveMenu(pathname, item.url || "");
              return (
                <span
                  key={`${item.id || item.title || "nav"}-${index}`}
                  className="inline-flex items-center"
                >
                  <a
                    href={item.url || "#"}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    {item.title}
                  </a>
                  {renderMenuAdminButtons(item)}
                </span>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              aria-label="Toggle search"
              onClick={() => setOpenSearch((current) => !current)}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:flex"
            >
              <FiSearch size={18} />
            </button>

            <button
              type="button"
              onClick={onClickLang}
              className="hidden min-w-[58px] items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:flex"
            >
              {isLangLoading ? "..." : nextLang}
            </button>

            {secondaryCta ? (
              <span className="hidden items-center lg:inline-flex">
                <a
                  href={secondaryCta.url || "#"}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                >
                  {secondaryCta.title}
                </a>
                {renderMenuAdminButtons(secondaryCta)}
              </span>
            ) : null}

            {primaryCta ? (
              <span className="hidden items-center lg:inline-flex">
                <a
                  href={primaryCta.url || "#"}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-22px_rgba(37,99,235,0.9)] transition hover:translate-y-[-1px]"
                >
                  {primaryCta.title}
                  <FiArrowUpRight size={16} />
                </a>
                {renderMenuAdminButtons(primaryCta)}
              </span>
            ) : null}

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpenMobileMenu(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-slate-100 transition-[max-height] duration-300 ${
            openSearch ? "max-h-28" : "max-h-0"
          }`}
        >
          <div className="mx-auto max-w-[1440px] px-4 py-4 lg:px-16">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <FiSearch className="text-slate-400" size={18} />
              <input
                type="text"
                onChange={(e) => setKeyword(e.target.value)}
                value={keyword}
                onKeyDown={handleKeyDown}
                placeholder={lang === "ID" ? "Cari halaman atau insight" : "Search pages or insights"}
                className="w-full border-0 bg-transparent p-0 text-sm text-slate-700 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </div>
      </header>

      {openMobileMenu ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" onClick={() => setOpenMobileMenu(false)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-[88vw] max-w-sm flex-col bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-slate-950">WePortal</div>
                  <div className="mt-1 text-sm text-slate-500">{brandDescription}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenMobileMenu(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {topLinks.map((item: NavigationItem, index: number) => (
                  <span
                    key={`${item.id || item.title || "mobile-top"}-${index}`}
                    className="inline-flex items-center"
                  >
                    <a
                      href={item.url || "#"}
                      className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {item.title}
                    </a>
                    {renderMenuAdminButtons(item)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <FiSearch className="text-slate-400" size={18} />
                <input
                  type="text"
                  onChange={(e) => setKeyword(e.target.value)}
                  value={keyword}
                  onKeyDown={handleKeyDown}
                  placeholder={lang === "ID" ? "Cari halaman atau insight" : "Search pages or insights"}
                  className="w-full border-0 bg-transparent p-0 text-sm text-slate-700 focus:outline-none focus:ring-0"
                />
              </div>

              <nav className="flex flex-col gap-2">
                {mainLinks.map((item: NavigationItem, index: number) => (
                  <div
                    key={`${item.id || item.title || "mobile-nav"}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <a
                      href={item.url || "#"}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      {item.title}
                    </a>
                    {renderMenuAdminButtons(item)}
                  </div>
                ))}
              </nav>
            </div>

            <div className="border-t border-slate-200 px-5 py-5">
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={onClickLang}
                  className="inline-flex min-w-[64px] items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {isLangLoading ? "..." : nextLang}
                </button>
                {secondaryCta ? (
                  <a
                    href={secondaryCta.url || "#"}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {secondaryCta.title}
                  </a>
                ) : null}
              </div>

              {primaryCta ? (
                <a
                  href={primaryCta.url || "#"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-5 py-3 text-sm font-semibold text-white"
                >
                  {primaryCta.title}
                  <FiArrowUpRight size={16} />
                </a>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
