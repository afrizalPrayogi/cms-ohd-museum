import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { formatDateTimeCul } from "app/lib/helper";
import { applyImageFallback, resolveWebImage, WEB_IMAGE_FALLBACKS } from "app/lib/webImage";

interface HomeInsightProps {
  dataApi?: any;
}

const HomeInsight = (props: HomeInsightProps) => {
  const swiperRef = useRef<any>(null);
  const [sectionData, setSectionData] = useState({
    name: `Insight <span class="ebd-text-gradient">WePortal</span>`,
  });
  const [childData, setChildData] = useState([
    {
      name: "Regional Manager & Limited Time Management",
      url: "#",
      overview:
        "With over a decade experience, wwe’ve established ourselves one of ",
      creator: "Rayyan",
      date: "July 24, 2025",
      image: "/assets/images/home-latest-post-1.jpg",
    },

    {
      name: "Regional Manager & Limited Time Management",
      url: "#",
      overview:
        "With over a decade experience, wwe’ve established ourselves one of ",
      creator: "Rayyan",
      date: "July 24, 2025",
      image: "/assets/images/home-latest-post-2.jpg",
    },

    {
      name: "Regional Manager & Limited Time Management",
      url: "#",
      overview:
        "With over a decade experience, wwe’ve established ourselves one of ",
      creator: "Rayyan",
      date: "July 24, 2025",
      image: "/assets/images/home-latest-post-3.jpg",
    },
    {
      name: "Regional Manager & Limited Time Management",
      url: "#",
      overview:
        "With over a decade experience, wwe’ve established ourselves one of ",
      creator: "Rayyan",
      date: "July 24, 2025",
      image: "/assets/images/home-latest-post-3.jpg",
    },
  ]);

  useEffect(() => {
    if (props.dataApi !== undefined) {
      var nameTmp = "";
      var insightTmp = [];
      if (props.dataApi?.category?.pageTranslations?.length > 0) {
        nameTmp = props.dataApi?.category?.pageTranslations[0]?.overview ?? "";
      }

      if (props.dataApi?.category?.pageCategories?.length > 0) {
        props.dataApi?.category?.pageCategories?.forEach((a) => {
          a?.page?.mediaPages?.forEach((b) => {
            if (a.langCode == b.langCode && b.type == "media_image") {
              let tmpClientItem = {
                name: a.page.translations[0].title,
                url: "/" + a.page.translations[0].slug,
                overview: a.page.translations[0].overview,
                creator: "Admin",
                date: formatDateTimeCul(a.page.publishAt, "id-ID"),
                image: resolveWebImage(b.url, WEB_IMAGE_FALLBACKS.insight),
              };
              insightTmp.push(tmpClientItem);
            }
          });
        });
      }

      setSectionData({
        name: nameTmp,
      });
      setChildData(insightTmp.length ? insightTmp : [{
        name: "Insight WePortal",
        url: "/#insight-terbaru",
        overview: "Update terbaru tentang pengembangan portal, workflow internal, dan operasional digital.",
        creator: "Admin",
        date: formatDateTimeCul(new Date(), "id-ID"),
        image: WEB_IMAGE_FALLBACKS.insight,
      }]);
    } else {
      setSectionData(null);
      setChildData([]);
    }
  }, [props.dataApi]);

  return (
    <div id="insight-terbaru" className="scroll-mt-32">
      <div className="px-8 py-8 lg:px-16 lg:py-12">
        <div className="flex flex-col gap-8 justify-center">
          <div className="w-full flex justify-between">
            <h2
              className="max-w-3xl text-[24px] font-[900] lg:text-[36px] lg:leading-[44px]"
              dangerouslySetInnerHTML={{ __html: sectionData?.name }}
            ></h2>
            {/* <div className="flex gap-2">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="px-2 py-2  bg-white rounded-full shadow "
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="px-2 py-2  bg-white rounded-full shadow"
              >
                <FaChevronRight />
              </button>
            </div> */}
          </div>
          <div className="w-full ">
            <Swiper
              modules={[Navigation, Autoplay]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper; // simpan instance swiper
              }}
              autoplay={true}
              loop={true}
              spaceBetween={20}
              slidesPerView={1} // default (mobile)
              breakpoints={{
                640: { slidesPerView: 1 }, // mobile
                768: { slidesPerView: 2 }, // tablet
                1024: { slidesPerView: 3 }, // desktop
              }}
              wrapperClass="py-4"
            >
              {childData?.map((item, index) => (
                <SwiperSlide key={index}>
                  <a href={item.url}>
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:shadow-[0_30px_70px_-36px_rgba(37,99,235,0.25)]">
                      <div className="aspect-[391/261] w-full">
                        <img
                          src={resolveWebImage(item.image, WEB_IMAGE_FALLBACKS.insight)}
                          onError={(event) => applyImageFallback(event, WEB_IMAGE_FALLBACKS.insight)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex h-[350px] flex-col justify-between gap-4 p-5">
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-3 items-center">
                            <img src={"/assets/icons/calendar.svg"} />
                            <div className="text-[14px] font-[800] uppercase tracking-[0.18em] text-slate-400">
                              {item.date}
                            </div>
                          </div>
                          <div className="text-[22px] leading-[30px] font-[900] text-slate-950">
                            {item.name}
                          </div>
                          <div
                            className="text-[16px] leading-[28px] font-[400] text-slate-600"
                            dangerouslySetInnerHTML={{ __html: item.overview }}
                          ></div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <hr className="border-slate-100" />
                          <div className="flex justify-between">
                            <div className="flex gap-2 lg:gap-3 items-center">
                              <img
                                src={"/assets/icons/insight-creator.svg"}
                                className="w-[24pxs] lg:w-[48px]"
                              />
                              <div className="text-[12px] lg:text-[16px] font-[800] text-slate-700">
                                {item.creator}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sky-700">
                              <div className="text-[12px] lg:text-[16px] font-[800]">
                                More Details
                              </div>
                              <FaArrowRight />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeInsight;
