import { useState } from "react";

const BannerPageTab = () => {
  const [sectionData, setSectionData] = useState({
    background: "/assets/images/banner-detail.jpg",
    name: "Dips 361",
    children: [
      {
        name: "What is Dips 361",
        isActive: false,
        url: "#",
      },
      {
        name: "Futher development & big data",
        isActive: true,
        url: "#",
      },
      {
        name: "Demo",
        isActive: false,
        url: "#",
      },
    ],
  });

  return (
    <div
      className="px-8 py-4 lg:py-8 lg:px-16 gap-4 relative w-full min-h-[150px] lg:min-h-[300px]"
      style={{
        background: `url(${sectionData?.background})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% auto",
        backgroundPosition: "bottom",
      }}
    >
      <div className="shadow absolute bottom-[-20px] inset-x-0 mx-8 lg:mx-16  bg-white flex flex-col p-3 pb-0 lg:p-6 lg:pb-0 items-center gap-1 lg:gap-4 rounded-[16px] lg:rounded-[24px]">
        <h1 className="ebd-text-gradient text-[18px] lg:text-[48px] lg:leading-[50px] font-[800]">
          {sectionData?.name}
        </h1>
        <div className="grid grid-cols-3 w-full">
          {sectionData?.children?.map((item, index) => (
            <div
              key={index}
              className={`p-4 items-center text-center ${
                item.isActive ? "ebd-border-color-gradient border-b-[5px]" : ""
              }`}
            >
              <a href={item.url}>
                <div
                  className={`text-[24px] ${item.isActive ? "font-bold" : ""}`}
                >
                  {item.name}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerPageTab;
