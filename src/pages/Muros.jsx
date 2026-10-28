import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrickWall } from "lucide-react";
import { uiWin98 as ui } from "../components/Layout/themes";
import {
  MAX_LENGTH,
  computeCombos,
  isPerfectSquare,
  pickBalanced,
  suggestLengths,
} from "../utils/wallMath";

const fmt = (n) => n.toLocaleString("es");

const MAX_GRID_LENGTH = 128;
const GRID_ROWS = 4;
const MAX_LABELED_SEGMENTS = 41;

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "⌫"];

const EXAMPLES = [
  { x: 25, p: 1 },
  { x: 50, p: 1 },
  { x: 100, p: 2 },
];

const digitsOnly = (value) => value.replace(/\D/g, "").slice(0, 10);

const MSG_ICONS = {
  error: "bg-[#FB0102] text-white",
  warn: "bg-[#FFFF00] text-black",
  ok: "bg-[#007F00] text-white",
};
const MSG_GLYPHS = { error: "×", warn: "!", ok: "★" };

const MsgBox = ({ kind, reduce, children }) => (
  <motion.div
    initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
    transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
    className={`${ui.etched} flex items-start gap-3 p-3`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center text-lg font-bold leading-none ${MSG_ICONS[kind]}`}
      aria-hidden
    >
      {MSG_GLYPHS[kind]}
    </span>
    <div className="min-w-0 flex-1 text-[13px] leading-snug">{children}</div>
  </motion.div>
);

const WallVisual = ({ x, p, n, r, reduce }) => {
  const period = r + p;
  const labeled = 2 * n + 1 <= MAX_LABELED_SEGMENTS;
  const showGrid = x <= MAX_GRID_LENGTH;

  const segments = useMemo(() => {
    if (!labeled) return [];
    const list = [{ type: "pillar", size: p }];
    for (let i = 0; i < n; i++) {
      list.push({ type: "fill", size: r });
      list.push({ type: "pillar", size: p });
    }
    return list;
  }, [labeled, n, r, p]);

  const reveal = reduce
    ? {}
    : {
        initial: { clipPath: "inset(0 100% 0 0)" },
        animate: { clipPath: "inset(0 0% 0 0)" },
        transition: { duration: 0.7, ease: "easeOut" },
      };

  const pillarShare = (p / period) * 100;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.25 }}
      className="space-y-3"
    >
      <p className="font-terminal text-[13px]">
        {fmt(x)} = {fmt(n)} × ({fmt(r)} + {fmt(p)}) + {fmt(p)}
      </p>

      {showGrid && (
        <div className={`${ui.scroll} overflow-x-auto bg-[#1a1a1a] p-1.5`}>
          <motion.div
            {...reveal}
            className="grid gap-px"
            style={{
              gridTemplateColumns: `repeat(${x}, minmax(14px, 1fr))`,
              minWidth: `${x * 15}px`,
            }}
          >
            {Array.from({ length: GRID_ROWS * x }, (_, i) => (
              <div
                key={i}
                className={`aspect-square ${i % x % period < p ? ui.pillar : ui.fill}`}
              />
            ))}
          </motion.div>
        </div>
      )}

      {labeled ? (
        <div className="flex h-11 w-full overflow-hidden bg-[#1a1a1a]">
          {segments.map((seg, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : i * 0.02 }}
              className={`flex items-center justify-center overflow-hidden text-[10px] font-bold leading-none text-black ${
                seg.type === "pillar" ? ui.pillar : ui.fill
              }`}
              style={{ flex: `${seg.size} 1 0%`, originX: 0 }}
              title={`${seg.type === "pillar" ? "Pilar" : "Relleno"}: ${fmt(seg.size)}`}
            >
              {(seg.size / x) * 100 >= 3.5 ? fmt(seg.size) : ""}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div {...reveal} className="flex h-11 w-full overflow-hidden bg-[#1a1a1a]">
          <div
            style={{
              width: `${((n * period) / x) * 100}%`,
              backgroundImage: `linear-gradient(to right, #00b050 0, #00b050 ${pillarShare}%, #ff8c1a ${pillarShare}%, #ff8c1a 100%)`,
              backgroundSize: `${100 / n}% 100%`,
              backgroundRepeat: "repeat-x",
            }}
          />
          <div className={ui.pillar} style={{ width: `${(p / x) * 100}%` }} />
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 ${ui.pillar}`} /> Pilar: {fmt(p)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 ${ui.fill}`} /> Relleno: {fmt(r)}
        </span>
        <span className="text-[#404040]">
          {fmt(n + 1)} pilares · {fmt(n)} rellenos
        </span>
      </div>
    </motion.div>
  );
};

const Muros = () => {
  const reduce = useReducedMotion();
  const [xStr, setXStr] = useState("");
  const [pStr, setPStr] = useState("1");
  const [active, setActive] = useState("x");
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [selectedN, setSelectedN] = useState(null);

  const calculate = (xRaw, pRaw) => {
    const fieldErrors = {};
    const x = Number(xRaw);
    const p = Number(pRaw === "" ? NaN : pRaw);

    if (xRaw === "" || !Number.isInteger(x) || x < 1) fieldErrors.x = "Escribe un número mayor que 0.";
    else if (x > MAX_LENGTH) fieldErrors.x = `Máximo: ${fmt(MAX_LENGTH)}.`;
    if (!Number.isInteger(p) || p < 1) fieldErrors.p = "Escribe un número mayor que 0.";
    else if (p > MAX_LENGTH) fieldErrors.p = `Máximo: ${fmt(MAX_LENGTH)}.`;

    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setResult(null);
      return;
    }

    const { remaining, combos } = computeCombos(x, p);

    if (remaining <= 0) {
      setResult({ kind: "error", x, p, remaining, combos: [] });
      setSelectedN(null);
      return;
    }

    setResult({
      kind: combos.length === 0 ? "none" : "ok",
      x,
      p,
      remaining,
      combos,
      square: p === 1 && isPerfectSquare(remaining) ? Math.round(Math.sqrt(remaining)) : null,
      suggestions: combos.length <= 1 ? suggestLengths(x, p) : [],
    });
    setSelectedN(combos.length > 0 ? pickBalanced(combos).n : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate(xStr, pStr);
  };

  const pressKey = (key) => {
    const set = active === "x" ? setXStr : setPStr;
    if (key === "C") set("");
    else if (key === "⌫") set((v) => v.slice(0, -1));
    else set((v) => digitsOnly(v + key));
  };

  const applyExample = (ex) => {
    setXStr(String(ex.x));
    setPStr(String(ex.p));
    calculate(String(ex.x), String(ex.p));
  };

  const applySuggestion = (x) => {
    setXStr(String(x));
    calculate(String(x), String(result.p));
  };

  const selected = result?.combos.find((c) => c.n === selectedN) || null;
  const hasList = result?.kind === "ok";

  const messages = [];
  if (result?.kind === "error") {
    messages.push(
      <MsgBox key="error" kind="error" reduce={reduce}>
        <p className="font-bold">El pilar no cabe.</p>
        <p>El muro tiene que ser más largo que el pilar.</p>
      </MsgBox>
    );
  }
  if (result && (result.kind === "none" || result.combos.length === 1)) {
    messages.push(
      <MsgBox key="warn" kind="warn" reduce={reduce}>
        <p className="font-bold">
          {result.kind === "none"
            ? "Con este largo no se puede hacer un muro simétrico."
            : "Solo hay una forma de hacerlo."}
        </p>
        <p>
          {result.kind === "none"
            ? "Prueba sumando o restando bloques al largo."
            : "Un pilar en cada extremo y un solo relleno en medio. Prueba otro largo para tener más opciones."}
        </p>
        {result.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span>Largos cercanos:</span>
            {result.suggestions.map((s) => (
              <button
                key={s.x}
                type="button"
                onClick={() => applySuggestion(s.x)}
                className={`${ui.btn} px-2 py-0.5 text-xs`}
              >
                {fmt(s.x)} ({s.delta > 0 ? "+" : ""}
                {s.delta})
              </button>
            ))}
          </div>
        )}
      </MsgBox>
    );
  }
  if (result?.square && result.square >= 2 && result.combos.some((c) => c.n === result.square)) {
    messages.push(
      <MsgBox key="square" kind="ok" reduce={reduce}>
        <p className="font-bold">¡Cuadrado perfecto!</p>
        <p>
          {fmt(result.remaining)} = {fmt(result.square)} × {fmt(result.square)}, así que puedes usar{" "}
          <strong>N = {fmt(result.square)}</strong> y <strong>R = {fmt(result.square - 1)}</strong>.{" "}
          <button
            type="button"
            onClick={() => setSelectedN(result.square)}
            className={`${ui.btn} ml-1 px-2 py-0.5 text-xs`}
          >
            Ver
          </button>
        </p>
      </MsgBox>
    );
  }

  const status = !result
    ? "Listo"
    : result.kind === "ok"
    ? `${fmt(result.combos.length)} combinaciones`
    : result.kind === "none"
    ? "Sin combinaciones"
    : "Error";

  const fieldBox = (id, label, value, setter, error) => (
    <div>
      <label htmlFor={id} className="mb-0.5 block text-xs">
        {active === (id === "mw-x" ? "x" : "p") ? "▸ " : ""}
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => setter(digitsOnly(e.target.value))}
        onFocus={() => setActive(id === "mw-x" ? "x" : "p")}
        placeholder={id === "mw-x" ? "0" : "1"}
        aria-invalid={Boolean(error)}
        className={`${ui.field} px-2 py-1 text-right font-terminal text-xl`}
      />
      {error && <p className="mt-0.5 text-xs text-[#c00000]">{error}</p>}
    </div>
  );

  return (
    <main
      className={`${ui.desktop} ${ui.font} min-h-[100dvh] px-2 pb-4 pt-14 sm:px-4 lg:flex lg:h-[100dvh] lg:items-center lg:justify-center lg:overflow-hidden lg:pt-12`}
    >
      <motion.section
        initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={`${ui.window} mx-auto flex w-full max-w-6xl flex-col lg:h-full lg:max-h-[44rem]`}
      >
        <div className={ui.titlebar}>
          <BrickWall size={14} aria-hidden />
          <h1 className="flex-1 truncate text-[13px]">Calculadora de muros</h1>
          <span className={`${ui.titleBtn} cursor-default`} aria-hidden>
            _
          </span>
          <span className={`${ui.titleBtn} cursor-default`} aria-hidden>
            □
          </span>
          <Link to="/" aria-label="Cerrar" className={`${ui.titleBtn} cursor-pointer`}>
            ×
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2.5">
            {fieldBox("mw-x", "Largo del muro (X)", xStr, setXStr, errors.x)}
            {fieldBox("mw-p", "Ancho del pilar (P)", pStr, setPStr, errors.p)}

            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Teclado numérico">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pressKey(key)}
                  className={`${ui.btn} py-1.5 text-base font-bold ${
                    key === "C" ? "text-[#c00000]" : ""
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <button type="submit" className={`${ui.btnDefault} px-3 py-2 text-sm`}>
              Calcular combinaciones
            </button>

            <fieldset className={`${ui.etched} px-2 pb-2 pt-0`}>
              <legend className="px-1 text-xs bg-[#C0C0C0]">Ejemplos</legend>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={`${ex.x}-${ex.p}`}
                    type="button"
                    onClick={() => applyExample(ex)}
                    className={`${ui.btn} px-2 py-0.5 text-xs`}
                  >
                    X={ex.x}, P={ex.p}
                  </button>
                ))}
              </div>
            </fieldset>
          </form>

          <div className="flex min-h-0 flex-col gap-3">
            <AnimatePresence initial={false}>{messages}</AnimatePresence>

            {hasList ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
                <div className={`${ui.inset} min-h-0 overflow-auto p-3 lg:order-2 ${ui.scroll}`}>
                  <p className="mb-2 text-xs font-bold">Vista previa</p>
                  {selected && (
                    <WallVisual
                      key={selected.n}
                      x={result.x}
                      p={result.p}
                      n={selected.n}
                      r={selected.r}
                      reduce={reduce}
                    />
                  )}
                </div>

                <div className={`${ui.inset} flex min-h-0 flex-col lg:order-1`}>
                  <div className="grid grid-cols-3 gap-px bg-[#808080] text-xs">
                    <span className={ui.listHeader}>Repet. (N)</span>
                    <span className={ui.listHeader}>Relleno (R)</span>
                    <span className={ui.listHeader}>Pilares</span>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="Combinaciones posibles"
                    className={`max-h-56 min-h-0 flex-1 overflow-y-auto lg:max-h-none ${ui.scroll}`}
                  >
                    {result.combos.map((c, i) => {
                      const isSel = c.n === selectedN;
                      return (
                        <motion.button
                          key={c.n}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          onClick={() => setSelectedN(c.n)}
                          initial={reduce ? false : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : Math.min(i, 12) * 0.025 }}
                          className={`grid w-full cursor-pointer grid-cols-3 px-2 py-0.5 text-left font-terminal tabular-nums ${
                            isSel ? ui.rowSelected : ui.rowIdle
                          }`}
                        >
                          <span>{fmt(c.n)}</span>
                          <span>{fmt(c.r)}</span>
                          <span>{fmt(c.n + 1)}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${ui.inset} flex-1 p-3 text-[13px] leading-relaxed`}>
                <p className="mb-2 font-bold">¿Cómo se usa?</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Escribe el largo del muro.</li>
                  <li>Elige el ancho del pilar (normalmente 1).</li>
                  <li>Pulsa «Calcular combinaciones».</li>
                </ol>
                <p className="mt-3">
                  El muro empieza y termina con un pilar. En medio se repite: relleno + pilar.
                </p>
                <p className="mt-3 font-terminal text-xs text-[#404040]">
                  X = N × (R + P) + P
                  <br />X largo · N repeticiones · R relleno · P pilar
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1 p-1 text-xs">
          <span className={`${ui.statusCell} flex-1`}>{status}</span>
          {result && result.remaining !== undefined && (
            <span className={`${ui.statusCell} hidden font-terminal sm:block`}>
              X − P = {fmt(result.remaining)}
            </span>
          )}
        </div>
      </motion.section>
    </main>
  );
};

export default Muros;