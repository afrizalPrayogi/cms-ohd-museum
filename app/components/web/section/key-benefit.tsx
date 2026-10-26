import { findMediaUrlByType } from "app/lib/helper";

interface KeyBenefitProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function KeyBenefit(props: KeyBenefitProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div
      className={`relative h-full bg-[#2A53CC] ${props.isAfterBannerPage == true ? "pt-[7.688rem]" : ""
        }`}
    >
      <div className="relative mx-[1.875rem] md:mx-[7.063rem] pb-[6.313rem] flex flex-col justify-center items-center">
        <div className=" inline-block -mt-6 md:-mt-11">
          <span className="relative shadow-[0_5px_10px_rgba(0,0,0,0.3)] text-[15px] md:text-[2.125rem] whitespace-nowrap px-11 md:px-24 py-4 bg-white font-black md:font-bold rounded-[1.875rem] ">
            <img className="absolute w-[2.313rem] md:w-[3.563rem] h-auto -left-2 md:left-5 -top-2 md:-top-5" src="/assets/images/benefit.png" />
            <span className="ebd-text-gradient">Key Benefit</span>
          </span>
        </div>
        {[...Array(Math.ceil(props?.dataApi?.category?.pageCategories?.length / 2))].map((_, rowIndex) => {

          return (
            <div className="flex flex-col md:flex-row py-11 md:py-[5.625rem] gap-10 text-xl font-bold">
              <div className="w-full md:w-1/2 text-white relative border-b border-[#4394FF] md:border-none pb-10 md:pb-0">
                <div className="[&_ul]:space-y-5 [&_li]:pl-9 [&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-1/2  [&_li]:before:-translate-y-1/2 [&_li]:before:w-[20px] [&_li]:before:h-[20px] [&_li]:before:bg-[url('/assets/images/list-arrow-right.png')] [&_li]:before:bg-contain [&_li]:before:bg-center [&_li]:before:bg-no-repeat "
                  dangerouslySetInnerHTML={{
                    __html: props?.dataApi?.category?.pageCategories?.[rowIndex * 2]?.page?.translations?.[0]?.overview,
                  }}
                />
              </div>

              <div className="w-full md:w-1/2 text-white">
                <div className="[&_ul]:space-y-5 [&_li]:pl-9 [&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-1/2  [&_li]:before:-translate-y-1/2 [&_li]:before:w-[20px] [&_li]:before:h-[20px] [&_li]:before:bg-[url('/assets/images/list-arrow-right.png')] [&_li]:before:bg-contain [&_li]:before:bg-center [&_li]:before:bg-no-repeat "
                  dangerouslySetInnerHTML={{
                    __html: props?.dataApi?.category?.pageCategories?.[rowIndex * 2 + 1]?.page?.translations?.[0]?.overview,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
