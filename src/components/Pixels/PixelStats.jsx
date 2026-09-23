import React from 'react';

export const PixelStats = ({ colorCount, getColorName }) => {
  const sortedStats = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
  const total = sortedStats.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="mt-5 w-full max-w-[540px] h-[140px] rounded-2xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-xl shadow-xl flex flex-col justify-start">
      <div className="mb-2 flex items-center justify-between border-b border-white/[0.06] pb-1.5 text-xs font-mono shrink-0">
        <span className="uppercase tracking-widest text-white/50">Píxeles</span>
        <span className="text-white/40">{total} coloreados</span>
      </div>

      {sortedStats.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs font-mono text-white/30">
          El lienzo está en blanco
        </div>
      ) : (
        /* Alineación arriba a la izquierda sin deformación */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto content-start items-start pr-1">
          {sortedStats.map(([color, count]) => (
            <div 
              key={color} 
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="h-3 w-3 shrink-0 rounded-sm border border-white/20" 
                  style={{ backgroundColor: color }} 
                />
                <span className="truncate text-xs font-mono text-white/70">
                  {getColorName(color)}
                </span>
              </div>
              <span className="ml-2 font-mono text-xs font-semibold text-white/90 shrink-0">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};