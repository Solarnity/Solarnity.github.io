import { SITE_VERSION_LABEL } from "../version";
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
    tag: "NUEVO",
    icon: <Layers size={24} />,
    description:
      "Creador de Listening Party, reproduce música y sincroniza la letra en tiempo real con extracción de metadatos.",
    element: <LPC />,
  },
  {
    name: "Píxeles",
    title: "Píxeles",
    path: "/pixels",
    route: "/pixels",
    hidden: false,
    icon: <Blocks size={24} />,
    description:
      "Haz pixel arts con lienzo configurable, modos de numeración y conteo de colores.",
    element: <Pixels />,
  },
  {
    name: "Quiz",
    title: "Quiz",
    path: "/cuestionario",
    route: "/cuestionario",
    hidden: false,
    tag: "NUEVO",
    icon: <FileQuestionMarkIcon size={24} />,
    description:
      "Crea cuestionarios para repasar contenidos, tiene soporte para fórmulas en KaTeX y bloques de código.",
    element: <Cuestionario />,
  },
  {
    name: "Números",
    title: "Números",
    path: "/calculo",
    route: "/calculo",
    hidden: false,
    tag: "NUEVO",
    icon: <Calculator size={24} />,
    description:
      "Entrenamiento de agilidad matemática a contrarreloj con dificultad adaptativa.",
    element: <CalculoMental />,
  },
  {
    name: "Terminal",
    title: "Terminal",
    path: "/infernalized",
    route: "/infernalized",
    hidden: true,
    tag: "???",
    icon: <TerminalSquare size={24} />,
    description:
      "El neón es un elemento químico de número atómico 10, símbolo Ne y de masa atómica 20,1797.",
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
    description:
      "Take excessive measures in attempting to correct or make amends for an error, weakness, or problem.",
    element: <Digital />,
  },
];

export function HomePage() {
  const visibleApps = APP_ROUTES.filter((item) => !item.hidden);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0A0A0A]">
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

      <main className="relative z-10 mx-auto flex h-full min-h-0 max-w-7xl flex-col justify-between px-4 sm:px-6 lg:px-8 pt-12 pb-3 sm:pb-6">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center w-full py-2 sm:py-4">
          <div className="w-full">
            <CardWheel
              items={visibleApps}
              visibleCards={4}
              loop={true}
              defaultSelected={0}
            />
          </div>
        </div>

        <footer className="w-full pt-3 sm:pt-4 border-t border-white/[0.04] text-[#555555] text-xs font-mono text-center">
          <p>
            PLGNM • {SITE_VERSION_LABEL}
          </p>
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
  <div className="min-h-[100dvh] flex items-center justify-center text-white">
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