import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { HomeIcon, Terminal, ShieldCheck } from "lucide-react";
import SideRays from "../components/Effects/SideRays.jsx";
import { BorderGlowCard } from "../components/Effects/BorderGlowCard";

const Secret = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A] select-none">
      {/* Fondo de rayos idéntico a HomePage */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SideRays
          speed={2.5}
          rayColor1="#E23F31"
          rayColor2="#F4889A"
          intensity={2.5}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.4}
          blend={0.7}
          falloff={0.5}
          opacity={0.8}
        />
      </div>

      {/* Estructura central compensando los 48px (h-12) de la Navbar */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        
        {/* Contenido centrado vertical y horizontalmente */}
        <div className="my-auto flex flex-1 flex-col items-center justify-center w-full py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-full max-w-3xl"
          >
            <BorderGlowCard
              glowColor="#E23F31"
              className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl shadow-2xl p-2 sm:p-3"
            >
              <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black/80 border border-white/[0.05]">
                <iframe
                  className="h-full w-full object-cover"
                  src="https://www.youtube.com/embed/G_XeW7P-1hs"
                  title="jarvis pedilo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </BorderGlowCard>

            <div className="mt-6 flex flex-col items-center justify-center gap-3">
              <Link
                to="/"
                className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-mono tracking-wider text-white/60 backdrop-blur-md transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <HomeIcon size={16} className="transition-transform duration-500 ease-out" />
              </Link>
            </div>
          </motion.div>
        </div>

        <footer className="w-full pt-4 border-t border-white/[0.04] text-[#555555] text-xs font-mono text-center">
          <p>PLGNM • {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
};

export default Secret;