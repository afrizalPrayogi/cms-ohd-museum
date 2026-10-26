import { formatDateTimeCul } from "app/lib/helper";
import { useState } from "react";

type Props = {
  pageData: any;
  dataApi: any;
};

const BannerInsightDetail = ({ pageData, dataApi }: Props) => {
  const [sectionData, setSectionData] = useState({
    background: "/assets/images/banner-detail.jpg",
    name: "Contact Us",
    description: "Get in touch with us",
  });
  return (
    <div
      className="px-8 py-4 lg:py-8 lg:px-36 gap-4 relative w-full min-h-[200px] lg:min-h-[300px]"
      style={{
        background: `url(${dataApi?.image})`,
        backgroundSize: "100% auto",
        backgroundPosition: "bottom",
      }}
    >
      <div className="absolute bottom-[-20px] inset-x-0 mx-8 lg:mx-[21.875rem]  bg-[#2A53CC] text-white flex flex-col p-3 lg:p-6 items-center gap-1 lg:gap-4 rounded-[16px] lg:rounded-[24px]">
        <h1 className="text-[18px] lg:text-[38px] lg:leading-[normal] font-bold text-center">
          {pageData?.title}
        </h1>
        <div className="flex flex-col md:flex-row gap-1 md:gap-16">
          <div className="flex gap-5 items-center justify-center">
            <img src="/assets/icons/users-insight.png" className="w-6 h-6" />
            <span className="text-[10px] lg:text-2xl">{pageData?.page?.wording?.Author}</span></div>
          <div className="flex gap-5 items-center justify-center">
            <img src="/assets/icons/calendar-days-insight.png" className="w-6 h-6" />
            <span className="text-[10px] lg:text-2xl">{formatDateTimeCul(pageData?.page?.publishAt, "id-ID")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerInsightDetail;
