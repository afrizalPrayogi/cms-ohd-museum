import { findMediaUrlByType } from "app/lib/helper";

interface ImageWithListProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function ImageWithList(props: ImageWithListProps) {
  return (
    <div
      className={`h-full bg-white ${props.isAfterBannerPage == true ? "pt-[7.688rem]" : ""
        }`}
    >
      <div className='mx-[1.875rem] md:mx-[7.063rem] py-[4.625rem] md:pb-[11.375rem]'>
        <h2 className="mb-10 md:mb-14 font-black text-[38px] text-center ebd-text-gradient">
          {props?.dataApi?.category?.pageTranslations?.[0]?.title}
        </h2>
        <div className="overflow-hidden flex flex-col-reverse md:flex-row gap-10 md:gap-[5.5rem]">
          <div className="w-full md:w-[29rem] relative">
            <div className="text-[10px] md:text-xl"
              dangerouslySetInnerHTML={{
                __html: props?.dataApi?.category?.pageTranslations?.[0]?.overview,
              }}
            />
            <div className="flex justify-center flex-col gap-3 md:gap-8 text-2xl md:ml-8 py-7">
              {props?.dataApi?.category?.pageCategories?.map((rw, index) => {

                return (
                  <div className="flex items-center justify-center  relative gap-5">
                    <img src={findMediaUrlByType(rw?.page?.mediaPages, "media_icon")} alt="" className="object-cover w-[2.063rem] md:w-[2.625rem] h-[2.063rem] md:h-[2.625rem] " />

                    <div className="font-bold text-sm md:text-xl w-full [&_p]:inline [&_p]:font-normal"
                      dangerouslySetInnerHTML={{
                        __html: rw?.page?.translations?.[0]?.title + ' ' + rw?.page?.translations?.[0]?.overview,
                      }}
                    />
                    <img src="/assets/images/arrow-right.png" className="object-cover w-[0.875rem] h-[0.875rem]" ></img>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="w-full md:w-1/2 md:h-auto text-white relative">
            <img src={findMediaUrlByType(props?.dataApi?.category?.medias, "media_image")} alt="" className="right-0 md:absolute object-cover w-full h-full " />
          </div>
        </div>
      </div>
    </div>
  );
}
