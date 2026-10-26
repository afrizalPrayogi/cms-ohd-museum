import { findMediaUrlByType } from "app/lib/helper";
import { useEffect, useRef, useState } from "react";

interface SectionTabProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function SectionTab(props: SectionTabProps) {
  const [active, setActive] = useState(0);
  const listRef = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    listRef.current[active]?.focus();
  }, [active]);

  function onKeyDown(e: React.KeyboardEvent, idx: number) {
    const last = props?.dataApi?.category?.pageCategories?.length - 1;
    let next = idx;
    if (e.key === "ArrowRight") next = idx === last ? 0 : idx + 1;
    else if (e.key === "ArrowLeft") next = idx === 0 ? last : idx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "Enter" || e.key === " ") {
      setActive(idx);
      return;
    } else return;

    e.preventDefault();
    setActive(next);
  }

  return (
    <div
      className={`h-full bg-white ${props.isAfterBannerPage == true ? "pt-[3.875rem] md:pt-[7.688rem]" : ""
        }`}
    >
      <div className='mx-[1.875rem] md:mx-[7.063rem] md:py-[4.625rem] '>
        <h2 className="mb-4 font-black text-[15px] md:text-4xl text-center ebd-text-gradient">
          {props?.dataApi?.category?.pageTranslations?.[0]?.title}
        </h2>
        <div className="text-[10px] md:text-xl"
          dangerouslySetInnerHTML={{
            __html: props?.dataApi?.category?.pageTranslations?.[0]?.overview,
          }}
        />
        <div role="tablist" aria-label="Sample Tabs" className="pt-6 md:pt-[5.438rem] flex gap-16 items-center justify-center border-b-2 border-[#1374F5]">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => {
            const isActive = index === active;
            return (
              <button
                key={index}
                id={`tab-${index}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${index}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={`px-3 md:px-4 py-5 text-[10px] md:text-3xl rounded-t-2xl focus:outline-none transition-shadow 
                ${isActive ? 'font-black text-[10px] md:text-[2.25rem] border-b-gradient-primary inline-block' : ''}`}
              >
                {rw?.page?.translations?.[0]?.title}
              </button>
            );
          })}
        </div>

        <div className="py-8">
          {props?.dataApi?.category?.pageCategories?.map((rw, index) => (
            <div
              key={index}
              id={`panel-${index}`}
              role="tabpanel"
              aria-labelledby={`tab-${index}`}
              className={`gap-6 flex flex-col-reverse md:flex-row justify-between ${index !== active ? 'hidden' : ''}`}
            >
              <div className="w-full md:w-1/2">
                <div dangerouslySetInnerHTML={{ __html: rw?.page?.translations?.[0]?.overview }} className="text-[10px] md:text-xl [&_p]:leading-normal mt-[2.188rem] [&>p]:mb-5 [&_p:first-child>strong:first-child]:inline-block [&_p:first-child>strong:first-child]:mb-8 [&_ul]:list-disc [&_ul]:pl-6"></div>
              </div>
              <div className="w-full md:w-1/2 px-8">
                {findMediaUrlByType(rw?.page?.mediaPages, "media_link_embed_youtube") != "-" ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: findMediaUrlByType(rw?.page?.mediaPages, "media_link_embed_youtube") }} className="text-[10px] md:text-xl [&_p]:leading-normal mt-[2.188rem] [&>p]:mb-5 [&_p:first-child>strong:first-child]:inline-block [&_p:first-child>strong:first-child]:mb-8 [&_ul]:list-disc [&_ul]:pl-6"></div>

                  </>
                ) :
                  (<img
                    alt="Ilustrasi layanan"
                    className="w-full h-auto object-cover bg-[url('/assets/images/demo-background.png')] bg-no-repeat bg-[length:100%] bg-top"
                    loading="lazy"
                    src={findMediaUrlByType(rw?.page?.mediaPages, "media_image")}
                  />
                  )}

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
