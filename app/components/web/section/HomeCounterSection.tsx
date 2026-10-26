import { useEffect, useState } from "react";
import { applyImageFallback, resolveWebImage, WEB_IMAGE_FALLBACKS } from "app/lib/webImage";

interface HomeCounterSectionProps {
  dataApi?: any;
}

const HomeCounterSection = (props: HomeCounterSectionProps) => {
  const [sectionData, setSectionData] = useState<any>(null);
  const [sectionChildData, setSectionChildData] = useState(null);
  useEffect(() => {
    if (props.dataApi !== undefined) {
      var sectionDataTmp = {};
      var sectionChildDataTmp = [];

      if (props.dataApi?.category?.medias?.length > 0) {
        props.dataApi?.category?.medias?.forEach((itemMedia) => {
          if (
            props.dataApi?.langCode == itemMedia?.langCode &&
            itemMedia.type == "media_image"
          ) {
            sectionDataTmp = {
              ...sectionDataTmp,
              ...{
                background: itemMedia?.url ?? "",
              },
            };
          }
        });
      }

      if (props.dataApi?.category?.pageTranslations?.length > 0) {
        props.dataApi?.category?.pageTranslations?.forEach((sectionDetail) => {
          sectionDataTmp = {
            ...sectionDataTmp,
            ...{
              name: sectionDetail?.title,
              subname: sectionDetail?.overview,
              actionLabel: "Masuk WePortal",
              actionLink: "/cms/login",
            },
          };
        });
      }

      if (props.dataApi?.category?.pageCategories?.length > 0) {
        props.dataApi?.category?.pageCategories?.forEach((a) => {
          a.page?.translations?.forEach((b) => {
            sectionChildDataTmp.push({
              name: b.overview,
              value: b.title,
            });
          });
        });
      }

      setSectionData(sectionDataTmp);
      setSectionChildData(sectionChildDataTmp);
    } else {
      setSectionData(null);
      setSectionChildData([]);
    }
  }, [props.dataApi]);

  return (
    <div id="operasional-terukur" className="px-8 py-4 gap-4 lg:py-8 lg:px-16 scroll-mt-32 ">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200/60 text-[white] shadow-[0_30px_80px_-42px_rgba(15,23,42,0.4)]">
        <img
          src={resolveWebImage(sectionData?.background, WEB_IMAGE_FALLBACKS.testimonialBackground)}
          onError={(event) =>
            applyImageFallback(event, WEB_IMAGE_FALLBACKS.testimonialBackground)
          }
          className="absolute z-[-1] h-full w-full object-cover"
        />
        <div className="absolute inset-0 z-[-1] bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(29,78,216,0.82),rgba(14,116,144,0.72))]" />
        <div className="p-8 lg:p-10">
          <div className="mx-auto max-w-4xl text-[22px] font-bold lg:text-[35px]">
            {sectionData?.name}
          </div>
          <div
            className={`mt-8 grid grid-cols-2 gap-y-6 lg:grid-cols-${
              sectionChildData?.length > 4
                ? 4
                : sectionChildData?.length < 2
                ? 2
                : sectionChildData?.length
            }`}
          >
            {sectionChildData?.map((item, index) => (
              <div
                key={index}
                className={`${
                  sectionChildData?.length % 2 &&
                  index + 1 == sectionChildData?.length
                    ? "col-span-2 lg:col-span-1"
                    : ""
                }`}
              >
                <div className="text-[#c7e3ff] text-[32px] lg:text-[82px] use-gotham font-black">
                  {item.value}
                </div>
                <div
                  className="mx-auto max-w-[220px] text-sm leading-6 text-white/88 lg:text-[22px] lg:leading-[30px]"
                  dangerouslySetInnerHTML={{ __html: item.name }}
                ></div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 lg:flex-row">
            <div
              className="max-w-2xl text-[15px] leading-7 text-white/82 lg:text-[18px]"
              dangerouslySetInnerHTML={{ __html: sectionData?.subname }}
            ></div>
            <a
              href={sectionData?.actionLink}
              className="rounded-full border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              {sectionData?.actionLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCounterSection;
