import { findMediaUrlByType } from "app/lib/helper";
import { useState } from "react";

interface ServiceIconListProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function ServiceIconList(props: ServiceIconListProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedItem(null);
  };
  return (
    <div className="h-full bg-white relative">
      <div className="mx-[1.875rem] md:mx-[7.063rem] pt-20 flex flex-col items-center z-10">
        <h2
          className="mb-[1.063rem] font-bold text-[15px] md:text-5xl text-center"          
        ><span className=""
          dangerouslySetInnerHTML={{
            __html: props?.dataApi?.category?.pageTranslations?.[0]?.title,
          }}></span> 
          <span className="ebd-text-gradient"
          dangerouslySetInnerHTML={{
            __html: props?.dataApi?.category?.pageTranslations?.[0]?.subTitle,
          }}></span>
          </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-7 gap-y-7 w-full">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => (
            <div
              key={index}
              className="cursor-pointer border border-[#ACCFFF] w-full h-[13.25rem] bg-[#F5F9FF] z-10 hover:shadow-lg transition"
              onClick={() => openModal(rw)}
            >
              <div className="flex flex-col justify-center items-center gap-4 text-2xl h-full">
                <img
                  alt="Ilustrasi layanan"
                  className="w-[2.125rem] md:w-[5.438rem] h-auto object-cover"
                  loading="lazy"
                  src={findMediaUrlByType(rw?.page?.mediaPages, "media_icon")}
                />
                <div
                  className="font-bold text-xs md:text-2xl text-center"
                  dangerouslySetInnerHTML={{
                    __html: rw?.page?.translations?.[0]?.title,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 h-max-full">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-[#F5F9FF] rounded-2xl shadow-lg mx-[1.875rem] md:mx-[7.063rem] w-[90%] p-7 md:p-10 z-10">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={closeModal}
            >
              ✕
            </button>

            <h3 className="text-lg md:text-4xl font-bold mb-4 text-center ebd-text-gradient">
              {selectedItem?.page?.translations?.[0]?.title}
            </h3>

            <div
              className="text-[13px] lg:text-2xl gap-7 md:gap-16 text-[10px] md:text-xl [&_li]:leading-[16px] md:[&_li]:leading-normal [&_h3]:w-full [&_ul]:w-full [&_h3]:text-[15px] md:[&_h3]:text-2xl md:[&_h3]:pb-3 md:[&_h3]:pt-7 [&_h3]:bg-clip-text [&_h3]:text-transparent [&_h3]:bg-gradient-primary-text [&_h3]:font-black md:[&_h3]:font-bold [&_h3]:w-1/2 md:[&_ul]:w-full [&_ul]:w-1/2 md:[&_h3]:w-full [&_li]:pl-6 [&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 md:[&_li]:before:top-4 [&_li]:before:-translate-y-1/2 [&_li]:before:w-[11px] [&_li]:before:h-[11px] md:[&_li]:before:w-[20px] md:[&_li]:before:h-[20px] [&_li]:before:bg-[url('/assets/images/list-check.png')] [&_li]:before:bg-contain [&_li]:before:bg-center [&_li]:before:bg-no-repeat"
              dangerouslySetInnerHTML={{
                __html: selectedItem?.page?.translations?.[0]?.overview
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-gradient-grey-to-bottom absolute top-0 w-full h-[28rem] opacity-10"></div>
    </div>
  );
}

