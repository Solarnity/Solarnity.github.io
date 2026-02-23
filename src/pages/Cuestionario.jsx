import React, { useState, useRef } from 'react';
import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';

const Cuestionarios = () => {
  const [cuestionarioData, setCuestionarioData] = useState(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [correctasContador, setCorrectasContador] = useState(0);
  const [incorrectasContador, setIncorrectasContador] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarContenido, setMostrarContenido] = useState(false);
  const [nombreCuestionario, setNombreCuestionario] = useState('');

  const fileInputRef = useRef(null);
  const fileInputCargarOtroRef = useRef(null);

  const CODE_START_MARKER = '[INICIO_CODIGO]';
  const CODE_END_MARKER = '[FIN_CODIGO]';

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setCargando(true);
    setMostrarContenido(false);
    setError('');

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setCuestionarioData(data);
        
        const nombreBase = file.name.replace('.json', '');
        const nombreLimpio = nombreBase.split('_').join(' ');
        setNombreCuestionario(nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1));
        
        inicializarCuestionario(data);
      } catch (error) {
        setError('Error al parsear el archivo JSON: ' + error.message);
        setCargando(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo');
      setCargando(false);
    };

    reader.readAsText(file);
  };

  const inicializarCuestionario = (data) => {
    if (!data) return;

    const shuffled = shuffleArray([...data.preguntas]);
    
    shuffled.forEach((pregunta) => {
      pregunta.respuestas_correctas_array = Array.isArray(pregunta.respuesta_correcta)
        ? pregunta.respuesta_correcta.map(res => res.trim())
        : [pregunta.respuesta_correcta.trim()];

      pregunta.esMultipleRespuesta = pregunta.respuestas_correctas_array.length > 1;

      const opcionesOriginales = [...pregunta.opciones];
      pregunta.opciones = shuffleArray(opcionesOriginales);

      pregunta.correctas_shuffled_indices = pregunta.respuestas_correctas_array.map(correctAnswer =>
        pregunta.opciones.indexOf(correctAnswer)
      ).filter(index => index !== -1);

      pregunta.correctas_shuffled_indices = [...new Set(pregunta.correctas_shuffled_indices)];
    });

    setShuffledQuestions(shuffled);
    setRespuestasUsuario({});
    setPuntajeTotal(0);
    setCorrectasContador(0);
    setIncorrectasContador(0);
    setCurrentQuestionIndex(0);
    setMostrarContenido(true);
    setCargando(false);
  };

  const reiniciarCuestionario = () => {
    if (cuestionarioData) {
      inicializarCuestionario(cuestionarioData);
    }
  };

  const cargarOtroCuestionario = () => {
    fileInputCargarOtroRef.current?.click();
  };

  const verificarRespuesta = (preguntaIndex) => {
    const preguntaData = shuffledQuestions[preguntaIndex];
    const respuestaUsuario = respuestasUsuario[preguntaIndex];
    
    const userSelectedOptions = new Set(respuestaUsuario.opcionIndices);
    const correctOptionsIndices = new Set(preguntaData.correctas_shuffled_indices);

    const isCorrect = userSelectedOptions.size === correctOptionsIndices.size &&
      [...userSelectedOptions].every(index => correctOptionsIndices.has(index));

    const nuevasRespuestas = {
      ...respuestasUsuario,
      [preguntaIndex]: {
        ...respuestaUsuario,
        esCorrecta: isCorrect,
        verificada: true
      }
    };

    setRespuestasUsuario(nuevasRespuestas);

    if (isCorrect) {
      setPuntajeTotal(prev => prev + parseInt(preguntaData.puntaje));
      setCorrectasContador(prev => prev + 1);
    } else {
      setIncorrectasContador(prev => prev + 1);
    }
  };

  const seleccionarOpcion = (preguntaIndex, opcionIndex) => {
    if (respuestasUsuario[preguntaIndex]?.verificada) return;

    const preguntaData = shuffledQuestions[preguntaIndex];
    const currentRespuesta = respuestasUsuario[preguntaIndex] || { opcionIndices: [], opcionTextos: [] };
    
    const indexInSelection = currentRespuesta.opcionIndices.indexOf(opcionIndex);
    let nuevasOpciones;

    if (indexInSelection > -1) {
      nuevasOpciones = currentRespuesta.opcionIndices.filter(idx => idx !== opcionIndex);
    } else {
      nuevasOpciones = [...currentRespuesta.opcionIndices, opcionIndex];
    }

    setRespuestasUsuario({
      ...respuestasUsuario,
      [preguntaIndex]: {
        opcionIndices: nuevasOpciones,
        opcionTextos: nuevasOpciones.map(idx => preguntaData.opciones[idx]),
        verificada: false
      }
    });
  };

  const formatPreguntaContent = (pregunta) => {
    const startIndex = pregunta.indexOf(CODE_START_MARKER);
    const endIndex = pregunta.indexOf(CODE_END_MARKER);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const preCodeText = pregunta.substring(0, startIndex).trim();
      const codeBlock = pregunta.substring(startIndex + CODE_START_MARKER.length, endIndex).trim();
      const postCodeText = pregunta.substring(endIndex + CODE_END_MARKER.length).trim();

      return (
        <>
          {preCodeText && <p className="mb-2 text-xs">{preCodeText}</p>}
          <pre className="bg-gray-100 p-3 font-mono text-xs md:text-xs border border-gray-300 overflow-x-auto whitespace-pre-wrap break-all mb-2">
            {codeBlock}
          </pre>
          {postCodeText && <p className="text-xs">{postCodeText}</p>}
        </>
      );
    }
    return <p className="text-xs">{pregunta}</p>;
  };

  const getOpcionClass = (preguntaIndex, opcionIndex) => {
    const respuesta = respuestasUsuario[preguntaIndex];
    const pregunta = shuffledQuestions[preguntaIndex];
    
    if (!respuesta) return 'border-gray-300 hover:border-black hover:bg-gray-50';
    
    if (respuesta.verificada) {
      const esCorrecta = respuesta.esCorrecta;
      const estaSeleccionada = respuesta.opcionIndices.includes(opcionIndex);
      const esOpcionCorrecta = pregunta.correctas_shuffled_indices.includes(opcionIndex);

      if (esCorrecta && estaSeleccionada) {
        return 'border-green-500 bg-green-50';
      } else if (!esCorrecta) {
        if (estaSeleccionada && !esOpcionCorrecta) {
          return 'border-red-500 bg-red-50';
        } else if (esOpcionCorrecta) {
          return 'border-green-500 bg-green-50';
        }
      }
    } else if (respuesta.opcionIndices.includes(opcionIndex)) {
      return 'bg-black text-white border-black';
    }
    
    return 'border-gray-300 hover:border-black hover:bg-gray-50';
  };

  const irAnterior = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const irSiguiente = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black font-mono p-4 selection:bg-black selection:text-white overflow-hidden">
      {/* Header - Solo visible cuando hay contenido cargado */}
      {mostrarContenido && (
        <header className="mb-2 pb-2 border-b border-black flex-shrink-0">
          <div className="flex justify-between sm:items-center gap-2">
            
            <div className="text-lg font-bold mb-1 gap-3 flex items-center">
              <Link
                to="/"
                className="btn btn-xs btn-square rounded-none bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
              >
                <ChevronLeft/>
              </Link>
              {nombreCuestionario}
            </div>

            <button
              onClick={cargarOtroCuestionario}
              className="btn btn-xs rounded-none bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
            >
              CARGAR CUESTIONARIO
            </button>

            <input
              ref={fileInputCargarOtroRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col gap-2 min-h-0">
        {/* Pantalla de inicio - Solo visible cuando NO hay contenido cargado */}
        {!mostrarContenido && !cargando && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl border border-black p-6 md:p-8">
              <div className="text-center space-y-3">
    
                <p className="font-bold">Cargar Cuestionario:</p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors text-sm"
                >
                  Selecciona un archivo JSON
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Instrucciones del formato JSON */}
                <div className="mt-8 text-left border-t border-gray-300 pt-6">
                  <h3 className="text-lg font-bold mb-3">FORMATO DEL JSON</h3>
                  
                  <div className="space-y-4 text-xs md:text-sm">
                    <div className="bg-gray-50 p-4 border border-gray-300">
                      <p className="font-bold mb-2">Estructura:</p>
                      <pre className="whitespace-pre-wrap break-all font-mono text-xs bg-white p-3 border border-gray-200">
{`{
  "preguntas": [
    {
      "pregunta": "Texto de la pregunta",
      "opciones": ["Opción A", "Opción B", "Opción C"],
      "respuesta_correcta": "Opción A",
      "puntaje": 5,
      "dificultad": "Easy"
    }
  ]
}`}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-300 p-3">
                        <p className="font-bold mb-2">Campos requeridos:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li><span className="font-mono">pregunta</span> (string)</li>
                          <li><span className="font-mono">opciones</span> (array)</li>
                          <li><span className="font-mono">respuesta_correcta</span> (string/array)</li>
                          <li><span className="font-mono">puntaje</span> (number)</li>
                          <li><span className="font-mono">dificultad</span> (string)</li>
                        </ul>
                      </div>

                      <div className="border border-gray-300 p-3">
                        <p className="font-bold mb-2">Características:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Soporte para código: <span className="font-mono text-xs">[INICIO_CODIGO]...[FIN_CODIGO]</span></li>
                          <li>Múltiples respuestas correctas (usando array)</li>
                          <li>Preguntas y opciones se mezclan automáticamente</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-300 p-3">
                      <p className="font-bold mb-1">JSON de Ejemplo:</p>
                      <a
                        href="../../public/python_cuestionario.json"
                        download="JSON EJEMPLO.json"
                        className="btn btn-sm rounded-none bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
                      >
                        Descargar (16,7 KB)
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="border border-red-500 bg-red-50 p-4 text-red-800 flex-shrink-0">
            {error}
          </div>
        )}

        {/* Cargador */}
        {cargando && (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-black p-8 text-center">
              <p className="text-sm tracking-widest animate-pulse">CARGANDO CUESTIONARIO...</p>
            </div>
          </div>
        )}

        {/* Contenido del Cuestionario */}
        {mostrarContenido && shuffledQuestions.length > 0 && (
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {/* Stats - Más pequeñas */}
            <div className="grid grid-cols-3 divide-x-3 divide-double border border-black">
              <div className="text-center py-1">
                <span className="block opacity-50 text-xs">CORRECTAS</span>
                <span className="font-bold text-green-600 text-sm">{correctasContador}</span>
              </div>
              <div className="text-center py-1">
                <span className="block opacity-50 text-xs">INCORRECTAS</span>
                <span className="font-bold text-red-600 text-sm">{incorrectasContador}</span>
              </div>
              <div className="text-center py-1">
                <span className="block opacity-50 text-xs">PUNTAJE</span>
                <span className="font-bold text-sm">{puntajeTotal}</span>
              </div>
            </div>

            {/* Pregunta Actual - Contenedor con scroll */}
            <div className="flex-1 border border-black flex flex-col min-h-0">
              {/* Contenido scrolleable */}
              <div className="flex-1 p-3 overflow-y-auto">
                {(() => {
                  const pregunta = shuffledQuestions[currentQuestionIndex];

                  return (
                    <div className="mb-2">
                      <div className="flex justify-between items-center">
                        <div className="text-xs uppercase tracking-widest opacity-50 mb-1">
                          PREGUNTA {currentQuestionIndex + 1} DE {shuffledQuestions.length}
                        </div>

                        <div className="text-xs uppercase tracking-widest opacity-50 mb-1">
                          {pregunta.puntaje} PTS
                        </div>
                      </div>

                      <div className="h-px bg-black mb-3"></div>
                    </div>
                  );
                })()}

                {(() => {
                  const pregunta = shuffledQuestions[currentQuestionIndex];
                  const respuestaActual = respuestasUsuario[currentQuestionIndex];

                  return (
                    <div className="space-y-3">
                      <div className="prose max-w-none">
                        {formatPreguntaContent(pregunta.pregunta)}
                      </div>

                      <div className="space-y-2">
                        {pregunta.opciones.map((opcion, idx) => (
                          <button
                            key={idx}
                            onClick={() => seleccionarOpcion(currentQuestionIndex, idx)}
                            disabled={respuestaActual?.verificada}
                            className={`w-full text-left p-2 text-xs border transition
                              ${getOpcionClass(currentQuestionIndex, idx)}
                              ${respuestaActual?.verificada ? 'cursor-default' : 'cursor-pointer'}
                            `}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                            <span className="break-words">{opcion}</span>
                          </button>
                        ))}
                      </div>

                      {!respuestaActual?.verificada && (
                        <button
                          onClick={() => verificarRespuesta(currentQuestionIndex)}
                          disabled={!respuestaActual?.opcionIndices?.length}
                          className="w-full p-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
                        >
                          VERIFICAR RESPUESTA
                        </button>
                      )}

                      {respuestaActual?.verificada && (
                        <div className={`p-3 border ${
                          respuestaActual.esCorrecta 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-red-500 bg-red-50'
                        }`}>
                          <p className="font-bold mb-1 text-sm">
                            {respuestaActual.esCorrecta ? '✓ CORRECTO' : '✗ INCORRECTO'}
                          </p>
                          {!respuestaActual.esCorrecta && (
                            <p className="text-xs break-words">
                              <span className="font-bold">Correcta(s):</span> "{pregunta.respuestas_correctas_array.join('", "')}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Footer anclado */}
              <div className="border-t border-gray-300 p-3 bg-white flex-shrink-0">
                {(() => {
                  const pregunta = shuffledQuestions[currentQuestionIndex];
                  return (
                    <div className="flex flex-row justify-between items-center gap-2 text-xs">
                      <span><span className="font-bold">Dificultad:</span> {pregunta.dificultad}</span>
                      {pregunta.esMultipleRespuesta && (
                        <span className="btn btn-xs shadow-none border-0 rounded-none bg-red-600 text-white font-bold flex items-center gap-1">
                          <span>ⓘ</span> RESPUESTA MÚLTIPLE
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Botones en una sola línea */}
            <div className="grid grid-cols-3 gap-2 flex-shrink-0">
              <button
                onClick={irAnterior}
                disabled={currentQuestionIndex === 0}
                className="p-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-xs"
              >
                ← ATRÁS
              </button>
              
              <button
                onClick={reiniciarCuestionario}
                className="p-2 bg-red-600 text-white font-bold border-2 border-red-600 hover:bg-white hover:text-red-600 transition-colors text-xs"
              >
                REINICIAR
              </button>
              
              <button
                onClick={irSiguiente}
                disabled={currentQuestionIndex === shuffledQuestions.length - 1}
                className="p-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-xs"
              >
                SIGUIENTE →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cuestionarios;