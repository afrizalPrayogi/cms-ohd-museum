interface FreeContentProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function FreeContent(props: FreeContentProps) {
  return (
    <div className='h-full bg-white pt-8 lg:pt-28 pb-7 lg:pb-[5.688rem] flex justify-center'>
      <div className="relative">
        <div className="absolute -left-2 lg:-left-6 top-1/2 -translate-y-1/2 w-[7.625rem] lg:w-[10.625rem] h-[7.625rem] lg:h-[10.625rem] rounded-full bg-gradient-primary-to-left-o20"></div>
        <div className="relative z-10 bg-gradient-primary-to-left text-white font-normal lg:font-bold text-center rounded-[3.594rem] p-4 lg:px-8 lg:py-6 w-[20.25rem] lg:w-[50.063rem] text-[13px] lg:text-2xl">
          <div dangerouslySetInnerHTML={{ __html: props?.dataApi?.description }} className=""></div>
        </div>
      </div>
    </div>
  );
}
