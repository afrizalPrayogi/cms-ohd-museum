export default function Services() {
  return (
    <section
      id="services"
      className="max-w-7xl mx-auto px-6 py-20 border-t border-green-600"
    >
      <h2 className="text-4xl text-green-600 font-extrabold text-center mb-16 tracking-wide text-slate-900">
        Layanan Kami
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <article className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center">
          <img
            alt="Ilustrasi website WordPress dengan tampilan modern dan responsif berwarna biru dan putih"
            className="mb-6 rounded-full border border-sky-400"
            height="120"
            loading="lazy"
            src="https://storage.googleapis.com/a1aa/image/12d80bf7-c1c9-4fc2-a3ec-bae072b74f04.jpg"
            width="120"
          />
          <h3 className="text-2xl font-bold text-sky-600 mb-3">
            Website & CMS
          </h3>
          <p className="text-slate-600">
            Pembuatan Website WordPress & CMS custom untuk kebutuhan bisnis
            Anda.
          </p>
        </article>
        <article className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center">
          <img
            alt="Ilustrasi website WordPress dengan tampilan modern dan responsif berwarna biru dan putih"
            className="mb-6 rounded-full border border-sky-400"
            height="120"
            loading="lazy"
            src="https://storage.googleapis.com/a1aa/image/7dbefcf3-934b-4654-7610-405b5c01b233.jpg"
            width="120"
          />
          <h3 className="text-2xl font-bold text-sky-600 mb-3">POS & Stok</h3>
          <p className="text-slate-600">
            Aplikasi kasir modern terintegrasi dengan manajemen stok.
          </p>
        </article>
        <article className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center">
          <img
            alt="Ilustrasi website WordPress dengan tampilan modern dan responsif berwarna biru dan putih"
            className="mb-6 rounded-full border border-sky-400"
            height="120"
            loading="lazy"
            src="https://storage.googleapis.com/a1aa/image/12d80bf7-c1c9-4fc2-a3ec-bae072b74f04.jpg"
            width="120"
          />
          <h3 className="text-2xl font-bold text-sky-600 mb-3">
            Sistem Rumah Sakit
          </h3>
          <p className="text-slate-600">
            Aplikasi rumah sakit terintegrasi BPJS & sistem rekam medis.
          </p>
        </article>
      </div>
    </section>
  );
}
