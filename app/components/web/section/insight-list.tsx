import { findMediaUrlByType, formatDateTimeCul } from "app/lib/helper";

interface InsightListProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function InsightList(props: InsightListProps) {
  return (
    <div
      className={`h-full bg-white ${props.isAfterBannerPage == true ? "pt-16 md:pt-[7.688rem]" : ""
        }`}
    >
      <div className='mx-[1.875rem] md:mx-[7.063rem] flex flex-col gap-[0.875rem] md:gap-20'>
        {props?.dataApi?.category?.pageCategories?.map((rw, index) => {
          return (
            <div className="flex flex-row bg-white gap-[0.875rem] md:gap-14">
              <img src={findMediaUrlByType(rw?.page?.mediaPages, "media_image")} alt="" className="w-[9.375rem] md:w-[27.625rem] object-cover rounded-[1.813rem] shadow-lg h-auto" />
              <div className="md:my-6 flex-1 ">
                <div className="md:my-6 flex flex-col gap-5">
                  <h3 className="text-[13px] md:text-4xl font-black md:font-bold">{rw?.page?.translations?.[0]?.title}</h3>
                  <div className="text-[10px] md:text-2xl"
                    dangerouslySetInnerHTML={{
                      __html: rw?.page?.translations?.[0]?.subTitle,
                    }}
                  />
                  <div className="flex flex-col md:flex-row gap-1 md:gap-16">
                    <div className="flex gap-5">
                      <img src="/assets/icons/users.png" className="w-6 h-6" />
                      <span className="text-[10px] md:text-2xl">{rw?.page?.translations?.[0]?.page?.wording?.Author ?? "-"}</span></div>
                    <div className="flex gap-5">
                      <img src="/assets/icons/calendar-days.png" className="w-6 h-6" />
                      <span className="text-[10px] md:text-2xl">{formatDateTimeCul(rw?.page?.translations?.[0]?.page?.publishAt, "id-ID")}</span>
                    </div>
                  </div>
                  <a
                    href={rw?.page?.translations?.[0]?.slug}
                    className="text-[10px] md:text-2xl flex items-center justify-center gap-2 py-[0.625rem] md:py-4 w-full md:w-[12.938rem] border border-2 border-[#1374F5] text-[#1374F5] bg-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-bold rounded-full md:rounded-[1.063rem] "
                  >
                    Read More
                    <img src="/assets/icons/arrow-up-right.png" className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          )
        })};
      </div>
    </div>
  )
}
