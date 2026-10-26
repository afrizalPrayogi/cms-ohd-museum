import { findMediaUrlByType } from "app/lib/helper";

interface CardSolutionProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function CardSolution(props: CardSolutionProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div
      className={`overflow-hidden relative h-full bg-white ${props.isAfterBannerPage == true ? "pt-[7.688rem]" : ""
        }`}
    > <img className="absolute w-[7rem] md:w-[10.813rem] h-[13rem] md:h-[20.063rem] -right-8 md:right-[1.688rem] top-[16.313rem] md:top-0 -mt-2" src="/assets/images/Intersect.png" />
      <img className="absolute w-[7rem] md:w-[10.813rem] h-[13rem] md:h-[20.063rem] left-2 md:left-[1.688rem] bottom-[13.938rem] md:bottom-0" src="/assets/images/Intersect-2.png" />

      <div className="relative md:mx-[7.063rem] flex flex-col gap-4 pb:0 md:pb-[6.313rem] pt-14 md:pt-[4rem] ">
        {[...Array(Math.ceil(props?.dataApi?.category?.pageCategories?.length / 2))].map((_, rowIndex) => {

          return (
            <div className="relative leading-normal">
              <div className=" overflow-hidden flex flex-col md:flex-row pb-10 md:pb-0 ">
                <div className="hidden md:block absolute bg-[#F8F8F8] w-[calc(100%-2.25rem)] h-full left-9 rounded-[1.875rem] shadow-[0_0_20px_rgba(0,0,0,0.3)]"></div>
                <div className="ml-[1.875rem] md:mx-0 md:w-1/2 text-white relative pb-[3.375rem]">
                  <div className="hidden md:block absolute bg-[#F8F8F8] w-full md:w-[calc(100%-36px)] h-full right-0"></div>
                  <img className="pr-[1.875rem] md:pr-0 absolute w-full h-full md:h-full md:filter drop-shadow-[20px_0_10px_rgba(0,0,0,0.2)]" src="/assets/images/card-solution.png" />
                  <div className=" h-full w-full relative z-10 pl-5 md:pl-[4.438rem] pt-12 md:pt-[6.625rem] flex flex-col">
                    <h2 className="text-[15px] md:text-[2.375rem] font-black md:font-bold mb-5 md:mb-6">{props?.dataApi?.category?.pageCategories?.[rowIndex * 2]?.page?.translations?.[0]?.title}</h2>
                    <div className="pr-14 md:pr-32 leading-[15px] md:leading-[30px] text-xs md:text-2xl [&>ul]:list-[square] [&>ul]:pl-6 "
                      dangerouslySetInnerHTML={{
                        __html: props?.dataApi?.category?.pageCategories?.[rowIndex * 2]?.page?.translations?.[0]?.overview,
                      }}
                    />
                  </div>
                </div>
                <div className="mr-[1.875rem] md:mr-0 mt:mr-0 mt-8 md:mt-0 bg-[#F8F8F8] md:w-1/2 px-6 pt-12 md:pt-[6.625rem] pb-7 flex flex-col [&>ul]:list-[square] [&>ul]:pl-6 rounded-r-[1.875rem] shadow-[0_0_20px_rgba(0,0,0,0.3)] md:shadoe-none">
                  <div className="z-10">
                    <h2 className="text-[15px] md:text-[2.375rem] text-white bg-gradient-primary font-black md:font-bold px-6 md:px-8 py-[0.563rem] md:py-[0.375rem] rounded-full w-fit mb-5 md:mb-6">
                      {props?.dataApi?.category?.pageCategories?.[rowIndex * 2 + 1]?.page?.translations?.[0]?.title}
                    </h2>
                    <div className="leading-[15px] md:leading-[30px] text-xs md:text-2xl [&>ul]:list-[square] [&>ul]:pl-6 "
                      dangerouslySetInnerHTML={{
                        __html: props?.dataApi?.category?.pageCategories?.[rowIndex * 2 + 1]?.page?.translations?.[0]?.overview,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div >
  );
}
