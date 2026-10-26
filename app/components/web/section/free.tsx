interface FreeProps {
  isAfterBannerPage?: boolean;
  dataApi: any;
}

export default function Free(props: FreeProps) {
  return (
    <div className='w-full bg-white'>
      <div dangerouslySetInnerHTML={{ __html: props?.dataApi?.description }} className=""></div>
    </div>
  );
}
