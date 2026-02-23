import React, { useState } from 'react';
import { Link, Routes, Route } from "react-router";
import { DATA } from '../data/terminalData';
import { VigenereCipher } from '../effects/VigenereCipher';

const Terminal = () => {
  const [secretKey, setSecretKey] = useState("...");
  const [selLevel, setSelLevel] = useState(null);
  const [spoilerRevealed, setSpoilerRevealed] = useState({});

  const formatValue = (value, secretKey) => {
    if (!value || !value.trim()) return "-";
    return VigenereCipher(value, secretKey);
  };

  const revealSpoiler = (itemId, e) => {
    e.stopPropagation();
    setSpoilerRevealed(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  const handleItemClick = (item, e) => {
    if (item.link) {
      window.open(item.link, '_blank');
    }
  };

  // Verificar si el nivel completo es spoiler
  const isLevelSpoiler = selLevel?.spoiler || false;
  const [levelSpoilerRevealed, setLevelSpoilerRevealed] = useState(false);

  const revealLevelSpoiler = (e) => {
    e.stopPropagation();
    setLevelSpoilerRevealed(true);
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black font-mono p-6 selection:bg-black selection:text-white text-[140%]">
      
      <header className="flex-shrink-0 mb-6 pb-3 border-b border-black">
        <Link className="text-2xl font-bold tracking-tight" to="/">
          🎕
        </Link>

        <div className="flex gap-4 mt-3 text-base">
          <span className="px-3 py-1 bg-black text-white text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">

        {/* LEVELS */}
        <section className="lg:col-span-2 border border-black bg-white p-3 flex flex-col overflow-y-auto">
          <div className="mb-4">
            <div className="text-sm uppercase tracking-widest opacity-50 mb-1">ACCESS LEVEL</div>
            <div className="h-px bg-black mb-2"></div>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {DATA.map((lvl, idx) => (
              <button
                key={lvl.id}
                onClick={() => { 
                  setSelLevel(lvl);
                  setLevelSpoilerRevealed(false);
                }}
                className={`w-full text-left p-3 text-base border font-mono transition
                  ${selLevel?.id === lvl.id
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">
                    LEVEL {String(idx + 1).padStart(3, '00')}
                  </span>
                  <span className={`text-sm ${selLevel?.id === lvl.id ? 'opacity-95' : 'opacity-25'}`}>
                    {lvl.items.length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* DIRECTORY */}
        <section className="lg:col-span-4 border border-black bg-white p-3 flex flex-col overflow-y-auto relative">
          <div className="mb-4">
            <div className="text-sm uppercase tracking-widest opacity-50 mb-1">DIRECTORY</div>
            <div className="h-px bg-black mb-2"/>
          </div>

          {selLevel ? (
            <div className="relative flex-1 min-h-0">
              {/* Spoiler overlay para nivel completo - TAPA TODA LA SECCIÓN */}
              {isLevelSpoiler && !levelSpoilerRevealed && (
                <div 
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 glass backdrop-blur-sm cursor-pointer"
                  onClick={revealLevelSpoiler}
                >
                  <div className="bg-black text-white px-8 py-4 text-lg font-bold uppercase tracking-widest transform hover:scale-105 transition border-2 border-white shadow-2xl">
                    SPOILER
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 overflow-y-auto max-h-full">
                {selLevel.items.map(item => (
                  <div key={item.id} className="relative">
                    {/* Spoiler overlay para item individual - SOLO UNA VEZ */}
                    {item.spoiler && !spoilerRevealed[item.id] && (
                      <div 
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
                        onClick={(e) => revealSpoiler(item.id, e)}
                      >
                        <div className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-widest border border-white shadow-lg">
                          SPOILER
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => handleItemClick(item, e)}
                      disabled={item.spoiler && !spoilerRevealed[item.id]}
                      className={`w-full text-center p-3 text-base border transition group
                        ${item.spoiler && !spoilerRevealed[item.id] 
                          ? 'border-gray-300 bg-black/25 glass backdrop-blur-sm' 
                          : 'border-gray-300 hover:border-black hover:bg-black hover:text-white'
                        }
                        ${item.link && spoilerRevealed[item.id] ? 'cursor-pointer' : ''}
                        ${item.link && !item.spoiler ? 'cursor-pointer' : ''}
                      `}
                    >
                      <div className="truncate font-medium">
                        {formatValue(item.name, secretKey)}
                      </div>
                      <div className="text-xs opacity-50 mt-1">
                        {item.added}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center opacity-30">
              <div className="text-center space-y-3">
                <div className="text-4xl">[ ... ]</div>
                <div className="text-base tracking-widest">
                  SELECT A LEVEL TO VIEW FILES
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black pt-4">
        <div className="flex justify-center mb-3">
          <div className="join border border-black overflow-hidden">
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
              className="join-item px-3 py-2 text-base uppercase outline-none"
              maxLength={20}
            />
            <div className="join-item rounded-none px-4 py-2.5 bg-black text-white text-sm font-bold">
              {secretKey.length}/20
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-300 text-sm opacity-50 text-center">
          2026 PLRGNM
        </div>
      </footer>
    </div>
  );
};

export default Terminal;