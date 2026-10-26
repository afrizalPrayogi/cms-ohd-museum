interface InsightDetailFreeContentProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function InsightDetailFreeContent(props: InsightDetailFreeContentProps) {
  return (
    <div className='overflow-hidden px-[1.875rem] h-full bg-white pt-28 pb-[5.688rem] flex justify-center lg:px-[21.875rem] [&_img]:p-8'>
      <div dangerouslySetInnerHTML={{ __html: props?.dataApi?.description }} className="w-full md:w-auto h-auto [&_img]:w-full text-[10px] md:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_h4]:font-bold [&_h5]:font-bold [&_h2]:leading-normal [&_h3]:leading-normal [&_h4]:leading-normal [&_h5]:leading-normal [&_p]:leading-normal mt-[2.188rem] [&>p]:mb-5 [&>h2]:text-lg md:[&>h2]:text-4xl [&>h3]:text-base md:[&>h3]:text-3xl [&>h4]:text-sm md:[&>h4]:text-lg [&>h5]:text-xs md:md:[&>h4]:text-2xl [&>h5]:text-xl [&>h2]:mb-5 [&>h3]:mb-5 [&>h4]:mb-5 [&>h5]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5"></div>
    </div>
  );
}
