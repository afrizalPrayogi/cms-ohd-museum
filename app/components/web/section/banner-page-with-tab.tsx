"use client";

import { findMediaUrlByType } from "app/lib/helper";
import { useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  pageData: any;
  dataApi: any;
};

const BannerPageWithTab = ({ pageData, dataApi }: Props) => {
  const [sectionData, setSectionData] = useState({
    background: "/assets/images/banner-detail.jpg",
    name: "Contact Us",
    description: "Get in touch with us",
  });
  const pathname = usePathname(); 
  return (
    <div
      className="px-8 py-4 md:py-8 md:px-16 gap-4 relative w-full min-h-[200px] md:min-h-[300px]"
      style={{
        background: `url(${dataApi?.image})`,
        backgroundSize: "100% auto",
        backgroundPosition: "bottom",
      }}
    >
      <div className="absolute bottom-[-30px] md:bottom-[-47px] inset-x-0 mx-8 md:mx-[7.063rem]  bg-white flex flex-col px-3 pt-3 md:px-6 md:pt-6 items-center gap-1 md:gap-2 rounded-[26px] md:rounded-[24px] shadow-[0px_8px_51.8px_0px_#0000001A]">
        <h1 className="ebd-text-gradient text-[18px] md:text-[48px] md:leading-normal font-[800]">
          {dataApi?.category?.pageTranslations?.[0]?.title}
        </h1>
        <div role="tablist" aria-label="Contoh Tabs" className="w-full flex gap-4 md:gap-4">
          {dataApi?.category?.pageCategories?.map((rw, index) => {
            return (
              <a id={`tab-${index}`} role="tab" aria-selected="true" aria-controls={`panel-${index}`}
                className={`text-center w-full whitespace-nowrap md:mx-auto pb-1 md:pb-5 text-[10px] md:text-3xl ${pathname == '/'+rw?.page?.translations?.[0]?.slug ? 'font-bold border-b-gradient-primary inline-block mx-auto' : ''}`} href={rw?.page?.translations?.[0]?.slug}
              >{rw?.page?.translations?.[0]?.title}</a>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default BannerPageWithTab;
