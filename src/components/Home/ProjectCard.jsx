import { BorderGlowCard } from "../Effects/BorderGlowCard";
import { ArrowRight } from "lucide-react";

export const ProjectCard = ({ app, isCurrent }) => {
  return (
    <BorderGlowCard
      glowColor={isCurrent ? "#E23F31" : "rgba(255,255,255,0.12)"}
      className="h-[360px] w-full select-none [backface-visibility:hidden]"
    >
      <div className="relative z-10 flex h-full flex-col justify-between p-7">
        <div>
          <div className="mb-5 flex items-center justify-between">
            {app.icon && (
              <div
                className={`flex items-center justify-center rounded-2xl border p-3 backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isCurrent
                    ? "border-[#E23F31]/25 bg-[#E23F31]/[0.08] text-[#E23F31] shadow-[0_0_18px_rgba(226,63,49,0.08)]"
                    : "border-white/[0.07] bg-white/[0.035] text-white/85"
                } group-hover:border-white/[0.12] group-hover:bg-white/[0.055]`}
              >
                {app.icon}
              </div>
            )}

            {/* Solo se muestra si app.tag tiene valor */}
            {Boolean(app.tag) && (
              <span className="rounded-full border border-white/[0.055] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white/40 backdrop-blur-md transition-all duration-700 group-hover:border-white/[0.09] group-hover:bg-white/[0.045] group-hover:text-white/55">
                {app.tag}
              </span>
            )}
          </div>

          {app.title && (
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-white transition-all duration-700 ease-out">
              {app.title}
            </h3>
          )}

          {app.description && (
            <p className="line-clamp-4 text-sm leading-relaxed text-white/45 transition-colors duration-700 ease-out group-hover:text-white/60">
              {app.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-white/[0.06] pt-4 transition-colors duration-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/35 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-white/[0.13] group-hover:bg-white/[0.07] group-hover:text-white/80">
            <ArrowRight size={16} className="transition-transform duration-500 ease-out" />
          </div>
        </div>
      </div>
    </BorderGlowCard>
  );
};