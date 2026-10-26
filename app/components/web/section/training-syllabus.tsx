import { findMediaUrlByType } from "app/lib/helper";

interface TrainingSyllabusProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function TrainingSyllabus(props: TrainingSyllabusProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div className="h-full bg-[#2A53CC]">
      <div className="mx-[1.875rem] lg:mx-[7.063rem] pt-8 lg:pt-16 pb-6 lg:pb-[6.313rem] flex flex-col items-center">
        <div className="rounded-[1.875rem] mb-[2.188rem] lg:mb-[4.625rem]  bg-white">
          <h2 className="font-black text-[15px] lg:text-4xl ebd-text-gradient text-center py-4 lg:py-[1.125rem] px-[1.25rem] lg:px-[3.25rem]">
            {props?.dataApi?.category?.pageTranslations?.[0]?.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[7.438rem] gap-4 lg:gap-y-7">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => {

            return (
              <div className="flex items-start gap-4 text-2xl">
                <img
                  className="w-[6.188rem] lg:w-[11.063rem] h-[6.438rem] lg:h-[13.25rem] border border-white object-cover rounded-[1.875rem]"
                  src={findMediaUrlByType(rw?.page?.mediaPages, "media_image")}
                />
                <div className="text-white ">
                  <h3 className="font-bold text-xl lg:text-3xl">
                    {rw?.page?.translations?.[0]?.title}
                  </h3>
                  <div className="text-[10px] lg:text-xl [&>ul]:leading-3 lg:[&>ul]:leading-normal [&>ul]:list-[square] [&>ul]:pl-6 "
                    dangerouslySetInnerHTML={{
                      __html: rw?.page?.translations?.[0]?.overview,
                    }}
                  />
                </div>
              </div>
            )
          })}
          <div className="hidden lg:block text-[1.688rem] text-white mt-12 font-bold" dangerouslySetInnerHTML={{
            __html: props?.dataApi?.category?.pageTranslations?.[0]?.overview,
          }}></div>
        </div>
      </div>
    </div>
  );
}
