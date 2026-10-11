import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { DATA } from "../data/terminalData";
import { VigenereCipher } from "../utils/vigenereCipher";

const BOOT_LINES = [
  "SILENCIA BIOS v2.6  (C) 1986-2026",
  "CPU: 8088 @ 4.77MHZ ................. OK",
  "MEMORY TEST: 640K ................... OK",
  "KEYBOARD ............................ OK",
  "MOUNTING /INFERNO ................... OK",
  `DEPTH SENSORS: ${DATA.length} LEVELS DETECTED`,
  "WARNING: DEEPER LEVELS MAY CONTAIN UNSTABLE DATA",
  "",
  "READY.",
];

let hasBooted = false;

const NAV_SOUND = "/sounds/navClick.mp3";
const playNavClick = () => {
  try {
    const audio = new Audio(NAV_SOUND);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    /* noop */
  }
};

const MarqueeText = ({ children, active }) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [shift, setShift] = useState(0);

  const measure = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    setShift(Math.max(0, inner.scrollWidth - outer.clientWidth));
  }, []);

  useLayoutEffect(measure, [children, measure]);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [measure]);

  const overflowing = shift > 0;
  const scrolling = active && overflowing;

  return (
    <span
      ref={outerRef}
      className="block min-w-0 flex-1 overflow-hidden whitespace-nowrap"
      style={
        overflowing && !active
          ? { maskImage: "linear-gradient(to right, #000 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, #000 85%, transparent)" }
          : undefined
      }
    >
      <span
        ref={innerRef}
        className="inline-block will-change-transform"
        style={{
          transform: scrolling ? `translateX(-${shift}px)` : "translateX(0)",
          transition: `transform ${scrolling ? Math.max(0.6, shift / 70) : 0.25}s linear`,
        }}
      >
        {children}
      </span>
    </span>
  );
};

const EntryRow = ({ item, label }) => {
  const [active, setActive] = useState(false);
  const interactive = {
    onMouseEnter: () => setActive(true),
    onMouseLeave: () => setActive(false),
    onFocus: () => setActive(true),
    onBlur: () => setActive(false),
  };

  const content = (
    <>
      <span className="shrink-0 text-sm opacity-50 sm:text-base">{item.added}</span>
      <MarqueeText active={active}>{label}</MarqueeText>
      {item.link && <span className="shrink-0 text-sm opacity-35 transition-opacity group-hover:opacity-90">↗</span>}
    </>
  );

  return item.link ? (
    <button
      type="button"
      onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
      className="group flex w-full cursor-pointer items-baseline gap-3 px-1 text-left transition-colors hover:bg-[#3dff72]/10 focus:bg-[#3dff72]/10 focus:outline-none"
      {...interactive}
    >
      {content}
    </button>
  ) : (
    <div
      tabIndex={0}
      className="group flex w-full items-baseline gap-3 px-1 transition-colors hover:bg-[#3dff72]/10 focus:bg-[#3dff72]/10 focus:outline-none"
      {...interactive}
    >
      {content}
    </div>
  );
};

const KEY_MAX = 20;
const MAX_ITEMS = Math.max(...DATA.map((l) => l.items.length), 1);

const depthLabel = (idx) => (idx === 0 ? "ALT +012m" : `ALT -${String(idx * 120).padStart(3, "0")}m`);
const levelName = (idx) => `${String(idx + 1).padStart(3, "0")}`;
const bar = (count) => {
  const filled = Math.max(1, Math.round((count / MAX_ITEMS) * 10));
  return "█".repeat(filled) + "░".repeat(10 - filled);
};

