import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, AlertTriangle, Sparkles } from "lucide-react";

const _0x9f = "aHR0cHM6Ly95b3V0dS5iZS9OSENBeUFnY050aw==";
const getTargetUrl = () => atob(_0x9f);

export const ProgressScreen = ({ unlocked = [], onResetProgress }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTriggeringFinal, setIsTriggeringFinal] = useState(false);

  const matrix = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const isAllCompleted = unlocked.length >= 9;

  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        setIsTriggeringFinal(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleFinalRingClick = () => {
    if (!isAllCompleted || isTriggeringFinal) return;
    setIsTriggeringFinal(true);

    const sound = new Audio("/sounds/finalUnlock.mp3");
    sound.currentTime = 0;
    sound.play().catch(() => {});

    setTimeout(() => {
      window.location.href = getTargetUrl();
    }, 6000);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/95 p-6 shadow-2xl overflow-hidden">
      
      <AnimatePresence>
        {isTriggeringFinal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "linear" }}
            className="fixed inset-0 z-40 pointer-events-none bg-black"
          />
        )}
      </AnimatePresence>

      <div className="my-auto flex flex-col items-center justify-center py-4 relative z-50">
        <div
          onClick={handleFinalRingClick}
          className={`relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center ${
            isAllCompleted && !isTriggeringFinal ? "cursor-pointer group" : ""
          }`}
        >
          <motion.div
            animate={
              isTriggeringFinal
                ? { scale: 2 }
                : { scale: 1 }
            }
            transition={{ duration: 6.0, ease: "easeIn" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <img
              src={`/images/districts${isAllCompleted ? "R" : ""}.png`}
              alt="Districts"
              className={`h-[48rem] w-[48rem] object-contain transition-all duration-500 ${
                isAllCompleted
                  ? "opacity-100 drop-shadow-[0_0_15px_rgba(226,63,49,0.85)]"
                  : "opacity-20"
              }`}
            />
          </motion.div>

          <motion.div
            animate={
              isTriggeringFinal
                ? { scale: 2 }
                : { scale: 1 }
            }
            transition={{ duration: 6.0, ease: "easeIn" }}
            className="grid grid-cols-3 gap-0 z-10 pointer-events-none items-center justify-center"
          >
            {matrix.map((num) => {
              const isLit = unlocked.includes(num);
              const iconPath = `/images/bIcons/B${num}${isLit ? "R" : ""}.png`;

              return (
                <div
                  key={num}
                  className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center"
                >
                  <img
                    src={iconPath}
                    alt={`B${num}`}
                    className={`h-5 w-5 sm:h-6 sm:w-6 object-contain transition-all duration-300 ${
                      isLit
                        ? "opacity-100 drop-shadow-[0_0_4px_rgba(226,63,49,0.9)]"
                        : "opacity-25"
                    }`}
                  />
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ opacity: isTriggeringFinal ? 0 : 1 }}
        transition={{ duration: 1.5 }}
        className="flex items-center justify-between border-t border-white/[0.06] pt-3"
      >
        <button
          type="button"
          disabled={isTriggeringFinal}
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 font-mono text-xs text-white/40 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-0"
        >
          <RotateCcw size={13} />
          REINICIAR PROGRESO
        </button>
      </motion.div>

      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/95 p-6">
          <div className="max-w-xs text-center font-mono">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[#E23F31]" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              ¿CONFIRMAR REINICIO?
            </h4>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Se reiniciará todo el progreso y perderás los códigos descifrados.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setShowConfirm(false);
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer"
              >
                Borrar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};