interface ImageWithFreeContent1Props {
  isAfterBannerPage?: boolean;
  dataApi: any;
}
export default function ImageWithFreeContent1(props: ImageWithFreeContent1Props) {
  return (
    <div className='h-full bg-white'>
      <div className='lg:mx-[7.063rem] py-4 md:py-[4.625rem]'>
        <div className='relative flex justify-between flex-col md:flex-row gap-11'>
          <div className="flex items-center lg:items-start justify-center lg:justify-start bg-gradient-primary-o5 lg:bg-white w-full lg:w-auto h-[8.563rem] lg:h-[20.938rem] top-[2.375rem] absolute lg:relative">
            <img
              alt="Ilustrasi layanan"
              className="w-[7rem] lg:w-full h-[7rem] lg:h-full object-cover lg:bg-white"
              loading="lazy"
              src={props?.dataApi?.image}
            />
          </div>
          <div className="w-full lg:flex-1 mx-[1.875rem] lg:mx-0">
            <h2 className='block pb-2 mb-[9.5863rem] lg:mb-0 text-lg lg:text-5xl font-black'>{props?.dataApi?.title}</h2>
            <h3 className='block font-black md:font-bold text-[15px] lg:text-2xl ebd-text-gradient'>
              {props?.dataApi?.subTitle}
            </h3>
            <div dangerouslySetInnerHTML={{ __html: props?.dataApi?.description }} className="text-[13px] lg:text-2xl mt-2 md:mt-4 lg:mt-[2.188rem] [&_p]:mb-2 md:[&_p]:mb-5 [&_p]:leading-['normal'] [&>p:first-child>strong:first-child]:inline-block"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
