import { useEffect, useState } from "react";
import { FiArrowUpRight, FiCheckCircle } from "react-icons/fi";

interface HomeClientOverlapProps {
  dataApi?: any;
}

type WorkflowItem = {
  name: string;
  description: string;
  url: string;
};

const LEGACY_CLIENT_PATTERNS = [
  "logo ",
  "bca",
  "pupuk indonesia",
  "alfamart",
  "afamart",
];

function isLegacyClientItem(value: string) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  return LEGACY_CLIENT_PATTERNS.some((pattern) => normalized.includes(pattern));
}

const FALLBACK_ITEMS: WorkflowItem[] = [
  {
    name: "Kelola Content",
    description: "Atur halaman, section, media, dan metadata website dari satu framework yang konsisten.",
    url: "/#fitur-utama",
  },
  {
    name: "Pantau Project",
    description: "Baca severity, violated card, QA re-open, dan aktivitas tim lebih cepat dari dashboard.",
    url: "/#alur-kerja",
  },
  {
    name: "Aktifkan AI",
    description: "Gunakan knowledge website dan dokumen untuk membantu WhatsApp AI menjawab lebih relevan.",
    url: "/#alur-kerja",
  },
  {
    name: "Jaga Reminder",
    description: "Kirim reminder finance otomatis, pantau due date, dan follow-up dari satu portal.",
    url: "/#mulai-weportal",
  },
];

const HomeClientOverlap = (props: HomeClientOverlapProps) => {
  const [sectionData, setSectionData] = useState({
    name: "",
    overview: "",
  });
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>(FALLBACK_ITEMS);

  useEffect(() => {
    if (!props.dataApi) {
      setSectionData({ name: "", overview: "" });
      setWorkflowItems(FALLBACK_ITEMS);
      return;
    }

    const categoryTranslation = props.dataApi?.category?.pageTranslations?.[0];
    const mappedItems: WorkflowItem[] = [];

    props.dataApi?.category?.pageCategories?.forEach((pageCategory: any) => {
      const translation = Array.isArray(pageCategory?.page?.translations)
        ? pageCategory.page.translations.find((item: any) => item?.langCode === pageCategory?.langCode) ||
          pageCategory.page.translations[0]
        : null;

      if (!translation?.title) return;
      if (isLegacyClientItem(translation.title)) return;

      mappedItems.push({
        name: translation.title,
        description: translation.overview || translation.description || "",
        url: translation.canonicalUrl || translation.url || "/#fitur-utama",
      });
    });

    setSectionData({
      name: categoryTranslation?.title ?? "",
      overview: categoryTranslation?.overview ?? "",
    });
    setWorkflowItems(mappedItems.length ? mappedItems : FALLBACK_ITEMS);
  }, [props.dataApi]);

  return (
    <section
      id="workflow-highlights"
      className="bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] px-8 py-10 lg:px-16 lg:py-14 scroll-mt-32"
    >
      <div className="grid gap-8 lg:grid-cols-[1.05fr_1.6fr] lg:items-start">
        <div className="max-w-xl">
          <div className="inline-flex rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-sky-700 shadow-sm">
            WePortal Workflow
          </div>
          <h2 className="mt-4 text-[24px] font-[900] leading-[32px] text-slate-950 lg:text-[38px] lg:leading-[46px]">
            {sectionData.name}
          </h2>
          <div
            className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600 lg:text-[17px]"
            dangerouslySetInnerHTML={{ __html: sectionData.overview || "" }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {workflowItems.map((item, index) => (
            <a
              key={`${item.name}-${index}`}
              href={item.url || "#"}
              className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_55px_-32px_rgba(37,99,235,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white shadow-[0_18px_34px_-20px_rgba(37,99,235,0.9)]">
                  <FiCheckCircle size={18} />
                </div>
                <FiArrowUpRight className="text-slate-300 transition group-hover:text-sky-600" size={18} />
              </div>
              <div className="mt-5 text-[20px] font-[800] leading-7 text-slate-950">{item.name}</div>
              <div className="mt-3 text-sm leading-7 text-slate-600">{item.description}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeClientOverlap;
