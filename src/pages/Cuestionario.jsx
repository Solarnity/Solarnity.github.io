import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, Info, Sigma } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

const Cuestionario = () => {
  const [cuestionarioData, setCuestionarioData] = useState(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [correctasContador, setCorrectasContador] = useState(0);
  const [incorrectasContador, setIncorrectasContador] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContenido, setMostrarContenido] = useState(false);
  const [nombreCuestionario, setNombreCuestionario] = useState("");
  const [esAleatorio, setEsAleatorio] = useState(true);

  const fileInputRef = useRef(null);
  const fileInputCargarOtroRef = useRef(null);

  const MARKERS = {
    CODE_START: "[INICIO_CODIGO]",
    CODE_END: "[FIN_CODIGO]",
    MATH_START: "[INICIO_MAT]",
    MATH_END: "[FIN_MAT]",
  };

  const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const renderContent = (text) => {
    if (typeof text !== "string") return text;

    // Split por marcadores de código y matemáticas usando regex
    const parts = text.split(
      /(\[INICIO_CODIGO\][\s\S]*?\[FIN_CODIGO\]|\[INICIO_MAT\][\s\S]*?\[FIN_MAT\])/g,
    );

    return parts.map((part, index) => {
      if (part.startsWith(MARKERS.CODE_START)) {
        const content = part
          .replace(MARKERS.CODE_START, "")
          .replace(MARKERS.CODE_END, "")
          .trim();
        return (
          <pre
            key={index}
            className="bg-gray-100 p-2 font-mono text-[10px] border border-gray-300 overflow-x-auto whitespace-pre-wrap break-all my-2"
          >
            {content}
          </pre>
        );
      }
      if (part.startsWith(MARKERS.MATH_START)) {
        const content = part
          .replace(MARKERS.MATH_START, "")
          .replace(MARKERS.MATH_END, "")
          .trim();
        return <InlineMath key={index} math={content} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setCargando(true);
    setMostrarContenido(false);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setCuestionarioData(data);
        const nombreBase = file.name.replace(".json", "").split("_").join(" ");
        setNombreCuestionario(
          nombreBase.charAt(0).toUpperCase() + nombreBase.slice(1),
        );
        inicializarCuestionario(data);
      } catch (err) {
        setError("Error al parsear el archivo JSON: " + err.message);
        setCargando(false);
      }
    };
    reader.readAsText(file);
  };

  const inicializarCuestionario = (data) => {
    if (!data) return;

    let preguntasProcesadas = esAleatorio
      ? shuffleArray(data.preguntas)
      : [...data.preguntas];

    preguntasProcesadas = preguntasProcesadas.map((pregunta) => {
      const respuestas_correctas_array = Array.isArray(
        pregunta.respuesta_correcta,
      )
        ? pregunta.respuesta_correcta.map((res) => String(res).trim())
        : [String(pregunta.respuesta_correcta).trim()];

      const opcionesOriginales = [...pregunta.opciones];
      const opcionesShuffled = esAleatorio
        ? shuffleArray(opcionesOriginales)
        : opcionesOriginales;

      const correctas_shuffled_indices = respuestas_correctas_array
        .map((correctAnswer) => opcionesShuffled.indexOf(correctAnswer))
        .filter((index) => index !== -1);

      return {
        ...pregunta,
        opciones: opcionesShuffled,
        respuestas_correctas_array,
        esMultipleRespuesta: respuestas_correctas_array.length > 1,
        correctas_shuffled_indices: [...new Set(correctas_shuffled_indices)],
      };
    });

    setShuffledQuestions(preguntasProcesadas);
    setRespuestasUsuario({});
    setPuntajeTotal(0);
    setCorrectasContador(0);
    setIncorrectasContador(0);
    setCurrentQuestionIndex(0);
    setMostrarContenido(true);
    setCargando(false);
  };

  const verificarRespuesta = (index) => {
    const pregunta = shuffledQuestions[index];
    const respuesta = respuestasUsuario[index];
    if (!respuesta) return;

    const userIndices = new Set(respuesta.opcionIndices);
    const correctIndices = new Set(pregunta.correctas_shuffled_indices);

    const isCorrect =
      userIndices.size === correctIndices.size &&
      [...userIndices].every((idx) => correctIndices.has(idx));

    setRespuestasUsuario((prev) => ({
      ...prev,
      [index]: { ...respuesta, esCorrecta: isCorrect, verificada: true },
    }));

    if (isCorrect) {
      setPuntajeTotal((p) => p + parseInt(pregunta.puntaje));
      setCorrectasContador((c) => c + 1);
    } else {
      setIncorrectasContador((i) => i + 1);
    }
  };

  const seleccionarOpcion = (qIdx, oIdx) => {
    if (respuestasUsuario[qIdx]?.verificada) return;

    const current = respuestasUsuario[qIdx] || { opcionIndices: [] };
    const existe = current.opcionIndices.indexOf(oIdx);

    let nuevosIndices =
      existe > -1
        ? current.opcionIndices.filter((i) => i !== oIdx)
        : [...current.opcionIndices, oIdx];

    setRespuestasUsuario({
      ...respuestasUsuario,
      [qIdx]: { opcionIndices: nuevosIndices, verificada: false },
    });
  };

  const getOpcionClass = (qIdx, oIdx) => {
    const res = respuestasUsuario[qIdx];
    const preg = shuffledQuestions[qIdx];
    if (!res) return "border-gray-300 hover:border-black";

    if (res.verificada) {
      const estaSeleccionada = res.opcionIndices.includes(oIdx);
      const esCorrecta = preg.correctas_shuffled_indices.includes(oIdx);
      if (esCorrecta)
        return "border-green-500 bg-green-50 text-green-700 font-bold";
      if (estaSeleccionada && !esCorrecta)
        return "border-red-500 bg-red-50 text-red-700";
      return "border-gray-200 opacity-50";
    }

    return res.opcionIndices.includes(oIdx)
      ? "bg-black text-white border-black"
      : "border-gray-300 hover:bg-gray-50";
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black font-mono p-4 overflow-hidden">
      {mostrarContenido && (
        <header className="mb-2 pb-2 border-b border-black flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="btn btn-xs btn-square rounded-none bg-black text-white"
            >
              <ChevronLeft size={16} />
            </Link>
            <span className="font-bold uppercase text-sm">
              {nombreCuestionario}
            </span>
          </div>
          <button
            onClick={() => fileInputCargarOtroRef.current?.click()}
            className="btn btn-xs rounded-none bg-black text-white px-4"
          >
            CAMBIAR
          </button>
          <input
            ref={fileInputCargarOtroRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </header>
      )}

      <main className="flex-1 flex flex-col gap-2 min-h-0">
        {/* Pantalla de inicio - Solo visible cuando NO hay contenido cargado */}
        {!mostrarContenido && !cargando && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl border border-black p-6 md:p-8">
              <div className="text-center space-y-3">
                <p className="font-bold uppercase tracking-widest text-xs">
                  Cargar Cuestionario:
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors text-sm"
                >
                  SELECCIONAR ARCHIVO JSON
                </button>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={esAleatorio}
                    onChange={() => setEsAleatorio(!esAleatorio)}
                    className="checkbox checkbox-xs rounded-none border-black"
                  />
                  <span className="text-[10px] font-bold">
                    MODO ALEATORIO (PREGUNTAS Y OPCIONES)
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Instrucciones del formato JSON */}
                <div className="mt-8 text-left border-t border-black pt-6">
                  <h3 className="text-lg font-bold mb-3 text-center">
                    ESPECIFICACIONES DEL FORMATO
                  </h3>

                  <div className="space-y-4 text-xs md:text-sm">
                    <div className="bg-gray-50 p-4 border border-gray-300">
                      <p className="font-bold mb-2">Estructura del Objeto:</p>
                      <pre className="whitespace-pre-wrap break-all font-mono text-[10px] bg-white p-3 border border-gray-200">
                        {`{
  "preguntas": [
    {
      "pregunta": "Texto con [INICIO_MAT]x^2[FIN_MAT]",
      "opciones": ["Opción A", "[INICIO_CODIGO]print('B')[FIN_CODIGO]", "C"],
      "respuesta_correcta": "Opción A", // O array para múltiple
      "puntaje": 10,
      "dificultad": "Media"
    }
  ]
}`}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-300 p-3">
                        <p className="font-bold mb-2">
                          Sintaxis de Enriquecimiento:
                        </p>
                        <ul className="list-disc pl-4 space-y-2 text-[11px]">
                          <li>
                            <span className="font-bold">
                              Bloques de Código:
                            </span>
                            <br />
                            <code className="bg-gray-200 px-1">
                              [INICIO_CODIGO] ... [FIN_CODIGO]
                            </code>
                          </li>
                          <li>
                            <span className="font-bold">
                              Fórmulas Matemáticas (LaTeX):
                            </span>
                            <br />
                            <code className="bg-gray-200 px-1">
                              [INICIO_MAT] ... [FIN_MAT]
                            </code>
                          </li>
                          <li className="italic opacity-70">
                            Disponibles en 'pregunta', 'opciones' y
                            'respuesta_correcta'.
                          </li>
                        </ul>
                      </div>

                      <div className="border border-gray-300 p-3">
                        <p className="font-bold mb-2">Reglas de Validación:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          <li>
                            <span className="font-mono font-bold">
                              respuesta_correcta
                            </span>
                            : Debe coincidir exactamente con el texto de una o
                            varias opciones.
                          </li>
                          <li>
                            <span className="font-mono font-bold">puntaje</span>
                            : Valor numérico entero.
                          </li>
                          <li>
                            Soporta múltiples respuestas correctas usando un
                            array <span className="font-mono">[ ]</span>.
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-300 p-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xs">RECURSO DE APOYO</p>
                        <p className="text-[10px]">
                          Esquema base para validación de estructura.
                        </p>
                      </div>
                      <a
                        href="../../public/python_cuestionario.json"
                        download="PLANTILLA_CUESTIONARIO.json"
                        className="btn btn-xs rounded-none bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
                      >
                        DESCARGAR JSON
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mostrarContenido && shuffledQuestions.length > 0 && (
          <>
            <div className="grid grid-cols-3 border border-black divide-x divide-black bg-gray-50">
              <div className="py-1 text-center">
                <p className="text-[10px] opacity-60">CORRECTAS</p>
                <p className="font-bold text-green-600">{correctasContador}</p>
              </div>
              <div className="py-1 text-center">
                <p className="text-[10px] opacity-60">INCORRECTAS</p>
                <p className="font-bold text-red-600">{incorrectasContador}</p>
              </div>
              <div className="py-1 text-center">
                <p className="text-[10px] opacity-60">PUNTAJE</p>
                <p className="font-bold">{puntajeTotal}</p>
              </div>
            </div>

            <div className="flex-1 border border-black flex flex-col min-h-0 bg-white">
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex justify-between text-[10px] opacity-50 mb-2 font-bold uppercase tracking-tighter">
                  <span>
                    Pregunta {currentQuestionIndex + 1} /{" "}
                    {shuffledQuestions.length}
                  </span>
                  <span>
                    {shuffledQuestions[currentQuestionIndex].dificultad} |{" "}
                    {shuffledQuestions[currentQuestionIndex].puntaje} PTS
                  </span>
                </div>

                <div className="mb-6 text-sm leading-relaxed">
                  {renderContent(
                    shuffledQuestions[currentQuestionIndex].pregunta,
                  )}
                </div>

                <div className="space-y-2">
                  {shuffledQuestions[currentQuestionIndex].opciones.map(
                    (opcion, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          seleccionarOpcion(currentQuestionIndex, idx)
                        }
                        disabled={
                          respuestasUsuario[currentQuestionIndex]?.verificada
                        }
                        className={`w-full text-left p-3 text-xs border transition-all flex items-start gap-3 ${getOpcionClass(currentQuestionIndex, idx)}`}
                      >
                        <span className="opacity-50 font-bold">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <div className="flex-1">{renderContent(opcion)}</div>
                      </button>
                    ),
                  )}
                </div>

                {respuestasUsuario[currentQuestionIndex]?.verificada && (
                  <div
                    className={`mt-4 p-3 border text-xs ${respuestasUsuario[currentQuestionIndex].esCorrecta ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
                  >
                    <p className="font-bold uppercase mb-1">
                      {respuestasUsuario[currentQuestionIndex].esCorrecta
                        ? "✓ Respuesta Correcta"
                        : "✗ Respuesta Incorrecta"}
                    </p>
                    {!respuestasUsuario[currentQuestionIndex].esCorrecta && (
                      <div className="mt-1">
                        <span className="font-bold">Solución:</span>
                        <div className="mt-2 pl-2 border-l-2 border-red-200">
                          {shuffledQuestions[
                            currentQuestionIndex
                          ].respuestas_correctas_array.map((solucion, sIdx) => (
                            <div key={sIdx} className="mb-1">
                              {renderContent(solucion)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-black bg-gray-50 flex justify-between items-center">
                {!respuestasUsuario[currentQuestionIndex]?.verificada ? (
                  <button
                    onClick={() => verificarRespuesta(currentQuestionIndex)}
                    disabled={
                      !respuestasUsuario[currentQuestionIndex]?.opcionIndices
                        .length
                    }
                    className="w-full btn btn-sm rounded-none bg-black text-white"
                  >
                    VERIFICAR
                  </button>
                ) : (
                  <div className="text-[10px] font-bold flex items-center gap-2">
                    <Info size={14} />{" "}
                    {shuffledQuestions[currentQuestionIndex].esMultipleRespuesta
                      ? "ESTA PREGUNTA ERA MULTIPLE"
                      : "PREGUNTA COMPLETADA"}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
                className="btn btn-sm rounded-none border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-30"
              >
                ATRÁS
              </button>
              <button
                onClick={() => inicializarCuestionario(cuestionarioData)}
                className="btn btn-sm rounded-none border-2 border-red-600 bg-white text-red-600 hover:bg-red-600 hover:text-white font-bold"
              >
                REINICIAR
              </button>
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(shuffledQuestions.length - 1, prev + 1),
                  )
                }
                disabled={currentQuestionIndex === shuffledQuestions.length - 1}
                className="btn btn-sm rounded-none border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-30"
              >
                SIGUIENTE
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Cuestionario;