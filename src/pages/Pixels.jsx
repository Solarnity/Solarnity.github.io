import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import LightRays from '../components/Effects/LightRays';
import { PixelToolbar } from '../components/Pixels/PixelToolbar';
import { PixelCanvas } from '../components/Pixels/PixelCanvas';
import { PixelStats } from '../components/Pixels/PixelStats';

const DEFAULT_COLORS = [
  '#ED1C24', '#FF7F27', '#FCD404', '#00B300', '#4CEAEF', '#3C50F0',
  '#6B50F6', '#EC1F80', '#000000', '#444444', '#787878', '#FFFFFF',
];

const COLOR_NAMES = {
  '#ED1C24': 'Rojo',
  '#FF7F27': 'Naranja',
  '#FCD404': 'Amarillo',
  '#00B300': 'Verde',
  '#4CEAEF': 'Cyan',
  '#3C50F0': 'Azul',
  '#6B50F6': 'Morado',
  '#EC1F80': 'Rosa',
  '#000000': 'Negro',
  '#444444': 'Gris',
  '#787878': 'Gris Claro',
  '#FFFFFF': 'Blanco'
};

const Pixels = () => {
  const [gridSize, setGridSize] = useState(16);
  const [gridOpacity, setGridOpacity] = useState(100);
  const [pixels, setPixels] = useState(() => Array(16 * 16).fill('#FFFFFF'));
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [numberingMode, setNumberingMode] = useState('bottom-right');
  const [isDrawing, setIsDrawing] = useState(false);

  const fileInputRef = useRef(null);

  // Redimensionar cuadrícula de forma limpia e instantánea
  const handleGridSizeChange = (newSize) => {
    setPixels((prevPixels) => {
      const nextPixels = Array(newSize * newSize).fill('#FFFFFF');
      const minDimension = Math.min(gridSize, newSize);

      for (let y = 0; y < minDimension; y++) {
        for (let x = 0; x < minDimension; x++) {
          const oldIndex = y * gridSize + x;
          const nextIndex = y * newSize + x;
          nextPixels[nextIndex] = prevPixels[oldIndex] || '#FFFFFF';
        }
      }
      return nextPixels;
    });
    setGridSize(newSize);
  };

  const paintPixel = useCallback((index, overrideColor = null) => {
    setPixels((prev) => {
      const colorToUse = overrideColor ?? (tool === 'eraser' ? '#FFFFFF' : selectedColor);
      if (prev[index] === colorToUse) return prev;
      const copy = [...prev];
      copy[index] = colorToUse;
      return copy;
    });
  }, [tool, selectedColor]);

  useEffect(() => {
    const handlePointerUp = () => setIsDrawing(false);
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  const handlePixelPointerDown = (index, e) => {
    e.preventDefault();
    setIsDrawing(true);
    if (e.button === 2) {
      paintPixel(index, '#FFFFFF');
      return;
    }
    paintPixel(index);
  };

  const handlePixelPointerEnter = (index) => {
    if (isDrawing) {
      paintPixel(index);
    }
  };

  const clearGrid = () => {
    setPixels(Array(gridSize * gridSize).fill('#FFFFFF'));
  };

  const exportDesign = () => {
    const data = {
      app: "Pixels",
      version: "2.0",
      createdAt: new Date().toISOString(),
      gridSize,
      gridOpacity,
      pixels,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pixel-art-${gridSize}x${gridSize}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDesign = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.gridSize && Array.isArray(json.pixels)) {
          const importedSize = Number(json.gridSize);
          setGridSize(importedSize);
          if (json.gridOpacity !== undefined) {
            setGridOpacity(Number(json.gridOpacity));
          }
          setPixels(json.pixels.slice(0, importedSize * importedSize));
        } else {
          alert("Estructura de JSON no compatible");
        }
      } catch {
        alert("Error al leer el archivo JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const triggerImport = () => fileInputRef.current?.click();

  const cycleNumberingMode = () => {
    const modes = ['disabled', 'bottom-right', 'bottom-left', 'top-right', 'top-left'];
    const nextIdx = (modes.indexOf(numberingMode) + 1) % modes.length;
    setNumberingMode(modes[nextIdx]);
  };

  const getNumbersForSide = (side) => {
    if (numberingMode === 'disabled') return [];
    const n = gridSize;
    let list = [];

    if (numberingMode === 'bottom-right') {
      if (side === 'bottom') for (let i = n; i >= 1; i--) list.push(i);
      else if (side === 'left') for (let i = 2 * n - 1; i >= n; i--) list.push(i);
      else if (side === 'top') for (let i = 2 * n - 1; i >= n; i--) list.push(i);
      else if (side === 'right') for (let i = n; i >= 1; i--) list.push(i);
    } else if (numberingMode === 'bottom-left') {
      if (side === 'bottom') for (let i = 1; i <= n; i++) list.push(i);
      else if (side === 'right') for (let i = 2 * n - 1; i >= n; i--) list.push(i);
      else if (side === 'top') for (let i = n; i <= 2 * n - 1; i++) list.push(i);
      else if (side === 'left') for (let i = n; i >= 1; i--) list.push(i);
    } else if (numberingMode === 'top-right') {
      if (side === 'top') for (let i = n; i >= 1; i--) list.push(i);
      else if (side === 'left') for (let i = n; i <= 2 * n - 1; i++) list.push(i);
      else if (side === 'bottom') for (let i = 2 * n - 1; i >= n; i--) list.push(i);
      else if (side === 'right') for (let i = 1; i <= n; i++) list.push(i);
    } else if (numberingMode === 'top-left') {
      if (side === 'top') for (let i = 1; i <= n; i++) list.push(i);
      else if (side === 'right') for (let i = n; i <= 2 * n - 1; i++) list.push(i);
      else if (side === 'bottom') for (let i = n; i <= 2 * n - 1; i++) list.push(i);
      else if (side === 'left') for (let i = 1; i <= n; i++) list.push(i);
    }

    if (n > 24) {
      return list.map((val, idx) => (idx % 2 === 0 ? val : ''));
    }
    return list;
  };

  // Contar píxeles omitiendo el fondo blanco
  const colorCount = pixels.reduce((acc, c) => {
    if (c.toUpperCase() !== '#FFFFFF') acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A] select-none">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.7}
          lightSpread={1.2}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0}
          noiseAmount={0.3}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1.4}
          saturation={1.4}
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-4 sm:px-6 lg:px-8 pt-16 pb-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-mono tracking-wider text-white/60 backdrop-blur-md transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* WORKSPACE: items-stretch para que la columna izquierda y derecha coincidan en altura total */}
        <div className="my-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Columna Izquierda: Toolbox */}
          <div className="col-span-1 h-full">
            <PixelToolbar
              colors={DEFAULT_COLORS}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              tool={tool}
              setTool={setTool}
              gridSize={gridSize}
              setGridSize={handleGridSizeChange}
              gridOpacity={gridOpacity}
              setGridOpacity={setGridOpacity}
              numberingMode={numberingMode}
              cycleNumberingMode={cycleNumberingMode}
              clearGrid={clearGrid}
              exportDesign={exportDesign}
              triggerImport={triggerImport}
              fileInputRef={fileInputRef}
              importDesign={importDesign}
            />
          </div>

          {/* Columna Derecha: Canvas + Stats */}
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-between w-full h-full">
            <PixelCanvas
              gridSize={gridSize}
              gridOpacity={gridOpacity}
              pixels={pixels}
              numberingMode={numberingMode}
              leftNumbers={getNumbersForSide('left')}
              rightNumbers={getNumbersForSide('right')}
              topNumbers={getNumbersForSide('top')}
              bottomNumbers={getNumbersForSide('bottom')}
              onPixelPointerDown={handlePixelPointerDown}
              onPixelPointerEnter={handlePixelPointerEnter}
            />

            <PixelStats 
              colorCount={colorCount} 
              getColorName={(hex) => COLOR_NAMES[hex] || hex} 
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 w-full pt-4 border-t border-white/[0.04] text-[#555555] text-xs font-mono text-center">
          <p>PLGNM • {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
};

export default Pixels;