import React from "react";
import SideRays from "../Effects/SideRays";

export const PageShell = ({
  children,
  background = true,
  backdrop = null,
  baseClass = "bg-[#0A0A0A]",
  scroll = true,
  maxWidth = "max-w-7xl",
  contentClassName = "",
}) => {
  return (
    <div className={`relative h-[100dvh] w-full overflow-hidden ${baseClass} text-white`}>
      {backdrop && (
        <div className="absolute inset-0 z-0 pointer-events-none">{backdrop}</div>
      )}
      {!backdrop && background && (
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
      )}

      <main
        className={`relative z-10 mx-auto flex h-full min-h-0 w-full ${maxWidth} flex-col px-4 sm:px-6 lg:px-8 pt-12 pb-3 sm:pb-6`}
      >
        <div
          className={`flex min-h-0 flex-1 flex-col ${
            scroll ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"
          } ${contentClassName}`}
        >
          {children}
        </div>

      </main>
    </div>
  );
};

export const ui = {
  panel:
    "rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl shadow-2xl",
  btnPrimary:
    "rounded-xl bg-[#E23F31] text-white font-mono font-semibold tracking-wide transition-all duration-300 hover:bg-[#ff4e3e] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
  btnGhost:
    "rounded-xl border border-white/10 bg-white/[0.04] text-white/80 font-mono tracking-wide transition-all duration-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none cursor-pointer",
  btnDanger:
    "rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 font-mono font-semibold tracking-wide transition-all duration-300 hover:bg-rose-500/20 hover:text-rose-200 active:scale-[0.98] cursor-pointer",
  optionIdle:
    "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/25 hover:bg-white/[0.07]",
  optionSelected:
    "border-[#E23F31]/60 bg-[#E23F31]/15 text-white shadow-[0_0_18px_rgba(226,63,49,0.15)]",
  optionCorrect: "border-emerald-500/50 bg-emerald-950/30 text-emerald-300",
  optionWrong: "border-rose-500/60 bg-rose-950/30 text-rose-300",
  label: "font-mono text-[10px] uppercase tracking-widest text-white/40",
  input:
    "rounded-xl border border-white/10 bg-white/[0.04] text-white outline-none transition-all focus:border-[#E23F31] focus:bg-white/[0.07] focus:shadow-[0_0_15px_rgba(226,63,49,0.2)]",
};

export default PageShell;