"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const columns = [
  {
    title: "Prestations",
    links: ["Tresses", "Locks", "Perruques", "Barber", "Maquillage", "Onglerie"],
  },
  {
    title: "Plateforme",
    links: ["Trouver un pro", "Devenir pro", "Tarifs", "Villes"],
  },
  {
    title: "Entreprise",
    links: ["À propos", "Journal", "Carrières", "Presse"],
  },
  {
    title: "Légal",
    links: ["Confidentialité", "Conditions", "Cookies"],
  },
];

export default function Footer() {
  return (
    <footer className="px-6 pb-10 pt-24 lg:px-10">
      <div className="mx-auto max-w-shell">
        {/* Big wordmark + newsletter */}
        <div className="grid grid-cols-1 gap-14 border-b border-line pb-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="max-w-xl font-display text-4xl font-medium leading-tight tracking-tightest text-ink lg:text-5xl"
            >
              La beauté afro mérite mieux qu&apos;un carnet de rendez-vous.
            </motion.h2>
          </div>

          <div className="flex flex-col justify-end">
            <label className="mb-3 text-sm text-ink/55">
              Recevez les nouveautés et les artisans en avant-première.
            </label>
            <div className="flex items-center gap-2 border-b border-ink pb-2">
              <input
                type="email"
                placeholder="vous@email.com"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
              />
              <button className="shrink-0 text-sm font-medium text-bronze-deep transition-colors hover:text-ink">
                S&apos;abonner →
              </button>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-4 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="#top" className="flex items-baseline gap-[2px]">
              <span className="font-display text-2xl font-medium tracking-tightest text-ink">
                Match
              </span>
              <span className="font-display text-2xl font-medium tracking-tightest text-bronze">
                Afro
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/50">
              Le rendez-vous beauté afro, pensé pour les artisans et leurs
              clientes.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink/40">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-ink/65 transition-colors hover:text-bronze-deep"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-sm text-ink/45">
            © {new Date().getFullYear()} MatchAfro. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5">
            {["Instagram", "TikTok", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm text-ink/55 transition-colors hover:text-ink"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
