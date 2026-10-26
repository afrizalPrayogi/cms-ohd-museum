import { findMediaUrlByType } from "app/lib/helper";

interface FeatureOverviewOverlapCardList1Props {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function FeatureOverviewOverlapCardList1(props: FeatureOverviewOverlapCardList1Props) {
  console.log('props?.dataApi?.category?.pageTranslations?.[0]:', props?.dataApi?.category)

  return (
    <div className='leading-normal h-auto bg-gradient-blue-white'>
      <div className='md:mr-0 py-7 md:py-[3.875rem] h-auto'>
        <div className="overflow-hidden flex flex-col-reverse md:flex-row gap-5 md:gap-24 h-auto">
          <div className="mx-[1.875rem] md:mx-0 md:ml-[7.063rem] md:w-1/2 relative">
            <h2 className="!leading-normal font-black md:font-bold text-lg lg:text-[38px] ebd-text-gradient md:ml-[7.25rem]">
              {props?.dataApi?.category?.pageTranslations?.[0]?.title}
            </h2>
            <div className="flex justify-end flex-row md:flex-col gap-2 md:gap-5 text-2xl md:mx-[4.688rem] py-11 md:py-12">
              {props?.dataApi?.category?.pageCategories?.map((rw, index) => {

                return (
                  <div className="bg-white flex flex-col justify-start relative w-full shadow-[0_0_20px_rgba(0,0,0,0.3)] px-5 md:px-11 py-6 gap-1 rounded-[1.563rem]">
                    <div className="flex justify-start items-center relative gap-3 md:gap-6">
                      <div className="bg-white">
                        <img src={findMediaUrlByType(rw?.page?.mediaPages, "media_icon")} alt="" className="w-8 md:w-[2.938rem] h-8 md:h-[2.938rem] " />
                      </div>
                      <h3 className="text-sam md:text-3xl font-bold ebd-text-gradient">{rw?.page?.translations?.[0]?.title}</h3>

                    </div>
                    <div className="text-[10px] md:text-[19px] [&_p]:leading-[13px] md:[&_p]:leading-[24px]"
                      dangerouslySetInnerHTML={{
                        __html: rw?.page?.translations?.[0]?.overview,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div className="ml-[1.875rem] md:ml-0 mr-[1.875rem] md:mr-0 md:w-1/2 md:min-h-[34.563rem] text-white relative">
            <img src={findMediaUrlByType(props?.dataApi?.category?.medias, "media_image")} alt="" className="right-0 md:-right-[13.438rem] relative md:absolute w-full md:w-[59.563rem] h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
