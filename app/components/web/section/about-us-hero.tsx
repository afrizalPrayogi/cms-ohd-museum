interface AboutUsHeroProps {
  dataApi: any;
}

export default function AboutUsHero({ dataApi }: AboutUsHeroProps) {
  const image = dataApi?.image || "/assets/images/home-section-2-thumb.png";

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {dataApi?.subTitle || "About Us"}
          </div>
          <h1 className="text-4xl font-black leading-tight text-slate-950 lg:text-6xl">
            {dataApi?.title}
          </h1>
          <div
            className="mt-6 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: dataApi?.description || "" }}
          />
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-slate-100 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.7)]">
          <img
            src={image}
            alt={dataApi?.title || "About us"}
            className="h-full min-h-[280px] w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