const Terminal = () => {
  const [secretKey, setSecretKey] = useState("...");
  const [selIndex, setSelIndex] = useState(null);
  const [bootCount, setBootCount] = useState(hasBooted ? BOOT_LINES.length : 0);
  const [shown, setShown] = useState(0);
  const [burst, setBurst] = useState(false);
  const burstTimerRef = useRef(null);
  const inputRef = useRef(null);

  const selLevel = selIndex !== null ? DATA[selIndex] : null;
  const booted = bootCount >= BOOT_LINES.length;

  useEffect(() => {
    if (booted) {
      hasBooted = true;
      return;
    }
    const t = setInterval(() => setBootCount((c) => Math.min(c + 1, BOOT_LINES.length)), 170);
    return () => clearInterval(t);
  }, [booted]);

  const skipBoot = useCallback(() => setBootCount(BOOT_LINES.length), []);

  useEffect(() => {
    if (booted) return;
    window.addEventListener("keydown", skipBoot);
    return () => window.removeEventListener("keydown", skipBoot);
  }, [booted, skipBoot]);

  const triggerBurst = useCallback(() => {
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    setBurst(true);
    burstTimerRef.current = setTimeout(() => setBurst(false), 90);
  }, []);

  useEffect(() => () => burstTimerRef.current && clearTimeout(burstTimerRef.current), []);

  const selectLevel = useCallback(
    (index) => {
      if (index === selIndex) return;
      playNavClick();
      setSelIndex(index);
      setShown(0);
      triggerBurst();
    },
    [triggerBurst, selIndex]
  );

  useEffect(() => {
    if (selIndex === null) return;
    const total = DATA[selIndex].items.length;
    const t = setInterval(() => {
      setShown((s) => {
        if (s >= total) {
          clearInterval(t);
          return s;
        }
        return s + 1;
      });
    }, 45);
    return () => clearInterval(t);
  }, [selIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (!booted) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next = selIndex === null ? (dir > 0 ? 0 : DATA.length - 1) : selIndex + dir;
      if (next >= 0 && next < DATA.length) selectLevel(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, selIndex, selectLevel]);

  const formatValue = useMemo(
    () => (value) => {
      if (!value || !value.trim()) return "-";
      return VigenereCipher(value, secretKey);
    },
    [secretKey]
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div
      className="crt-root relative h-[100dvh] w-full overflow-hidden bg-[#030803] font-terminal text-[#3dff72] selection:bg-[#3dff72] selection:text-black"
      onPointerDown={!booted ? skipBoot : undefined}
    >
      <div className="crt-screen relative z-10 mx-auto flex h-full max-w-5xl flex-col px-4 pb-3 pt-14 text-lg leading-snug sm:px-6 sm:text-xl md:text-2xl">
        <div className="crt-glow flex shrink-0 items-center justify-between border-b border-[#3dff72]/40 pb-1 text-sm uppercase tracking-widest sm:text-xs">
          <span>INFERNUS TERMINAL</span>
          <span className="opacity-70">{today}</span>
        </div>

        {!booted ? (
          <div className="crt-glow mt-3 flex-1 overflow-hidden">
            {BOOT_LINES.slice(0, bootCount).map((line, i) => (
              <div key={i} className="min-h-[1.4em] whitespace-pre-wrap break-words">
                {line}
              </div>
            ))}
            <span className="crt-cursor" />
            <div className="mt-4 text-sm opacity-40">[ toca o presiona una tecla para omitir ]</div>
          </div>
        ) : (
          <>
            <main className="mt-3 grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,2fr)_minmax(0,3fr)] gap-3 md:grid-cols-5 md:grid-rows-1">
              <section className="crt-box flex min-h-0 flex-col md:col-span-2">
                <div className="crt-title crt-glow">[ LEVELS ]</div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">

                  {DATA.map((lvl, idx) => {
                    const active = selIndex === idx;
                    const dim = active ? 1 : Math.max(0.45, 1 - idx * 0.09);

                    return (
                      <React.Fragment key={lvl.id}>
                        {(idx ===  2 || idx === 6) && (
                          <div
                            aria-hidden
                            className="crt-wave my-1 overflow-hidden whitespace-nowrap text-sm opacity-70"
                          >
                            {"~ ".repeat(60)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => selectLevel(idx)}
                          style={{ opacity: dim }}
                          className={`group flex w-full cursor-pointer items-center gap-2 px-1 text-left transition-colors ${
                            active
                              ? "bg-[#3dff72] text-black"
                              : "hover:bg-[#3dff72]/15"
                          }`}
                        >
                          <span className="w-3 shrink-0">{active ? ">" : " "}</span>
                          <span className="shrink-0 font-bold">{levelName(idx)}</span>
                          <span className="hidden shrink-0 text-sm opacity-70 sm:inline">
                            {depthLabel(idx)}
                          </span>
                          <span className="ml-auto shrink-0 tracking-tighter">{bar(lvl.items.length)}</span>
                          <span className="w-6 shrink-0 text-right">{String(lvl.items.length).padStart(2, "0")}</span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </section>

              <section className="crt-box flex min-h-0 flex-col md:col-span-3">
                <div className="crt-title crt-glow">[ DIRECTORY ]</div>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                  {selLevel ? (
                    <>
                      <div className="crt-glow break-words text-[#3dff72]/80">
                        INFR:/{levelName(selIndex)}$ ls -l
                      </div>
                      <div className="crt-glow mb-1 text-sm opacity-60">
                        total {selLevel.items.length}
                      </div>

                      {selLevel.items.slice(0, shown).map((item) => (
                        <EntryRow key={item.id} item={item} label={formatValue(item.name)} />
                      ))}

                      {shown >= selLevel.items.length ? (
                        <div className="crt-glow mt-2">
                          INFR:/{levelName(selIndex)}$ <span className="crt-cursor" />
                        </div>
                      ) : (
                        <span className="crt-cursor" />
                      )}
                    </>
                  ) : (
                    <div className="crt-glow pt-2">
                      <div>&gt; SELECT A LEVEL TO LIST FILES</div>
                      <div className="text-sm opacity-50">&gt; USE ↑ / ↓ OR CLICK A LEVEL</div>
                      <span className="crt-cursor" />
                    </div>
                  )}
                </div>
              </section>
            </main>

            <footer className="mt-3 shrink-0 border-t border-[#3dff72]/40 pt-2">
              <label
                className="crt-glow flex cursor-text items-center gap-2"
                onClick={() => inputRef.current?.focus()}
              >
                <span className="shrink-0">CIPHER KEY&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
                  maxLength={KEY_MAX}
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent uppercase tracking-widest text-[#3dff72] caret-[#3dff72] outline-none"
                />
                <span className="shrink-0 text-sm opacity-60">
                  {secretKey.length}/{KEY_MAX}
                </span>
              </label>
            </footer>
          </>
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-repeat mix-blend-screen transition-opacity ease-out will-change-[opacity]"
        style={{
          backgroundImage: "url('/images/noise1.gif')",
          opacity: burst ? 0.55 : 0.07,
          transitionDuration: burst ? "0ms" : "250ms",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.3) 3px)",
        }}
      />
      <div aria-hidden className="crt-roll pointer-events-none absolute inset-x-0 z-20 h-24" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      <style>{`
        .crt-glow { text-shadow: 0 0 6px rgba(61,255,114,.55), 0 0 1px rgba(61,255,114,.9); }
        .crt-screen { text-shadow: 0 0 4px rgba(61,255,114,.35); animation: crt-flicker 7s infinite steps(1); }
        .crt-box { position: relative; border: 1px solid rgba(61,255,114,.55); box-shadow: 0 0 10px rgba(61,255,114,.12) inset; }
        .crt-title { position: relative; top: -0.7em; margin-left: .75rem; width: fit-content; padding: 0 .4rem; background: #030803; font-size: 1rem; letter-spacing: .15em; }
        .crt-cursor { display: inline-block; width: .6em; height: 1.05em; vertical-align: -0.15em; background: #3dff72; box-shadow: 0 0 8px rgba(61,255,114,.8); animation: crt-blink 1s steps(1) infinite; }
        .crt-wave { animation: crt-wave 4s linear infinite; }
        .crt-roll { top: -6rem; background: linear-gradient(to bottom, rgba(61,255,114,0), rgba(61,255,114,.05), rgba(61,255,114,0)); animation: crt-roll 7s linear infinite; }
        @keyframes crt-blink { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }
        @keyframes crt-flicker { 0%, 100% { opacity: 1 } 92% { opacity: .96 } 94% { opacity: 1 } 97% { opacity: .98 } }
        @keyframes crt-roll { from { transform: translateY(0) } to { transform: translateY(calc(100dvh + 6rem)) } }
        @keyframes crt-wave { from { transform: translateX(0) } to { transform: translateX(-2ch) } }
        .crt-root ::-webkit-scrollbar { width: 6px; }
        .crt-root ::-webkit-scrollbar-thumb { background: rgba(61,255,114,.45); }
        .crt-root ::-webkit-scrollbar-track { background: transparent; }
        @media (prefers-reduced-motion: reduce) {
          .crt-screen, .crt-roll, .crt-wave, .crt-cursor { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default Terminal;