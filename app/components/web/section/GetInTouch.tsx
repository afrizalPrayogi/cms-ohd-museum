import { useState } from "react";
import Button from "../button/Button";

interface GetInTouchProps {
  isAfterBannerPage?: boolean;
  dataApi?: any;
  pageData?: any;
}
const GetInTouch = (props: GetInTouchProps) => {
  const [sectionData, setSectionData] = useState({
    name: "Get in touch",
    description:
      "Ready to redefine the future of finance? Talk and collaborate with us to create secure, seamless, and innovative digital experiences.",
    contactInfo: [
      {
        name: "Phone",
        url: "https//wa.me/628128266730",
        value: "+62 8128266730",
        image: "/assets/icons/contact-whatsapp.svg",
      },
      {
        name: "Email",
        url: "mailto:Contact@ebd.com",
        value: "Contact@ebd.com",
        image: "/assets/icons/contact-mail.svg",
      },
      {
        name: "Address",
        url: "#",
        value: "Sentraya 12th floor",
        image: "/assets/icons/contact-map-pin.svg",
      },
    ],
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1434036523765!2d106.8037739!3d-6.244825199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f21e0c9a2983%3A0x97b71463fc40251d!2sMenara%20Sentraya!5e0!3m2!1sid!2sid!4v1756858580579!5m2!1sid!2sid",
  });

  return (
    <div className={`${props.isAfterBannerPage == true ? "pt-[20px]" : ""}`}>
      <div className="px-8 py-4 gap-4 lg:py-8 lg:px-16 grid lg:grid-cols-2 ">
        <div className="flex flex-col gap-4 justify-center">
          <h2 className="ebd-text-gradient text-[20px] lg:text-[32px] lg:leading-[34px] font-[800]">
            {props.dataApi?.title}
          </h2>
          <div
            className="text-[20px]"
            dangerouslySetInnerHTML={{
              __html: props.dataApi?.description ?? "",
            }}
          ></div>
          {/* <div className="flex flex-col gap-2">
            {sectionData?.contactInfo?.map((item, index) => (
              <div className="flex" key={index}>
                <a href={item.url} className="flex gap-2 items-center">
                  <img
                    src={item.image}
                    className="min-w-[24px] max-w-[24px] min-h-[24px] max-h-[24px] object-contain aspce-square"
                  />
                  <div className="text-[24px]">{item.value}</div>
                </a>
              </div>
            ))}
          </div> */}
        </div>
        <div>
          <iframe
            src={props?.pageData?.wording?.map}
            width="100%"
            height="100%"
            className="border-0 min-h-[450px]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;
