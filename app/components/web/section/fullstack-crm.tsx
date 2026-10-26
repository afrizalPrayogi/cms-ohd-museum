import { findMediaUrlByType } from "app/lib/helper";

interface FullstackCrmProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function FullstackCrm(props: FullstackCrmProps) {
  // console.log('props?.dataApi?.category?.pageCategories[0].page?.mediaPages VisionMission:', props?.dataApi?.category?.pageCategories[0].page?.mediaPages)
  return (
    <div className="pt-8 md:pt-[8.438rem] relative h-full bg-white bg-[url('/assets/images/futher-development-background-fullstack.png')] bg-no-repeat bg-[length:calc(100%-3.75rem)_auto] md:bg-[length:calc(100%-9.875rem)_auto] bg-bottom">
      <div className="relative mx-[1.875rem] md:mx-[7.063rem] gap-2 md:gap-8 flex flex-col items-center z-10 ">
        <div dangerouslySetInnerHTML={{ __html: props?.dataApi?.description }} className="[&_p]:text-[10px] md:[&_p]:text-xl [&_h3]:text-[15px] md:[&_h3]:text-[38px] [&_h3]:bg-clip-text [&_h3]:text-transparent [&_h3]:bg-gradient-primary-text">
        </div>
        <img
          alt="Ilustrasi layanan"
          className="w-full md:w-[60.125rem] h-full object-cover"
          loading="lazy"
          src={props?.dataApi?.image}
        />
        <div className="h-[3.4px] md:h-[0.688rem] w-full bg-gradient-primary-to-left rounded-full"></div>
      </div>
      <div className="absolute inset-0 bg-[rgba(255,255,255,0.76)]"></div>
    </div>
  );
}
