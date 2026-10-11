import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { Clock, Award, Brain, Settings, Plus, Minus, X, Divide, AlarmClock, ArrowRight } from 'lucide-react';
import { PageShell } from '../components/Layout/PageShell';
import { uiAmber as ui } from '../components/Layout/themes';
import Squares from '../components/Effects/Squares';
import { BorderGlowCard } from '../components/Effects/BorderGlowCard';

const AMBER_RGB = [245, 179, 1];

const shellProps = {
  baseClass: 'bg-[#0c0a06]',
  backdrop: <Squares color={AMBER_RGB} />,
};

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
    modoRespuesta: 'opciones',
    tiempoLimite: 60
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

  const optionBase = 'rounded-xl border p-3 transition-all duration-300 cursor-pointer';
  const optionClass = (selected) =>
    `${optionBase} ${selected ? ui.optionSelected : ui.optionIdle}`;
  const sectionTitle =
    'mb-3 flex items-center gap-2 text-sm font-bold tracking-widest text-white';

  return (
    <PageShell maxWidth="max-w-3xl" {...shellProps}>
      <div className="my-auto py-2 font-mono">
        <BorderGlowCard glowColor="#F5B301" className="w-full">
          <div className="relative z-10 space-y-6 p-5 text-white sm:p-6">
            <div>
              <h2 className={sectionTitle}>
                <Brain size={18} className="text-[#F5B301]" /> OPERACIONES
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'suma', label: 'SUMA (+)', Icon: Plus },
                  { id: 'resta', label: 'RESTA (-)', Icon: Minus },
                  { id: 'multiplicacion', label: 'MULTIPLICACIÓN (×)', Icon: X },
                  { id: 'division', label: 'DIVISIÓN (÷)', Icon: Divide }
                ].map(op => (
                  <button
                    key={op.id}
                    onClick={() => handleOperacionChange(op.id)}
                    className={`${optionClass(config.operaciones[op.id])} text-left`}
                  >
                    <op.Icon size={18} strokeWidth={2.5} className="mr-2 inline-block align-[-3px] text-[#F5B301]" />
                    <span className="text-xs font-bold sm:text-sm">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className={sectionTitle}>CANTIDAD DE PREGUNTAS</h2>
              <input
                type="range"
                min="1"
                max="50"
                value={config.cantidadPreguntas}
                onChange={(e) => setConfig(prev => ({ ...prev, cantidadPreguntas: parseInt(e.target.value) }))}
                className="w-full accent-[#F5B301]"
              />
              <div className="mt-2 text-center">
                <span className="text-2xl font-bold">{config.cantidadPreguntas}</span>
              </div>
            </div>

            <div>
              <h2 className={sectionTitle}>CANTIDAD DE DÍGITOS</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${ui.label} mb-1 block`}>MÍNIMO</label>
                  <select
                    value={config.digitosMin}
                    onChange={(e) => handleDigitosChange('min', e.target.value)}
                    className={`${ui.input} w-full p-2 text-center font-mono`}
                  >
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n} className="bg-[#151515]">{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`${ui.label} mb-1 block`}>MÁXIMO</label>
                  <select
                    value={config.digitosMax}
                    onChange={(e) => handleDigitosChange('max', e.target.value)}
                    className={`${ui.input} w-full p-2 text-center font-mono`}
                  >
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n} className="bg-[#151515]">{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-white/40">
                Rango: {config.digitosMin} - {config.digitosMax} dígitos
              </p>
            </div>

            <div>
              <h2 className={sectionTitle}>MODO DE RESPUESTA</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfig(prev => ({ ...prev, modoRespuesta: 'opciones' }))}
                  className={optionClass(config.modoRespuesta === 'opciones')}
                >
                  <span className="block font-bold">OPCIONES</span>
                  <span className="text-xs opacity-60">Seleccionar respuesta</span>
                </button>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, modoRespuesta: 'escritura' }))}
                  className={optionClass(config.modoRespuesta === 'escritura')}
                >
                  <span className="block font-bold">ESCRITURA</span>
                  <span className="text-xs opacity-60">Escribir respuesta</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className={sectionTitle}>
                <Clock size={18} className="text-[#F5B301]" /> TIEMPO LÍMITE
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 120, 300].map(tiempo => (
                  <button
                    key={tiempo}
                    onClick={() => setConfig(prev => ({ ...prev, tiempoLimite: tiempo }))}
                    className={`${optionClass(config.tiempoLimite === tiempo)} p-2 text-center text-sm`}
                  >
                    {tiempo < 60 ? `${tiempo}s` : `${tiempo/60}min`}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              onClick={validarYIniciar}
              className={`${ui.btnPrimary} w-full p-4 text-base sm:text-lg`}
            >
              INICIAR CÁLCULO MENTAL <ArrowRight size={18} className="ml-1 inline-block align-[-3px]" />
            </button>
          </div>
        </BorderGlowCard>
      </div>
    </PageShell>
  );
};

const PantallaQuiz = ({ config, onTerminar, onTiempoAgotado }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaActual, setRespuestaActual] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(config.tiempoLimite);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [puntaje, setPuntaje] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const generarNumero = (digitos) => {
    const min = Math.pow(10, digitos - 1);
    const max = Math.pow(10, digitos) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const calcularDificultad = (num1, num2, operacion) => {
    let dificultad = 1;
    
    dificultad += (num1.toString().length + num2.toString().length) / 2;
    
    if (operacion === 'multiplicacion') dificultad *= 1.5;
    if (operacion === 'division') dificultad *= 2;
    
    return Math.round(dificultad * 10);
  };

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
      
      if (operacion === 'resta' && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      
      if (operacion === 'division') {
        num2 = Math.max(1, num2);
        num1 = num1 * num2;
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

  const opcionesActuales = useMemo(() => {
    if (preguntas.length === 0 || config.modoRespuesta !== 'opciones') return [];
    const pregunta = preguntas[preguntaActual];
    if (!pregunta) return [];

    const opciones = [pregunta.resultado];
    while (opciones.length < 4) {
      const variacion = Math.floor(Math.random() * 20) - 10;
      const posibleRespuesta = pregunta.resultado + variacion;
      if (posibleRespuesta > 0 && !opciones.includes(posibleRespuesta)) {
        opciones.push(posibleRespuesta);
      }
    }

    for (let i = opciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }
    return opciones;
  }, [preguntaActual, preguntas, config.modoRespuesta]);

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

  const calcularResultado = (a, b, op) => {
    switch(op) {
      case 'suma': return a + b;
      case 'resta': return a - b;
      case 'multiplicacion': return a * b;
      case 'division': return Math.floor(a / b);
      default: return 0;
    }
  };

  const manejarRespuesta = (respuesta) => {
    const pregunta = preguntas[preguntaActual];
    if (!pregunta) return;

    const respuestaNum = typeof respuesta === 'number' ? respuesta : parseFloat(respuesta);
    if (Number.isNaN(respuestaNum)) return;
    const correcta = respuestaNum === pregunta.resultado;
    const puntosObtenidos = correcta ? pregunta.puntaje : 0;

    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = {
      respuesta: respuestaNum,
      correcta,
      puntajeObtenido: puntosObtenidos
    };
    const nuevoPuntaje = puntaje + puntosObtenidos;

    setRespuestas(nuevasRespuestas);
    setPuntaje(nuevoPuntaje);
    setUltimoResultado({ correcta, puntos: puntosObtenidos, resultado: pregunta.resultado });

    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaActual('');
      inputRef.current?.focus();
    } else {
      clearInterval(timerRef.current);
      onTerminar({
        respuestas: nuevasRespuestas,
        puntajeTotal: nuevoPuntaje,
        tiempoRestante
      });
    }
  };

  if (preguntas.length === 0) {
    return (
      <PageShell {...shellProps}>
        <div className="flex flex-1 items-center justify-center font-mono text-sm text-white/60">
          CARGANDO...
        </div>
      </PageShell>
    );
  }

  const pregunta = preguntas[preguntaActual];
  const operacionSimbolo = {
    suma: '+',
    resta: '-',
    multiplicacion: '×',
    division: '÷'
  };

  return (
    <PageShell maxWidth="max-w-4xl" {...shellProps}>
      <div className="flex flex-1 flex-col py-2 font-mono text-white">
        <header className={`${ui.panel} mb-4 flex shrink-0 items-center justify-end px-4 py-2.5`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-[#F5B301]" />
              <span className={`font-bold ${tiempoRestante < 10 ? 'text-rose-400' : ''}`}>
                {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award size={16} className="text-[#F5B301]" />
              <span className="font-bold">{puntaje}</span>
            </div>
          </div>
        </header>

        <div className="mb-4 shrink-0">
          <div className="mb-1.5 flex justify-between text-[10px] uppercase tracking-widest text-white/40">
            <span>PREGUNTA {preguntaActual + 1} DE {preguntas.length}</span>
            <span>DIFICULTAD: {pregunta.dificultad}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-1 rounded-full bg-[#F5B301] shadow-[0_0_10px_rgba(245,179,1,0.6)] transition-all"
              style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-2">
          <div className="mb-6 break-all text-center text-5xl font-bold sm:mb-8 sm:text-7xl md:text-8xl">
            {pregunta.num1} {operacionSimbolo[pregunta.operacion]} {pregunta.num2}
          </div>

          {config.modoRespuesta === 'opciones' ? (
            <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-4">
              {opcionesActuales.map((opcion, idx) => (
                <button
                  key={idx}
                  onClick={() => manejarRespuesta(opcion)}
                  className={`${ui.optionIdle} cursor-pointer rounded-2xl border p-4 text-2xl font-bold transition-all duration-150 hover:border-[#F5B301]/60 hover:bg-[#F5B301]/10 active:scale-[0.97] sm:p-6 sm:text-3xl`}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && respuestaActual !== '') {
                    manejarRespuesta(respuestaActual);
                  }
                }}
                className={`w-full rounded-2xl border p-4 text-center font-mono text-2xl font-bold sm:p-6 sm:text-3xl ${ui.input} focus:border-[#F5B301]`}
                autoFocus
              />
            </div>
          )}

          <div className="mt-5 h-6 text-center text-xs font-bold tracking-widest">
            {ultimoResultado && (
              <span className={ultimoResultado.correcta ? 'text-emerald-400' : 'text-rose-400'}>
                {ultimoResultado.correcta
                  ? `✓ CORRECTA +${ultimoResultado.puntos}`
                  : `✗ ERA ${ultimoResultado.resultado}`}
              </span>
            )}
          </div>
        </div>

        {config.modoRespuesta === 'escritura' && (
          <div className="mt-2 shrink-0 text-center text-xs text-white/40">
            Presiona ENTER para enviar tu respuesta
          </div>
        )}
      </div>
    </PageShell>
  );
};

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

  const statBox = 'rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center';

  return (
    <PageShell maxWidth="max-w-3xl" {...shellProps}>
      <div className="my-auto py-2 font-mono text-white">
        <header className="mb-4">
          <h1 className="text-xl font-bold tracking-wider sm:text-2xl">ESTADÍSTICAS FINALES</h1>
        </header>

        {tiempoAgotado && (
          <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 text-center text-rose-200">
            <h2 className="mb-1 flex items-center justify-center gap-2 text-xl font-bold sm:text-2xl">
              <AlarmClock size={24} /> ¡TIEMPO AGOTADO!
            </h2>
            <p className="text-sm">No pudiste completar todas las preguntas a tiempo</p>
          </div>
        )}

        <BorderGlowCard glowColor="#F5B301" className="w-full">
          <div className="relative z-10 space-y-6 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className={statBox}>
                <span className="block text-3xl font-bold text-emerald-400">{correctas}</span>
                <span className={ui.label}>CORRECTAS</span>
              </div>
              <div className={statBox}>
                <span className="block text-3xl font-bold text-rose-400">{incorrectas}</span>
                <span className={ui.label}>INCORRECTAS</span>
              </div>
              <div className={statBox}>
                <span className="block text-3xl font-bold">{sinResponder}</span>
                <span className={ui.label}>SIN RESPONDER</span>
              </div>
              <div className={statBox}>
                <span className="block text-3xl font-bold text-[#F5B301]">{puntajeTotal}</span>
                <span className={ui.label}>PUNTAJE TOTAL</span>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-widest">
                <Settings size={18} className="text-[#F5B301]" /> CONFIGURACIÓN DEL QUIZ
              </h2>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-white/40">Operaciones:</span>
                  <span className="font-bold">{operacionesTexto}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-white/40">Cantidad de preguntas:</span>
                  <span className="font-bold">{config.cantidadPreguntas}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-white/40">Dígitos:</span>
                  <span className="font-bold">{config.digitosMin} - {config.digitosMax}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-white/40">Modo de respuesta:</span>
                  <span className="font-bold">
                    {config.modoRespuesta === 'opciones' ? 'OPCIONES' : 'ESCRITURA'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-white/40">Tiempo restante:</span>
                  <span className="font-bold text-emerald-400">
                    {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:gap-4">
              <button onClick={onReiniciar} className={`${ui.btnPrimary} p-3 text-sm sm:p-4`}>
                NUEVO QUIZ
              </button>
              <Link
                to="/"
                className={`${ui.btnGhost} p-3 text-center text-sm sm:p-4`}
              >
                VOLVER AL INICIO
              </Link>
            </div>
          </div>
        </BorderGlowCard>
      </div>
    </PageShell>
  );
};

const CalculoMental = () => {
  const [pantalla, setPantalla] = useState('configuracion');
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