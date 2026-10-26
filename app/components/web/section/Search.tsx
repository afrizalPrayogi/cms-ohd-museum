import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { FetchData } from "app/lib/helper";
import { RotateLoader } from "react-spinners";
import Pagination from "../pagination/pagination";

interface SearchProps {
  dataApi?: any;
}

const Search = (props: SearchProps) => {
  var searchParams = useSearchParams();
  const reqKeyword = searchParams.get("keyword");
  const reqPage = searchParams.get("page");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [childData, setChildData] = useState([
    // {
    //   name: "Regional Manager & Limited Time Management",
    //   url: "#",
    //   overview:
    //     "With over a decade experience, wwe’ve established ourselves one of ",
    //   creator: "Rayyan",
    //   date: "July 24, 2025",
    //   image: "/assets/images/home-latest-post-1.jpg",
    // },
    // {
    //   name: "Regional Manager & Limited Time Management",
    //   url: "#",
    //   overview:
    //     "With over a decade experience, wwe’ve established ourselves one of ",
    //   creator: "Rayyan",
    //   date: "July 24, 2025",
    //   image: "/assets/images/home-latest-post-2.jpg",
    // },
    // {
    //   name: "Regional Manager & Limited Time Management",
    //   url: "#",
    //   overview:
    //     "With over a decade experience, wwe’ve established ourselves one of ",
    //   creator: "Rayyan",
    //   date: "July 24, 2025",
    //   image: "/assets/images/home-latest-post-3.jpg",
    // },
    // {
    //   name: "Regional Manager & Limited Time Management",
    //   url: "#",
    //   overview:
    //     "With over a decade experience, wwe’ve established ourselves one of ",
    //   creator: "Rayyan",
    //   date: "July 24, 2025",
    //   image: "/assets/images/home-latest-post-3.jpg",
    // },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const onSearch = async (keyword, page?) => {
    setIsLoading(true);
    try {
      let url = "api/fe/v1/search?keyword=" + encodeURIComponent(keyword);
      if (page !== undefined) {
        url += "&page=" + page;
      }
      const data = await FetchData(url, "GET", "", false, "", false);
      if (data?.code == 200) {
        setChildData(
          data?.data?.result?.map((item) => ({
            name: item?.title,
            url: item?.url,
            overview: item?.overview,
          }))
        );
        // var arrayPage = [];
        // for (let index = 1; index <= (data?.data?.totalPages ?? 0); index++) {
        //   arrayPage.push(index);
        // }
        setTotalPage(data?.data?.totalPages);
      } else {
        setChildData([]);
        setTotalPage(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      reqKeyword !== undefined &&
      reqKeyword !== null &&
      reqKeyword.trim() != ""
    ) {
      if (reqPage !== undefined && reqPage !== null && reqPage.trim() != "") {
        onSearch(reqKeyword, reqPage);
        setCurrentPage(parseInt(reqPage));
      } else {
        onSearch(reqKeyword);
        setCurrentPage(1);
      }
    } else {
      window.location.href = "/";
    }
  }, [reqKeyword, reqPage]);

  return (
    <div>
      <div className="px-8 py-4 gap-4 lg:py-8 lg:px-16">
        <div className="flex flex-col gap-8 justify-center">
          <div className="w-full flex justify-between">
            <h2 className="text-[20px] lg:text-[32px] lg:leading-[34px] font-[800]">
              Hasil Pencarian : {reqKeyword}
            </h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <RotateLoader />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              {childData?.map((item, index) => (
                <a href={item.url} key={index}>
                  <div className="shadow">
                    <div className="p-4 flex flex-col gap-4">
                      <div className="text-[24px] leading-[26px] font-[900]">
                        {item.name}
                      </div>
                      <div
                        className="text-[#757575] text-[18px] leading-[20px] font-[400]"
                        dangerouslySetInnerHTML={{ __html: item.overview }}
                      ></div>
                      <hr />
                      <div className="flex justify-between">
                        <div className="flex gap-2 lg:gap-3 items-center"></div>
                        <div className="flex items-center gap-2">
                          <div className="text-[12px] lg:text-[18px] font-[800] ">
                            More Details
                          </div>
                          <FaArrowRight />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <Pagination
            totalPage={totalPage}
            currentPage={currentPage}
            onClick={(value) => {
              window.location.href =
                "/search?keyword=" + reqKeyword + "&page=" + value;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
