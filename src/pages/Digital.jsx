import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CluesScreen } from "../components/Digital/CluesScreen";
import { TerminalScreen } from "../components/Digital/TerminalScreen";
import { ProgressScreen } from "../components/Digital/ProgressScreen";
import { RotateNotice } from "../components/Digital/RotateNotice";
import { loadProgress, saveProgress, clearProgress } from "../utils/argSec";

export const Digital = () => {
  const [inMonitorView, setInMonitorView] = useState(true);
  const [isZooming, setIsZooming] = useState(false);

  const [currentScreen, setCurrentScreen] = useState(2);
  const [unlockedCodes, setUnlockedCodes] = useState([]);

  const [staticBurst, setStaticBurst] = useState(false);
  const burstTimerRef = useRef(null);

  useEffect(() => {
    setUnlockedCodes(loadProgress());
  }, []);

  const triggerStaticBurst = () => {
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    setStaticBurst(true);
    burstTimerRef.current = setTimeout(() => {
      setStaticBurst(false);
    }, 40);
  };

  // Manejo de desbloqueo: detecta si es el 9no código para disparar el sonido final
  const handleUnlockSuccess = (codeId, isFinalCode = false) => {
    triggerStaticBurst();
    const updated = [...new Set([...unlockedCodes, codeId])];
    setUnlockedCodes(updated);
    saveProgress(updated);

    const soundPath = isFinalCode ? "/sounds/codeSuccess2.mp3" : "/sounds/codeSuccess.mp3";
    const sound = new Audio(soundPath);
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const handleResetProgress = () => {
    clearProgress();
    setUnlockedCodes([]);
  };

  const handleMonitorClick = () => {
    if (isZooming) return;
    const sound = new Audio("/sounds/monitorOn.mp3");
    sound.currentTime = 0;
    sound.play().catch(() => {});

    setIsZooming(true);
    setTimeout(() => {
      setInMonitorView(false);
      setIsZooming(false);
    }, 900);
  };

  const handleNavigate = (targetScreen) => {
    triggerStaticBurst();
    const sound = new Audio("/sounds/navClick.mp3");
    sound.currentTime = 0;
    sound.play().catch(() => {});
    setCurrentScreen(targetScreen);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
      <RotateNotice />

      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-35"
        style={{
          backgroundImage: "url('/images/concrete.jpg')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      />

      {!inMonitorView && (
        <div
          className="fixed inset-0 z-50 pointer-events-none bg-repeat transition-opacity ease-out will-change-[opacity]"
          style={{
            backgroundImage: "url('/images/noise1.gif')",
            opacity: staticBurst ? 0.9 : 0.05,
            transitionDuration: staticBurst ? "0ms" : "300ms",
          }}
        />
      )}

      <AnimatePresence>
        {inMonitorView && (
          <motion.div
            key="monitor-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 3.5 }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.3, 1] }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black cursor-pointer p-4"
            onClick={handleMonitorClick}
          >
            <motion.img
              src="/images/screen.png"
              alt="Monitor CRT"
              animate={{
                scale: isZooming ? 4.5 : 1,
                opacity: isZooming ? 0 : 1,
              }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="max-h-[38vh] max-w-[42vw] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.06)] pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!inMonitorView && (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <div className="relative z-20 flex h-[85vh] w-full max-w-4xl items-center justify-center px-12 sm:px-14">
            
            {currentScreen > 1 && (
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => handleNavigate(currentScreen - 1)}
                className="absolute -left-2 sm:-left-4 z-30 flex h-30 w-10 sm:h-35 sm:w-11 items-center justify-center rounded-lg border border-white/10 bg-black/80 text-white/60 transition-all hover:scale-110 hover:border-[#E23F31] hover:text-[#E23F31] active:scale-95 cursor-pointer shadow-lg"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {currentScreen === 1 && (
                  <motion.div
                    key="screen-1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="h-full w-full flex items-center justify-center"
                  >
                    <CluesScreen unlocked={unlockedCodes} />
                  </motion.div>
                )}

                {currentScreen === 2 && (
                  <motion.div
                    key="screen-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="h-full w-full flex items-center justify-center"
                  >
                    <TerminalScreen
                      unlocked={unlockedCodes}
                      onUnlockSuccess={handleUnlockSuccess}
                      onGoToProgress={() => handleNavigate(3)}
                    />
                  </motion.div>
                )}

                {currentScreen === 3 && (
                  <motion.div
                    key="screen-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="h-full w-full flex items-center justify-center"
                  >
                    <ProgressScreen
                      unlocked={unlockedCodes}
                      onResetProgress={handleResetProgress}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Flecha Derecha */}
            {currentScreen < 3 && (
              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => handleNavigate(currentScreen + 1)}
                className="absolute -right-2 sm:-right-4 z-30 flex h-30 w-10 sm:h-35 sm:w-11 items-center justify-center rounded-lg border border-white/10 bg-black/80 text-white/60 transition-all hover:scale-110 hover:border-[#E23F31] hover:text-[#E23F31] active:scale-95 cursor-pointer shadow-lg"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Digital;