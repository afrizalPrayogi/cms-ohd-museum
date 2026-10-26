interface ServiceHeroProps {
  dataApi: any;
}

export default function ServiceHero({ dataApi }: ServiceHeroProps) {
  const image = dataApi?.image || "/assets/images/home-section-tab.png";

  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-20">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
            {dataApi?.subTitle || "Service"}
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight lg:text-6xl">
            {dataApi?.title}
          </h1>
          <div
            className="mt-6 max-w-2xl text-base leading-8 text-slate-200 lg:text-lg [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: dataApi?.description || "" }}
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_90px_-55px_rgba(37,99,235,0.9)]">
          <img
            src={image}
            alt={dataApi?.title || "Service"}
            className="h-[300px] w-full object-cover lg:h-[420px]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
