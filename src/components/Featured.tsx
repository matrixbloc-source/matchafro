"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const pros = [
  {
    name: "Aïssata Diallo",
    craft: "Tresses & Knotless",
    city: "Paris 18e",
    rating: "4,98",
    reviews: 214,
    from: "45",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Maison Kévin",
    craft: "Barber afro",
    city: "Bruxelles",
    rating: "4,95",
    reviews: 168,
    from: "28",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Studio Naïla",
    craft: "Perruques & Lace",
    city: "Lyon",
    rating: "4,97",
    reviews: 302,
    from: "60",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Fatou Beauty",
    craft: "Maquillage pro",
    city: "Marseille",
    rating: "5,0",
    reviews: 96,
    from: "50",
    img: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?q=80&w=800&auto=format&fit=crop",
  },
];

export default function Featured() {
  return (
    <section id="vedettes" className="bg-cream px-6 py-28 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-shell">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-bronze" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-bronze-deep">
                Vedettes
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="max-w-xl font-display text-4xl font-medium leading-tight tracking-tightest text-ink lg:text-5xl"
            >
              Les artisans les plus demandés.
            </motion.h2>
          </div>
          <a
            href="#"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-bronze-deep"
          >
            Voir tous les professionnels
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pros.map((pro, i) => (
            <motion.a
              key={pro.name}
              href="#"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: (i % 4) * 0.07 }}
              className="group block overflow-hidden rounded-3xl border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(11,11,12,0.18)]"
            >
              <div className="relative aspect-[5/6] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pro.img}
                  alt={pro.name}
                  className="h-full w-full object-cover transition-transform duration-[1.1s] ease-smooth group-hover:scale-[1.05]"
                />
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 backdrop-blur-sm">
                  <StarIcon />
                  <span className="text-xs font-semibold text-ink">
                    {pro.rating}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-medium text-ink">
                  {pro.name}
                </h3>
                <p className="mt-0.5 text-sm text-bronze-deep">{pro.craft}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="flex items-center gap-1.5 text-sm text-ink/55">
                    <PinIcon />
                    {pro.city}
                  </span>
                  <span className="text-sm text-ink/55">
                    dès{" "}
                    <span className="font-display text-base font-medium text-ink">
                      {pro.from}€
                    </span>
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

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#A87E3C">
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 21.4l1.5-6.8L2.2 9.9l6.9-.7L12 2z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="text-bronze"
    >
      <path
        d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
