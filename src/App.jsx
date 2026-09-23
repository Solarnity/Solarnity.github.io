import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import {
  Layers,
  Blocks,
  FileQuestionMarkIcon,
  Calculator,
  TerminalSquare,
  Radio,
  Binary,
} from "lucide-react";

import { Navbar } from "./components/Navigation/Navbar";
import SideRays from "./components/Effects/SideRays";
import { CardWheel } from "./components/Home/CardWheel";

const LPC = lazy(() => import("./pages/LPC"));
const Pixels = lazy(() => import("./pages/Pixels"));
const Terminal = lazy(() => import("./pages/Terminal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Cuestionario = lazy(() => import("./pages/Cuestionario"));
const CalculoMental = lazy(() => import("./pages/CalculoMental"));
const Secret = lazy(() => import("./pages/Secret"));
const Digital = lazy(() => import("./pages/Digital"));

const APP_ROUTES = [
  {
    name: "LPC",
    title: "LPC",
    path: "/lpc",
    route: "/lpc",
    hidden: false,
    icon: <Layers size={24} />,
    description:
      "Listening Party Creator y sincronizador de letras LRC en tiempo real con extracción de metadatos.",
    element: <LPC />,
  },
  {
    name: "Píxeles",
    title: "Píxeles",
    path: "/pixels",
    route: "/pixels",
    hidden: false,
    tag: "2.0",
    icon: <Blocks size={24} />,
    description:
      "Estudio de pixel art minimalista con lienzo configurable, modos de numeración y conteo de paleta.",
    element: <Pixels />,
  },
  {
    name: "Quiz",
    title: "Quiz",
    path: "/cuestionario",
    route: "/cuestionario",
    hidden: false,
    icon: <FileQuestionMarkIcon size={24} />,
    description:
      "Generador dinámico de cuestionarios técnicos con soporte para fórmulas en KaTeX y bloques de código.",
    element: <Cuestionario />,
  },
  {
    name: "Números",
    title: "Números",
    path: "/calculo",
    route: "/calculo",
    hidden: false,
    icon: <Calculator size={24} />,
    description:
      "Entrenamiento de agilidad matemática contrarreloj con dificultad adaptativa y estadísticas por sesión.",
    element: <CalculoMental />,
  },
  {
    name: "Terminal",
    title: "Terminal",
    path: "/plrgnm",
    route: "/plrgnm",
    hidden: true,
    tag: "???",
    icon: <TerminalSquare size={24} />,
    description:
      "ZW5jdWVudHJhIG1pIGljZWJlcmc=",
    element: <Terminal />,
  },
  {
    name: "???",
    title: "???",
    path: "/secret",
    route: "/secret",
    hidden: true,
    tag: "???",
    icon: <Radio size={24} />,
    description: "10 1 18 22 9 19 16 5 4 9 12 15",
    element: <Secret />,
  },
  {
    name: "Digital Remains",
    title: "Digital Remains",
    path: "/digitalremains",
    route: "/digitalremains",
    hidden: true,
    tag: "???",
    icon: <Binary size={24} />,
    description: "15398642_14",
    element: <Digital />,
  },
];

export function HomePage() {
  const visibleApps = APP_ROUTES.filter((item) => !item.hidden);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A]">
      {/* Fondo de rayos */}
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

      {/* Contenedor principal compensando la altura de la Navbar (pt-12) */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        
        {/* Espacio central: centrado vertical y horizontal perfecto */}
        <div className="my-auto flex flex-1 flex-col items-center justify-center w-full py-4">
          <div className="w-full">
            <CardWheel
              items={visibleApps}
              visibleCards={4}
              loop={true}
              defaultSelected={0}
            />
          </div>

          {/* Texto de instrucción posicionado directamente debajo de la rueda */}
          <div className="mt-6 text-center max-w-xl mx-auto px-4">
            <p className="text-xs sm:text-sm text-[#8E8E8E] leading-relaxed select-none">
              Gira o arrastra para explorar los proyectos.
              <br />
              Haz clic sobre la tarjeta centrada para acceder.
            </p>
          </div>
        </div>

        {/* Footer fijo al final */}
        <footer className="w-full pt-4 border-t border-white/[0.04] text-[#555555] text-xs font-mono text-center">
          <p>PLGNM • {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const currentRoute = APP_ROUTES.find(
      (r) => r.path === location.pathname
    );

    document.title = currentRoute
      ? `${currentRoute.name}`
      : "PLGNM";
  }, [location]);

  return null;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-white">
    <div className="w-6 h-6 border-2 border-[#E23F31] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter basename="/">
      <TitleManager />

      <Navbar routesConfig={APP_ROUTES} />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {APP_ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}