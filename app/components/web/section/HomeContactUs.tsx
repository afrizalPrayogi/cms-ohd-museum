import { useEffect, useState } from "react";
import Button from "../button/Button";
import ButtonLink from "../button/ButtonLink";
import { FaArrowRight } from "react-icons/fa";
import { applyImageFallback, resolveWebImage, WEB_IMAGE_FALLBACKS } from "app/lib/webImage";

interface HomeContactUsProps {
  dataApi?: any;
  pageData?: any;
}

const HomeContactUs = (props: HomeContactUsProps) => {
  const [sectionData, setSectionData] = useState<any>({
    name: "Tentang WePortal",
    overview: `Satu portal untuk <span class="ebd-text-gradient">content, project, AI, dan finance</span>`,
    image: "/assets/images/home-section-2-thumb.png",
    description: `WePortal dirancang sebagai pusat operasional digital untuk tim, agar content, monitoring, knowledge AI, dan reminder bisa berjalan lebih rapi dalam satu portal.`,
    contactInfo: [
      {
        name: "Phone",
        url: "https//wa.me/628128266730",
        value: "+62 8128266730",
        image: "/assets/icons/contact-whatsapp.svg",
      },
      {
        name: "Contact Us!",
        url: "mailto:Contact@ebd.com",
        value: "Contact@ebd.com",
        image: "/assets/icons/contact-mail.svg",
      },
    ],
  });

  useEffect(() => {
    if (props.dataApi !== undefined) {
      var tmpSectionData = {
        name: props.dataApi?.title,
        overview: props.dataApi?.subTitle,
        image: resolveWebImage(props.dataApi?.image, WEB_IMAGE_FALLBACKS.section),
        description: props.dataApi?.description,
      };
      setSectionData(tmpSectionData);
    } else {
      setSectionData(null);
    }
  }, [props.dataApi]);

  return (
    <div id="hubungi-weportal" className="pt-4 scroll-mt-32">
      <div className="px-8 py-4 gap-4 lg:py-8 lg:px-16 grid lg:grid-cols-2 gap-4 ">
        <div>
          <div>
            <img
              src={resolveWebImage(sectionData?.image, WEB_IMAGE_FALLBACKS.section)}
              onError={(event) => applyImageFallback(event, WEB_IMAGE_FALLBACKS.section)}
              className="object-contain h-[500px] w-full"
            />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[18px] lg:text-[20px] lg:leading-[24px] font-[500] use-gotham">
                {sectionData?.name}
              </div>
              <div
                className="text-[24px] leading-[28px] lg:text-[32px] lg:leading-[36px] font-[700] use-gotham"
                dangerouslySetInnerHTML={{
                  __html: sectionData?.overview ?? "",
                }}
              ></div>
            </div>
            <div
              className="text-[12px] leading-[16px] lg:text-[18px] lg:leading-[24px] font-[400] border-left-contactus"
              dangerouslySetInnerHTML={{
                __html: sectionData?.description ?? "",
              }}
            ></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex">
              <ButtonLink
                link={"/contact-us"}
                name={props?.pageData?.wording?.contactus ?? ""}
                className="font-bold"
                icon={<FaArrowRight />}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="shadow rounded-full p-3">
                <img src={"/assets/icons/footer-phone.svg"} />
              </div>
              <div className="text-[20px] leading-[24px] lg:text-[26px] lg:leading-[30px] font-bold ">
                {props?.pageData?.wording?.phonenumber}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContactUs;
