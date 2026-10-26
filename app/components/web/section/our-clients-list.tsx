import { findMediaUrlByType } from "app/lib/helper";

interface OurClientsListProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function OurClientsList(props: OurClientsListProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div
      className={`h-full bg-white ${props.isAfterBannerPage == true ? "pt-16 lg:pt-[7.688rem]" : ""
        }`}
    >
      <div className="mx-[1.875rem] lg:mx-[7.063rem] pb-5 md:pb-28 flex flex-col items-center pt-20">
        <h2 className="mb-2 md:mb-9 leading-normal font-black text-[15px] md:text-5xl text-center text-[#939393]">
          {props?.dataApi?.category?.pageTranslations?.[0]?.title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => {

            return (
              <div className="px-5 flex items-center justify-center rounded-[0.625rem] shadow-lg w-[5.313rem] md:w-[14.375rem] h-[3.375rem] md:h-[8rem] bg-white overflow-hidden">
                  <img
                    alt="Ilustrasi layanan"
                    className="max-w-full h-[3.563rem] object-contain"
                    loading="lazy"
                    src={findMediaUrlByType(rw?.page?.mediaPages, "media_icon")}
                  />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
