import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
} from "lucide-react";

const playFlipSound = () => {
  try {
    const audio = new Audio("/sounds/navClick.mp3");
    audio.volume = 0.4;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    /* noop */
  }
};

/**
 * Dibuja un HTMLImageElement en un <canvas> sin exponer ninguna URL en el DOM
 * y bloqueando clic derecho, arrastre y descarga.
 */
export const ProtectedCanvas = ({ image, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = image.naturalWidth || image.width || 1000;
    canvas.height = image.naturalHeight || image.height || 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  }, [image]);

  return (
    <canvas
      ref={canvasRef}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none", userSelect: "none" }}
      className={`pointer-events-none block select-none ${className}`}
    />
  );
};

const BookletZoomModal = ({ image, pageNumber, totalPages, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + 0.35).toFixed(2)));
  const zoomOut = () =>
    setScale((s) => {
      const next = Math.max(MIN_SCALE, +(s - 0.35).toFixed(2));
      if (next === MIN_SCALE) setPosition({ x: 0, y: 0 });
      return next;
    });
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    draggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!draggingRef.current) return;
    setPosition({
      x: dragStartRef.current.posX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.posY + (e.clientY - dragStartRef.current.y),
    });
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#181818]/95 p-4 select-none font-mono"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute left-4 top-4 z-10 border border-[#EDE0D8]/40 bg-[#181818] px-3 py-1.5 text-xs text-[#EDE0D8]">
        {String(pageNumber).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-[#EDE0D8]/40 bg-[#181818] text-[#EDE0D8] transition-colors hover:bg-[#EDE0D8] hover:text-[#181818] cursor-pointer rounded-none"
        aria-label="Cerrar zoom"
      >
        <X size={18} />
      </button>

      <div
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 border border-[#EDE0D8]/40 bg-[#181818] px-3 py-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="flex h-8 w-8 items-center justify-center text-[#EDE0D8] transition-colors hover:bg-[#EDE0D8] hover:text-[#181818] disabled:opacity-30 cursor-pointer rounded-none"
          aria-label="Alejar"
        >
          <ZoomOut size={15} />
        </button>

        <span className="min-w-[52px] text-center text-xs text-[#EDE0D8]">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="flex h-8 w-8 items-center justify-center text-[#EDE0D8] transition-colors hover:bg-[#EDE0D8] hover:text-[#181818] disabled:opacity-30 cursor-pointer rounded-none"
          aria-label="Acercar"
        >
          <ZoomIn size={15} />
        </button>

        <div className="mx-1 h-4 w-px bg-[#EDE0D8]/25" />

        <button
          type="button"
          onClick={resetZoom}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          className="flex h-8 w-8 items-center justify-center text-[#EDE0D8] transition-colors hover:bg-[#EDE0D8] hover:text-[#181818] disabled:opacity-30 cursor-pointer rounded-none"
          aria-label="Restablecer"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div
        className="flex max-h-full max-w-full items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ cursor: scale > 1 ? "grab" : "default" }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: draggingRef.current ? "none" : "transform 0.1s ease-out",
          }}
        >
          <ProtectedCanvas
            image={image}
            className="max-h-[86vh] max-w-[90vw] object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

const PageSurface = ({ pageImg, pageNum, side, showSpineCrease, onZoom }) => {
  if (!pageNum) {
    return <div className="h-full w-full pointer-events-none" />;
  }

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="group relative h-full w-full overflow-hidden bg-[#EDE0D8] select-none rounded-none"
    >
      {pageImg ? (
        <ProtectedCanvas
          image={pageImg}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-[#181818]/20 bg-[#EDE0D8] font-mono text-xs text-[#181818]/50">
          {String(pageNum).padStart(2, "0")}
        </div>
      )}

      {/* Sombra muy sutil únicamente en la unión central cuando hay 2 páginas abiertas */}
      {showSpineCrease && side === "left" && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-2.5"
          style={{
            background:
              "linear-gradient(to right, rgba(24,24,24,0) 0%, rgba(24,24,24,0.10) 100%)",
          }}
        />
      )}
      {showSpineCrease && side === "right" && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-2.5"
          style={{
            background:
              "linear-gradient(to left, rgba(24,24,24,0) 0%, rgba(24,24,24,0.10) 100%)",
          }}
        />
      )}

      {/* Botón de zoom discreto */}
      {pageImg && onZoom && (
        <div
          className={`absolute bottom-2 ${
            side === "left" ? "left-2" : "right-2"
          } opacity-0 transition-opacity duration-150 group-hover:opacity-100`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onZoom(pageImg, pageNum);
            }}
            className="flex h-7 w-7 items-center justify-center border border-[#181818] bg-[#EDE0D8]/95 text-[#181818] transition-colors hover:bg-[#181818] hover:text-[#EDE0D8] cursor-pointer rounded-none"
            title="Zoom"
            aria-label={`Ampliar página ${pageNum}`}
          >
            <ZoomIn size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

function buildSpreads(totalPages) {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [{ left: null, right: 1 }];

  const spreads = [{ left: null, right: 1 }];
  let p = 2;
  while (p < totalPages) {
    spreads.push({
      left: p,
      right: p + 1 <= totalPages ? p + 1 : null,
    });
    p += 2;
  }
  if (totalPages % 2 === 0) {
    spreads.push({ left: totalPages, right: null });
  }
  return spreads;
}

const BASE_FLIP_DURATION = 0.28;
const FAST_FLIP_DURATION = 0.13;

export const BookletViewer = ({ pageImages = {}, totalPages = 24 }) => {
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "single" : "spread"
  );

  const spreads = useMemo(() => buildSpreads(totalPages), [totalPages]);
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [flipState, setFlipState] = useState(null);

  const [singlePage, setSinglePage] = useState(1);
  const [zoomData, setZoomData] = useState(null);

  useEffect(() => {
    const onResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const effectiveMode = isMobileViewport ? "single" : viewMode;

  const goNextSpread = useCallback(() => {
    if (flipState) {
      // Si ya está animando y se vuelve a presionar la flecha, completar el giro actual
      // e iniciar inmediatamente el siguiente con velocidad aumentada (FAST_FLIP_DURATION).
      const currentTarget = flipState.toIdx;
      if (currentTarget < spreads.length - 1) {
        playFlipSound();
        setSpreadIdx(currentTarget);
        setFlipState({
          dir: "next",
          fromIdx: currentTarget,
          toIdx: currentTarget + 1,
          fast: true,
          stepId: (flipState.stepId || 0) + 1,
        });
      } else if (!flipState.fast) {
        setFlipState((prev) => (prev ? { ...prev, fast: true } : null));
      }
      return;
    }

    if (spreadIdx >= spreads.length - 1) return;
    playFlipSound();
    setFlipState({
      dir: "next",
      fromIdx: spreadIdx,
      toIdx: spreadIdx + 1,
      fast: false,
      stepId: 1,
    });
  }, [flipState, spreadIdx, spreads.length]);

  const goPrevSpread = useCallback(() => {
    if (flipState) {
      // Si ya está animando y se presiona la flecha anterior, acelerar inmediatamente
      const currentTarget = flipState.toIdx;
      if (currentTarget > 0) {
        playFlipSound();
        setSpreadIdx(currentTarget);
        setFlipState({
          dir: "prev",
          fromIdx: currentTarget,
          toIdx: currentTarget - 1,
          fast: true,
          stepId: (flipState.stepId || 0) + 1,
        });
      } else if (!flipState.fast) {
        setFlipState((prev) => (prev ? { ...prev, fast: true } : null));
      }
      return;
    }

    if (spreadIdx <= 0) return;
    playFlipSound();
    setFlipState({
      dir: "prev",
      fromIdx: spreadIdx,
      toIdx: spreadIdx - 1,
      fast: false,
      stepId: 1,
    });
  }, [flipState, spreadIdx]);

  const goNextSingle = useCallback(() => {
    if (singlePage >= totalPages) return;
    playFlipSound();
    setSinglePage((p) => Math.min(totalPages, p + 1));
  }, [singlePage, totalPages]);

  const goPrevSingle = useCallback(() => {
    if (singlePage <= 1) return;
    playFlipSound();
    setSinglePage((p) => Math.max(1, p - 1));
  }, [singlePage]);

  const handleNext = useCallback(() => {
    if (effectiveMode === "spread") goNextSpread();
    else goNextSingle();
  }, [effectiveMode, goNextSpread, goNextSingle]);

  const handlePrev = useCallback(() => {
    if (effectiveMode === "spread") goPrevSpread();
    else goPrevSingle();
  }, [effectiveMode, goPrevSpread, goPrevSingle]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (zoomData) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev, zoomData]);

  const completeFlip = () => {
    if (!flipState) return;
    setSpreadIdx(flipState.toIdx);
    setFlipState(null);
  };

  const activeSpreadIdx = flipState ? flipState.toIdx : spreadIdx;
  const currentSpread = spreads[spreadIdx] || { left: null, right: 1 };

  const staticLeftPage = useMemo(() => {
    if (!flipState) return currentSpread.left;
    if (flipState.dir === "next") {
      return spreads[flipState.fromIdx]?.left ?? null;
    }
    return spreads[flipState.toIdx]?.left ?? null;
  }, [flipState, currentSpread.left, spreads]);

  const staticRightPage = useMemo(() => {
    if (!flipState) return currentSpread.right;
    if (flipState.dir === "next") {
      return spreads[flipState.toIdx]?.right ?? null;
    }
    return spreads[flipState.fromIdx]?.right ?? null;
  }, [flipState, currentSpread.right, spreads]);

  const turningFrontPage = useMemo(() => {
    if (!flipState) return null;
    if (flipState.dir === "next") {
      return spreads[flipState.fromIdx]?.right ?? null;
    }
    return spreads[flipState.toIdx]?.right ?? null;
  }, [flipState, spreads]);

  const turningBackPage = useMemo(() => {
    if (!flipState) return null;
    if (flipState.dir === "next") {
      return spreads[flipState.toIdx]?.left ?? null;
    }
    return spreads[flipState.fromIdx]?.left ?? null;
  }, [flipState, spreads]);

  const canPrev =
    effectiveMode === "spread" ? activeSpreadIdx > 0 : singlePage > 1;
  const canNext =
    effectiveMode === "spread"
      ? activeSpreadIdx < spreads.length - 1
      : singlePage < totalPages;

  // Centrar cuando en modo 2 páginas solo se muestra 1 página (ej. página 1 o página 24)
  const targetSpreadForCenter = flipState ? spreads[flipState.toIdx] : currentSpread;
  const shiftClass = useMemo(() => {
    if (!targetSpreadForCenter) return "translate-x-0";
    if (!targetSpreadForCenter.left && targetSpreadForCenter.right) {
      return "-translate-x-1/4";
    }
    if (targetSpreadForCenter.left && !targetSpreadForCenter.right) {
      return "translate-x-1/4";
    }
    return "translate-x-0";
  }, [targetSpreadForCenter]);

  const hasBothPagesOpen = Boolean((staticLeftPage || flipState) && (staticRightPage || flipState));
  const flipDuration = flipState?.fast ? FAST_FLIP_DURATION : BASE_FLIP_DURATION;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="flex flex-col items-center gap-4 w-full font-mono select-none"
    >
      {/* Selector superior centrado 2P / 1P */}
      {!isMobileViewport && (
        <div className="flex items-center justify-center gap-0 border border-[#181818]">
          <button
            type="button"
            onClick={() => {
              setFlipState(null);
              setViewMode("spread");
            }}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors cursor-pointer rounded-none ${
              effectiveMode === "spread"
                ? "bg-[#181818] text-[#EDE0D8] font-bold"
                : "bg-[#EDE0D8] text-[#181818]/70 hover:text-[#181818]"
            }`}
          >
            2 PÁGINAS
          </button>
          <button
            type="button"
            onClick={() => {
              setFlipState(null);
              const activeP = currentSpread.left || currentSpread.right || 1;
              setSinglePage(activeP);
              setViewMode("single");
            }}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors cursor-pointer rounded-none border-l border-[#181818] ${
              effectiveMode === "single"
                ? "bg-[#181818] text-[#EDE0D8] font-bold"
                : "bg-[#EDE0D8] text-[#181818]/70 hover:text-[#181818]"
            }`}
          >
            1 PÁGINA
          </button>
        </div>
      )}

      {/* Escenario del Booklet (sin botones inferiores de numeración de página) */}
      <div className="relative flex w-full items-center justify-center py-2 sm:px-14">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canPrev}
          aria-label="Página anterior"
          className="absolute left-0 z-30 flex h-11 w-11 items-center justify-center border border-[#181818] bg-[#EDE0D8] text-[#181818] transition-colors hover:bg-[#181818] hover:text-[#EDE0D8] disabled:opacity-25 disabled:pointer-events-none cursor-pointer rounded-none"
        >
          <ChevronLeft size={18} />
        </button>

        {effectiveMode === "spread" ? (
          /* MODO 2 PÁGINAS CON GIRO 3D RÁPIDO Y CENTRADO AUTOMÁTICO EN PÁG 1 Y 24 */
          <div
            className="relative mx-auto flex w-full max-w-[820px] items-center justify-center overflow-visible"
            style={{ perspective: "2200px" }}
          >
            <div
              className={`relative grid aspect-[2/1] w-full grid-cols-2 transition-transform ${
                flipState?.fast ? "duration-150" : "duration-250"
              } ease-out ${shiftClass}`}
            >
              {/* Hoja Izquierda */}
              <div
                onClick={canPrev && staticLeftPage ? handlePrev : undefined}
                className={`relative h-full w-full overflow-hidden rounded-none ${
                  staticLeftPage ? "cursor-pointer" : "pointer-events-none"
                }`}
              >
                <PageSurface
                  pageImg={staticLeftPage ? pageImages[staticLeftPage] : null}
                  pageNum={staticLeftPage}
                  side="left"
                  showSpineCrease={hasBothPagesOpen}
                  onZoom={(img, num) => setZoomData({ image: img, pageNumber: num })}
                />
              </div>

              {/* Hoja Derecha */}
              <div
                onClick={canNext && staticRightPage ? handleNext : undefined}
                className={`relative h-full w-full overflow-hidden rounded-none ${
                  staticRightPage ? "cursor-pointer" : "pointer-events-none"
                }`}
              >
                <PageSurface
                  pageImg={staticRightPage ? pageImages[staticRightPage] : null}
                  pageNum={staticRightPage}
                  side="right"
                  showSpineCrease={hasBothPagesOpen}
                  onZoom={(img, num) => setZoomData({ image: img, pageNumber: num })}
                />
              </div>

              {/* Línea divisoria central muy tenue cuando hay 2 páginas abiertas */}
              {hasBothPagesOpen && (
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-[#181818]/20" />
              )}

              {/* Hoja girando en 3D */}
              {flipState && (
                <motion.div
                  key={`${flipState.fromIdx}-${flipState.toIdx}-${flipState.stepId || 0}`}
                  initial={{
                    rotateY: flipState.dir === "next" ? 0 : -180,
                  }}
                  animate={{
                    rotateY: flipState.dir === "next" ? -180 : 0,
                  }}
                  transition={{
                    duration: flipDuration,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onAnimationComplete={completeFlip}
                  style={{
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                  }}
                  className="pointer-events-none absolute right-0 top-0 z-30 h-full w-1/2"
                >
                  <div
                    style={{ backfaceVisibility: "hidden" }}
                    className="absolute inset-0 h-full w-full overflow-hidden bg-[#EDE0D8] rounded-none"
                  >
                    <PageSurface
                      pageImg={turningFrontPage ? pageImages[turningFrontPage] : null}
                      pageNum={turningFrontPage}
                      side="right"
                      showSpineCrease={true}
                    />
                  </div>

                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className="absolute inset-0 h-full w-full overflow-hidden bg-[#EDE0D8] rounded-none"
                  >
                    <PageSurface
                      pageImg={turningBackPage ? pageImages[turningBackPage] : null}
                      pageNum={turningBackPage}
                      side="left"
                      showSpineCrease={true}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          /* MODO 1 PÁGINA (SIN ANIMACIONES, CENTRADO) */
          <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center">
            <div className="relative aspect-square w-full overflow-hidden bg-[#EDE0D8] rounded-none">
              <PageSurface
                pageImg={pageImages[singlePage]}
                pageNum={singlePage}
                side="right"
                showSpineCrease={false}
                onZoom={(img, num) => setZoomData({ image: img, pageNumber: num })}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext}
          aria-label="Página siguiente"
          className="absolute right-0 z-30 flex h-11 w-11 items-center justify-center border border-[#181818] bg-[#EDE0D8] text-[#181818] transition-colors hover:bg-[#181818] hover:text-[#EDE0D8] disabled:opacity-25 disabled:pointer-events-none cursor-pointer rounded-none"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence>
        {zoomData && (
          <BookletZoomModal
            image={zoomData.image}
            pageNumber={zoomData.pageNumber}
            totalPages={totalPages}
            onClose={() => setZoomData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookletViewer;
