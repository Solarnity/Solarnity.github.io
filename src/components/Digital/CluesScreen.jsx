import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Check,
  Play,
  Pause,
  Video,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  RotateCcw,
} from "lucide-react";
import { defaultClues } from "../../data/clues";

const playNavSound = () => {
  const audio = new Audio("/sounds/navClick.mp3");
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

/* ============================================================
   MODAL DE PREVISUALIZACIÓN DE IMAGEN
   ============================================================ */
const ImagePreviewModal = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  const zoomIn = () =>
    setScale((s) => Math.min(MAX_SCALE, +(s + 0.25).toFixed(2)));
  const zoomOut = () =>
    setScale((s) => {
      const next = Math.max(MIN_SCALE, +(s - 0.25).toFixed(2));
      if (next === MIN_SCALE) setPosition({ x: 0, y: 0 });
      return next;
    });
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Zoom con la rueda del ratón
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // Arrastrar cuando está zoomeado
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
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + dx,
      y: dragStartRef.current.posY + dy,
    });
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Botón de cierre */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Cerrar previsualización"
      >
        <X size={18} />
      </button>

      {/* Controles de zoom */}
      <div
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Alejar"
        >
          <ZoomOut size={16} />
        </button>

        <span className="min-w-[48px] text-center font-mono text-[10px] text-white/60">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Acercar"
        >
          <ZoomIn size={16} />
        </button>

        <div className="mx-1 h-5 w-px bg-white/10" />

        <button
          type="button"
          onClick={resetZoom}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Restablecer zoom"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Imagen */}
      <div
        className="flex max-h-full max-w-full items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <motion.img
          src={src}
          alt={alt}
          draggable={false}
          onMouseDown={handleMouseDown}
          animate={{ scale, x: position.x, y: position.y }}
          transition={{ type: "tween", duration: 0.15 }}
          style={{
            cursor: scale > 1 ? (draggingRef.current ? "grabbing" : "grab") : "default",
            maxHeight: "90vh",
            maxWidth: "90vw",
            userSelect: "none",
          }}
        />
      </div>
    </motion.div>
  );
};

/* ============================================================
   REPRODUCTOR DE AUDIO
   ============================================================ */
const CustomAudioPlayer = ({ src, title }) => {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const value = Number(event.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (event) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(event.target.value);
    audio.volume = value;
    setVolume(value);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.volume > 0) {
      audio.volume = 0;
      setVolume(0);
    } else {
      audio.volume = 1;
      setVolume(1);
    }
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#111111] p-4 shadow-lg">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E23F31]/20 bg-[#E23F31]/10">
          <Volume2 className="h-5 w-5 text-[#E23F31]" />
        </div>

        <a
          href={src}
          download
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
          aria-label="Descargar audio"
          title="Descargar audio"
        >
          <Download size={16} />
        </a>
      </div>

      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.01"
        value={currentTime}
        onChange={handleSeek}
        className="clue-audio-progress w-full"
        style={{ "--progress": `${progress}%` }}
      />

      <div className="mt-1 flex justify-between font-mono text-[9px] text-white/30">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E23F31] text-white transition-all duration-150 hover:bg-[#f04a3b] hover:shadow-[0_0_15px_rgba(226,63,49,0.35)] active:scale-95"
          aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="text-white/40 transition-colors hover:text-white"
          aria-label={volume === 0 ? "Activar volumen" : "Silenciar"}
        >
          {volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          className="clue-volume flex-1"
          style={{ "--volume": `${volume * 100}%` }}
        />

        <span className="min-w-[38px] text-right font-mono text-[9px] text-white/30">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};

/* ============================================================
   REPRODUCTOR DE VIDEO
   ============================================================ */
const CustomVideoPlayer = ({ src, title }) => {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/[0.08] bg-black shadow-lg">
      <video
        controls
        preload="metadata"
        src={src}
        className="max-h-[420px] w-full object-contain"
        aria-label={title || "Video"}
      />

      <div className="flex items-center gap-2 border-t border-white/[0.06] bg-[#111111] px-4 py-3">
        <Video size={14} className="text-[#E23F31]" />
      </div>
    </div>
  );
};

/* ============================================================
   PANTALLA DE PISTAS
   ============================================================ */
