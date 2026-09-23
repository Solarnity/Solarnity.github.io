import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Check,
  Play,
  Pause,
  Video,
} from "lucide-react";
import { defaultClues } from "../../data/clues";

const playNavSound = () => {
  const audio = new Audio("/sounds/navClick.mp3");
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

const CustomAudioPlayer = ({ src }) => {
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

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E23F31]/20 bg-[#E23F31]/10">
          <Volume2 className="h-5 w-5 text-[#E23F31]" />
        </div>
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

export const CluesScreen = ({
  clues = defaultClues,
  unlocked = [],
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
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
            <div className="mb-2 flex items-center gap-2">
              {isResolved && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">
                  <Check size={10} />
                  RESUELTO
                </span>
              )}
            </div>

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
              <div className="relative max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-black p-2">
                <img
                  src={content}
                  alt={title || `Clue ${id}`}
                  className="max-h-[420px] w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {type === "audio" && content && <CustomAudioPlayer src={content} />}

            {type === "video" && content && (
              <CustomVideoPlayer src={content} title={title} />
            )}

            {hint && (
              <span className="mt-5 font-mono text-[11px] tracking-wide text-white/30">
                PISTA: {hint}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

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