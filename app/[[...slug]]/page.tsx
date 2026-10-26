"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePageData } from "../PageContext";
import { readStoredAuthSession } from "app/lib/authSession";
import { GetDecrypt } from "app/lib/helper";
import Header from "../components/web/section/Header";
import Footer from "../components/web/section/Footer";
import Search from "app/components/web/section/Search";
import HomeSlider from "app/components/web/section/Home-slider";
import HomeFeature from "app/components/web/section/HomeFeature";
import HomeClientOverlap from "app/components/web/section/HomeClientOverlap";
import HomeContactUs from "app/components/web/section/HomeContactUs";
import HomeCounterSection from "app/components/web/section/HomeCounterSection";
import HomeTab from "app/components/web/section/HomeTab";
import HomeTestimonial from "app/components/web/section/HomeTestimonial";
import HomeInsight from "app/components/web/section/HomeInsight";
import GetQuote from "app/components/web/section/GetQuote";
import BannerPage from "../components/web/section/Banner-page";
import GetInTouchForm from "../components/web/section/GetInTouchForm";
import BannerInsightDetail from "../components/web/section/Banner-insight-detail";
import ImageWithFreeContent from "app/components/web/section/image-with-free-content";
import FreeContent from "app/components/web/section/free-content";
import VisionMission from "app/components/web/section/vision-mission";
import ImageWithFreeContent1 from "app/components/web/section/image-with-free-content-1";
import AboutPartner from "app/components/web/section/about-partner";
import Services from "app/components/web/section/Services";
import TrainingSyllabus from "app/components/web/section/training-syllabus";
import InsightList from "app/components/web/section/insight-list";
import OurClientsList from "app/components/web/section/our-clients-list";
import OurClientsListBlue from "app/components/web/section/our-clients-list-blue";
import OurClientsMarqueeBlue from "app/components/web/section/our-clients-marquee-blue";
import BannerPageWithTab from "app/components/web/section/banner-page-with-tab";
import CardCareer from "app/components/web/section/card-career";
import ImageWithFreeContent2 from "app/components/web/section/image-with-free-content-2";
import ServiceIconList from "app/components/web/section/service-icon-list";
import CardSolution from "app/components/web/section/card-solution";
import FeatureOverviewOverlapCardList1 from "app/components/web/section/feature-overview-overlap-card-list-1";
import FeatureOverviewOverlapCardList2 from "app/components/web/section/feature-overview-overlap-card-list-2";
import FeatureOverviewOverlapCardList from "app/components/web/section/feature-overview-overlap-card-list";
import Free from "app/components/web/section/free";
import FeatureOverviewCardList from "app/components/web/section/feature-overview-card-list";
import BranchlesBanking from "app/components/web/section/branchles-banking";
import FullstackCrm from "app/components/web/section/fullstack-crm";
import ImageWithList from "app/components/web/section/image-with-list";
import KeyBenefit from "app/components/web/section/key-benefit";
import SectionTab from "app/components/web/section/section-tab";
import InsightDetailFreeContent from "app/components/web/section/insight-detail-free-content";
import GetInTouch from "app/components/web/section/GetInTouch";
import AboutUsHero from "app/components/web/section/about-us-hero";
import AboutUsContent from "app/components/web/section/about-us-content";
import ServiceHero from "app/components/web/section/service-hero";
import ServiceOverview from "app/components/web/section/service-overview";
import ServiceFeatureGrid from "app/components/web/section/service-feature-grid";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiMove,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";

type SectionProps = {
  dataApi: any;
  pageData?: any;
};

