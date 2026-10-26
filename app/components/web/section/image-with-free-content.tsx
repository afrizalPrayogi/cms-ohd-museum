interface ImageWithFreeContentProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function ImageWithFreeContent(props: ImageWithFreeContentProps) {
  return (
    <div
      className={`overflow-x-hidden relative h-full bg-white ${props.isAfterBannerPage == true ? "pt-16 md:pt-[7.688rem]" : ""
        }`}
    >
      <img className="hidden md:show absolute w-[7rem] md:w-[29.25rem] h-[13rem] md:h-[24.688rem] right-2 md:-right-[9.5rem] bottom-[13.938rem] md:bottom-0" src="/assets/images/about-us-background.png" />
      <img className="show md:hidden absolute w-[17rem] h-auto right-2 top-6" src="/assets/images/about-us-background-m.png" />
      <div className='mx-[1.875rem] md:mx-[7.063rem]'>
        <div className='flex justify-between gap-11 md:gap-16 flex-col md:flex-row-reverse md:flex-row'>
          <img
            alt="Ilustrasi layanan"
            className="w-[15.375rem] md:w-[32.875rem] h-auto md:h-full object-cover mx-auto relative z-10"
            loading="lazy"
            src={props?.dataApi?.image}
          />
          <div className="w-full md:w-[38.688rem]">
            <h2 className='block pb-3 md:pb-[1.063rem] text-lg md:text-5xl font-black'>{props?.dataApi?.title}</h2>
            <div className="h-[1px] md:h-1 w-[4.938rem] md:w-[11.75rem] bg-[#2A53CC]"></div>
            <span className='block mt-3 md:mt-[2.188rem] text-sm md:text-2xl' >
              <div dangerouslySetInnerHTML={{ __html: props?.dataApi?.description }} className="[&_p]:mb-2 md:[&_p]:mb-5 [&_p]:text-[13px] md:[&_p]:text-2xl [&_p]:leading-['normal'] [&>p:first-child>strong:first-child]:font-bold [&>p:first-child>strong:first-child]:inline-block [&>p:first-child>strong:first-child]:mb-0"></div>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
