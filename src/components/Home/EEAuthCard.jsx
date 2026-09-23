import { useState, useRef, useEffect } from "react";
import { BorderGlowCard } from "../Effects/BorderGlowCard";
import { Check, ShieldAlert } from "lucide-react";

// SHA-256 de "018450"
const EE_TARGET_SHA256 = "c8b32b5e976009e2506b08a8cd88b0bdf69a8f0d7b8588569cb55f427ce7afb5";

const verifyEECodeSHA256 = async (codeStr) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeStr);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex === EE_TARGET_SHA256;
  } catch {
    return false;
  }
};

export const EEAuthCard = ({
  isCurrent,
  onSuccess,
  eeSound = "/sounds/magicClick.mp3",
  eeRedirectDelay = 1000,
}) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle"); // "idle" | "success" | "error"
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

    if (cleanVal && index < 5) {
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
    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    if (e.key === "Enter") {
      handleValidate(digits.join(""));
    }
  };

  const handlePaste = (e) => {
    if (status === "success") return;
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || "";
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, 5);
    inputsRef.current[nextIndex]?.focus();

    if (pasteData.length === 6) {
      handleValidate(pasteData);
    }
  };

  const handleValidate = async (candidateCode = digits.join("")) => {
    if (candidateCode.length < 6 || status === "success") return;

    const isValid = await verifyEECodeSHA256(candidateCode);

    if (isValid) {
      setStatus("success");
      const audio = new Audio(eeSound);
      audio.currentTime = 0;
      audio.play().catch(() => {});

      setTimeout(() => {
        onSuccess?.();
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

        {/* 6 inputs OTP */}
        <div className="my-auto flex justify-center gap-2">
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
              className={`h-12 w-10 rounded-xl border text-center text-lg font-mono font-bold outline-none transition-all duration-300
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
          disabled={status === "success" || digits.join("").length < 6}
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