const SECTION_COMPONENTS: Record<string, (props: SectionProps) => React.JSX.Element> = {
  "home-banner": ({ dataApi }) => <HomeSlider dataApi={dataApi} />,
  "home-featured": ({ dataApi }) => <HomeFeature dataApi={dataApi} />,
  "home-client-overlap": ({ dataApi }) => <HomeClientOverlap dataApi={dataApi} />,
  "home-contact-us": ({ dataApi, pageData }) => (
    <HomeContactUs dataApi={dataApi} pageData={pageData} />
  ),
  "home-counter-section": ({ dataApi }) => <HomeCounterSection dataApi={dataApi} />,
  "home-tab": ({ dataApi }) => <HomeTab dataApi={dataApi} />,
  "home-testimonial": ({ dataApi }) => <HomeTestimonial dataApi={dataApi} />,
  "home-insight": ({ dataApi }) => <HomeInsight dataApi={dataApi} />,
  "home-get-qoute": ({ dataApi }) => <GetQuote dataApi={dataApi} />,
  "page-banner": ({ dataApi, pageData }) => <BannerPage dataApi={dataApi} pageData={pageData} />,
  "page-banner-with-tab": ({ dataApi, pageData }) => (
    <BannerPageWithTab dataApi={dataApi} pageData={pageData} />
  ),
  "image-with-free-content": ({ dataApi }) => <ImageWithFreeContent dataApi={dataApi} />,
  "image-with-free-content-1": ({ dataApi }) => <ImageWithFreeContent1 dataApi={dataApi} />,
  "image-with-free-content-2": ({ dataApi }) => <ImageWithFreeContent2 dataApi={dataApi} />,
  "image-with-list": ({ dataApi }) => <ImageWithList dataApi={dataApi} />,
  "free-content": ({ dataApi }) => <FreeContent dataApi={dataApi} />,
  "free-content-with-title": ({ dataApi }) => <FreeContent dataApi={dataApi} />,
  "free-content-with-title-center": ({ dataApi }) => <FreeContent dataApi={dataApi} />,
  "vision-mission": ({ dataApi }) => <VisionMission dataApi={dataApi} />,
  "about-partner": ({ dataApi }) => <AboutPartner dataApi={dataApi} />,
  services: ({ dataApi }) => <Services dataApi={dataApi} />,
  "training-syllabus": ({ dataApi }) => <TrainingSyllabus dataApi={dataApi} />,
  "insight-list": ({ dataApi }) => <InsightList dataApi={dataApi} />,
  "insignt-detail-banner": ({ dataApi, pageData }) => (
    <BannerInsightDetail dataApi={dataApi} pageData={pageData} />
  ),
  "insight-detail-free-content": ({ dataApi }) => <InsightDetailFreeContent dataApi={dataApi} />,
  "our-clients-list": ({ dataApi }) => <OurClientsList dataApi={dataApi} />,
  "our-clients-list-blue": ({ dataApi }) => <OurClientsListBlue dataApi={dataApi} />,
  "our-clients-marquee-blue": ({ dataApi }) => <OurClientsMarqueeBlue dataApi={dataApi} />,
  "get-in-touch": ({ dataApi, pageData }) => <GetInTouch dataApi={dataApi} pageData={pageData} />,
  "get-in-touch-form": ({ dataApi }) => <GetInTouchForm dataApi={dataApi} />,
  "service-icon-list": ({ dataApi }) => <ServiceIconList dataApi={dataApi} />,
  "card-solution": ({ dataApi }) => <CardSolution dataApi={dataApi} />,
  "feature-overview-card-list": ({ dataApi }) => <FeatureOverviewCardList dataApi={dataApi} />,
  "feature-overview-overlap-card-list-1": ({ dataApi }) => (
    <FeatureOverviewOverlapCardList1 dataApi={dataApi} />
  ),
  "feature-overview-overlap-card-list-2": ({ dataApi }) => (
    <FeatureOverviewOverlapCardList2 dataApi={dataApi} />
  ),
  "feature-overview-overlap-card-list": ({ dataApi }) => (
    <FeatureOverviewOverlapCardList dataApi={dataApi} />
  ),
  free: ({ dataApi }) => <Free dataApi={dataApi} />,
  "branchles-banking": ({ dataApi }) => <BranchlesBanking dataApi={dataApi} />,
  "fullstack-crm": ({ dataApi }) => <FullstackCrm dataApi={dataApi} />,
  "key-benefit": ({ dataApi }) => <KeyBenefit dataApi={dataApi} />,
  "card-career": ({ dataApi }) => <CardCareer dataApi={dataApi} />,
  "section-tab": ({ dataApi }) => <SectionTab dataApi={dataApi} />,
  "about-us-hero": ({ dataApi }) => <AboutUsHero dataApi={dataApi} />,
  "about-us-content": ({ dataApi }) => <AboutUsContent dataApi={dataApi} />,
  "service-hero": ({ dataApi }) => <ServiceHero dataApi={dataApi} />,
  "service-overview": ({ dataApi }) => <ServiceOverview dataApi={dataApi} />,
  "service-feature-grid": ({ dataApi }) => <ServiceFeatureGrid dataApi={dataApi} />,
};

