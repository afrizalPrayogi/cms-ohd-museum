export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="bg-white py-20 border-t border-purple-600"
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-purple-600 font-extrabold text-center mb-16 tracking-wide text-slate-900">
          Portofolio Kami
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          <article className="bg-slate-50  rounded-xl shadow-md text-center">
            <img
              alt="Tampilan aplikasi chatbot klien 5 dengan antarmuka percakapan modern berwarna biru dan putih"
              className="w-full object-cover h-48"
              height="400"
              loading="lazy"
              src="/images/bhimasena-portofolio.png"
              width="600"
            />
            <div className="w-full p-4">
              <h3 className="text-2xl font-bold text-sky-600 mb-2 rounded-xl">
                Website Bhimasenapower
              </h3>
              <p className="text-slate-600 text-sm">
                Situs web perusahaan energi Bhimasena Power yang menampilkan
                profil korporat, proyek strategis, serta informasi publik dalam
                desain modern, responsif, dan mudah diakses.
              </p>
            </div>
          </article>
          <article className="bg-slate-50  rounded-xl shadow-md text-center">
            <img
              alt="Tampilan aplikasi chatbot klien 5 dengan antarmuka percakapan modern berwarna biru dan putih"
              className="w-full object-cover h-48 rounded-xl"
              height="400"
              loading="lazy"
              src="/images/RTLH.png"
              width="600"
            />
            <div className="w-full p-4">
              <h3 className="text-2xl font-bold text-sky-600 mb-2">
                RTLH WEB APPS
              </h3>
              <p className="text-slate-600 text-sm">
                Portal resmi pendataan Rumah Tidak Layak Huni (RTLH) milik
                Kementerian PUPR yang memuat informasi program, peta interaktif,
                dan rekap data nasional dalam tampilan yang informatif dan
                responsif.
              </p>
            </div>
          </article>
          <article className="bg-slate-50  rounded-xl shadow-md text-center">
            <img
              alt="Tampilan aplikasi chatbot klien 5 dengan antarmuka percakapan modern berwarna biru dan putih"
              className="w-full object-cover h-48 rounded-xl"
              height="400"
              loading="lazy"
              src="/images/krs.png"
              width="600"
            />
            <div className="w-full p-4">
              <h3 className="text-2xl font-bold text-sky-600 mb-2">
                KRS WEB APPS
              </h3>
              <p className="text-slate-600 text-sm">
                Sistem informasi Keterpaduan Rencana dan Sinkronisasi (KRS)
                Direktorat Jenderal Perumahan Kementerian PUPR yang mendukung
                perencanaan dan pemantauan program perumahan secara nasional
                melalui tampilan web interaktif dan berbasis data spasial.
              </p>
            </div>
          </article>
          <article className="bg-slate-50  rounded-xl shadow-md text-center">
            <img
              alt="Tampilan aplikasi chatbot klien 5 dengan antarmuka percakapan modern berwarna biru dan putih"
              className="w-full object-cover h-48 rounded-xl"
              height="400"
              loading="lazy"
              src="/images/pos.png"
              width="600"
            />
            <div className="w-full p-4">
              <h3 className="text-2xl font-bold text-sky-600 mb-2">
                POS UMK Local
              </h3>
              <p className="text-slate-600 text-sm">
                Sistem Point of Sale (POS) yang dikembangkan khusus untuk pelaku
                UMKM, dirancang untuk mempermudah proses transaksi, pencatatan
                penjualan, dan manajemen stok secara real-time. Aplikasi ini
                telah digunakan oleh berbagai usaha lokal seperti kedai kopi,
                toko kelontong, dan butik, membantu mereka beroperasi lebih
                efisien dan profesional di era digital.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
