import { useEffect, useState } from "react";
import { applyImageFallback, resolveWebImage, WEB_IMAGE_FALLBACKS } from "app/lib/webImage";

interface HomeFeatureProps {
  dataApi?: any;
}

const HomeFeature = (props: HomeFeatureProps) => {
  const [featureData, setFeatureData] = useState([
    {
      name: "Content & CMS",
      url: "/#fitur-utama",
      image: WEB_IMAGE_FALLBACKS.featureIcon,
    },
    {
      name: "Project & Redmine",
      url: "/#alur-kerja",
      image: "/assets/icons/home-infastructure.svg",
    },
    {
      name: "WhatsApp AI",
      url: "/#alur-kerja",
      image: "/assets/icons/home-applicant.svg",
    },
    {
      name: "Finance Reminder",
      url: "/#mulai-weportal",
      image: "/assets/icons/home-consultant.svg",
    },
  ]);

  const mappingFeature = (listFeature: any[]) => {
    let tmpFeature = [];

    listFeature?.forEach((a) => {
      a?.page?.translations?.forEach((b) => {
        b?.page?.mediaPages?.forEach((c) => {
          if (b.langCode == c.langCode && c.type == "media_icon") {
            let tmpFeatureItem = {
              image: c?.url ?? "",
              name: b?.title ?? "",
              url: b?.url ?? b?.canonicalUrl ?? "#",
            };
            tmpFeature.push(tmpFeatureItem);
          }
        });
      });
    });

    setFeatureData(tmpFeature);
  };

  useEffect(() => {
    if (props.dataApi !== undefined) {
      mappingFeature(props.dataApi?.category?.pageCategories ?? []);
    } else {
      setFeatureData([]);
    }
  }, [props.dataApi]);

  return (
    <section
      id="fitur-utama"
      className="relative z-[3] -mt-10 bg-transparent px-4 pb-8 scroll-mt-32 lg:-mt-16 lg:px-16 lg:pb-14"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {featureData?.map((item, index) => (
          <div key={index} className="group">
            <a
              href={item.url || "#"}
              className="flex h-full min-h-[148px] flex-col items-center justify-center gap-3 rounded-[28px] border border-slate-200/80 bg-white px-4 py-5 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_28px_70px_-34px_rgba(37,99,235,0.32)] lg:min-h-[190px] lg:gap-5 lg:px-6 lg:py-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#2563eb)] shadow-[0_18px_38px_-22px_rgba(37,99,235,0.9)] lg:h-16 lg:w-16">
                <img
                  src={resolveWebImage(item.image, WEB_IMAGE_FALLBACKS.featureIcon)}
                  onError={(event) => applyImageFallback(event, WEB_IMAGE_FALLBACKS.featureIcon)}
                  className="h-6 w-6 object-contain lg:h-8 lg:w-8"
                />
              </div>
              <div className="text-[12px] font-[800] leading-[16px] text-slate-900 lg:text-[15px] lg:leading-[20px]">
                {item.name}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400 transition group-hover:text-sky-600 lg:text-[11px]">
                WePortal Module
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeFeature;
