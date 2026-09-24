import React, { useState } from "react";
import { 
  View,
  Eye,
  ArrowUpFromLine,
  CircleCheckBig,
  CircleX,
  Repeat2,
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { hashString, CODE_HASHES } from "../../utils/argSec";

const SOUNDS = {
  navClick: "/sounds/navClick.mp3",
  dullHit: "/sounds/dullHit.mp3",
  counter: "/sounds/counter.mp3",
};

const playSound = (src) => {
  try {
    const audio = new Audio(src);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    /* noop */
  }
};

const TOTAL_CODES = 9;

export const TerminalScreen = ({ unlocked = [], onUnlockSuccess, onGoToProgress }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [lastFound, setLastFound] = useState(null);
  const buttonControls = useAnimation();

  const allCompleted = unlocked.length >= TOTAL_CODES;

  const shake = () =>
    buttonControls.start({
      x: [0, -7, 7, -7, 7, -4, 4, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });

  const pop = () =>
    buttonControls.start({
      scale: [1, 1.18, 1],
      transition: { duration: 0.45, ease: "easeInOut" },
    });

  const handleValidate = async () => {
    if (!code.trim() || status === "success" || allCompleted) return;

    playSound(SOUNDS.navClick);

    const hash = await hashString(code);

    let matchedId = null;
    for (const [id, targetHash] of Object.entries(CODE_HASHES)) {
      if (targetHash === hash) {
        matchedId = Number(id);
        break;
      }
    }

    if (matchedId) {
      if (unlocked.includes(matchedId)) {
        setStatus("already");
        setLastFound(matchedId);
        playSound(SOUNDS.counter);
        shake();
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        const isFinalCode = unlocked.length + 1 >= TOTAL_CODES;
        setLastFound(matchedId);
        onUnlockSuccess(matchedId, isFinalCode);
        setCode("");
        pop();
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } else {
      setStatus("error");
      playSound(SOUNDS.dullHit);
      shake();
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleValidate();
    }
  };

  const isSuccess = status === "success";
  const isAlready = status === "already";
  const isError = status === "error";
  const isFailed = isAlready || isError;

  const validateButtonClass = [
    "flex h-12 w-16 items-center justify-center rounded-lg",
    "transition-colors duration-300 select-none",
    isSuccess && "bg-[#FFD800] text-black cursor-pointer shadow-[0_0_18px_rgba(255,216,0,0.5)]",
    isFailed && "bg-white/20 text-white/70 cursor-pointer",
    !isSuccess && !isFailed &&
      "bg-[#E23F31] text-white hover:bg-[#ff4e3e] cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");

  const ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9!@#$%^&*:;.,?¿\-_=]/g;

  const sanitizeCode = (value) => value.replace(ALLOWED_CHARS_REGEX, "");

  const renderIcon = () => {
    if (isSuccess) return <CircleCheckBig size={22} strokeWidth={2.5} />;
    if (isAlready) return <Repeat2 size={22} strokeWidth={2.5} />;
    if (isError) return <CircleX size={22} strokeWidth={2.5} />;
    return <ArrowUpFromLine size={22} strokeWidth={2.5} />;
  };

  const handleGoToProgress = () => {
    playSound(SOUNDS.navClick);
    onGoToProgress?.();
  };

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/95 p-6 shadow-2xl">
      <div className="my-auto flex flex-col items-center text-center py-6">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
          <View size={26} className="text-[#E23F31]" />
        </div>

        <h3 className="mb-2 font-mono text-xl font-bold tracking-widest text-white uppercase">
          Digital Remains
        </h3>
        <p className="mb-6 max-w-sm font-mono text-xs text-white/40 leading-relaxed">
          Introduce cualquier secuencia alfanumérica obtenida en los archivos.
        </p>

        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <div className="relative w-full">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(sanitizeCode(e.target.value))}
              onKeyDown={handleKeyDown}
              placeholder="..."
              disabled={allCompleted}
              maxLength={48}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 px-4 text-center font-mono text-sm uppercase tracking-widest text-white placeholder-white/20 outline-none transition-all focus:border-[#E23F31] focus:bg-white/[0.06] focus:shadow-[0_0_15px_rgba(226,63,49,0.2)] disabled:opacity-50"
            />
          </div>

          {!allCompleted ? (
            <motion.button
              type="button"
              onClick={handleValidate}
              animate={buttonControls}
              className={validateButtonClass}
              aria-label="Validar código"
            >
              {renderIcon()}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleGoToProgress}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="Ir a la matriz de progreso"
              className="flex h-12 w-16 items-center justify-center rounded-lg border border-[#E23F31]/50 bg-[#E23F31]/20 text-white shadow-[0_0_15px_rgba(226,63,49,0.4)] hover:bg-[#E23F31]/30 transition-colors cursor-pointer"
            >
              <Eye size={22} className="text-[#E23F31]" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-3 font-mono text-[10px] text-white/30 flex justify-between">
        <span>✿</span>
        <span>{unlocked.length}/9</span>
      </div>
    </div>
  );
};