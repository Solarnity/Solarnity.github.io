import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, Brush, Eraser, FileDown, FileUp, Trash, MoveDownRight, MoveDownLeft, MoveUpRight, MoveUpLeft } from 'lucide-react';

const PixelArtCreator = () => {
  // Colores disponibles
  const colors = [
    '#ED1C24', '#FF7F27', '#FCD404', '#00B300',
    '#4CEAEF', '#3C50F0', '#6B50F6', '#EC1F80',
    '#000000', '#444444', '#787878', '#FFFFFF',
  ];
  
  // Estados
  const [gridSize, setGridSize] = useState(16);
  const [pixels, setPixels] = useState(() => Array(32 * 32).fill('#FFFFFF'));
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [numberingMode, setNumberingMode] = useState('bottom-right');
  const fileInputRef = useRef(null);
  const gridRef = useRef(null);

  // Obtener píxeles visibles para el tamaño actual
  const getVisiblePixels = () => {
    const visiblePixels = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const index = y * 32 + x;
        visiblePixels.push(pixels[index] || '#FFFFFF');
      }
    }
    return visiblePixels;
  };

  // Efecto para detectar cuando se presiona la barra espaciadora
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Efecto para prevenir el scroll en dispositivos táctiles
  useEffect(() => {
    const preventScroll = (e) => {
      if (e.touches.length > 1) return; // Permitir zoom con dos dedos
      e.preventDefault();
    };

    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      if (gridElement) {
        gridElement.removeEventListener('touchmove', preventScroll);
      }
    };
  }, []);

  

  // Manejar cambio de tamaño de la cuadrícula
  const handleGridSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setIsResizing(true);
    setGridSize(newSize);
    
    setTimeout(() => {
      setIsResizing(false);
    }, 50);
  };

  // Pintar un píxel
  const paintPixel = (index, color) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const fullIndex = row * 32 + col;
    
    const newPixels = [...pixels];
    newPixels[fullIndex] = color;
    setPixels(newPixels);
  };

  // Manejar clic en un píxel
  const handlePixelClick = (index, e) => {
    if (e.type.includes('touch')) {
      e.preventDefault();
    }
    
    if (e.button === 2) {
      e.preventDefault();
      paintPixel(index, '#FFFFFF');
      return;
    }
    
    if (e.button === 0 || e.type.includes('touch')) {
      const colorToUse = tool === 'eraser' ? '#FFFFFF' : selectedColor;
      paintPixel(index, colorToUse);
    }
  };

  // Manejar movimiento del mouse sobre los píxeles (solo con barra espaciadora)
  const handlePixelMouseOver = (index, e) => {
    // Eliminar completamente la condición e.buttons === 1
    if (isSpacePressed) {
      const colorToUse = tool === 'eraser' ? '#FFFFFF' : selectedColor;
      paintPixel(index, colorToUse);
    }
  };

  // Manejar touch move para dispositivos móviles
  const handleTouchMove = (e) => {
    e.preventDefault();
    
    const touch = e.touches[0];
    const gridElement = gridRef.current;
    
    if (!gridElement) return;
    
    const rect = gridElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (x >= 0 && y >= 0 && x < rect.width && y < rect.height) {
      const pixelSize = rect.width / gridSize;
      const col = Math.floor(x / pixelSize);
      const row = Math.floor(y / pixelSize);
      const index = row * gridSize + col;
      
      const colorToUse = tool === 'eraser' ? '#FFFFFF' : selectedColor;
      paintPixel(index, colorToUse);
    }
  };

  // Prevenir el menú contextual en click derecho
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // Limpiar toda la cuadrícula
  const clearGrid = () => {
    setPixels(Array(32 * 32).fill('#FFFFFF'));
  };

  // Exportar el diseño actual
  const exportDesign = () => {
    const visiblePixels = getVisiblePixels();
    const data = {
      gridSize,
      pixels: visiblePixels
    };
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pixel-art-${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Importar un diseño
  const importDesign = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.gridSize && importedData.pixels) {
          setIsResizing(true);
          setGridSize(importedData.gridSize);
          
          const newPixels = Array(32 * 32).fill('#FFFFFF');
          const importSize = Math.min(importedData.gridSize, 32);
          
          for (let y = 0; y < importSize; y++) {
            for (let x = 0; x < importSize; x++) {
              const importIndex = y * importedData.gridSize + x;
              const newIndex = y * 32 + x;
              if (importIndex < importedData.pixels.length) {
                newPixels[newIndex] = importedData.pixels[importIndex];
              }
            }
          }
          
          setPixels(newPixels);
          
          setTimeout(() => {
            setIsResizing(false);
          }, 50);
        } else {
          alert('Archivo no válido');
        }
      } catch (error) {
        alert('Error al importar el archivo');
      }
    };
    reader.readAsText(file);
    
    e.target.value = null;
  };

  // Trigger para importar
  const triggerImport = () => {
    fileInputRef.current.click();
  };

  // Contar píxeles por color (solo los visibles)
  const countPixelsByColor = () => {
    const colorCount = {};
    const visiblePixels = getVisiblePixels();
    
    visiblePixels.forEach(color => {
      colorCount[color] = (colorCount[color] || 0) + 1;
    });
    
    return colorCount;
  };

  // Obtener nombre del color basado en el código HEX
  const getColorName = (hexCode) => {
    const colorNames = {
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
    
    return colorNames[hexCode] || hexCode;
  };

  // Seleccionar herramienta
  const selectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  // Cambiar modo de numeración
  const cycleNumberingMode = () => {
    const modes = ['disabled', 'bottom-right', 'bottom-left', 'top-right', 'top-left'];
    const currentIndex = modes.indexOf(numberingMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setNumberingMode(modes[nextIndex]);
  };

  // Obtener números para los lados según el modo (en espejo)
  const getNumbersForSide = (side) => {
    if (numberingMode === 'disabled') return [];
    
    const numbers = [];
    const n = gridSize;

    // ---- MODO: BOTTOM-RIGHT ----
    if (numberingMode === 'bottom-right') {
      if (side === 'bottom') {
        // Abajo
        for (let i = n; i >= 1; i--) numbers.push(i);
      } else if (side === 'left') {
        // Izquierda
        for (let i = 2*n - 1; i >= n; i--) numbers.push(i);
      } else if (side === 'top') {
        // Arriba
        for (let i = 2*n - 1; i >= n; i--) numbers.push(i);
      } else if (side === 'right') {
        // Derecha
        for (let i = n; i >= 1; i--) numbers.push(i);
      }
    }

    // ---- MODO: BOTTOM-LEFT ----
    if (numberingMode === 'bottom-left') {
      if (side === 'bottom') {
        // Abajo
        for (let i = 1; i <= n; i++) numbers.push(i);
      } else if (side === 'right') {
        // Derecha
        for (let i = 2*n - 1; i >= n; i--) numbers.push(i);
      } else if (side === 'top') {
        // Arriba
        for (let i = n; i <= 2*n - 1; i++) numbers.push(i);
      } else if (side === 'left') {
        // Izquierda
        for (let i = n; i >= 1; i--) numbers.push(i);
      }
    }

    // ---- MODO: TOP-RIGHT ----
    if (numberingMode === 'top-right') {
      if (side === 'top') {
        // Arriba
        for (let i = n; i >= 1; i--) numbers.push(i);
      } else if (side === 'left') {
        // Izquierda
        for (let i = n; i <= 2*n - 1; i++) numbers.push(i);
      } else if (side === 'bottom') {
        // Abajo
        for (let i = 2*n - 1; i >= n; i--) numbers.push(i);
      } else if (side === 'right') {
        // Derecha
        for (let i = 1; i <= n; i++) numbers.push(i);
      }
    }

    // ---- MODO: TOP-LEFT ----
    if (numberingMode === 'top-left') {
      if (side === 'top') {
        // Arriba
        for (let i = 1; i <= n; i++) numbers.push(i);
      } else if (side === 'right') {
        // Derecha
        for (let i = n; i <= 2*n - 1; i++) numbers.push(i);
      } else if (side === 'bottom') {
        // Abajo
        for (let i = n; i <= 2*n - 1; i++) numbers.push(i);
      } else if (side === 'left') {
        // Izquierda
        for (let i = 1; i <= n; i++) numbers.push(i);
      }
    }

    // Para lados verticales (izquierda/derecha), mostrar solo números alternados si gridSize > 23
    if ((side === 'left' || side === 'right') && n > 23) {
      return numbers.map((num, idx) => idx % 2 === 0 ? num : '');
    }
    
    // Para lados horizontales (arriba/abajo), mostrar solo números alternados si gridSize > 23
    if ((side === 'top' || side === 'bottom') && n > 23) {
      return numbers.map((num, idx) => idx % 2 === 0 ? num : '');
    }

    return numbers;
  };

  // Función para determinar el tamaño de fuente según el gridSize
  const getFontSizeClass = () => {
    if (gridSize <= 16) return "text-xs";
    if (gridSize <= 24) return "text-[8px]";
    return "text-[8px]";
  };

  // Efecto para deshabilitar automáticamente la numeración en grids muy grandes
  useEffect(() => {
    if (gridSize > 28 && numberingMode !== 'disabled') {
      setNumberingMode('disabled');
    }
  }, [gridSize, numberingMode]);

  const fontSizeClass = getFontSizeClass();

  // Obtener conteo de colores
  const colorCount = countPixelsByColor();
  const visiblePixels = getVisiblePixels();

  // Obtener números para cada lado
  const bottomNumbers = getNumbersForSide('bottom');
  const rightNumbers = getNumbersForSide('right');
  const topNumbers = getNumbersForSide('top');
  const leftNumbers = getNumbersForSide('left');

  return (
    <>
      <div className="fixed w-screen h-screen -z-10 bg-neutral-900" onContextMenu={handleContextMenu}/>
      <div className="max-w-6xl mx-auto min-h-dvh text-neutral-100 p-3 md:p-4 lg:p-6 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Panel de controles */}
          <div className="col-span-1 bg-neutral-800 p-4 md:p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between w-full mb-3">
              <Link
                to="/"
                className="btn btn-sm btn-ghost btn-square flex items-center justify-center shadow-none hover:border-transparent hover:bg-white/25 hover:text-gray-900 disabled:text-white/50"
              >
                <ChevronLeft/>
              </Link>
            </div>
            
            {/* Selector de tamaño */}
            <div className="form-control mb-4 md:mb-6 w-full">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-neutral-300">Tamaño:</h3>
                <label className="label">
                  <span className="label-text text-neutral-300">{gridSize}x{gridSize}</span>
                </label>
              </div>
              <input 
                type="range" 
                min="8" 
                max="32" 
                value={gridSize} 
                onChange={handleGridSizeChange}
                className="range range-almond w-full [--range-thumb:transparent] [--range-thumb-size:0.75rem]"
              />
              <div className="w-full flex justify-between text-sm px-2 text-neutral-400">
                <span>8</span>
                <span>20</span>
                <span>32</span>
              </div>
            </div>
            
            {/* Selector de herramientas */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg font-semibold mb-2 text-neutral-300">Herramientas:</h3>
              <div className="flex gap-2">
                <button
                  className={`btn transition-all duration-300 flex-1 ${tool === 'pencil' ? 'btn-almond' : 'glass text-almond hover:bg-almond/10'}`}
                  onClick={() => selectTool('pencil')}
                >
                  <Brush size={20} className="md:size-6"/>
                </button>
                <button
                  className={`btn transition-all duration-300 flex-1 ${tool === 'eraser' ? 'btn-almond' : 'glass text-almond hover:bg-almond/10'}`}
                  onClick={() => selectTool('eraser')}
                >
                  <Eraser size={20} className="md:size-6"/>
                </button>
              </div>
            </div>
            
            {/* Selector de color */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg font-semibold mb-2 text-neutral-300">Colores:</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className={`w-full aspect-square rounded cursor-pointer outline-1 ${selectedColor === color ? 'outline-almond outline-3 outline-offset-2' : 'outline-neutral-600'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      setTool('pencil');
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Botón para cambiar modo de numeración */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg font-semibold mb-2 text-neutral-300">Numeración:</h3>                 
              <button 
                className={`btn ${numberingMode !== 'disabled' ? 'btn-almond' : 'glass text-almond hover:bg-almond/10'} w-full`}
                onClick={cycleNumberingMode}
              >
                {numberingMode === 'disabled' && 'Desactivada'}
                {numberingMode === 'bottom-right' && 
                  <>
                    <MoveDownRight size={18} className="md:size-5"/>
                    <span className="hidden md:inline">Inferior-Derecha</span>
                    <span className="md:hidden">Inf-Der</span>
                  </>
                }
                {numberingMode === 'bottom-left' && 
                  <>
                    <MoveDownLeft size={18} className="md:size-5"/>
                    <span className="hidden md:inline">Inferior-Izquierda</span>
                    <span className="md:hidden">Inf-Izq</span>
                  </>
                }
                {numberingMode === 'top-right' && 
                  <>
                    <MoveUpRight size={18} className="md:size-5"/>
                    <span className="hidden md:inline">Superior-Derecha</span>
                    <span className="md:hidden">Sup-Der</span>
                  </>
                }
                {numberingMode === 'top-left' && 
                  <>
                    <MoveUpLeft size={18} className="md:size-5"/>
                    <span className="hidden md:inline">Superior-Izquierda</span>
                    <span className="md:hidden">Sup-Izq</span>
                  </>
                }
              </button>
            </div>
            
            {/* Botones de acción */}   
            <div className="grid grid-cols-1 gap-2">
              <button 
                className="btn glass text-almond hover:bg-red-700 hover:text-almond"
                onClick={clearGrid}
              >
                <Trash size={18} className="md:size-5"/>
                <span>Limpiar</span>
              </button>
              
              <button 
                className="btn glass text-almond hover:bg-blue-700 hover:text-almond"
                onClick={exportDesign}
              >
                <FileDown size={18} className="md:size-5"/>
                <span>Exportar</span>
              </button>
              
              <button 
                className="btn glass text-almond hover:bg-green-700 hover:text-almond"
                onClick={triggerImport}
              >
                <FileUp size={18} className="md:size-5"/>
                <span>Importar</span>
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
          
          {/* Cuadrícula de píxeles con números */}
          <div className="col-span-1 lg:col-span-2 bg-neutral-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            
            <div className="relative w-full max-w-[400px] md:max-w-[500px] my-4 md:my-8 lg:my-16">
              {/* Números del lado izquierdo */}
              {numberingMode !== 'disabled' && (
                <div className={`absolute -left-4 h-full flex flex-col justify-between ${fontSizeClass} font-mono text-neutral-400`}>
                  {leftNumbers.map((number, i) => (
                    <div 
                      key={`left-${i}`} 
                      className="flex items-center justify-center h-full"
                      style={{ visibility: number ? 'visible' : 'hidden' }}
                    >
                      {number || '·'}
                    </div>
                  ))}
                </div>
              )}

              {/* Números del lado derecho */}
              {numberingMode !== 'disabled' && (
                <div className={`absolute -right-4 h-full flex flex-col justify-between ${fontSizeClass} font-mono text-neutral-400`}>
                  {rightNumbers.map((number, i) => (
                    <div 
                      key={`right-${i}`} 
                      className="flex items-center justify-center h-full"
                      style={{ visibility: number ? 'visible' : 'hidden' }}
                    >
                      {number || '·'}
                    </div>
                  ))}
                </div>
              )}

              {/* Números de la parte superior */}
              {numberingMode !== 'disabled' && (
                <div className={`absolute -top-4 w-full flex justify-between ${fontSizeClass} font-mono text-neutral-400 px-0.5`}>
                  {topNumbers.map((number, i) => (
                    <div 
                      key={`top-${i}`} 
                      className="flex-1 text-center"
                      style={{ visibility: number ? 'visible' : 'hidden' }}
                    >
                      {number || '·'}
                    </div>
                  ))}
                </div>
              )}

              {/* Números de la parte inferior */}
              {numberingMode !== 'disabled' && (
                <div className={`absolute -bottom-4 w-full flex justify-between ${fontSizeClass} font-mono text-neutral-400 px-0.5`}>
                  {bottomNumbers.map((number, i) => (
                    <div 
                      key={`bottom-${i}`} 
                      className="flex-1 text-center"
                      style={{ visibility: number ? 'visible' : 'hidden' }}
                    >
                      {number || '·'}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Cuadrícula principal */}
              <div 
                ref={gridRef}
                className="grid border-1 border-neutral-600 touch-none w-full"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  aspectRatio: '1/1',
                  opacity: isResizing ? 0.8 : 1,
                  transition: 'opacity 0.1s ease'
                }}
                onTouchMove={handleTouchMove}
                onTouchStart={(e) => e.preventDefault()}
              >
                {visiblePixels.map((color, index) => (
                  <div
                    key={index}
                    className="border border-neutral-700 cursor-pointer"
                    style={{ backgroundColor: color }}
                    onMouseDown={(e) => handlePixelClick(index, e)}
                    onMouseOver={(e) => handlePixelMouseOver(index, e)}
                    onTouchStart={(e) => handlePixelClick(index, e)}
                    onContextMenu={handleContextMenu}
                  />
                ))}
              </div>
            </div>

            {/* Panel de conteo de colores - Versión mejorada */}
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-neutral-700 rounded-lg w-full">
              <h3 className="text-lg font-semibold mb-2 text-neutral-300">Conteo:</h3>
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(colorCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([color, count]) => (
                      <div key={color} className="flex items-center justify-between py-1">
                        <div className="flex items-center min-w-0 flex-1">
                          <div 
                            className="w-3 h-3 md:w-4 md:h-4 mr-2 border border-neutral-600 flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm text-neutral-300 truncate">
                            {getColorName(color)}
                          </span>
                        </div>
                        <span className="font-semibold text-sm text-neutral-300 ml-2 flex-shrink-0">
                          {count}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PixelArtCreator;