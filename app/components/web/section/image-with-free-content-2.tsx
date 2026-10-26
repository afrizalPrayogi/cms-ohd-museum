interface ImageWithFreeContent2Props {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function ImageWithFreeContent2(props: ImageWithFreeContent2Props) {
  return (
    <div
      className={`overflow-x-hidden h-full bg-white ${props.isAfterBannerPage == true ? "pt-16 md:pt-[7.688rem]" : ""
        }`}
    >
      <div className='mx-[1.875rem] lg:mx-[7.063rem] md:pt-[4.625rem] h-full'>
        <div className='pl-0 md:pl-[7.375rem] flex items-center justify-center gap-6 h-full'>
          <div className="w-[47.438rem]">
            <h2 className='block pb-4 md:pb-[1.063rem] ebd-text-gradient text-[15px] md:text-5xl font-black'>{props?.dataApi?.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: props?.dataApi?.description }} className="text-[10px] md:text-2xl [&>p]:mb-5 [&>p:first-child>strong:first-child]:inline-block [&>p:first-child>strong:first-child]:mb-8"></div>
          </div>
          <img
            alt="Ilustrasi layanan"
            className="w-[10.688rem] md:w-[31.875rem] h-full object-cover"
            loading="lazy"
            src={props?.dataApi?.image}
          />
        </div>
      </div>
    </div>
  );
}
