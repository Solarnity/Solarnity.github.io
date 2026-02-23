import SmokeBackground from "../effects/SmokeBackground";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <>
      {/* Fondo de humo y texto */}
      <div className="fixed inset-0 w-lvw h-lvh z-0 pointer-events-none crt-effect">
        <div className="fixed md:hidden">
          <SmokeBackground
            fadeInOut={true}
            minOpacity={0.2}
            maxOpacity={0.5}
            numParticles={8}
            direction="left"
            origin="right"
            movementIntensity={7}
          />
        </div>
        
        <div className="hidden md:block">
          <SmokeBackground
            fadeInOut={true}
            minOpacity={0.2}
            maxOpacity={0.5}
            numParticles={35}
            direction="left"
            origin="right"
            movementIntensity={10}
          />
        </div>
        

        {/* Efecto de grano */}
        <img className="fixed overflow-hidden top-0 bottom-0 left-0 right-0 h-lvh w-lvw pointer-events-none z-10 mix-blend-color-dodge opacity-20" alt="background texture" src="/grunge.jpg" />
      </div>

      <div className="w-full h-full text-almond relative">

        {/* Contenedor principal centrado */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">Página no encontrada</h2>
            <p className="opacity-90">La página que buscas no existe o no tienes permiso para acceder.</p>
            <Link to="/" className="btn glass text-almond mt-6">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;