"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const headlineLines = [
  ["Réservez", "les", "meilleurs"],
  ["experts", "beauté", "afro."],
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-20 pt-36 lg:px-10"
    >
      {/* Ambient bronze wash — extremely subtle, top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full opacity-[0.07] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #A87E3C 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-shell">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-8 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-bronze" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-bronze-deep">
            La beauté afro, sur rendez-vous
          </span>
        </motion.div>

        {/* Headline — word-by-word reveal */}
        <h1 className="max-w-4xl font-display text-5xl font-medium leading-[1.02] tracking-tightest text-ink sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
          {headlineLines.map((line, li) => (
            <span key={li} className="block overflow-hidden">
              <span className="flex flex-wrap gap-x-[0.28em]">
                {line.map((word, wi) => {
                  const delay = 0.15 + (li * line.length + wi) * 0.07;
                  const isAccent = word === "afro.";
                  return (
                    <motion.span
                      key={wi}
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease, delay }}
                      className={`inline-block ${
                        isAccent ? "italic text-bronze" : ""
                      }`}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </span>
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.7 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-ink/60"
        >
          Tresses, locks, perruques, barber, maquillage et onglerie près de chez
          vous. Des artisans vérifiés, une réservation en quelques secondes.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.85 }}
          className="mt-10 max-w-2xl"
        >
          <div className="group flex flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-[0_1px_2px_rgba(11,11,12,0.04),0_12px_40px_-12px_rgba(11,11,12,0.12)] transition-shadow duration-500 hover:shadow-[0_1px_2px_rgba(11,11,12,0.04),0_20px_60px_-12px_rgba(168,126,60,0.25)] sm:flex-row sm:items-center sm:gap-0">
            <div className="flex flex-1 items-center gap-3 px-4 py-3">
              <SearchIcon />
              <input
                type="text"
                placeholder="Quelle prestation ?"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink/40 focus:outline-none"
              />
            </div>
            <div className="hidden h-8 w-px bg-line sm:block" />
            <div className="flex flex-1 items-center gap-3 px-4 py-3">
              <PinIcon />
              <input
                type="text"
                placeholder="Où ? (ville)"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink/40 focus:outline-none"
              />
            </div>
            <button className="m-1 rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white transition-transform duration-300 hover:scale-[1.02]">
              Rechercher
            </button>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 1 }}
          className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3"
        >
          <a
            href="#vedettes"
            className="text-sm font-medium text-ink underline decoration-bronze decoration-2 underline-offset-[6px] transition-colors hover:text-bronze-deep"
          >
            Trouver un professionnel
          </a>
          <a
            href="#offre"
            className="text-sm font-medium text-ink/50 transition-colors hover:text-ink"
          >
            Devenir professionnel →
          </a>
        </motion.div>

        {/* Quiet trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease, delay: 1.2 }}
          className="mt-20 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-ink/45"
        >
          <Stat value="5 000+" label="artisans vérifiés" />
          <span className="hidden h-4 w-px bg-line sm:block" />
          <Stat value="12" label="pays couverts" />
          <span className="hidden h-4 w-px bg-line sm:block" />
          <Stat value="4,9/5" label="note moyenne" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-lg font-medium text-ink">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-bronze"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-bronze"
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
