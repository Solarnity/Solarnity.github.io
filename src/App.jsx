import React, { useState, useEffect } from "react";
import { Link, BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Layers, Blocks, HomeIcon, Folder, Lock, Image, Hexagon, Calculator, FileQuestionMarkIcon } from 'lucide-react';

import LPC from "./pages/LPC";
import Pixels from "./pages/Pixels";
import Terminal from "./pages/Terminal";
import NotFound from "./pages/NotFound";
import Cuestionario from "./pages/Cuestionario";
import CalculoMental from "./pages/CalculoMental";
import Secret from "./pages/Secret";

import SmokeBackground from "./effects/SmokeBackground";

// Lista de navegación
const navItems = [
  {
    title: 'Inicio',
    id: 'inicio',
    icon: <HomeIcon size={24} />,
    blocked: true,
  },
  {
    title: 'Proyectos',
    id: 'proyectos',
    icon: <Folder size={24} />,
    blocked: false,
  },
  {
    title: 'osámktky',
    id: 'images',
    icon: <Image size={24} />,
    blocked: true,
  },
  {
    title: 'otlkxtay',
    id: 'infernus',
    icon: <Hexagon size={24} />,
    blocked: true,
  },
];

// Lista de aplicaciones
const appRoutes = [
  {
    title: 'LPC',
    route: '/lpc',
    icon: <Layers />,
    status: 'v1.0',
    description: 'Creador de Listening Parties',
    blocked: false,
  },
  {
    title: 'Pixels',
    route: '/pixels',
    icon: <Blocks />,
    status: 'v1.0',
    description: 'Pinta en una cuadrícula de píxeles',
    blocked: false,
  },
  {
    title: 'Cuestionario',
    route: '/cuestionario',
    icon: <FileQuestionMarkIcon />,
    status: 'v1.0',
    description: 'Importa tus preguntas y respuestas para practicar',
    blocked: false,
  },
  {
    title: 'Cálculo Mental',
    route: '/calculo',
    icon: <Calculator />,
    status: 'v1.0',
    description: 'Ejercita tu mente con operaciones matemáticas',
    blocked: false,
  },
  {
    title: '???',
    route: '',
    icon: <Hexagon />,
    status: 'Pendiente',
    description: '-',
    blocked: true,
  }
];

// Componente principal de la página de inicio
function Home() {
  const [activeTab, setActiveTab] = useState('proyectos');

  const handleNavClick = (item) => {
    if (!item.blocked) {
      setActiveTab(item.id);
    }
  };

  return (
    <>
      {/* Fondo de humo y texto */}
      <div className="fixed inset-0 w-lvw h-lvh z-0 pointer-events-none">
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

      <div className="w-full h-full text-almond relative crt-effect">
        
        {/* Logo */}
        <div className="flex items-center justify-center p-10 md:p-20">
            <span className="text-2xl font-bold text-almond">
              <img src="/Flower.ico" className="inline h-35 w-35 md:h-50 md:w-50 mr-2 -mt-1 animate-spin [animation-duration:20s]" alt="logo" />
            </span>
        </div>

        {/* Barra de navegación con espacio a los lados */}
        <div className="flex justify-center px-4 md:px-10 lg:px-40 xl:px-60 2xl:px-80 mb-8">
          <div className="navbar p-2 w-full max-w-6xl relative">
            <div className="flex justify-around w-full">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  className={`flex flex-col items-center px-2 py-1 md:px-4 md:py-2 rounded-md transition-all duration-300 relative ${
                    activeTab === item.id 
                      ? 'bg-almond/90 text-chestnut' 
                      : item.blocked
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-almond/25'
                  }`}
                  onClick={() => handleNavClick(item)}
                  disabled={item.blocked}
                >
                  {item.icon}
                  <span className="text-xs md:text-sm font-semibold mt-1">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido dinámico */}
        <div className="flex flex-col items-center px-4 md:px-10 lg:px-20 xl:px-40 2xl:px-60 pb-10">
          <div className="w-full max-w-6xl">
            {activeTab === 'proyectos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appRoutes.map(app => (
                  <Link
                    key={app.route}
                    to={app.route}
                    className={`bg-almond/10 backdrop-blur-sm rounded-md p-8 transition-all duration-500 ${
                      app.blocked 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:scale-[1.005] hover:shadow-xl hover:backdrop-blur-xl hover:bg-almond/15 hover:cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="p-3 rounded-lg bg-almond/20 mb-4">
                        {app.icon}
                      </div>
                      <h2 className="text-xl font-bold mb-2">{app.title}</h2>
                      <p className="opacity-90 mb-3">{app.description}</p>
                      {app.status && (
                        <div className="badge badge-sm badge-outline rounded px-2 py-1">
                          {app.status}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Contenido para la pestaña de Inicio */}
            {activeTab === 'inicio' && (
              <div className="bg-almond/10 backdrop-blur-sm rounded-md p-8 text-center">
                <div className="flex flex-col items-center">
                  <HomeIcon size={48} className="mb-4 text-almond" />
                  <h2 className="text-2xl font-bold mb-4">Bienvenido a la Colección de Aplicaciones</h2>
                  <p className="text-lg mb-6">Selecciona "Proyectos" para explorar las aplicaciones disponibles.</p>
                  <button 
                    className="px-6 py-3 bg-almond/20 hover:bg-almond/30 rounded-lg transition-colors"
                    onClick={() => setActiveTab('proyectos')}
                  >
                    Ver Proyectos
                  </button>
                </div>
              </div>
            )}
            
            {/* Contenido para otras pestañas bloqueadas */}
            {(activeTab === 'images' || activeTab === 'infernus' || activeTab === 'about') && (
              <div className="bg-almond/10 backdrop-blur-sm rounded-md p-8 text-center">
                <div className="flex flex-col items-center">
                  <Lock size={48} className="mb-4 text-chestnut/70" />
                  <h2 className="text-2xl font-bold mb-4">Contenido Bloqueado</h2>
                  <button 
                    className="px-6 py-3 bg-almond/20 hover:bg-almond/30 rounded-lg transition-colors"
                    onClick={() => setActiveTab('proyectos')}
                  >
                    Volver a Proyectos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': '< 🎕 >',
      '/lpc': 'LPC',
      '/pixels': 'Pixels',
      '/plrgnm': '- 🎕 -',
      '/cuestionario': 'Cuestionario',
      '/calculo': 'Cálculo Mental',
      '/secret': '???',
    };

    // Aplicamos el título o uno por defecto si no existe en la lista
    document.title = titles[location.pathname] || '< 🎕 >';
  }, [location]);

  return null;
};

function App() {
  return (
    <BrowserRouter basename="/">
      <TitleManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lpc" element={<LPC />} />
        <Route path="/pixels" element={<Pixels />} />
        <Route path="/plrgnm" element={<Terminal />} />
        <Route path="/cuestionario" element={<Cuestionario />} />
        <Route path="/calculo" element={<CalculoMental />} />
        <Route path="/secret" element={<Secret />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;