"use client";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;

    const subject = encodeURIComponent(`Pesan dari ${name}`);
    const body = encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`
    );
    window.location.href = `mailto:widy.prawira@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="bg-white py-20 border-t border-purple-600">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl text-purple-600 font-extrabold mb-10 text-center tracking-wide text-slate-900">
          Hubungi Kami
        </h2>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <input
            name="name"
            className="w-full p-4 rounded border"
            placeholder="Nama Lengkap"
            required
          />
          <input
            type="email"
            name="email"
            className="w-full p-4 rounded border"
            placeholder="Email"
            required
          />
          <textarea
            name="message"
            className="w-full p-4 rounded border"
            rows={5}
            placeholder="Pesan"
            required
          />
          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-3 rounded font-bold"
          >
            Kirim Pesan
          </button>
        </form>
      </div>
    </section>
  );
}
