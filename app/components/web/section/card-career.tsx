import { findMediaUrlByType } from "app/lib/helper";

interface CardCareerProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function CardCareer(props: CardCareerProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div
      className={`h-full bg-white ${props.isAfterBannerPage == true ? "pt-16 lg:pt-[7.688rem]" : ""
        }`}
    >
      <div className="mx-[1.875rem] lg:mx-[7.063rem] pb-[6.313rem] flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => {
            // console.log('re' , rw?.page?.translations?.[0]?.page?.wording)
            return (
              <div className="flex px-7 pt-12 pb-[3.188rem] flex-col items-center justify-start gap-3 text-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div>
                  <img
                    alt="Ilustrasi layanan"
                    className="w-[7.188rem] h-[7.188rem] object-cover rounded-full mb-6"
                    loading="lazy"
                    src={findMediaUrlByType(rw?.page?.mediaPages, "media_icon")}
                  />
                </div>
                <div>
                  <h3 className='block font-black text-xl text-center mb-2'>
                    {rw?.page?.translations?.[0]?.title}
                  </h3>
                  <div className="[&_p]:leading-[normal] [&_p]:text-lg text-[#757575] h-[21.063rem]"
                    dangerouslySetInnerHTML={{
                      __html: rw?.page?.translations?.[0]?.overview,
                    }}
                  />
                </div>
                <a
                  target="_blank"
                  href={rw?.page?.translations?.[0]?.page?.wording?.linkapply}
                  className="leading-[normal] text-lg whitespace-nowrap flex items-center justify-center gap-2 px-[4.313rem] py-[1.188rem] w-[12.938rem] text-white bg-gradient-primary-to-left font-bold rounded-[1.875rem] shadow-[0_5px_5px_rgba(0,0,0,0.2)]"
                >
                  Apply Now
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
