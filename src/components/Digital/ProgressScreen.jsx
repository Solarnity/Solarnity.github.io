import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, AlertTriangle, Sparkles } from "lucide-react";

const _0x9f = "aHR0cHM6Ly93d3cueW91dHViZS5jb20vcGxheWxpc3Q/bGlzdD1QTEp6b3EteFFZdU5j";
const getTargetUrl = () => atob(_0x9f);

const RingGraphic = ({ unlocked, isAllCompleted, triggering, interactive, onClick }) => {
  const matrix = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      onClick={onClick}
      className={`relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center ${
        interactive ? "cursor-pointer group" : ""
      }`}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={triggering ? { scale: 2 } : { scale: 1 }}
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
        initial={{ scale: 1 }}
        animate={triggering ? { scale: 2 } : { scale: 1 }}
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
  );
};

export const ProgressScreen = ({ unlocked = [], onResetProgress, stageScale = 1 }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTriggeringFinal, setIsTriggeringFinal] = useState(false);
  const [finalGeometry, setFinalGeometry] = useState(null);
  const panelRef = useRef(null);
  const ringWrapRef = useRef(null);
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

    const ringRect = ringWrapRef.current?.getBoundingClientRect();
    const panelRect = panelRef.current?.getBoundingClientRect();
    if (ringRect && panelRect) {
      setFinalGeometry({
        panel: {
          left: panelRect.left,
          top: panelRect.top,
          width: panelRect.width,
          height: panelRect.height,
        },
        ring: {
          x: ringRect.left + ringRect.width / 2 - panelRect.left,
          y: ringRect.top + ringRect.height / 2 - panelRect.top,
        },
      });
    }
    setIsTriggeringFinal(true);

    const sound = new Audio("/sounds/finalUnlock.mp3");
    sound.currentTime = 0;
    sound.play().catch(() => {});

    setTimeout(() => {
      window.location.href = getTargetUrl();
    }, 6000);
  };

  return (
    <div
      ref={panelRef}
      className="relative flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/95 p-6 shadow-2xl overflow-hidden"
    >
      {createPortal(
        <AnimatePresence>
          {isTriggeringFinal && (
            <>
              <motion.div
                key="final-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "linear" }}
                className="fixed inset-0 z-40 pointer-events-none bg-black"
              />
              <div
                key="final-ring"
                className="fixed z-50 overflow-hidden pointer-events-none"
                style={
                  finalGeometry
                    ? {
                        left: `${finalGeometry.panel.left}px`,
                        top: `${finalGeometry.panel.top}px`,
                        width: `${finalGeometry.panel.width}px`,
                        height: `${finalGeometry.panel.height}px`,
                        borderRadius: `${16 * stageScale}px`,
                      }
                    : { inset: 0 }
                }
              >
                <div
                  className="absolute"
                  style={{
                    left: finalGeometry ? `${finalGeometry.ring.x}px` : "50%",
                    top: finalGeometry ? `${finalGeometry.ring.y}px` : "50%",
                    transform: `translate(-50%, -50%) scale(${stageScale})`,
                  }}
                >
                  <RingGraphic
                    unlocked={unlocked}
                    isAllCompleted={isAllCompleted}
                    triggering
                    interactive={false}
                  />
                </div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="my-auto flex flex-col items-center justify-center py-4 relative z-50">
        <div
          ref={ringWrapRef}
          className={isTriggeringFinal ? "invisible" : undefined}
        >
          <RingGraphic
            unlocked={unlocked}
            isAllCompleted={isAllCompleted}
            triggering={false}
            interactive={isAllCompleted && !isTriggeringFinal}
            onClick={handleFinalRingClick}
          />
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