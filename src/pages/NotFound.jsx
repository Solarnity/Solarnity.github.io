import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import SideRays from "../components/Effects/SideRays";

const NotFound = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A] select-none text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SideRays
          speed={2.5}
          rayColor1="#E23F31"
          rayColor2="#F4889A"
          intensity={2.5}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.4}
          blend={0.7}
          falloff={0.5}
          opacity={0.8}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Página no encontrada</h2>
          <p className="text-sm text-white/50 leading-relaxed font-mono">
            La página que buscas no existe o no tienes permiso para acceder.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-xs font-mono tracking-wider text-white/70 backdrop-blur-md transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white active:scale-95"
            >
              <ArrowLeft
                size={14}
                className="transition-transform duration-300 group-hover:-translate-x-1 text-white"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;