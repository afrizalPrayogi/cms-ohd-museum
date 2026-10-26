import { findMediaUrlByType } from "app/lib/helper";
import Marquee from "react-fast-marquee";

interface OurClientsMarqueeBlueProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function OurClientsMarqueeBlue(props: OurClientsMarqueeBlueProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div
      className={`h-full bg-gradient-primary-o5 ${props.isAfterBannerPage == true ? "pt-[7.688rem]" : ""
        }`}
    >
      <div className="mx-[1.875rem] lg:mx-[7.063rem] pb-5 md:pb-14 pt-3 lg:pt-7 flex flex-col items-center">
        <h2 className="mb-2 md:mb-9 leading-normal font-black text-[15px] md:text-5xl  text-center text-[#939393]">
          {props?.dataApi?.category?.pageTranslations?.[0]?.title}
        </h2>
        {[
          props?.dataApi?.category?.pageCategories?.slice(0, Math.ceil(props?.dataApi?.category?.pageCategories?.length / 2)),
          props?.dataApi?.category?.pageCategories?.slice(Math.ceil(props?.dataApi?.category?.pageCategories?.length / 2))
        ].map((half, halfIndex) => (
          <Marquee autoFill>
            <div key={halfIndex} className="flex items-center justify-center gap-8 px-4 pb-3 lg:pb-12">
              {half.map((rw, index) => (
                <div
                  key={index}
                  className="px-5 flex items-center justify-center rounded-[0.625rem] shadow-lg w-[5.313rem] md:w-[14.375rem] h-[3.375rem] md:h-[8rem] bg-white overflow-hidden"
                >
                  <img
                    alt="Ilustrasi layanan"
                    className="max-w-full h-[3.563rem] object-contain"
                    loading="lazy"
                    src={findMediaUrlByType(rw?.page?.mediaPages, "media_icon")}
                  />
                </div>
              ))}
            </div>
          </Marquee>
        ))}
      </div>
    </div>
  );
}
