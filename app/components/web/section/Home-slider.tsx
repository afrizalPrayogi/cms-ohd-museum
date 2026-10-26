"use client";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { applyImageFallback, resolveWebImage, WEB_IMAGE_FALLBACKS } from "app/lib/webImage";

type Props = {
  pageData?: any;
  dataApi?: any;
};

interface HomeSliderItemProps {
  background: string;
  description: string;
  altBackground?: string;
}

const HomeSlider = (props: Props) => {
  const swiperRef = useRef<any>(null);

  const [banners, setBanners] = useState<HomeSliderItemProps[]>([
    {
      background: WEB_IMAGE_FALLBACKS.banner,
      altBackground: "Slider 1",
      description: `<div>
      <div class="slider-text-tag">End-to-End Solution</div>
      <div class="slider-text-main">EMPOWERING THE FINANCIAL INDUSTRY</div>
      <div class="slider-text-sub">Through Digital Innovation</div>
      </div>`,
    },
  ]);

  const mappingBanner = (listBanner: any[]) => {
    let tmpBanner = [];

    listBanner?.forEach((a) => {
      a?.page?.translations?.forEach((b) => {
        b?.page?.mediaPages?.forEach((c) => {
          if (b.langCode == c.langCode && c.type == "media_banner") {
            let tmpBannerItem = {
              background: resolveWebImage(c?.url, WEB_IMAGE_FALLBACKS.banner),
              altBackground: b?.title,
              description: b?.overview,
            };
            tmpBanner.push(tmpBannerItem);
          }
        });
      });
    });

    setBanners(tmpBanner.length ? tmpBanner : [{
      background: resolveWebImage(props.dataApi?.image, WEB_IMAGE_FALLBACKS.banner),
      altBackground: props.dataApi?.title ?? "WePortal Banner",
      description:
        props.dataApi?.overview ??
        `<div><div class="slider-text-tag">${props.dataApi?.subTitle ?? "WePortal"}</div><div class="slider-text-main">${props.dataApi?.title ?? "Portal Operasional Bisnis"}</div><div class="slider-text-sub">${props.dataApi?.description ?? "Satu portal untuk content, project, AI, dan finance reminder."}</div></div>`,
    }]);
  };

  useEffect(() => {
    if (props.dataApi !== undefined) {
      mappingBanner(props.dataApi?.category?.pageCategories ?? []);
    } else {
      setBanners([]);
    }
  }, [props]);

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, Navigation]}
        // autoplay={{
        //   delay: 2500, // jeda 2.5 detik
        //   disableOnInteraction: false, // tetap autoplay walau user geser
        // }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper; // simpan instance swiper
        }}
        loop={true}
        className="w-full h-[200px] lg:h-[calc(100vh-165px)]"
      >
        {banners.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="relative home-slider-item">
              <img
                src={resolveWebImage(item.background, WEB_IMAGE_FALLBACKS.banner)}
                onError={(event) => applyImageFallback(event, WEB_IMAGE_FALLBACKS.banner)}
                className="w-full object-cover"
              />
              <div className="text-white absolute z-[11] top-0 w-full mx-8 px-8 h-[200px] lg:h-[calc(100vh-165px)] flex items-center">
                <div
                  dangerouslySetInnerHTML={{ __html: item.description }}
                ></div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex items-center absolute w-full gap-4 top-0 z-[10] h-full px-4">
        <div className="flex justify-between w-full">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="px-2 py-2  bg-white rounded-full "
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="px-2 py-2  bg-white rounded-full"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeSlider;
