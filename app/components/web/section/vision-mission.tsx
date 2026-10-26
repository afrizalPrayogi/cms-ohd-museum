import { findMediaUrlByType } from "app/lib/helper";

interface FreeContentProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function VisionMission(props: FreeContentProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div className="h-full bg-gradient-primary-o5">
      <div className="mx-[1.875rem] lg:mx-[7.063rem] pt-5 lg:pt-20 pb-8 lg:pb-[6.313rem] flex flex-col items-center">
        <h2 className="mb-[1.063rem] font-black text-lg lg:text-5xl text-center">
          {props?.dataApi?.category?.pageTranslations?.[0]?.title}
        </h2>
        <section className="text-center w-full [&_h3]:mb-5 [&_h3]:font-bold [&_h3]:text-[13px] md:[&_h3]:text-[2.25rem] [&_h3]:border-b5-gradient-primary [&_h3]:inline-block [&_p]:text-[13px] md:[&_p]:text-2xl [&_p]:mb-12 md:[&_p]:mb-11" dangerouslySetInnerHTML={{ __html: props?.dataApi?.category?.pageTranslations?.[0]?.overview }}></section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[7.438rem] gap-y-2 md:gap-y-7">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => {

            return (
              <div className="flex items-center lg:items-start justify-center lg:justify-start gap-4 text-[13px] lg:text-2xl" key={`vision-mission-${index}`}>
                {/* <div className="w-[3.813rem]">
                  <div className="flex items-center justify-center w-[3.813rem] h-[3.813rem] rounded-full bg-gradient-primary">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L2 9.75l7.75-7.75M15 7h5v5h-5V7z" />
              </svg>
                    
            </div>
                </div> */}
                <img
                  alt="Ilustrasi layanan"
                  className="w-[4rem] md:w-[5.438rem] h-auto object-cover"
                  loading="lazy"
                  src={findMediaUrlByType(rw?.page?.mediaPages, "media_icon")}
                />
                <div className="[&_h3]:text-[15px] [&_p]:leading-[16px] [&_p]:text-[13px] md:[&_p]:text-2xl"
                  dangerouslySetInnerHTML={{
                    __html: rw?.page?.translations?.[0]?.overview,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
