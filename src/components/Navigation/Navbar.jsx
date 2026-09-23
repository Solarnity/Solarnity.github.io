import React, { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const playAudio = (src) => {
  if (!src) return;
  const audio = new Audio(src);
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

export const Navbar = ({
  routesConfig = [],
  dullHitSound = "/sounds/dullHit.mp3",
  counterSound = "/sounds/counter.mp3",
  eeUnlockSound = "/sounds/chipbell.mp3",
  eeIconSrc = "/images/aceclidina.webp",
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

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

  // Manejador exclusivo para el icono (Flor / Foto)
  const handleIconClick = useCallback(
    (e) => {
      e.stopPropagation();
      playAudio(dullHitSound);

      const now = Date.now();
      const MAX_INTERVAL = 600; // Máximo tiempo entre clics para considerarse "seguidos"

      // Limpia cualquier reinicio programado previo
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      // Si pasa demasiado tiempo, se rompe la racha y se reinicia
      if (now - lastClickTimeRef.current > MAX_INTERVAL) {
        clickCountRef.current = 0;
      }

      lastClickTimeRef.current = now;
      clickCountRef.current += 1;
      const clicks = clickCountRef.current;

      // Programa reinicio si el usuario se detiene antes de completar la meta
      resetTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, MAX_INTERVAL);

      // Estado 1: Inactivo -> Requiere 10 clics seguidos
      if (!eeActive) {
        if (clicks >= 10) {
          clearTimeout(resetTimerRef.current);
          clickCountRef.current = 0;
          setEeActive(true);
          playAudio(eeUnlockSound);
        }
      }
      // Estado 2: Activo -> Requiere 5 clics seguidos para revertir
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
    // Al dar clic en el texto se limpia la racha de clics del icono
    clickCountRef.current = 0;
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full h-12 bg-transparent pointer-events-none select-none">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative flex items-center justify-between pointer-events-auto">
        
        {/* Contenedor del Logo (Icono interactivo + Texto enlazado a Home) */}
        <div className="flex items-center gap-1.5 z-20 pointer-events-auto">
          {/* Botón interactivo exclusivo para el icono */}
          <button
            type="button"
            aria-label="Logo Icon"
            onClick={handleIconClick}
            className="flex items-center justify-center p-0.5 rounded cursor-pointer outline-none border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-white/20 active:scale-95 transition-transform"
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
                className="w-4 h-4 rounded-full opacity-90 hover:rotate-90 transition-transform duration-500 ease-out"
              />
            )}
          </button>

          {/* Enlace al Home con el texto y el signo '?' animado */}
          <Link
            to="/"
            onClick={handleTextClick}
            className="flex items-center text-sm font-medium tracking-wider text-white transition-colors duration-200 group"
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
                  className="font-comic font-bold text-white select-none inline-block"
                >
                  ? xd
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navegación central con layout animado */}
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
                      isActive
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