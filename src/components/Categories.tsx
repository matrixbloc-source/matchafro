"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const categories = [
  {
    name: "Tresses",
    note: "Box braids, fulani, cornrows",
    img: "https://images.unsplash.com/photo-1626954079979-ec4f7b05e032?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Locks",
    note: "Démarrage, entretien, retwist",
    img: "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Perruques",
    note: "Pose, customisation, lace",
    img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Barber",
    note: "Coupe, dégradé, contours",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Maquillage",
    note: "Jour, soirée, événement",
    img: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Onglerie",
    note: "Pose, nail art, soin",
    img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Categories() {
  return (
    <section id="categories" className="px-6 py-28 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-shell">
        {/* Section header */}
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-bronze" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-bronze-deep">
                Prestations
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="max-w-xl font-display text-4xl font-medium leading-tight tracking-tightest text-ink lg:text-5xl"
            >
              Un savoir-faire pour chaque style.
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="max-w-xs text-[15px] leading-relaxed text-ink/55"
          >
            Six familles de prestations, des centaines d&apos;artisans
            spécialisés. Trouvez la main experte qu&apos;il vous faut.
          </motion.p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: (i % 3) * 0.08 }}
              className="group relative block overflow-hidden rounded-3xl bg-mist"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-[1.1s] ease-smooth group-hover:scale-[1.06]"
                />
                {/* gradient veil */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

                {/* label */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <h3 className="font-display text-2xl font-medium text-white">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">{cat.note}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-500 group-hover:border-white group-hover:bg-white">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-white transition-colors duration-500 group-hover:text-ink"
                    >
                      <path
                        d="M7 17 17 7M9 7h8v8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
