import { findMediaUrlByType } from "app/lib/helper";

interface ServicesProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function Services(props: ServicesProps) {
  return (
    <div
      className={`h-full bg-white ${props.isAfterBannerPage == true ? "pt-16 lg:pt-[7.688rem]" : ""
        }`}
    >
      <div className='mx-[1.875rem] lg:mx-[7.063rem] lg:pt-[3.25rem] pb-8 lg:pb-[12.25rem]'>
        <div className="flex justify-center flex-col gap-7 lg:gap-[5.375rem] text-2xl">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => {

            return (
              <div className="flex justify-center relative">
                <div className={`flex-shrink-0 absolute ${index % 2 == 0 ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2`}>
                  {/* <div className="rounded-full border-[1.438rem] border-indigo-400 overflow-hidden w-[19.688rem] h-[19.688rem] flex items-center justify-center bg-white"> */}
                  <div className="rounded-full overflow-hidden w-[7.438rem] lg:w-[19.688rem] h-[7.438rem] lg:h-[19.688rem] flex items-center justify-center bg-white">
                    <img src={findMediaUrlByType(rw?.page?.mediaPages, "media_image")} alt="" className="object-cover w-full h-full rounded-full" />
                  </div>
                </div>
                <div className={` ${index % 2 == 0 ? 'pl-6 lg:pl-[5.75rem] pr-[4.156rem] lg:pr-48 mr-[4.031rem] lg:mr-[12.406rem] rounded-l-[1.563rem] lg:rounded-l-[3.125rem] lg:ml-[13.625rem] ' : 'pr-6 lg:pr-[5.75rem] pl-[4.156rem] lg:pl-48 ml-[4.031rem] lg:ml-[12.406rem] lg: rounded-r-[1.563rem] lg:rounded-r-[3.125rem] lg:mr-[13.625rem]'} flex justify-center flex-col gap-[0.625rem] lg:gap-4 py-8 lg:py-[2.063rem] text-left shadow-[0_0_20px_rgba(0,0,0,0.3)]  lg:min-h-[9.813rem]`}>
                  <h3 className=" leading-normal text-[15px] lg:text-4xl font-black ebd-text-gradient lg:pt-4">{rw?.page?.translations?.[0]?.title}</h3>
                  <div className="lg:[&_p]:font-montserrat lg:[&_p]:font-bold [&_p]:text-[10px] lg:[&_p]:text-xl [&_p]:leading-3"
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
  )
}
