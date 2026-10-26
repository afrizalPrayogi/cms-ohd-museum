import { findMediaUrlByType } from "app/lib/helper";

interface AboutPartnerProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function AboutPartner(props: AboutPartnerProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div className="h-full bg-gradient-primary-o5">
      <div className="mx-[1.875rem] md:mx-[7.063rem] pt-8 md:pt-20 pb-[6.313rem] flex flex-col">
        <div>
          <h2 className="mb-12 font-black text-[15px] md:text-5xl ebd-text-gradient">
          {props?.dataApi?.category?.pageTranslations?.[0]?.title}
        </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 md:gap-x-28 gap-y-6 md:gap-y-16">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => {

            return (
              <div className="flex flex-col items-start gap-3 text-[10px] md:text-2xl">
                <div className="w-full h-[4.188rem] md:h-[6.313rem]">
                  <img
                    alt="Ilustrasi layanan"
                    className="h-full object-contain"
                    loading="lazy"
                    src={findMediaUrlByType(rw?.page?.mediaPages, "media_image")}
                  />
                </div>
                <div>
                  <h3 className='block font-bold text-xl'>
                    {rw?.page?.translations?.[0]?.title}
                  </h3>
                  <div className="text-[10px] md:text-lg"
                    dangerouslySetInnerHTML={{
                      __html: rw?.page?.translations?.[0]?.overview,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