export const CluesScreen = ({
  clues = defaultClues,
  unlocked = [],
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [previewImage, setPreviewImage] = useState(null); // { src, alt }

  const safeClues = Array.isArray(clues) ? clues.filter((c) => c && c.id != null) : [];
  const activeClue = safeClues[selectedIdx] || safeClues[0];

  const handleSelectClue = (idx) => {
    playNavSound();
    setSelectedIdx(idx);
  };

  if (!activeClue) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/95 p-6">
        <span className="font-mono text-xs text-white/40">
          NO HAY PISTAS DISPONIBLES
        </span>
      </div>
    );
  }

  const { id, title, type, content, hint } = activeClue;
  const isResolved = unlocked.includes(id);

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/95 p-6 shadow-2xl">
      <div className="flex items-center justify-center border-b border-white/[0.08] pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {safeClues.map((clue, idx) => {
            const isCompleted = unlocked.includes(clue.id);
            const isSelected = selectedIdx === idx;

            const iconPath = `/images/bIcons/B${clue.id}${
              isCompleted ? "R" : ""
            }.png`;

            return (
              <button
                key={clue.id}
                type="button"
                onClick={() => handleSelectClue(idx)}
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-lg p-1.5 transition-all duration-150"
              >
                <div className="flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">
                  <img
                    src={iconPath}
                    alt={`B${clue.id}`}
                    className={`h-6 w-6 object-contain transition-opacity duration-150 ${
                      isCompleted
                        ? "opacity-100"
                        : "opacity-45 group-hover:opacity-100"
                    }`}
                  />
                </div>

                <div
                  className={`mt-1 h-0.5 w-6 rounded-full transition-all duration-200 ${
                    isSelected
                      ? isCompleted
                        ? "bg-[#E23F31] shadow-[0_0_8px_#E23F31]"
                        : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-auto flex flex-col items-center justify-center py-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="flex w-full flex-col items-center"
          >
            {title && (
              <h3 className="mb-5 font-mono text-lg font-bold tracking-wider text-white sm:text-xl">
                {title}
              </h3>
            )}

            {type === "text" && content && (
              <p className="max-w-xl rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 font-mono text-sm leading-relaxed text-white/70">
                {content}
              </p>
            )}

            {type === "image" && content && (
              <button
                type="button"
                onClick={() => {
                  playNavSound();
                  setPreviewImage({
                    src: content,
                    alt: title || `Clue ${id}`,
                  });
                }}
                className="group relative max-w-2xl cursor-zoom-in overflow-hidden rounded-xl border border-white/10 bg-black p-2 transition-colors hover:border-[#E23F31]/40"
                aria-label="Ampliar imagen"
              >
                <img
                  src={content}
                  alt={title || `Clue ${id}`}
                  className="max-h-[420px] w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
                    <ZoomIn size={18} />
                  </span>
                </span>
              </button>
            )}

            {type === "audio" && content && (
              <CustomAudioPlayer src={content} title={title} />
            )}

            {type === "video" && content && (
              <CustomVideoPlayer src={content} title={title} />
            )}

            {hint && (
              <span className="mt-5 font-mono text-[11px] tracking-wide text-white/30">
                {hint}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de previsualización de imagen */}
      <AnimatePresence>
        {previewImage && (
          <ImagePreviewModal
            src={previewImage.src}
            alt={previewImage.alt}
            onClose={() => setPreviewImage(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .clue-audio-progress,
        .clue-volume {
          appearance: none;
          -webkit-appearance: none;
          height: 3px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }

        .clue-audio-progress {
          background: linear-gradient(
            to right,
            #E23F31 var(--progress),
            rgba(255, 255, 255, 0.08) var(--progress)
          );
        }

        .clue-volume {
          background: linear-gradient(
            to right,
            #E23F31 var(--volume),
            rgba(255, 255, 255, 0.08) var(--volume)
          );
        }

        .clue-audio-progress::-webkit-slider-thumb,
        .clue-volume::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #E23F31;
          border: 2px solid #111111;
          box-shadow: 0 0 6px rgba(226, 63, 49, 0.5);
        }

        .clue-audio-progress::-moz-range-thumb,
        .clue-volume::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #E23F31;
          border: 2px solid #111111;
          box-shadow: 0 0 6px rgba(226, 63, 49, 0.5);
        }
      `}</style>
    </div>
  );
};