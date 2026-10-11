import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const findCurrentLineIndex = (arr, t) => {
  if (!arr || arr.length === 0) return -1;
  let idx = -1;
  for (let i = 0; i < arr.length; i++) {
    if (t >= arr[i].time) idx = i;
    else break;
  }
  return idx;
};

const lineColor = (offset) => {
  if (offset === 0) return '#ffffff';
  if (offset < 0) return '#2b2b2b';
  if (offset === 1) return '#5e5e5e';
  if (offset === 2) return '#4b4b4b';
  if (offset === 3) return '#3b3b3b';
  return '#2f2f2f';
};

const isStatusMessage = (plain) =>
  typeof plain === 'string' && plain.length < 60 && !plain.includes('\n');

export default function Lyrics({ lyrics, progress, onSeek, label = 'Lyrics' }) {
  const [mode, setMode] = useState('synced');
  const [offset, setOffset] = useState(0);

  const containerRef = useRef(null);
  const lineRefs = useRef([]);

  const synced = useMemo(
    () => (Array.isArray(lyrics?.synced) ? lyrics.synced : []),
    [lyrics]
  );
  const plain = lyrics?.plain || '';
  const hasSynced = synced.length > 0;
  const showSynced = hasSynced && mode === 'synced';

  const currentIdx = useMemo(
    () => findCurrentLineIndex(synced, progress),
    [synced, progress]
  );

  const recalc = () => {
    const container = containerRef.current;
    const el = lineRefs.current[Math.max(0, currentIdx)];
    if (!container || !el) return;
    setOffset(el.offsetTop - container.clientHeight * 0.28);
  };

  useLayoutEffect(recalc, [currentIdx, synced, showSynced]);

  const recalcRef = useRef(recalc);
  recalcRef.current = recalc;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => recalcRef.current());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const seekTo = (time) => {
    onSeek?.({ target: { value: time } });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 items-center justify-center gap-3 pb-3 text-sm text-white">
        <span>{label}</span>
        {hasSynced && plain && (
          <button
            type="button"
            onClick={() => setMode(mode === 'synced' ? 'plain' : 'synced')}
            className="cursor-pointer rounded border border-white/20 px-1.5 text-[10px] uppercase tracking-wider text-white/60 transition-colors hover:border-white/50 hover:text-white"
          >
            {mode === 'synced' ? 'sync' : 'texto'}
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_85%,transparent)]"
      >
        {showSynced ? (
          <div
            className="absolute inset-x-0 top-0 transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateY(${-offset}px)` }}
          >
            {synced.map((line, i) => (
              <button
                key={`${line.time}-${i}`}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                type="button"
                onClick={() => seekTo(line.time)}
                className="block w-full cursor-pointer py-2.5 text-left text-2xl font-bold leading-snug transition-colors duration-500 lg:py-3 lg:text-[2rem]"
                style={{ color: lineColor(i - currentIdx) }}
              >
                {line.text || '♪'}
              </button>
            ))}
          </div>
        ) : isStatusMessage(plain) || !plain ? (
          <p className="flex h-full items-center justify-center px-4 text-center text-sm italic text-white/50">
            {plain || 'No hay letra para esta canción.'}
          </p>
        ) : (
          <div className="h-full overflow-y-auto whitespace-pre-wrap px-1 py-6 text-left text-lg font-semibold leading-relaxed text-white/80 lg:text-xl">
            {plain}
          </div>
        )}
      </div>
    </div>
  );
}