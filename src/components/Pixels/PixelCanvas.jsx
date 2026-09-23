import React from 'react';

export const PixelCanvas = ({
  gridSize,
  pixels,
  numberingMode,
  gridOpacity, // 0 a 100
  leftNumbers,
  rightNumbers,
  topNumbers,
  bottomNumbers,
  onPixelPointerDown,
  onPixelPointerEnter,
}) => {
  const showRulers = numberingMode !== 'disabled';
  const lineOpacityRatio = (gridOpacity / 100).toFixed(2);

  return (
    <div className="relative flex aspect-square w-full max-w-[540px] items-center justify-center rounded-2xl border border-white/[0.08] bg-black/40 p-3 sm:p-5 backdrop-blur-xl shadow-2xl select-none">
      {/* Grilla estructural fija: las columnas de reglas (1.5rem) existen siempre para que el canvas no cambie de tamaño */}
      <div 
        className="relative grid aspect-square w-full h-full p-1"
        style={{
          gridTemplateColumns: '1.5rem 1fr 1.5rem',
          gridTemplateRows: '1.5rem 1fr 1.5rem',
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* ================= FILA SUPERIOR ================= */}
        <div className="w-full h-full" />
        <div 
          className={`grid w-full h-full font-mono text-[9px] sm:text-[10px] text-white/40 items-center justify-items-center transition-opacity duration-200 ${
            showRulers ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {topNumbers.map((num, i) => (
            <span key={`top-${i}`} className="truncate leading-none">
              {num}
            </span>
          ))}
        </div>
        <div className="w-full h-full" />

        {/* ================= FILA CENTRAL ================= */}
        <div 
          className={`grid h-full w-full font-mono text-[9px] sm:text-[10px] text-white/40 items-center justify-items-center transition-opacity duration-200 ${
            showRulers ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ gridTemplateRows: `repeat(${gridSize}, 1fr)` }}
        >
          {leftNumbers.map((num, i) => (
            <span key={`left-${i}`} className="truncate leading-none">
              {num}
            </span>
          ))}
        </div>

        {/* CONTENEDOR DEL CANVAS (FONDO BLANCO BASE PARA EVITAR SUBPIXEL BLACK LINES) */}
        <div className="relative aspect-square w-full h-full overflow-hidden bg-white border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8)] touch-none cursor-crosshair">
          {/* Matriz de píxeles sin transiciones para eliminar el lag visual al redimensionar */}
          <div 
            className="grid aspect-square w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {pixels.map((color, index) => (
              <div
                key={index}
                className="w-full h-full"
                style={{ backgroundColor: color }}
                onPointerDown={(e) => onPixelPointerDown(index, e)}
                onPointerEnter={() => onPixelPointerEnter(index)}
              />
            ))}
          </div>

          {/* CUADRÍCULA CON MIX-BLEND-MODE DIFFERENCE: SIEMPRE VISIBLE EN FONDOS BLANCOS Y OSCUROS */}
          {gridOpacity > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-difference"
              style={{
                opacity: lineOpacityRatio,
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: `calc(100% / ${gridSize}) calc(100% / ${gridSize})`,
              }}
            />
          )}
        </div>

        <div 
          className={`grid h-full w-full font-mono text-[9px] sm:text-[10px] text-white/40 items-center justify-items-center transition-opacity duration-200 ${
            showRulers ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ gridTemplateRows: `repeat(${gridSize}, 1fr)` }}
        >
          {rightNumbers.map((num, i) => (
            <span key={`right-${i}`} className="truncate leading-none">
              {num}
            </span>
          ))}
        </div>

        {/* ================= FILA INFERIOR ================= */}
        <div className="w-full h-full" />
        <div 
          className={`grid w-full h-full font-mono text-[9px] sm:text-[10px] text-white/40 items-center justify-items-center transition-opacity duration-200 ${
            showRulers ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {bottomNumbers.map((num, i) => (
            <span key={`bottom-${i}`} className="truncate leading-none">
              {num}
            </span>
          ))}
        </div>
        <div className="w-full h-full" />
      </div>
    </div>
  );
};