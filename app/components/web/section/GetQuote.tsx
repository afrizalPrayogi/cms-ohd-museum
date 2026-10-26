import { useEffect, useState } from "react";
import ButtonLink from "../button/ButtonLink";

interface GetQuoteProps {
  isAfterBannerPage?: boolean;
  dataApi?: any;
}

const GetQuote = (props: GetQuoteProps) => {
  const [sectionData, setSectionData] = useState({
    name: "Ingin melihat WePortal lebih dekat?",
    description: "Mulai dari content, monitoring, sampai reminder dalam satu portal.",
    url: "#",
    urlLabel: "Coba WePortal",
  });

  useEffect(() => {
    if (props.dataApi !== undefined) {
      if (props.dataApi?.category?.pageTranslations?.length > 0) {
        var selectedData = props.dataApi?.category?.pageTranslations[0];
        setSectionData({
          name: selectedData?.title,
          description: selectedData?.subTitle,
          url: selectedData?.url ?? selectedData?.canonicalUrl ?? "#",
          urlLabel: selectedData?.overview,
        });
      } else {
        setSectionData({
          name: props.dataApi?.title ?? "",
          description: props.dataApi?.description ?? props.dataApi?.subTitle ?? "",
          url: props.dataApi?.slug ?? "#",
          urlLabel: props.dataApi?.overview ?? "Hubungi Kami",
        });
      }
    } else {
      setSectionData(null);
    }
  }, [props.dataApi]);

  return (
    <div
      id="mulai-weportal"
      className={`bg-[linear-gradient(135deg,#020617,#0f172a,#1d4ed8)] ${
        props.isAfterBannerPage == true ? "pt-[20px]" : ""
      } scroll-mt-32`}
    >
      <div className="relative overflow-hidden px-8 py-8 lg:px-16 lg:py-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-[-10%] top-[-25%] h-48 w-48 rounded-full bg-sky-400 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-5%] h-56 w-56 rounded-full bg-blue-500 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 text-white lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white/80">
              WePortal Access
            </div>
            <div className="text-[24px] font-[900] lg:text-[38px] lg:leading-[44px]">
              {sectionData?.name}
            </div>
            <div
              className="mt-3 max-w-xl text-[15px] leading-7 text-white/78 lg:text-[18px] lg:leading-[30px]"
              dangerouslySetInnerHTML={{ __html: sectionData?.description ?? "" }}
            ></div>
          </div>
          <div className="flex shrink-0 items-center">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-2 backdrop-blur-sm">
              <ButtonLink
                name={sectionData?.urlLabel ?? ""}
                link={sectionData?.url ?? ""}
                className="!bg-white !text-slate-950 hover:!bg-slate-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetQuote;
