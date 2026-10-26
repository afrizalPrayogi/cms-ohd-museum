import { findMediaUrlByType } from "app/lib/helper";

interface BranchlesBankingProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function BranchlesBanking(props: BranchlesBankingProps) {
  return (
    <div
      className={`h-full bg-white ${props.isAfterBannerPage == true ? "pt-[3.875rem] md:pt-[7.688rem]" : ""
        }`}
    >
      <div className={`bg-[url('/assets/images/futher-development-background.png')] bg-no-repeat bg-[length:100%] bg-top`}>
        <div className="mx-[1.875rem] md:mx-[7.063rem]">
          <h2 className="text-center !leading-normal md:pt-[3.188rem] font-black md:font-bold text-lg md:text-[38px] ebd-text-gradient mb-6">
            {props?.dataApi?.category?.pageTranslations?.[0]?.title}
          </h2>
          {[...Array(Math.ceil(props?.dataApi?.category?.pageCategories?.length / 2))].map((_, rowIndex) => {
            const isLastData = props?.dataApi?.category?.pageCategories?.[rowIndex * 2 + 1]
            return (
              <div className="relative flex justify-center flex-col gap-7 md:gap-[5.688rem] text-2xl">
              <img className="absolute w-auto h-[10.375rem] md:h-[20.063rem] right-5 md:right-[7.375rem] top-[2.688rem] md:top-[5.25rem]" src="/assets/images/Intersect-3.png" />
                {[...Array(isLastData ? 2 : 1)].map((_, colIndex) => {
                  const itemIndex = rowIndex * 2 + colIndex;
                  const item = props?.dataApi?.category?.pageCategories?.[itemIndex];
                  return (
                    <div className={`md:px-[7.375rem] flex flex-col justify-center relative gap-8 md:gap-[5.688rem] ${colIndex % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                      }`}>
                      <div className="w-full md:w-1/2 flex items-center justify-center">
                        <img src={findMediaUrlByType(item?.page?.mediaPages, "media_image")} alt="" className={`object-cover w-auto ${colIndex % 2 === 0 ? 'h-[13.063rem] md:h-[24.75rem]' : 'h-[9.188rem] md:h-[21.688rem]'}`} />
                      </div>
                      <div className={`w-full md:w-1/2 flex justify-center flex-col gap-4 text-left`}>
                        <div className="flex flex-row md:flex-col text-[10px] md:text-xl [&_li]:leading-[16px] md:[&_li]:leading-normal [&>div]:w-1/2 md:[&>div]:w-full [&_h3]:w-full [&_ul]:w-full [&_h3]:text-[15px] md:[&_h3]:text-2xl md:[&_h3]:pb-3 md:[&_h3]:pt-7 [&_h3]:bg-clip-text [&_h3]:text-transparent [&_h3]:bg-gradient-primary-text [&_h3]:font-black md:[&_h3]:font-bold [&_h3]:w-1/2 md:[&_ul]:w-full [&_ul]:w-1/2 md:[&_h3]:w-full [&_li]:pl-6 [&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 md:[&_li]:before:top-4 [&_li]:before:-translate-y-1/2 [&_li]:before:w-[11px] [&_li]:before:h-[11px] md:[&_li]:before:w-[20px] md:[&_li]:before:h-[20px] [&_li]:before:bg-[url('/assets/images/list-check.png')] [&_li]:before:bg-contain [&_li]:before:bg-center [&_li]:before:bg-no-repeat"
                          dangerouslySetInnerHTML={{
                            __html: item?.page?.translations?.[0]?.overview,
                          }}
                        />
                      </div>
                      {colIndex % 2 === 0 && (<img src="/assets/images/futher-development-arrow.png" alt="" className="hidden md:block absolute -bottom-[10.375rem] object-cover w-[14.313rem] h-[14.938rem] " />)}
                      {colIndex % 2 === 0 && (<img src="/assets/images/futher-development-arrow-m.png" alt="" className="block md:hidden absolute -bottom-[1.188rem] left-[8.313rem] object-cover w-auto h-[11.25rem] " />)}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
