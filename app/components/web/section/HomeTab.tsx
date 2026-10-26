import { useEffect, useState } from "react";
import Button from "../button/Button";
import ButtonLink from "../button/ButtonLink";
import { removeTrailingNbsp } from "app/lib/helper";
import { applyImageFallback, resolveWebImage, WEB_IMAGE_FALLBACKS } from "app/lib/webImage";

interface HomeTabProps {
  dataApi?: any;
}

const HomeTab = (props: HomeTabProps) => {
  const [sectionData, setSectionData] = useState<any>({
    subname: "Alur kerja yang saling terhubung",
    name: `Satu portal untuk <br />
<span class="ebd-text-gradient">content, project, AI,</span><br />
dan finance reminder`,
  });
  const [sectionTabData, setSectionTabData] = useState([
    {
      name: "CMS & Konten",
      content: {
        image: WEB_IMAGE_FALLBACKS.tab,
        subname: "CMS & Konten",
        name: `Bangun halaman utama dan turunan <span class="ebd-text-gradient">berbasis section</span>`,
        description:
          "Tim bisa mengatur content, media, wording, dan metadata dalam framework yang sama tanpa perlu hardcode ulang setiap halaman.",
        url: "/#fitur-utama",
      },
    },
    {
      name: "Project & Redmine",
      content: {
        subname: "Project & Redmine",
        name: `Pantau severity, <span class="ebd-text-gradient">violated card</span>, dan progress tim`,
        description:
          "Dashboard membantu membaca kondisi project lebih cepat, dari spent time sampai QA re-open, dalam satu tampilan operasional.",
        url: "/#operasional-terukur",
      },
    },
    {
      name: "AI & Reminder",
      content: {
        subname: "AI & Reminder",
        name: `Knowledge website dan <span class="ebd-text-gradient">follow-up finance</span> dalam satu portal`,
        description:
          "WhatsApp AI belajar dari knowledge yang Anda kelola, sementara reminder finance membantu menjaga due date dan tindak lanjut tetap disiplin.",
        url: "/#mulai-weportal",
      },
    },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    if (props.dataApi !== undefined) {
      var sectiondataTmp = {};
      var clientTmp = [];
      if (props.dataApi?.category?.pageTranslations?.length > 0) {
        sectiondataTmp = {
          subname: props.dataApi?.category?.pageTranslations[0]?.title ?? "",
          name: props.dataApi?.category?.pageTranslations[0]?.overview ?? "",
        };
      }

      if (props.dataApi?.category?.pageCategories?.length > 0) {
        props.dataApi?.category?.pageCategories?.forEach((a) => {
          a?.page?.mediaPages?.forEach((b) => {
            if (a.langCode == b.langCode && b.type == "media_image") {
              var sectionDetail =
                a?.page?.translations?.length > 0
                  ? a?.page?.translations[0] ?? null
                  : null;
              let tmpClientItem = {
                name: sectionDetail?.title ?? "",
                content: {
                  image: resolveWebImage(b.url, WEB_IMAGE_FALLBACKS.tab),
                  name: sectionDetail.overview,
                  description: sectionDetail.description,
                  url: sectionDetail.url ?? sectionDetail.canonicalUrl ?? "#",
                },
              };
              clientTmp.push(tmpClientItem);
            }
          });
        });
      }

      setSectionData(sectiondataTmp);
      setSectionTabData(clientTmp);
    } else {
      setSectionData(null);
      setSectionTabData([]);
    }
  }, [props.dataApi]);

  return (
    <div id="alur-kerja" className="scroll-mt-32">
      <div className="px-8 py-4 gap-4 lg:py-8 lg:px-16 flex flex-col gap-8">
        <div className="flex justify-center">
          <div className="ebd-text-gradient text-[20px] use-gotham font-[900] shadow p-2 px-4 rounded-full">
            {sectionData?.subname}
          </div>
        </div>
        <h2
          className="text-[20px] lg:text-[65px] lg:leading-[67px] font-[900] text-center"
          dangerouslySetInnerHTML={{ __html: sectionData?.name }}
        ></h2>
        <div className="flex justify-center gap-4 border-t-[1px] overflow-auto border-b-[1px] border-[#C7C7CC]">
          <div className="flex lg:justify-center gap-4 w-full">
            {sectionTabData?.map((item, index) => (
              <div
                onClick={() => {
                  setActiveTab(index);
                }}
                className={`p-4 text-[28px] cursor-pointer select-none leading-[30px] ${
                  activeTab == index
                    ? "border-b-gradient-primary font-bold"
                    : ""
                } `}
                key={index}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          {sectionTabData[activeTab] !== undefined && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div>
                  <img
                    src={resolveWebImage(
                      sectionTabData[activeTab]?.content.image,
                      WEB_IMAGE_FALLBACKS.tab
                    )}
                    onError={(event) => applyImageFallback(event, WEB_IMAGE_FALLBACKS.tab)}
                    className="object-contain w-full"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <div
                    className="flex flex-col gap-2 title-tab-home"
                    dangerouslySetInnerHTML={{
                      __html:
                        removeTrailingNbsp(
                          sectionTabData[activeTab]?.content?.name
                        ) ?? "",
                    }}
                  >
                    {/* <div className="text-[24px] leading-[26px] font-[700] use-gotham">
                      {sectionTabData[activeTab].content.subname}
                    </div>
                    <div
                      className="text-[38px] leading-[40px] font-[700] use-gotham"
                      dangerouslySetInnerHTML={{
                        __html: sectionTabData[activeTab].content.name ?? "",
                      }}
                    ></div> */}
                  </div>
                  <div
                    className="text-[24px] leading-[26px] font-[400]"
                    dangerouslySetInnerHTML={{
                      __html:
                        sectionTabData[activeTab].content.description ?? "",
                    }}
                  ></div>
                </div>
                <div className="flex gap-4">
                  <div className="flex">
                    <ButtonLink
                      link={sectionTabData[activeTab]?.content?.url ?? "#"}
                      name="Learn More"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
