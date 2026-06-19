"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const TOTAL = 50;
const CLAIMED = 35; // 35 already taken → 15 remaining

export default function LaunchOffer() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-120px" });

  const remaining = TOTAL - CLAIMED;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => unsub();
  }, [rounded]);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, remaining, {
        duration: 1.6,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      });
      return controls.stop;
    }
  }, [inView, count, remaining]);

  const pct = (CLAIMED / TOTAL) * 100;

  return (
    <section id="offre" ref={sectionRef} className="px-6 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-shell">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-16 lg:px-20 lg:py-24"
        >
          {/* Ambient bronze glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #A87E3C 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #C9A35F 0%, transparent 70%)",
            }}
          />

          <div className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            {/* Left — message */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-bronze-light opacity-75" />
                  <span className="h-2 w-2 rounded-full bg-bronze-light" />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-bronze-light">
                  Offre de lancement
                </span>
              </div>

              <h2 className="font-display text-4xl font-medium leading-[1.08] tracking-tightest text-white lg:text-[3.25rem]">
                Les 50 premiers professionnels obtiennent un compte{" "}
                <span className="italic text-bronze-light">
                  Premium gratuit à vie.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/55">
                Profil mis en avant, réservations illimitées, statistiques
                avancées. Aucun frais, jamais — pour celles et ceux qui bâtissent
                MatchAfro avec nous.
              </p>

              <a
                href="#"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
              >
                Réclamer ma place
                <span>→</span>
              </a>
            </div>

            {/* Right — the counter, treated as a precious object */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] px-10 py-12 backdrop-blur-sm">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                  Places restantes
                </span>

                <div className="my-3 flex items-baseline">
                  <motion.span className="font-display text-[7rem] font-medium leading-none text-white lg:text-[9rem]">
                    {display}
                  </motion.span>
                  <span className="ml-2 font-display text-3xl font-medium text-bronze-light">
                    /{TOTAL}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #8A6526, #C9A35F)",
                    }}
                  />
                </div>
                <span className="mt-3 text-xs text-white/40">
                  {CLAIMED} professionnels ont déjà rejoint
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
