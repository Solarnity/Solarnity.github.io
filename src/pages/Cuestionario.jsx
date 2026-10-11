import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, Info, Sigma } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { PageShell } from "../components/Layout/PageShell";
import { uiBlue as ui } from "../components/Layout/themes";
import DotGrid from "../components/Effects/DotGrid";
import { BorderGlowCard } from "../components/Effects/BorderGlowCard";

const BLUE_RGB = [59, 130, 246];

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
            className="rounded-lg bg-black/50 p-2 font-mono text-[10px] text-white/80 border border-white/10 overflow-x-auto whitespace-pre-wrap break-all my-2"
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

  const volverAlInicio = () => {
    setMostrarContenido(false);
    setCuestionarioData(null);
    setShuffledQuestions([]);
    setRespuestasUsuario({});
    setPuntajeTotal(0);
    setCorrectasContador(0);
    setIncorrectasContador(0);
    setCurrentQuestionIndex(0);
    setNombreCuestionario("");
    setFileName("");
    setError("");
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
    if (!res) return ui.optionIdle;

    if (res.verificada) {
      const estaSeleccionada = res.opcionIndices.includes(oIdx);
      const esCorrecta = preg.correctas_shuffled_indices.includes(oIdx);
      if (esCorrecta) return `${ui.optionCorrect} font-semibold`;
      if (estaSeleccionada && !esCorrecta) return ui.optionWrong;
      return "border-white/5 bg-white/[0.02] text-white/30";
    }

    return res.opcionIndices.includes(oIdx) ? ui.optionSelected : ui.optionIdle;
  };

  const preguntaActual = shuffledQuestions[currentQuestionIndex];
  const respuestaActual = respuestasUsuario[currentQuestionIndex];

  return (
    <PageShell
      maxWidth="max-w-4xl"
      baseClass="bg-[#060a14]"
      backdrop={<DotGrid color={BLUE_RGB} />}
    >
      <div
        className={
          mostrarContenido
            ? "flex min-h-0 flex-1 flex-col gap-3 py-2"
            : "flex flex-1 flex-col justify-center py-2"
        }
      >
        {mostrarContenido && (
          <header className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={volverAlInicio}
                aria-label="Volver al inicio del cuestionario"
                className={`${ui.btnGhost} flex h-8 w-8 shrink-0 items-center justify-center`}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
                {nombreCuestionario}
              </span>
            </div>
            <button
              onClick={() => fileInputCargarOtroRef.current?.click()}
              className={`${ui.btnGhost} shrink-0 px-4 py-1.5 text-xs`}
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

        {!mostrarContenido && !cargando && (
          <div className="mx-auto w-full max-w-2xl">
            <BorderGlowCard glowColor="#3B82F6" className="w-full">
              <div className="relative z-10 p-5 sm:p-8 text-center space-y-3 font-mono">
                <p className="font-bold uppercase tracking-widest text-xs text-white/80">
                  Cargar Cuestionario
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`${ui.btnPrimary} px-8 py-2.5 text-sm`}
                >
                  SELECCIONAR ARCHIVO JSON
                </button>

                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    checked={esAleatorio}
                    onChange={() => setEsAleatorio(!esAleatorio)}
                    className="checkbox checkbox-xs rounded-md border-white/30 [--chkbg:#3B82F6] [--chkfg:white]"
                  />
                  <span className="text-[10px] font-bold text-white/60">
                    MODO ALEATORIO (PREGUNTAS Y OPCIONES)
                  </span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mt-6 text-left border-t border-white/[0.08] pt-6">
                  <h3 className="text-base font-bold mb-3 text-center text-white tracking-wide">
                    ESPECIFICACIONES DEL FORMATO
                  </h3>

                  <div className="space-y-4 text-xs md:text-sm text-white/70">
                    <div className="rounded-xl bg-white/[0.03] p-4 border border-white/10">
                      <p className="font-bold mb-2 text-white">Estructura del Objeto:</p>
                      <pre className="whitespace-pre-wrap break-all font-mono text-[10px] rounded-lg bg-black/50 p-3 border border-white/10 text-white/70">
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
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="font-bold mb-2 text-white">
                          Sintaxis de Enriquecimiento:
                        </p>
                        <ul className="list-disc pl-4 space-y-2 text-[11px]">
                          <li>
                            <span className="font-bold text-white/90">
                              Bloques de Código:
                            </span>
                            <br />
                            <code className="rounded bg-white/10 px-1 text-white/80">
                              [INICIO_CODIGO] ... [FIN_CODIGO]
                            </code>
                          </li>
                          <li>
                            <span className="font-bold text-white/90">
                              Fórmulas Matemáticas (LaTeX):
                            </span>
                            <br />
                            <code className="rounded bg-white/10 px-1 text-white/80">
                              [INICIO_MAT] ... [FIN_MAT]
                            </code>
                          </li>
                          <li className="italic opacity-70">
                            Disponibles en 'pregunta', 'opciones' y
                            'respuesta_correcta'.
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="font-bold mb-2 text-white">Reglas de Validación:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          <li>
                            <span className="font-mono font-bold text-white/90">
                              respuesta_correcta
                            </span>
                            : Debe coincidir exactamente con el texto de una o
                            varias opciones.
                          </li>
                          <li>
                            <span className="font-mono font-bold text-white/90">
                              puntaje
                            </span>
                            : Valor numérico entero.
                          </li>
                          <li>
                            Soporta múltiples respuestas correctas usando un
                            array <span className="font-mono">[ ]</span>.
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-3">
                      <div>
                        <p className="font-bold text-xs text-white">RECURSO DE APOYO</p>
                        <p className="text-[10px] text-white/60">
                          Esquema base para validación de estructura.
                        </p>
                      </div>
                      <a
                        href="/files/python_cuestionario.json"
                        download="PLANTILLA_CUESTIONARIO.json"
                        className={`${ui.btnPrimary} shrink-0 px-3 py-1.5 text-[11px]`}
                      >
                        DESCARGAR JSON
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </BorderGlowCard>
          </div>
        )}

        {mostrarContenido && shuffledQuestions.length > 0 && (
          <>
            <div className={`${ui.panel} grid shrink-0 grid-cols-3 divide-x divide-white/[0.08] py-2`}>
              <div className="text-center">
                <p className={ui.label}>Correctas</p>
                <p className="font-mono font-bold text-emerald-400">{correctasContador}</p>
              </div>
              <div className="text-center">
                <p className={ui.label}>Incorrectas</p>
                <p className="font-mono font-bold text-rose-400">{incorrectasContador}</p>
              </div>
              <div className="text-center">
                <p className={ui.label}>Puntaje</p>
                <p className="font-mono font-bold text-white">{puntajeTotal}</p>
              </div>
            </div>

            <div className={`${ui.panel} flex min-h-0 flex-1 flex-col overflow-hidden`}>
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="mb-3 flex justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-white/40">
                  <span>
                    Pregunta {currentQuestionIndex + 1} / {shuffledQuestions.length}
                  </span>
                  <span>
                    {preguntaActual.dificultad} | {preguntaActual.puntaje} PTS
                  </span>
                </div>

                <div className="mb-6 text-sm leading-relaxed text-white">
                  {renderContent(preguntaActual.pregunta)}
                </div>

                <div className="space-y-2">
                  {preguntaActual.opciones.map((opcion, idx) => (
                    <button
                      key={idx}
                      onClick={() => seleccionarOpcion(currentQuestionIndex, idx)}
                      disabled={respuestaActual?.verificada}
                      className={`w-full text-left p-3 text-xs rounded-xl border transition-all duration-300 flex items-start gap-3 cursor-pointer disabled:cursor-default ${getOpcionClass(currentQuestionIndex, idx)}`}
                    >
                      <span className="font-mono font-bold opacity-50">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <div className="flex-1">{renderContent(opcion)}</div>
                    </button>
                  ))}
                </div>

                {respuestaActual?.verificada && (
                  <div
                    className={`mt-4 rounded-xl border p-3 text-xs ${
                      respuestaActual.esCorrecta
                        ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                        : "border-rose-500/40 bg-rose-950/30 text-rose-200"
                    }`}
                  >
                    <p className="font-mono font-bold uppercase mb-1">
                      {respuestaActual.esCorrecta
                        ? "✓ Respuesta Correcta"
                        : "✗ Respuesta Incorrecta"}
                    </p>
                    {!respuestaActual.esCorrecta && (
                      <div className="mt-1">
                        <span className="font-bold">Solución:</span>
                        <div className="mt-2 pl-2 border-l-2 border-rose-400/40">
                          {preguntaActual.respuestas_correctas_array.map((solucion, sIdx) => (
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

              <div className="flex shrink-0 items-center justify-between border-t border-white/[0.08] bg-white/[0.02] p-3">
                {!respuestaActual?.verificada ? (
                  <button
                    onClick={() => verificarRespuesta(currentQuestionIndex)}
                    disabled={!respuestaActual?.opcionIndices.length}
                    className={`${ui.btnPrimary} w-full py-2 text-sm`}
                  >
                    VERIFICAR
                  </button>
                ) : (
                  <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-white/60">
                    <Info size={14} />
                    {preguntaActual.esMultipleRespuesta
                      ? "ESTA PREGUNTA ERA MULTIPLE"
                      : "PREGUNTA COMPLETADA"}
                  </div>
                )}
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-3 gap-2">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className={`${ui.btnGhost} py-2 text-xs`}
              >
                ATRÁS
              </button>
              <button
                onClick={() => inicializarCuestionario(cuestionarioData)}
                className={`${ui.btnDanger} py-2 text-xs`}
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
                className={`${ui.btnGhost} py-2 text-xs`}
              >
                SIGUIENTE
              </button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default Cuestionario;