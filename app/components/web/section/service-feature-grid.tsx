interface ServiceFeatureGridProps {
  dataApi: any;
}

function splitCards(description: string) {
  return String(description || "")
    .split("<hr>")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ServiceFeatureGrid({ dataApi }: ServiceFeatureGridProps) {
  const cards = splitCards(dataApi?.description);

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-16 lg:py-16">
        <div className="mb-8 max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            {dataApi?.subTitle || "Capabilities"}
          </div>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 lg:text-5xl">
            {dataApi?.title}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <article
              key={`service-card-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-base font-black text-blue-700">
                {index + 1}
              </div>
              <div
                className="text-sm leading-7 text-slate-600 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:text-slate-950 [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: card }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
