import { useState, useRef, useEffect } from "react";
import { BorderGlowCard } from "../Effects/BorderGlowCard";
import { Check, ShieldAlert } from "lucide-react";

const CODE_LENGTH = 4;

const EE_AUTH_MAP = {
  "4e67c080014aa6295aa33d2b53b259e94999e7cbffd9da06bf4c6b45e593d877": "/secret",
  "411b255e8c928b62eb7725b2ce97c600699944a1353e4bc895024cd08c7bc49d": "/digitalremains",
  "152e69cf3c8e76c8d8b0aed924ddd1708e4c68624611af33d52c2c2814dd5df9": "/infernalized",
};

const verifyEECodeSHA256 = async (codeStr) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeStr);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return EE_AUTH_MAP[hashHex] || null;
  } catch {
    return null;
  }
};

export const EEAuthCard = ({
  isCurrent,
  onSuccess,
  eeSound = "/sounds/magicClick.mp3",
  eeRedirectDelay = 1000,
}) => {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState("idle");
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isCurrent && status === "idle") {
      inputsRef.current[0]?.focus();
    }
  }, [isCurrent, status]);

  const handleChange = (index, value) => {
    if (status === "success") return;
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (status === "success") return;

    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (e.key === "Enter") {
      handleValidate(digits.join(""));
    }
  };

  const handlePaste = (e) => {
    if (status === "success") return;
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < CODE_LENGTH; i++) {
      newDigits[i] = pasteData[i] || "";
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, CODE_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();

    if (pasteData.length === CODE_LENGTH) {
      handleValidate(pasteData);
    }
  };

  const handleValidate = async (candidateCode = digits.join("")) => {
    if (candidateCode.length < CODE_LENGTH || status === "success") return;

    const targetRoute = await verifyEECodeSHA256(candidateCode);

    if (targetRoute) {
      setStatus("success");
      const audio = new Audio(eeSound);
      audio.currentTime = 0;
      audio.play().catch(() => {});

      setTimeout(() => {
        onSuccess?.(targetRoute);
      }, eeRedirectDelay);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1200);
    }
  };

  return (
    <BorderGlowCard
      glowColor={
        status === "success"
          ? "#22c55e"
          : status === "error"
          ? "#ef4444"
          : isCurrent
          ? "#3b82f6"
          : "rgba(255,255,255,0.12)"
      }
      className="h-[360px] w-full select-none [backface-visibility:hidden]"
    >
      <div className="relative z-10 flex h-full flex-col justify-between p-7 text-center">
        <div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Autenticación
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Introduce el código de verificación
          </p>
        </div>

        <div className="my-auto flex justify-center gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={status === "success"}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onClick={(e) => e.stopPropagation()}
              data-no-drag
              className={`h-14 w-12 rounded-xl border text-center text-lg font-mono font-bold outline-none transition-all duration-300
                ${
                  status === "success"
                    ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
                    : status === "error"
                    ? "border-rose-500/60 bg-rose-950/30 text-rose-300"
                    : "border-white/10 bg-white/5 text-white focus:border-blue-500 focus:bg-blue-500/10 focus:shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                }
              `}
            />
          ))}
        </div>

        <button
          type="button"
          data-no-drag
          disabled={status === "success" || digits.join("").length < CODE_LENGTH}
          onClick={(e) => {
            e.stopPropagation();
            handleValidate();
          }}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-500
            ${
              status === "success"
                ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                : status === "error"
                ? "bg-rose-500/80 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            }
          `}
        >
          {status === "success" ? (
            <>
              <Check size={18} /> Verificado
            </>
          ) : status === "error" ? (
            <>
              <ShieldAlert size={18} /> Código Incorrecto
            </>
          ) : (
            "Confirmar"
          )}
        </button>
      </div>
    </BorderGlowCard>
  );
};