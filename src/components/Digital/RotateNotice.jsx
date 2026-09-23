import React from "react";
import { RotateCw } from "lucide-react";

export const RotateNotice = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-6 text-center portrait:flex landscape:hidden">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <RotateCw className="h-10 w-10 text-[#E23F31] animate-spin" style={{ animationDuration: "3s" }} />
      </div>
      <h2 className="font-mono text-base font-bold tracking-widest text-white uppercase mb-2">
        ORIENTACIÓN REQUERIDA
      </h2>
      <p className="max-w-xs font-mono text-xs text-white/50 leading-relaxed">
        Gira tu dispositivo a posición horizontal para acceder a la terminal de descifrado.
      </p>
    </div>
  );
};