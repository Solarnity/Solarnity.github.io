import { useIsTouchDevice } from "../../utils/device";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const playAudio = (src) => {
  if (!src) return;
  const audio = new Audio(src);
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

let sharedCtx = null;
const toRGBA = (cssColor) => {
  if (!cssColor || cssColor === "transparent") return null;
  if (!sharedCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    sharedCtx = canvas.getContext("2d", { willReadFrequently: true });
  }
  sharedCtx.clearRect(0, 0, 1, 1);
  sharedCtx.fillStyle = "#000";
  sharedCtx.fillStyle = cssColor;
  sharedCtx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = sharedCtx.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a: a / 255 };
};

const BASE_BG = { r: 10, g: 10, b: 10 };

const getToneAt = (x, y, header) => {
  const stack = document.elementsFromPoint(x, y);
  let remaining = 1;
  let r = 0;
  let g = 0;
  let b = 0;

  for (const el of stack) {
    if (header && header.contains(el)) continue;
    const color = toRGBA(getComputedStyle(el).backgroundColor);
    if (!color || color.a <= 0) continue;
    const weight = color.a * remaining;
    r += color.r * weight;
    g += color.g * weight;
    b += color.b * weight;
    remaining *= 1 - color.a;
    if (remaining < 0.02) break;
  }

  r += BASE_BG.r * remaining;
  g += BASE_BG.g * remaining;
  b += BASE_BG.b * remaining;

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? "light" : "dark";
};

const useBackdropTone = (headerRef, path) => {
  const [tones, setTones] = useState({ left: "dark", center: "dark" });

  useEffect(() => {
    const measure = () => {
      const header = headerRef.current;
      if (!header) return;
      const y = Math.max(header.getBoundingClientRect().height / 2, 1);
      const left = getToneAt(Math.min(56, window.innerWidth / 2), y, header);
      const center = getToneAt(window.innerWidth / 2, y, header);
      setTones((prev) =>
        prev.left === left && prev.center === center ? prev : { left, center }
      );
    };

    measure();
    const timeouts = [80, 400, 1000].map((ms) => setTimeout(measure, ms));
    const interval = setInterval(measure, 700);
    window.addEventListener("resize", measure);
    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
      window.removeEventListener("resize", measure);
    };
  }, [headerRef, path]);

  return tones;
};

const HIDE_ON_TOUCH_ROUTES = ["/digitalremains"];

export const Navbar = ({
  routesConfig = [],
  dullHitSound = "/sounds/dullHit.mp3",
  counterSound = "/sounds/counter.mp3",
  eeUnlockSound = "/sounds/chipbell.mp3",
  eeIconSrc = "/images/aceclidina.webp",
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isTouch = useIsTouchDevice();
  const hideNavbar = isTouch && HIDE_ON_TOUCH_ROUTES.includes(location.pathname);

  const headerRef = useRef(null);
  const tones = useBackdropTone(headerRef, currentPath);
  const leftLight = tones.left === "light";
  const centerLight = tones.center === "light";

  const [eeActive, setEeActive] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const resetTimerRef = useRef(null);

  const defaultNavItems = routesConfig.filter((route) => !route.hidden);
  const currentHiddenItem = routesConfig.find(
    (route) => route.hidden && route.path === currentPath
  );

  const navItems = currentHiddenItem
    ? [...defaultNavItems, currentHiddenItem]
    : defaultNavItems;

  const handleIconClick = useCallback(
    (e) => {
      e.stopPropagation();
      playAudio(dullHitSound);

      const now = Date.now();
      const MAX_INTERVAL = 600;

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      if (now - lastClickTimeRef.current > MAX_INTERVAL) {
        clickCountRef.current = 0;
      }

      lastClickTimeRef.current = now;
      clickCountRef.current += 1;
      const clicks = clickCountRef.current;

      resetTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, MAX_INTERVAL);

      if (!eeActive) {
        if (clicks >= 10) {
          clearTimeout(resetTimerRef.current);
          clickCountRef.current = 0;
          setEeActive(true);
          playAudio(eeUnlockSound);
        }
      }
      else {
        if (clicks >= 5) {
          clearTimeout(resetTimerRef.current);
          clickCountRef.current = 0;
          setEeActive(false);
          playAudio(counterSound);
        }
      }
    },
    [eeActive, dullHitSound, counterSound, eeUnlockSound]
  );

  const handleTextClick = () => {
    clickCountRef.current = 0;
  };

  if (hideNavbar) return null;

  return (
    <header ref={headerRef} className="absolute top-0 left-0 right-0 z-50 w-full h-12 bg-transparent pointer-events-none select-none">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative flex items-center justify-between pointer-events-auto">
        
        <div className="flex items-center gap-1.5 z-20 pointer-events-auto">
          <button
            type="button"
            aria-label="Logo Icon"
            onClick={handleIconClick}
            className={`flex items-center justify-center p-0.5 rounded cursor-pointer outline-none border-0 bg-transparent focus-visible:ring-1 ${leftLight ? "focus-visible:ring-black/30" : "focus-visible:ring-white/20"} active:scale-95 transition-transform`}
          >
            {eeActive ? (
              <motion.img
                key="ee-photo"
                initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                src={eeIconSrc}
                alt="Secret Icon"
                className="w-4 h-4 rounded-none object-cover shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              />
            ) : (
              <img
                src="/icons/Flower.ico"
                alt="Flower Logo"
                className={`w-4 h-4 rounded-full opacity-90 hover:rotate-90 transition-[rotate,filter] duration-500 ease-out brightness-0 ${
                  leftLight ? "" : "invert"
                }`}
              />
            )}
          </button>

          <Link
            to="/"
            onClick={handleTextClick}
            className={`flex items-center text-sm font-medium tracking-wider transition-colors duration-300 group ${
              leftLight ? "text-black" : "text-white"
            }`}
          >
            <span>PLGNM</span>

            <AnimatePresence>
              {eeActive && (
                <motion.span
                  key="ee-question-mark"
                  initial={{ opacity: 0, scale: 0, x: -4, rotate: -25 }}
                  animate={{ opacity: 1, scale: 1, x: 2, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, x: -2, rotate: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                    mass: 0.8,
                  }}
                  className={`font-comic font-bold select-none inline-block transition-colors duration-300 ${
                    leftLight ? "text-black" : "text-white"
                  }`}
                >
                  ? xd
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
          <motion.nav
            layout
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 py-1 bg-transparent"
          >
            {navItems.map((item) => {
              const isActive = currentPath === item.path;

              return (
                <motion.div
                  layout
                  key={item.path}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  <Link
                    to={item.path}
                    className={`relative px-3 py-1 rounded-md text-xs tracking-wide transition-all duration-300 font-medium inline-block ${
                      centerLight
                        ? isActive
                          ? "text-black font-semibold"
                          : "text-black/50 hover:text-black"
                        : isActive
                        ? "text-white [text-shadow:0_0_12px_rgba(255,255,255,0.7)] font-semibold"
                        : "text-[#8E8E8E] hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.5)]"
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        </div>

        <div className="w-16 hidden md:block" />
      </div>
    </header>
  );
};