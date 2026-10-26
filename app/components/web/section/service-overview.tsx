interface ServiceOverviewProps {
  dataApi: any;
}

export default function ServiceOverview({ dataApi }: ServiceOverviewProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1120px] px-4 py-12 text-center lg:px-16 lg:py-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          {dataApi?.subTitle || "Overview"}
        </div>
        <h2 className="mx-auto mt-3 max-w-4xl text-3xl font-black leading-tight text-slate-950 lg:text-5xl">
          {dataApi?.title}
        </h2>
        <div
          className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 lg:text-lg [&_p]:mb-4"
          dangerouslySetInnerHTML={{ __html: dataApi?.description || "" }}
        />
      </div>
    </section>
  );
}
