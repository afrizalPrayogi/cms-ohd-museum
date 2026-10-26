export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-sky-100 via-white to-purple-100 text-slate-900 py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 mt-2">
        <div className="md:w-1/2 space-y-8">
          <h1 className="text-2xl md:text-5xl font-extrabold leading-tight tracking-wide">
            Solusi Digital Modern <br />
            untuk Kebutuhan Bisnis Anda
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-xl text-slate-700">
            Kami menghadirkan layanan pembuatan website dan aplikasi
            terintegrasi mulai dari WordPress, Custom CMS, POS, Sistem Rumah
            Sakit dengan BPJS, Akuntansi BLU, Chatbot AI, hingga aplikasi mobile
            Android & iOS. Transformasi digital tidak selalu membutuhkan biaya
            besar—namun membutuhkan pendekatan strategis yang selaras dengan
            tujuan bisnis Anda.
          </p>
          <a
            href="https://wa.me/6281316293387?text=Halo, Saya Ingin mengetahui Service/layanan SolusiApps"
            className="inline-block bg-sky-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
          >
            Konsultasi Sekarang
          </a>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/images/jasa-pembuatan-aplikasi-website.jpg"
            alt="jasa pembuatan aplikasi website.jpg"
            className="rounded-xl shadow-lg w-full max-w-md"
            width={600}
            height={400}
          />
        </div>
      </div>
    </section>
  );
}
