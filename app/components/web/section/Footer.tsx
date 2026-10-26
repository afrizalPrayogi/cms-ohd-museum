import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { FaChevronUp } from "react-icons/fa";
import { FiArrowUpRight, FiClock, FiGrid, FiLogIn, FiMapPin, FiPhone } from "react-icons/fi";

type NavigationItem = {
  id?: string;
  title?: string;
  type?: string;
  url?: string;
  children?: NavigationItem[];
};

interface FooterProps {
  isAfterBannerPage?: boolean;
  dataApi?: any;
}

function FooterColumn({
  title,
  items,
  icon,
}: {
  title: string;
  items: Array<{ name: string; url: string }>;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
          {icon}
        </div>
        <div className="text-lg font-bold">{title}</div>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <a
            key={`${item.name}-${index}`}
            href={item.url || "#"}
            className="group inline-flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/10 hover:bg-white/10 hover:text-white"
          >
            <span>{item.name}</span>
            <FiArrowUpRight className="opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </div>
  );
}

const Footer = (props: FooterProps) => {
  const [showStt, setShowStt] = useState(false);

  const navigation = Array.isArray(props.dataApi?.navigation) ? props.dataApi.navigation : [];
  const footerNavigation = navigation.find((item: NavigationItem) => item.type === "Web-Footer-Navigation");
  const quickAccess = navigation.find((item: NavigationItem) => item.type === "Web-Footer-Office-Info");
  const moduleLinks = navigation.find((item: NavigationItem) => item.type === "Web-Footer-Social-Media");
  const footerBottom = navigation.filter((item: NavigationItem) => item.type === "Web-Footer-Bottom");

  const footerIntro = useMemo(
    () => ({
      title: "WePortal",
      description:
        props.dataApi?.langCode === "EN"
          ? "A single portal to manage website content, project monitoring, WhatsApp AI knowledge, finance reminders, and daily team operations."
          : "Satu portal untuk mengelola content website, monitoring project, knowledge WhatsApp AI, finance reminder, dan aktivitas operasional tim sehari-hari.",
      stats:
        props.dataApi?.langCode === "EN"
          ? [
              { label: "Main Modules", value: "6+" },
              { label: "Operational Access", value: "24/7" },
            ]
          : [
              { label: "Modul Utama", value: "6+" },
              { label: "Akses Operasional", value: "24/7" },
            ],
    }),
    [props.dataApi?.langCode]
  );

  const officeDetails = useMemo(
    () => [
      {
        icon: <FiPhone size={16} />,
        label: props.dataApi?.langCode === "EN" ? "Phone" : "Telepon",
        value: props.dataApi?.page?.wording?.phonenumber || "+62 - 812 8200 0189",
      },
      {
        icon: <FiMapPin size={16} />,
        label: props.dataApi?.langCode === "EN" ? "Focus" : "Fokus",
        value:
          props.dataApi?.langCode === "EN"
            ? "Website, Redmine, AI, and finance operations"
            : "Website, Redmine, AI, dan operasional finance",
      },
      {
        icon: <FiClock size={16} />,
        label: props.dataApi?.langCode === "EN" ? "Use Case" : "Use Case",
        value:
          props.dataApi?.langCode === "EN"
            ? "Built for faster follow-up and clearer visibility"
            : "Dibuat untuk follow-up lebih cepat dan visibilitas lebih jelas",
      },
    ],
    [props.dataApi?.langCode, props.dataApi?.page?.wording?.phonenumber]
  );

  const bottomLinks = footerBottom.map((item: NavigationItem) => ({
    name: item.title || "",
    url: item.url || "#",
  }));

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      setShowStt(window.scrollY > 200);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <Fragment>
      <div>
        <div
          className={`bg-[radial-gradient(circle_at_top_left,#1d4ed8_0%,#0f172a_38%,#020617_100%)] ${
            props.isAfterBannerPage === true ? "pt-[20px]" : ""
          }`}
        >
          <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-16 lg:py-16">
            <div className="mb-8 grid gap-5 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
              <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-7 text-white backdrop-blur-sm lg:pr-10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-black">
                    WP
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-tight">{footerIntro.title}</div>
                    <div className="text-sm text-white/60">
                      {props.dataApi?.langCode === "EN"
                        ? "Integrated business operations portal"
                        : "Portal operasional bisnis terintegrasi"}
                    </div>
                  </div>
                </div>

                <div className="max-w-xl text-sm leading-7 text-slate-200">{footerIntro.description}</div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {footerIntro.stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <div className="text-2xl font-black text-white">{item.value}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/cms/login"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
                  >
                    {props.dataApi?.langCode === "EN" ? "Access WePortal" : "Masuk WePortal"}
                    <FiLogIn size={16} />
                  </a>
                  <a
                    href="/#fitur-utama"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {props.dataApi?.langCode === "EN" ? "View Modules" : "Lihat Modul"}
                  </a>
                </div>
              </div>

              <FooterColumn
                title={moduleLinks?.title || (props.dataApi?.langCode === "EN" ? "Core Modules" : "Modul Utama")}
                items={(moduleLinks?.children || []).map((item: NavigationItem) => ({
                  name: item.title || "",
                  url: item.url || "#",
                }))}
                icon={<FiGrid size={18} />}
              />

              <FooterColumn
                title={quickAccess?.title || (props.dataApi?.langCode === "EN" ? "Quick Access" : "Akses Cepat")}
                items={(quickAccess?.children || []).map((item: NavigationItem) => ({
                  name: item.title || "",
                  url: item.url || "#",
                }))}
                icon={<FiLogIn size={18} />}
              />

              <FooterColumn
                title={
                  footerNavigation?.title || (props.dataApi?.langCode === "EN" ? "Navigation" : "Navigasi")
                }
                items={(footerNavigation?.children || []).map((item: NavigationItem) => ({
                  name: item.title || "",
                  url: item.url || "#",
                }))}
                icon={<FiArrowUpRight size={18} />}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_auto]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-white backdrop-blur-sm">
                <div className="mb-4 text-lg font-bold">
                  {props.dataApi?.langCode === "EN" ? "Operational Snapshot" : "Ringkasan Operasional"}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {officeDetails.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                        {item.icon}
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/45">{item.label}</div>
                      <div className="mt-2 text-sm leading-6 text-slate-200">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {bottomLinks.length ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-white backdrop-blur-sm">
                  <div className="mb-4 text-lg font-bold">
                    {props.dataApi?.langCode === "EN" ? "Additional Links" : "Link Tambahan"}
                  </div>
                  <div className="flex flex-col gap-3">
                    {bottomLinks.map((item, index) => (
                      <a
                        key={`${item.name}-${index}`}
                        href={item.url}
                        className="rounded-2xl border border-transparent bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/10 hover:bg-white/10 hover:text-white"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 bg-[#020617] px-4 py-4 text-center text-sm text-slate-400 lg:px-16">
          {new Date().getFullYear()} • WePortal.{" "}
          {props.dataApi?.langCode === "EN"
            ? "A portal for content, monitoring, AI, and reminders."
            : "Portal untuk content, monitoring, AI, dan reminder."}
        </div>
      </div>
      {showStt ? (
        <div
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 cursor-pointer select-none rounded-full bg-white p-3 text-slate-900 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.8)] transition hover:scale-110"
        >
          <FaChevronUp />
        </div>
      ) : null}
    </Fragment>
  );
};

export default Footer;
