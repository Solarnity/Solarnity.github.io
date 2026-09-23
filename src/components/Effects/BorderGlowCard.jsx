import React, { useRef, useCallback } from "react";

export const BorderGlowCard = ({
  children,
  className = "",
  glowColor = "#E23F31",
  onClick,
}) => {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);

    card.style.setProperty("--glow-angle", `${angle + 90}deg`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current;

    if (!card) return;

    card.classList.add("is-hovered");
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;

    if (!card) return;

    card.classList.remove("is-hovered");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`border-glow-card group relative isolate rounded-[28px] p-[1px] ${className}`}
      style={{"--mouse-x": "50%", "--mouse-y": "50%", "--glow-angle": "0deg", "--glow-color": glowColor}}
    >
      <div 
        className="pointer-events-none absolute inset-0 z-0 rounded-[28px] border border-white/[0.085] transition-colors
          duration-500 ease-out group-[.is-hovered]:border-white/[0.13]"
      />

      <div
        className=" pointer-events-none absolute inset-0 z-[1] rounded-[28px] opacity-0 transition-opacity duration-300
          ease-out group-[.is-hovered]:opacity-100"
        style={{
          background: `conic-gradient(from var(--glow-angle), transparent 0deg, transparent 55deg,
            color-mix(in srgb, var(--glow-color) 100%, transparent) 72deg,
            color-mix(in srgb, var(--glow-color) 68%, transparent) 92deg,
            transparent 120deg, transparent 240deg,
            color-mix(in srgb, var(--glow-color) 78%, transparent) 280deg,
            transparent 320deg, transparent 360deg)
          `,
          WebkitMask: `
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0)
          `,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />

      <div
        className="pointer-events-none absolute -inset-[2px] z-0 rounded-[30px] opacity-0 blur-[8px]
          transition-opacity duration-500 ease-out *:group-[.is-hovered]:opacity-100"
        style={{
          background: `conic-gradient(from var(--glow-angle), transparent 0deg,
            color-mix(in srgb, var(--glow-color) 8%, transparent) 70deg,
            transparent 120deg, transparent 250deg,
            color-mix(in srgb, var(--glow-color) 5%, transparent) 300deg,
            transparent 360deg)
          `,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[2] rounded-[28px] opacity-0
          transition-opacity duration-500 ease-out group-[.is-hovered]:opacity-100"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y),
            color-mix(in srgb, var(--glow-color) 7%, transparent) 0%,
            color-mix(in srgb, var(--glow-color) 3%, transparent) 32%, transparent 72%)
          `,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[3] rounded-[28px] opacity-0
          transition-opacity duration-500 ease-out group-[.is-hovered]:opacity-100"
        style={{
          background: `radial-gradient(180px circle at var(--mouse-x) var(--mouse-y),
            rgba(255,255,255,0.045), transparent 70%)
          `,
        }}
      />

      <div
        className="relative z-[4] flex h-full w-full flex-col justify-between overflow-hidden
          rounded-[27px] border border-white/[0.035] bg-[#151515]/[0.62] backdrop-blur-xl
          shadow-[0_12px_40px_rgba(0,0,0,0.14)] transition-[background-color,box-shadow] duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)] group-[.is-hovered]:bg-[#171717]/[0.60] group-[.is-hovered]:shadow-[0_14px_45px_rgba(0,0,0,0.17)]
        "
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[110px] rounded-t-[27px]
            bg-gradient-to-b from-white/[0.065] via-white/[0.018] to-transparent opacity-80
            transition-opacity duration-500 group-[.is-hovered]:opacity-100"
        />

        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px
            bg-gradient-to-r from-transparent via-white/[0.13] to-transparent opacity-70"
        />

        <div
          className="pointer-events-none absolute -inset-[30px] rounded-[40px] opacity-0
            transition-opacity duration-500 group-[.is-hovered]:opacity-100"
          style={{
            background: `radial-gradient(160px circle at var(--mouse-x) var(--mouse-y),
              rgba(255,255,255,0.025), transparent 70%)
            `,
          }}
        />

        {children}
      </div>
    </div>
  );
};

export default BorderGlowCard;