// CalculoMental.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, Clock, Award, Brain, Settings, BarChart } from 'lucide-react';

// Componente para la pantalla de configuración
const PantallaConfiguracion = ({ onIniciar }) => {
  const [config, setConfig] = useState({
    operaciones: {
      suma: true,
      resta: false,
      multiplicacion: false,
      division: false
    },
    cantidadPreguntas: 10,
    digitosMin: 1,
    digitosMax: 1,
    modoRespuesta: 'opciones', // 'opciones' o 'escritura'
    tiempoLimite: 60 // segundos
  });

  const [error, setError] = useState('');

  const handleOperacionChange = (operacion) => {
    setConfig(prev => ({
      ...prev,
      operaciones: {
        ...prev.operaciones,
        [operacion]: !prev.operaciones[operacion]
      }
    }));
  };

  const handleDigitosChange = (tipo, valor) => {
    const numValor = parseInt(valor) || 1;
    
    if (tipo === 'min') {
      if (numValor <= config.digitosMax) {
        setConfig(prev => ({ ...prev, digitosMin: Math.min(8, Math.max(1, numValor)) }));
      }
    } else {
      if (numValor >= config.digitosMin) {
        setConfig(prev => ({ ...prev, digitosMax: Math.min(8, Math.max(1, numValor)) }));
      }
    }
  };

  const validarYIniciar = () => {
    const operacionesSeleccionadas = Object.values(config.operaciones).filter(Boolean).length;
    
    if (operacionesSeleccionadas === 0) {
      setError('Debes seleccionar al menos una operación');
      return;
    }

    if (config.cantidadPreguntas < 1 || config.cantidadPreguntas > 50) {
      setError('La cantidad de preguntas debe estar entre 1 y 50');
      return;
    }

    if (config.modoRespuesta === 'escritura' && (config.digitosMin > 3 || config.digitosMax > 3)) {
      setError('El modo escritura solo está disponible para números de hasta 3 dígitos');
      return;
    }

    onIniciar(config);
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black font-mono p-4 overflow-y-auto">
      <header className="mb-6 pb-2 border-b border-black flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="btn btn-xs btn-square rounded-none bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
          >
            <ChevronLeft />
          </Link>
          <h1 className="text-2xl font-bold">CÁLCULO MENTAL</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full">
        <div className="border border-black p-6 space-y-6">
          {/* Operaciones */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Brain size={18} /> OPERACIONES
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'suma', label: 'SUMA (+)', emoji: '➕' },
                { id: 'resta', label: 'RESTA (-)', emoji: '➖' },
                { id: 'multiplicacion', label: 'MULTIPLICACIÓN (×)', emoji: '✖️' },
                { id: 'division', label: 'DIVISIÓN (÷)', emoji: '➗' }
              ].map(op => (
                <button
                  key={op.id}
                  onClick={() => handleOperacionChange(op.id)}
                  className={`p-3 border-2 transition-all text-left ${
                    config.operaciones[op.id]
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 hover:border-black hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mr-2">{op.emoji}</span>
                  <span className="text-sm font-bold">{op.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad de preguntas */}
          <div>
            <h2 className="text-lg font-bold mb-3">CANTIDAD DE PREGUNTAS</h2>
            <input
              type="range"
              min="1"
              max="50"
              value={config.cantidadPreguntas}
              onChange={(e) => setConfig(prev => ({ ...prev, cantidadPreguntas: parseInt(e.target.value) }))}
              className="w-full accent-black"
            />
            <div className="text-center mt-2">
              <span className="text-2xl font-bold">{config.cantidadPreguntas}</span>
            </div>
          </div>

          {/* Dígitos */}
          <div>
            <h2 className="text-lg font-bold mb-3">CANTIDAD DE DÍGITOS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs opacity-50 mb-1">MÍNIMO</label>
                <select
                  value={config.digitosMin}
                  onChange={(e) => handleDigitosChange('min', e.target.value)}
                  className="w-full p-2 border border-black font-mono text-center"
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs opacity-50 mb-1">MÁXIMO</label>
                <select
                  value={config.digitosMax}
                  onChange={(e) => handleDigitosChange('max', e.target.value)}
                  className="w-full p-2 border border-black font-mono text-center"
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-center mt-2 opacity-50">
              Rango: {config.digitosMin} - {config.digitosMax} dígitos
            </p>
          </div>

          {/* Modo de respuesta */}
          <div>
            <h2 className="text-lg font-bold mb-3">MODO DE RESPUESTA</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfig(prev => ({ ...prev, modoRespuesta: 'opciones' }))}
                className={`p-3 border-2 transition-all ${
                  config.modoRespuesta === 'opciones'
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                }`}
              >
                <span className="block font-bold">OPCIONES</span>
                <span className="text-xs opacity-75">Seleccionar respuesta</span>
              </button>
              <button
                onClick={() => setConfig(prev => ({ ...prev, modoRespuesta: 'escritura' }))}
                className={`p-3 border-2 transition-all ${
                  config.modoRespuesta === 'escritura'
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                }`}
              >
                <span className="block font-bold">ESCRITURA</span>
                <span className="text-xs opacity-75">Escribir respuesta</span>
              </button>
            </div>
          </div>

          {/* Tiempo límite */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Clock size={18} /> TIEMPO LÍMITE
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 120, 300].map(tiempo => (
                <button
                  key={tiempo}
                  onClick={() => setConfig(prev => ({ ...prev, tiempoLimite: tiempo }))}
                  className={`p-2 border-2 text-center transition-all ${
                    config.tiempoLimite === tiempo
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 hover:border-black hover:bg-gray-50'
                  }`}
                >
                  {tiempo < 60 ? `${tiempo}s` : `${tiempo/60}min`}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="border border-red-500 bg-red-50 p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={validarYIniciar}
            className="w-full p-4 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors text-lg"
          >
            INICIAR CÁLCULO MENTAL →
          </button>
        </div>
      </main>
    </div>
  );
};

// Componente para la pantalla del quiz
const PantallaQuiz = ({ config, onTerminar, onTiempoAgotado }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaActual, setRespuestaActual] = useState('');
  const [opcionesActuales, setOpcionesActuales] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(config.tiempoLimite);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState(false);
  const [puntaje, setPuntaje] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Generar números aleatorios
  const generarNumero = (digitos) => {
    const min = Math.pow(10, digitos - 1);
    const max = Math.pow(10, digitos) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Calcular dificultad y puntaje
  const calcularDificultad = (num1, num2, operacion) => {
    let dificultad = 1;
    
    // Por cantidad de dígitos
    dificultad += (num1.toString().length + num2.toString().length) / 2;
    
    // Por operación
    if (operacion === 'multiplicacion') dificultad *= 1.5;
    if (operacion === 'division') dificultad *= 2;
    
    return Math.round(dificultad * 10);
  };

  // Generar preguntas
  useEffect(() => {
    const nuevasPreguntas = [];
    const operacionesActivas = Object.entries(config.operaciones)
      .filter(([_, activa]) => activa)
      .map(([op]) => op);

    for (let i = 0; i < config.cantidadPreguntas; i++) {
      const operacion = operacionesActivas[Math.floor(Math.random() * operacionesActivas.length)];
      const digitos1 = Math.floor(Math.random() * (config.digitosMax - config.digitosMin + 1)) + config.digitosMin;
      const digitos2 = Math.floor(Math.random() * (config.digitosMax - config.digitosMin + 1)) + config.digitosMin;
      
      let num1 = generarNumero(digitos1);
      let num2 = generarNumero(digitos2);
      
      // Asegurar que la resta no dé negativo y la división sea exacta
      if (operacion === 'resta' && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      
      if (operacion === 'division') {
        num2 = Math.max(1, num2);
        num1 = num1 * num2; // Para que sea exacta
      }

      const resultado = calcularResultado(num1, num2, operacion);
      const dificultad = calcularDificultad(num1, num2, operacion);
      
      nuevasPreguntas.push({
        id: i,
        num1,
        num2,
        operacion,
        resultado,
        dificultad,
        puntaje: dificultad
      });
    }

    setPreguntas(nuevasPreguntas);
    setRespuestas(new Array(nuevasPreguntas.length).fill(null));
  }, [config]);

  // Generar opciones para la pregunta actual
  useEffect(() => {
    if (preguntas.length === 0 || config.modoRespuesta !== 'opciones') return;

    const pregunta = preguntas[preguntaActual];
    if (!pregunta) return;

    const opciones = [pregunta.resultado];
    
    while (opciones.length < 4) {
      const variacion = Math.floor(Math.random() * 20) - 10;
      const posibleRespuesta = pregunta.resultado + variacion;
      if (posibleRespuesta > 0 && !opciones.includes(posibleRespuesta)) {
        opciones.push(posibleRespuesta);
      }
    }

    // Mezclar opciones
    for (let i = opciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }

    setOpcionesActuales(opciones);
  }, [preguntaActual, preguntas, config.modoRespuesta]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTiempoAgotado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [onTiempoAgotado]);

  // Calcular resultado
  const calcularResultado = (a, b, op) => {
    switch(op) {
      case 'suma': return a + b;
      case 'resta': return a - b;
      case 'multiplicacion': return a * b;
      case 'division': return Math.floor(a / b);
      default: return 0;
    }
  };

  // Manejar respuesta
  const manejarRespuesta = (respuesta) => {
    if (mostrarFeedback) return;

    const pregunta = preguntas[preguntaActual];
    const respuestaNum = typeof respuesta === 'number' ? respuesta : parseFloat(respuesta);
    const correcta = respuestaNum === pregunta.resultado;

    setEsCorrecta(correcta);
    setMostrarFeedback(true);

    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = {
      respuesta: respuestaNum,
      correcta,
      puntajeObtenido: correcta ? pregunta.puntaje : 0
    };

    if (correcta) {
      setPuntaje(prev => prev + pregunta.puntaje);
    }

    setRespuestas(nuevasRespuestas);

    // Avanzar después de 1.5 segundos
    setTimeout(() => {
      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(prev => prev + 1);
        setRespuestaActual('');
        setMostrarFeedback(false);
      } else {
        clearInterval(timerRef.current);
        onTerminar({
          respuestas: nuevasRespuestas,
          puntajeTotal: puntaje + (correcta ? pregunta.puntaje : 0),
          tiempoRestante
        });
      }
    }, 1500);
  };

  if (preguntas.length === 0) {
    return <div className="flex items-center justify-center h-screen">CARGANDO...</div>;
  }

  const pregunta = preguntas[preguntaActual];
  const operacionSimbolo = {
    suma: '+',
    resta: '-',
    multiplicacion: '×',
    division: '÷'
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black font-mono p-4">
      {/* Header */}
      <header className="mb-4 pb-2 border-b border-black flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">CÁLCULO MENTAL</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span className={`font-bold ${tiempoRestante < 10 ? 'text-red-600' : ''}`}>
                {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Award size={16} />
              <span className="font-bold">{puntaje}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>PREGUNTA {preguntaActual + 1} DE {preguntas.length}</span>
          <span>DIFICULTAD: {pregunta.dificultad}</span>
        </div>
        <div className="h-1 bg-gray-200">
          <div 
            className="h-1 bg-black transition-all"
            style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Pregunta */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-7xl md:text-8xl font-bold mb-8 text-center break-all">
          {pregunta.num1} {operacionSimbolo[pregunta.operacion]} {pregunta.num2}
        </div>

        {config.modoRespuesta === 'opciones' ? (
          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
            {opcionesActuales.map((opcion, idx) => (
              <button
                key={idx}
                onClick={() => manejarRespuesta(opcion)}
                disabled={mostrarFeedback}
                className={`p-6 text-3xl font-bold border-4 transition-all
                  ${mostrarFeedback && opcion === pregunta.resultado
                    ? 'border-green-500 bg-green-50'
                    : mostrarFeedback && opcion === respuestaActual
                    ? 'border-red-500 bg-red-50'
                    : 'border-black hover:bg-black hover:text-white'
                  }
                  ${mostrarFeedback ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {opcion}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md">
            <input
              ref={inputRef}
              type="number"
              value={respuestaActual}
              onChange={(e) => setRespuestaActual(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && respuestaActual && !mostrarFeedback) {
                  manejarRespuesta(respuestaActual);
                }
              }}
              disabled={mostrarFeedback}
              className={`w-full p-6 text-3xl font-bold text-center border-4 outline-none
                ${mostrarFeedback
                  ? esCorrecta
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-black focus:border-gray-500'
                }
              `}
              autoFocus
            />
            {mostrarFeedback && !esCorrecta && (
              <div className="mt-4 p-4 border border-red-500 bg-red-50 text-center">
                <p className="font-bold">RESPUESTA CORRECTA:</p>
                <p className="text-2xl font-bold">{pregunta.resultado}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {config.modoRespuesta === 'escritura' && (
        <div className="text-center text-xs opacity-50 mt-4">
          Presiona ENTER para enviar tu respuesta
        </div>
      )}
    </div>
  );
};

// Componente para la pantalla de estadísticas
const PantallaEstadisticas = ({ resultados, config, tiempoAgotado, onReiniciar }) => {
  const {
    respuestas,
    puntajeTotal,
    tiempoRestante
  } = resultados;

  const correctas = respuestas.filter(r => r?.correcta).length;
  const incorrectas = respuestas.filter(r => r && !r.correcta).length;
  const sinResponder = respuestas.filter(r => r === null).length;

  const operacionesTexto = Object.entries(config.operaciones)
    .filter(([_, activa]) => activa)
    .map(([op]) => {
      const nombres = {
        suma: 'SUMA',
        resta: 'RESTA',
        multiplicacion: 'MULTIPLICACIÓN',
        division: 'DIVISIÓN'
      };
      return nombres[op];
    })
    .join(', ');

  return (
    <div className="h-screen flex flex-col bg-white text-black font-mono p-4 overflow-y-auto">
      <header className="mb-6 pb-2 border-b border-black flex-shrink-0">
        <h1 className="text-2xl font-bold">ESTADÍSTICAS FINALES</h1>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full">
        {tiempoAgotado && (
          <div className="mb-6 p-6 border-4 border-red-500 bg-red-50 text-center">
            <h2 className="text-2xl font-bold mb-2">⏰ ¡TIEMPO AGOTADO! ⏰</h2>
            <p>No pudiste completar todas las preguntas a tiempo</p>
          </div>
        )}

        <div className="border border-black p-6 space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border border-black">
              <span className="block text-3xl font-bold">{correctas}</span>
              <span className="text-xs opacity-50">CORRECTAS</span>
            </div>
            <div className="text-center p-4 border border-black">
              <span className="block text-3xl font-bold">{incorrectas}</span>
              <span className="text-xs opacity-50">INCORRECTAS</span>
            </div>
            <div className="text-center p-4 border border-black">
              <span className="block text-3xl font-bold">{sinResponder}</span>
              <span className="text-xs opacity-50">SIN RESPONDER</span>
            </div>
            <div className="text-center p-4 border border-black">
              <span className="block text-3xl font-bold">{puntajeTotal}</span>
              <span className="text-xs opacity-50">PUNTAJE TOTAL</span>
            </div>
          </div>

          {/* Información de la configuración */}
          <div className="border-t border-gray-300 pt-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Settings size={18} /> CONFIGURACIÓN DEL QUIZ
            </h2>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="opacity-50">Operaciones:</span>
                <span className="font-bold">{operacionesTexto}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="opacity-50">Cantidad de preguntas:</span>
                <span className="font-bold">{config.cantidadPreguntas}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="opacity-50">Dígitos:</span>
                <span className="font-bold">{config.digitosMin} - {config.digitosMax}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="opacity-50">Modo de respuesta:</span>
                <span className="font-bold">
                  {config.modoRespuesta === 'opciones' ? 'OPCIONES' : 'ESCRITURA'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="opacity-50">Tiempo restante:</span>
                <span className="font-bold text-green-600">
                  {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={onReiniciar}
              className="p-4 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
            >
              NUEVO QUIZ
            </button>
            <Link
              to="/"
              className="p-4 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors text-center"
            >
              VOLVER AL INICIO
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente principal
const CalculoMental = () => {
  const [pantalla, setPantalla] = useState('configuracion'); // 'configuracion', 'quiz', 'estadisticas'
  const [config, setConfig] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [tiempoAgotado, setTiempoAgotado] = useState(false);

  const manejarIniciar = (configuracion) => {
    setConfig(configuracion);
    setPantalla('quiz');
    setTiempoAgotado(false);
  };

  const manejarTerminar = (resultadosQuiz) => {
    setResultados(resultadosQuiz);
    setPantalla('estadisticas');
  };

  const manejarTiempoAgotado = () => {
    setTiempoAgotado(true);
    // Forzar terminación con respuestas actuales
    setPantalla('estadisticas');
  };

  const manejarReiniciar = () => {
    setPantalla('configuracion');
    setConfig(null);
    setResultados(null);
    setTiempoAgotado(false);
  };

  return (
    <>
      {pantalla === 'configuracion' && (
        <PantallaConfiguracion onIniciar={manejarIniciar} />
      )}

      {pantalla === 'quiz' && config && (
        <PantallaQuiz
          config={config}
          onTerminar={manejarTerminar}
          onTiempoAgotado={manejarTiempoAgotado}
        />
      )}

      {pantalla === 'estadisticas' && config && (
        <PantallaEstadisticas
          resultados={resultados || { respuestas: [], puntajeTotal: 0, tiempoRestante: 0 }}
          config={config}
          tiempoAgotado={tiempoAgotado}
          onReiniciar={manejarReiniciar}
        />
      )}
    </>
  );
};

export default CalculoMental;