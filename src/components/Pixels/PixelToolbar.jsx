import React from 'react';
import { 
  Brush, 
  Eraser, 
  Trash, 
  FileDown, 
  FileUp, 
  MoveDownRight, 
  MoveDownLeft, 
  MoveUpRight, 
  MoveUpLeft 
} from 'lucide-react';

export const PixelToolbar = ({
  colors,
  selectedColor,
  setSelectedColor,
  tool,
  setTool,
  gridSize,
  setGridSize,
  gridOpacity,
  setGridOpacity,
  numberingMode,
  cycleNumberingMode,
  clearGrid,
  exportDesign,
  triggerImport,
  fileInputRef,
  importDesign
}) => {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col gap-4">
        {/* Selector de resolución */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono tracking-wider text-white/60">
            <span className="uppercase">Resolución</span>
            <span className="rounded bg-white/[0.06] px-2 py-0.5 text-white/90">
              {gridSize} × {gridSize}
            </span>
          </div>
          <input 
            type="range" 
            min="8" 
            max="32" 
            value={gridSize} 
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-white"
          />
          <div className="flex justify-between text-[10px] font-mono text-white/30">
            <span>8</span>
            <span>16</span>
            <span>24</span>
            <span>32</span>
          </div>
        </div>

        {/* Opacidad de líneas (Solo Slider, sin input numérico) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono tracking-wider text-white/60">
            <span className="uppercase">Opacidad Cuadrícula</span>
            <span className="text-[11px] font-mono text-white/60">{gridOpacity}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={gridOpacity} 
            onChange={(e) => setGridOpacity(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-white"
          />
        </div>

        {/* Herramientas */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-white/60">Herramienta</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTool('pencil')}
              className={`flex h-9 items-center justify-center gap-2 rounded-xl border text-xs font-medium transition-all duration-200 ${
                tool === 'pencil'
                  ? 'border-white/40 bg-white/15 text-white shadow-[0_0_15px_rgba(226,63,49,0.15)]'
                  : 'border-white/[0.06] bg-white/[0.03] text-white/60 hover:border-white/[0.12] hover:text-white'
              }`}
            >
              <Brush size={15} />
              <span>Pincel</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`flex h-9 items-center justify-center gap-2 rounded-xl border text-xs font-medium transition-all duration-200 ${
                tool === 'eraser'
                  ? 'border-white/40 bg-white/15 text-white shadow-[0_0_15px_rgba(226,63,49,0.15)]'
                  : 'border-white/[0.06] bg-white/[0.03] text-white/60 hover:border-white/[0.12] hover:text-white'
              }`}
            >
              <Eraser size={15} />
              <span>Goma</span>
            </button>
          </div>
        </div>

        {/* Paleta de colores */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-white/60">Paleta</span>
          <div className="grid grid-cols-6 gap-1.5">
            {colors.map((color, index) => {
              const isSelected = selectedColor === color && tool === 'pencil';
              return (
                <button
                  key={index}
                  type="button"
                  className={`relative aspect-square w-full rounded-lg border transition-all duration-150 ${
                    isSelected 
                      ? 'scale-110 border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] z-10' 
                      : 'border-white/10 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    setTool('pencil');
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Orientación de Coordenadas */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-white/60">Coordenadas</span>
          <button 
            type="button"
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] text-xs font-mono tracking-wider text-white/80 transition-all hover:border-white/[0.14] hover:bg-white/[0.06] active:scale-[0.98]"
            onClick={cycleNumberingMode}
          >
            {numberingMode === 'disabled' && <span>Desactivada</span>}
            {numberingMode === 'bottom-right' && (
              <>
                <MoveDownRight size={14} className="text-white" />
                <span>Inferior-Derecha</span>
              </>
            )}
            {numberingMode === 'bottom-left' && (
              <>
                <MoveDownLeft size={14} className="text-white" />
                <span>Inferior-Izquierda</span>
              </>
            )}
            {numberingMode === 'top-right' && (
              <>
                <MoveUpRight size={14} className="text-white" />
                <span>Superior-Derecha</span>
              </>
            )}
            {numberingMode === 'top-left' && (
              <>
                <MoveUpLeft size={14} className="text-white" />
                <span>Superior-Izquierda</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Operaciones de Archivo al fondo de la columna */}
      <div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/[0.06]">
        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button"
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-xs font-mono text-white/70 transition-all hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
            onClick={exportDesign}
          >
            <FileDown size={14} />
            <span>Exportar</span>
          </button>
          
          <button 
            type="button"
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-xs font-mono text-white/70 transition-all hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
            onClick={triggerImport}
          >
            <FileUp size={14} />
            <span>Importar</span>
          </button>
        </div>

        <button 
          type="button"
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs font-mono text-rose-300 transition-all hover:border-rose-500/35 hover:bg-rose-500/10 active:scale-[0.98]"
          onClick={clearGrid}
        >
          <Trash size={14} />
          <span>Limpiar</span>
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={importDesign} 
          accept=".json" 
          className="hidden" 
        />
      </div>
    </div>
  );
};