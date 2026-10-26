import { findMediaUrlByType } from "app/lib/helper";
import { useState } from "react";

type Props = {
  pageData: any;
  dataApi: any;
};

const BannerPage = ({ pageData, dataApi }: Props) => {
  const [sectionData, setSectionData] = useState({
    background: "/assets/images/banner-detail.jpg",
    name: "Contact Us",
    description: "Get in touch with us",
  });

  return (
    <div
      className="px-8 py-4 md:py-8 md:px-16 gap-4 relative w-full min-h-[150px] md:min-h-[300px]"
      style={{
        background: `url(${dataApi?.image})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% auto",
        backgroundPosition: "bottom",
      }}
    >
      <div className="z-10 shadow absolute bottom-[-30px] md:bottom-[-47px] inset-x-0 mx-8 md:mx-16  bg-white flex flex-col px-3 md:px-9 pt-3 md:pt-9 pb-3 md:pb-8 items-center gap-1 rounded-[26px] md:rounded-[24px]">
        <h1 className="ebd-text-gradient text-[18px] md:text-[48px] font-[800]">
          {pageData?.title}
        </h1>
        <div
          className="text-center text-[10px] md:text-[20px] md:leading-[20px]"
          dangerouslySetInnerHTML={{ __html: pageData?.subTitle }}
        ></div>
      </div>
    </div>
  );
};

export default BannerPage;
