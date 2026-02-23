import SmokeBackground from "../effects/SmokeBackground";
import { Link } from "react-router";
import { HomeIcon } from 'lucide-react';

const Secret = () => {
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
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center">
              <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/G_XeW7P-1hs" title="jarvis pedilo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
            <div className="flex items-center justify-center mt-4">
              <Link to="/" className="btn glass text-almond">
                <HomeIcon className="w-5 h-5"/>
              </Link>
            </div>
          </div>
        </div>

        
      </div>
    </>
  );
};

export default Secret;