function resolveMediaUrl(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.url || value.path || "";
}

function getCustomStyleClass(style?: string) {
  switch (style) {
    case "rounded":
      return "rounded-2xl";
    case "shadow":
      return "shadow-xl";
    case "rounded-shadow":
      return "rounded-2xl shadow-xl";
    default:
      return "";
  }
}

function getTextStyleProps(style: any, defaultClass = "") {
  const sizeClassMap: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };
  const className = [
    defaultClass,
    style?.size ? sizeClassMap[style.size] : "",
    style?.bold ? "font-bold" : "",
    style?.italic ? "italic" : "",
    style?.underline ? "underline" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    className,
    style: style?.color ? { color: style.color } : undefined,
  };
}

function CustomSection({ dataApi }: { dataApi: any }) {
  const config = dataApi?.customConfig || {};
  const textStyles = config.textStyles || {};
  const columns = Math.min(4, Math.max(1, Number(config.columns || 1)));
  const items = Array.isArray(config.items) ? config.items.slice(0, columns) : [];
  const categoryItems =
    config.contentType === "category" && Array.isArray(dataApi?.category?.pageCategories)
      ? dataApi.category.pageCategories
          .map((item: any) => {
            const translation = Array.isArray(item?.page?.translations)
              ? item.page.translations[0]
              : null;
            const media = Array.isArray(item?.page?.mediaPages)
              ? item.page.mediaPages[0]
              : null;
            return translation
              ? {
                  title: translation.title || "",
                  subTitle: translation.subTitle || "",
                  content:
                    translation.overview ||
                    translation.description ||
                    translation.metaDescription ||
                    "",
                  image: media?.url ? { url: media.url } : null,
                  href: translation.slug ? `/${translation.slug}` : "#",
                }
              : null;
          })
          .filter(Boolean)
      : [];
  const renderedItems = categoryItems.length ? categoryItems : items;
  const backgroundImage = resolveMediaUrl(config.backgroundImage);
  const sectionImage = resolveMediaUrl(dataApi?.image);
  const sectionStyle = getCustomStyleClass(config.sectionStyle);
  const widthClass =
    config.width === "full"
      ? "max-w-none"
      : config.width === "narrow"
      ? "max-w-4xl"
      : "max-w-7xl";

  const sectionBackground =
    config.backgroundType === "image" && backgroundImage
      ? {
          backgroundImage: `linear-gradient(rgba(255,255,255,.86), rgba(255,255,255,.86)), url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: config.backgroundColor || "#ffffff" };

  return (
    <section className={`px-4 py-16 lg:px-8 ${sectionStyle}`} style={sectionBackground}>
      <div className={`mx-auto ${widthClass}`}>
        {dataApi?.title || dataApi?.subTitle || dataApi?.description || sectionImage ? (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {sectionImage ? (
              <img
                src={sectionImage}
                alt={dataApi?.title || "Section image"}
                className="mx-auto mb-6 max-h-72 rounded-2xl object-cover"
              />
            ) : null}
            {dataApi?.subTitle ? (
              <div
                {...getTextStyleProps(
                  textStyles.subTitle,
                  "mb-2 text-sm font-bold uppercase tracking-[0.16em] text-blue-700"
                )}
              >
                {dataApi.subTitle}
              </div>
            ) : null}
            {dataApi?.title ? (
              <h2
                {...getTextStyleProps(
                  textStyles.title,
                  "mb-4 text-3xl font-black text-slate-950 lg:text-4xl"
                )}
              >
                {dataApi.title}
              </h2>
            ) : null}
            {dataApi?.description ? (
              <div
                {...getTextStyleProps(
                  textStyles.description,
                  "prose mx-auto max-w-none text-slate-700"
                )}
                dangerouslySetInnerHTML={{ __html: dataApi.description }}
              />
            ) : null}
          </div>
        ) : null}
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${
              columns === 1 ? "100%" : "260px"
            }), 1fr))`,
          }}
        >
          {renderedItems.map((item: any, index: number) => {
            const itemBackgroundImage = resolveMediaUrl(item.backgroundImage);
            const itemImage = resolveMediaUrl(item.image);
            const itemStyle = getCustomStyleClass(item.columnStyle);
            const itemBackground =
              item.backgroundType === "image" && itemBackgroundImage
                ? {
                    backgroundImage: `linear-gradient(rgba(255,255,255,.9), rgba(255,255,255,.9)), url(${itemBackgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { backgroundColor: item.backgroundColor || "#ffffff" };

            return (
              <article
                key={`custom-section-${dataApi?.id || "new"}-${index}`}
                className={`min-w-0 border border-slate-200 p-6 ${itemStyle}`}
                style={itemBackground}
              >
                {itemImage ? (
                  <img
                    src={itemImage}
                    alt={item.title || `Content ${index + 1}`}
                    className="mb-5 h-48 w-full rounded-xl object-cover"
                  />
                ) : null}
                {item.subTitle ? (
                  <div className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                    {item.subTitle}
                  </div>
                ) : null}
                {item.title ? (
                  <h2 className="mb-3 text-2xl font-black text-slate-950">
                    {item.title}
                  </h2>
                ) : null}
                {item.content ? (
                  <div
                    className="prose max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                ) : null}
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    Detail
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderSection(section: any, pageData: any) {
  if (section?.customConfig?.mode === "CUSTOM") {
    return <CustomSection dataApi={section} />;
  }

  const templateCode = String(section?.template?.code || "").trim().toLowerCase();
  const Component = SECTION_COMPONENTS[templateCode];

  if (!Component) return null;

  return <Component dataApi={section} pageData={pageData} />;
}

function getCmsLoginSession() {
  try {
    let raw = readStoredAuthSession();

    if (!raw && typeof window !== "undefined") {
      const persisted = window.localStorage.getItem("persist:dips-wdy");
      if (persisted) {
        const parsedPersisted = JSON.parse(persisted);
        const persistedValue = parsedPersisted?.value
          ? JSON.parse(parsedPersisted.value)
          : "";
        if (typeof persistedValue === "string") {
          raw = persistedValue;
        }
      }
    }

    const decrypted = GetDecrypt(raw);
    if (!decrypted) return null;
    const parsed = JSON.parse(decrypted);
    return parsed?.data?.token ? parsed : null;
  } catch {
    return null;
  }
}

function CmsFrontendEditor({
  pageId,
  section,
  isOpen,
  onToggle,
  onClose,
  onOpenForm,
  onMove,
  onDelete,
  canMoveUp,
  canMoveDown,
}: {
  pageId?: number | string;
  section?: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenForm: (url: string, title: string) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  if (!pageId) return null;

  const sectionId = section?.id;
  const cmsPageUrl = `/cms/module/page/cms/form?id=${pageId}&focus=section${
    sectionId ? `&focusSectionId=${sectionId}` : ""
  }`;
  const addSectionUrl = `/cms/module/page/cms/form?id=${pageId}&focus=section`;
  const sectionTitle = String(section?.title || section?.template?.name || "Section");
  const templateName = String(section?.template?.name || section?.template?.code || "-");

  return (
    <div className="absolute left-3 top-3 z-[9990]">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-800"
        title={`Edit ${sectionTitle}`}
      >
        <FiEdit2 />
        Edit
      </button>

      {isOpen ? (
        <div className="mt-2 w-[280px] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-slate-900">
                {sectionTitle}
              </div>
              <div className="truncate text-xs text-slate-500">
                Template: {templateName}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close editor popup"
            >
              <FiX />
            </button>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onMove("up")}
                disabled={!canMoveUp}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiArrowUp />
                Up
              </button>
              <button
                type="button"
                onClick={() => onMove("down")}
                disabled={!canMoveDown}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiArrowDown />
                Down
              </button>
            </div>
            <button
              type="button"
              onClick={() => onOpenForm(cmsPageUrl, `Edit ${sectionTitle}`)}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              <FiEdit2 />
              Edit Section
            </button>
            <button
              type="button"
              onClick={() => onOpenForm(addSectionUrl, "Tambah Section")}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50"
            >
              <FiPlus />
              Tambah Section
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              <FiTrash2 />
              Delete Section
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const pageData = usePageData();
  const { slug } = useParams<{ slug?: string[] }>();
  const [canEditCms, setCanEditCms] = useState(false);
  const [cmsToken, setCmsToken] = useState("");
  const [activeEditorSectionId, setActiveEditorSectionId] = useState<
    string | number | null
  >(null);
  const [cmsSectionModal, setCmsSectionModal] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [editableSections, setEditableSections] = useState<any[]>([]);
  const [draggedSectionId, setDraggedSectionId] = useState<string | number | null>(
    null
  );

  useEffect(() => {
    const session = getCmsLoginSession();
    setCanEditCms(Boolean(session?.data?.token));
    setCmsToken(String(session?.data?.token || ""));
  }, []);

  const sections = Array.isArray(pageData?.page?.sectionsAsMain) ? pageData.page.sectionsAsMain : [];
  const isHomePage = !slug?.length;
  const filteredSections = isHomePage
    ? sections.filter((section: any) => {
        const templateCode = String(section?.template?.code || "")
          .trim()
          .toLowerCase();
        return ![
          "our-clients-list",
          "our-clients-list-blue",
          "our-clients-marquee-blue",
        ].includes(templateCode);
      })
    : sections;
  const pageId = pageData?.page?.id;
  const renderedSections = canEditCms ? editableSections : filteredSections;

  useEffect(() => {
    setEditableSections(filteredSections);
  }, [pageId, filteredSections.map((section: any) => section?.id).join(",")]);

  const persistSectionOrder = async (nextSections: any[]) => {
    if (!cmsToken) return;

    const response = await fetch("/api/cms/page/section", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cmsToken}`,
      },
      body: JSON.stringify({
        pageId,
        sectionIds: nextSections.map((section: any) => section.id),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update section order");
    }
  };

  const moveSection = async (sectionId: string | number, direction: "up" | "down") => {
    const currentIndex = editableSections.findIndex(
      (section: any) => section?.id === sectionId
    );
    if (currentIndex < 0) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= editableSections.length) return;

    const nextSections = [...editableSections];
    const [moved] = nextSections.splice(currentIndex, 1);
    nextSections.splice(targetIndex, 0, moved);
    const previousSections = editableSections;
    setEditableSections(nextSections);
    try {
      await persistSectionOrder(nextSections);
    } catch (error) {
      setEditableSections(previousSections);
      window.alert("Gagal simpan urutan section.");
    }
  };

  const dropSection = async (targetSectionId: string | number) => {
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;

    const currentIndex = editableSections.findIndex(
      (section: any) => section?.id === draggedSectionId
    );
    const targetIndex = editableSections.findIndex(
      (section: any) => section?.id === targetSectionId
    );
    if (currentIndex < 0 || targetIndex < 0) return;

    const nextSections = [...editableSections];
    const [moved] = nextSections.splice(currentIndex, 1);
    nextSections.splice(targetIndex, 0, moved);
    const previousSections = editableSections;
    setEditableSections(nextSections);
    setDraggedSectionId(null);
    try {
      await persistSectionOrder(nextSections);
    } catch (error) {
      setEditableSections(previousSections);
      window.alert("Gagal simpan urutan section.");
    }
  };

  const deleteSection = async (section: any) => {
    const confirmed = window.confirm(
      `Hapus section "${section?.title || section?.template?.name || "Section"}"?`
    );
    if (!confirmed || !cmsToken) return;

    const response = await fetch("/api/cms/page/section", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cmsToken}`,
      },
      body: JSON.stringify({ sectionId: section.id }),
    });

    if (!response.ok) {
      window.alert("Gagal hapus section.");
      return;
    }

    setEditableSections((current) =>
      current.filter((item: any) => item?.id !== section.id)
    );
    setActiveEditorSectionId(null);
  };

  if (slug?.length && slug[0]?.toLowerCase() === "search") {
    return <Search />;
  }

  return (
    <>
      <Header
        dataApi={pageData}
        canEditCms={canEditCms}
        cmsToken={cmsToken}
        onOpenCmsForm={(url, title) => setCmsSectionModal({ url, title })}
      />
      {renderedSections.map((section: any, index: number) => (
        <React.Fragment key={`main-${section?.id || index}`}>
          <div
            className="group relative"
            onDragOver={(event) => {
              if (!canEditCms) return;
              event.preventDefault();
            }}
            onDrop={() => canEditCms && dropSection(section?.id || index)}
          >
            {canEditCms ? (
              <>
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDraggedSectionId(section?.id || index)}
                  onDragEnd={() => setDraggedSectionId(null)}
                  className="absolute left-3 top-12 z-[9990] flex cursor-grab items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg ring-1 ring-slate-200 backdrop-blur active:cursor-grabbing"
                  title="Drag untuk ubah urutan section"
                >
                  <FiMove />
                  Move
                </button>
                <CmsFrontendEditor
                  pageId={pageId}
                  section={section}
                  isOpen={activeEditorSectionId === (section?.id || index)}
                  onToggle={() =>
                    setActiveEditorSectionId((current) =>
                      current === (section?.id || index)
                        ? null
                        : section?.id || index
                    )
                  }
                  onClose={() => setActiveEditorSectionId(null)}
                  onOpenForm={(url, title) => {
                    setCmsSectionModal({ url, title });
                    setActiveEditorSectionId(null);
                  }}
                  onMove={(direction) => moveSection(section?.id || index, direction)}
                  onDelete={() => deleteSection(section)}
                  canMoveUp={index > 0}
                  canMoveDown={index < renderedSections.length - 1}
                />
              </>
            ) : null}
            {renderSection(section, pageData)}
          </div>
        </React.Fragment>
      ))}
      {cmsSectionModal ? (
        <div className="fixed inset-0 z-[99999] bg-slate-950/55 p-3 backdrop-blur-sm lg:p-6">
          <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-950">
                  {cmsSectionModal.title}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {cmsSectionModal.url}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={cmsSectionModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Open tab
                </a>
                <button
                  type="button"
                  onClick={() => setCmsSectionModal(null)}
                  className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              src={cmsSectionModal.url}
              className="min-h-0 flex-1 border-0"
              title={cmsSectionModal.title}
            />
          </div>
        </div>
      ) : null}
      {slug?.length ? null : <Footer dataApi={pageData} />}
    </>
  );
}
