import { Fragment, useEffect, useRef, useState } from "react";
import ButtonLink from "../button/ButtonLink";
import { FaArrowRight, FaRegStar, FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { applyImageFallback, resolveWebImage, WEB_IMAGE_FALLBACKS } from "app/lib/webImage";

interface HomeTabProps {
  dataApi?: any;
}

const HomeTestimonial = (props: HomeTabProps) => {
  const swiperRef = useRef<any>(null);

  const [sectionData, setSectionData] = useState<any>({
    categoryName: "Team Story",
    name: 'Begini cara <br /><span class="ebd-text-gradient">tim internal</span> memakai WePortal',
    description:
      "WePortal membantu operasional tim menjadi lebih rapi, lebih terlihat, dan lebih mudah ditindaklanjuti dari satu portal.",
  });
  const [backgroundSlider, setBackgroundSlider] = useState(
    "/assets/images/home-testi-bg-1.png"
  );
  const [sliderData, setSliderData] = useState([
    {
      name: "Jeson",
      jobTitle: "Senior Developer",
      image: "/assets/images/home-testi-person-1.png",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      star: 4,
    },
    {
      name: "Jeson",
      jobTitle: "Senior Developer",
      image: "/assets/images/home-testi-person-1.png",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      star: 5,
    },
    {
      name: "Jeson",
      jobTitle: "Senior Developer",
      image: "/assets/images/home-testi-person-1.png",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      star: 1,
    },
  ]);

  useEffect(() => {
    if (props.dataApi) {
      var sectiondataTmp = {};
      var sectionSliderdataTmp = [];
      if (props.dataApi?.category?.pageTranslations?.length > 0) {
        sectiondataTmp = {
          categoryName:
            props.dataApi?.category?.pageTranslations[0]?.title ?? "",
          name: props.dataApi?.category?.pageTranslations[0]?.subTitle ?? "",
          description:
            props.dataApi?.category?.pageTranslations[0]?.overview ?? "",
        };
      }

      if (props.dataApi?.category?.pageCategories?.length > 0) {
        props.dataApi?.category?.pageCategories?.forEach((a) => {
          a?.page?.mediaPages?.forEach((b) => {
            if (a.langCode == b.langCode && b.type == "media_image") {
              let tmpSliderData = {
                name: a.page.translations[0].title,
                jobTitle: a.page.translations[0].subTitle,
                image: resolveWebImage(b.url, WEB_IMAGE_FALLBACKS.testimonialAvatar),
                description: a.page.translations[0].overview,
                star: 5,
              };
              sectionSliderdataTmp.push(tmpSliderData);
            }
          });
        });
      }
      setSectionData(sectiondataTmp);
      setSliderData(sectionSliderdataTmp.length ? sectionSliderdataTmp : [{
        name: "Tim Operasional Internal",
        jobTitle: "Pengguna WePortal",
        image: WEB_IMAGE_FALLBACKS.testimonialAvatar,
        description:
          "WePortal membantu kami memantau pekerjaan, menjaga update project, dan menindaklanjuti reminder tanpa harus berpindah-pindah sistem.",
        star: 5,
      }]);
    } else {
      setSectionData(null);
      setSliderData([]);
    }
  }, [props.dataApi]);

  return (
    <div>
      <div className="px-8 py-4 gap-4 lg:py-8 flex lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8 pr-16">
          <div className="flex">
            <div className="ebd-text-gradient text-[20px] use-gotham font-[900] shadow p-2 px-4 rounded-full">
              {sectionData?.categoryName}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div
              className="text-[38px] use-gotham font-[700] leading-[40px]"
              dangerouslySetInnerHTML={{ __html: sectionData?.name }}
            ></div>
            <div
              className="text-[24px] leading-[28px]"
              dangerouslySetInnerHTML={{ __html: sectionData?.description }}
            ></div>
          </div>
        </div>
        <div className="relative">
          <img
            src={resolveWebImage(backgroundSlider, WEB_IMAGE_FALLBACKS.testimonialBackground)}
            onError={(event) => applyImageFallback(event, WEB_IMAGE_FALLBACKS.testimonialBackground)}
            className="w-full absolute z-[-1] object-cover"
          />
          <div className="p-4 lg:p-16">
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper; // simpan instance swiper
                }}
                spaceBetween={20}
                slidesPerView={1}
                className="shadow rounded-[7px] bg-white"
                loop={true}
              >
                {sliderData?.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div className=" p-4 flex flex-col gap-4">
                      <div className="flex gap-1 text-[#F9CB33] ">
                        {[1, 2, 3, 4, 5].map((itemStar, indexStar) => (
                          <Fragment key={indexStar}>
                            {itemStar <= item.star ? <FaStar /> : <FaRegStar />}
                          </Fragment>
                        ))}
                      </div>
                      <div
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      ></div>
                      <div className="flex gap-2 items-center">
                        <div className=" w-[64px] ebd-border-color-gradient-testi h-[64px] rounded-[70px]">
                          <img
                            src={resolveWebImage(item.image, WEB_IMAGE_FALLBACKS.testimonialAvatar)}
                            onError={(event) =>
                              applyImageFallback(event, WEB_IMAGE_FALLBACKS.testimonialAvatar)
                            }
                            className="object-cover object-center w-full rounded-[100%]"
                          />
                        </div>
                        <div>
                          <div className="font-[900]">{item.name}</div>
                          <div className="ebd-text-gradient">
                            {item.jobTitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="absolute bottom-[-15px] flex gap-2 right-[10px] z-[10]">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTestimonial;
