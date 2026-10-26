import { findMediaUrlByType } from "app/lib/helper";

interface FeatureOverviewCardListProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function FeatureOverviewCardList(props: FeatureOverviewCardListProps) {
  return (
    <div className='leading-normal h-auto bg-white'>
      <div className='md:mr-0 pt-7 md:pt-[3.875rem] h-auto'>
        <h2 className="!leading-normal md:pt-[3.188rem] font-black text-lg md:text-5xl ebd-text-gradient ml-[1.875rem] md:ml-[14.313rem]">
          {props?.dataApi?.category?.pageTranslations?.[0]?.title}
        </h2>
        <div className="overflow-hidden flex flex-col md:flex-row gap-5 md:gap-24 h-auto pt-7 md:pt:0 ">
          <div className="mx-[1.875rem] md:mx-0 md:w-1/2 md:min-h-[34.563rem] text-white flex justify-end items-center">
            <img src={findMediaUrlByType(props?.dataApi?.category?.medias, "media_image")} alt="" className="w-full md:w-[calc(100%-7.063rem)] h-auto" />
          </div>
          <div className="mx-[1.875rem] md:mx-0 md:mr-[7.063rem] md:w-1/2 relative md:pb-[3.875rem]">

            {[...Array(Math.ceil(props?.dataApi?.category?.pageCategories?.length / 2))].map((_, rowIndex) => {
              const isFirst = rowIndex === 0;
              const isLast = rowIndex === props?.dataApi?.category?.pageCategories?.length - 2;
              const isLastData = props?.dataApi?.category?.pageCategories?.[rowIndex * 2 + 1]

              return (
                <div className={`flex justify-end flex-row md:flex-col gap-2 md:gap-5 text-2xl md:mx-[4.5rem] ${isFirst ? 'pb-2 md:pb-5' : ''} ${isLast ? (isLastData ? 'pb-11 md:pb-12' : 'pb-11 md:pb-12 pt-3 md:pt-0') : ''} `}>
                  {[...Array(isLastData ? 2 : 1)].map((_, colIndex) => {
                    const itemIndex = rowIndex * 2 + colIndex;
                    const item = props?.dataApi?.category?.pageCategories?.[itemIndex];

                    return (
                      <div className={`bg-white flex flex-col justify-start relative w-full shadow-[0_0_20px_rgba(0,0,0,0.3)] ${isLastData ? 'px-5' : 'px-11'} md:px-11 py-6 gap-1 rounded-[1.563rem]`}>
                        <div className="flex justify-start items-center relative gap-3 md:gap-6">
                          <div className="bg-white justify-center items-center">
                            <img src={findMediaUrlByType(item?.page?.mediaPages, "media_icon")} alt="" className="w-8 md:w-[2.938rem] h-8 md:h-[2.938rem]" />
                          </div>
                          <h3 className="text-sam md:text-3xl font-bold ebd-text-gradient">{item?.page?.translations?.[0]?.title}</h3>

                        </div>
                        <div className="text-[10px] md:text-[19px] [&_p]:leading-[13px] md:[&_p]:leading-[24px]"
                          dangerouslySetInnerHTML={{
                            __html: item?.page?.translations?.[0]?.overview,
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
