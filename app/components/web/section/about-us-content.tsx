interface AboutUsContentProps {
  dataApi: any;
}

export default function AboutUsContent({ dataApi }: AboutUsContentProps) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-16 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              {dataApi?.subTitle || "Our Story"}
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 lg:text-5xl">
              {dataApi?.title}
            </h2>
          </div>
          <div
            className="rounded-2xl border border-slate-200 bg-white p-6 text-base leading-8 text-slate-600 shadow-sm lg:p-8 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:text-slate-950 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: dataApi?.description || "" }}
          />
        </div>
      </div>
    </section>
  );
}
