"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    n: "01",
    title: "Rechercher",
    body: "Filtrez par prestation, ville et budget. Comparez les portfolios, les notes et les disponibilités réelles.",
  },
  {
    n: "02",
    title: "Réserver",
    body: "Choisissez votre créneau et confirmez en quelques secondes. Paiement sécurisé, confirmation immédiate.",
  },
  {
    n: "03",
    title: "Profiter",
    body: "Présentez-vous, détendez-vous, repartez sublimée. Laissez un avis pour la prochaine cliente.",
  },
];

export default function HowItWorks() {
  return (
    <section id="etapes" className="px-6 py-28 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-shell">
        <div className="mb-16 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-bronze" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-bronze-deep">
              Comment ça marche
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="font-display text-4xl font-medium leading-tight tracking-tightest text-ink lg:text-5xl"
          >
            Trois étapes, zéro friction.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: i * 0.12 }}
              className="group relative bg-white p-9 transition-colors duration-500 hover:bg-cream lg:p-11"
            >
              <div className="mb-8 flex items-baseline gap-4">
                <span className="font-display text-5xl font-medium text-bronze/30 transition-colors duration-500 group-hover:text-bronze">
                  {step.n}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <h3 className="font-display text-2xl font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/55">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
