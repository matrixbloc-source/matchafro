"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-5 lg:px-10">
        <a href="#top" className="flex items-baseline gap-[2px]">
          <span className="font-display text-2xl font-medium tracking-tightest text-ink">
            Match
          </span>
          <span className="font-display text-2xl font-medium tracking-tightest text-bronze">
            Afro
          </span>
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {[
            ["Catégories", "#categories"],
            ["Professionnels", "#vedettes"],
            ["Comment ça marche", "#etapes"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="group relative text-sm text-ink/70 transition-colors hover:text-ink"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-sm text-ink/70 transition-colors hover:text-ink sm:block"
          >
            Connexion
          </a>
          <a
            href="#offre"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-transform duration-300 hover:scale-[1.03]"
          >
            Devenir professionnel
          </a>
        </div>
      </div>
    </motion.header>
  );
}
