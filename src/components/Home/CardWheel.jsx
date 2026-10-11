import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { EEAuthCard } from "./EEAuthCard";

const DESIGN_HEIGHT = 430;

const NO_DRAG_SELECTOR = "button, input, textarea, select, a, [data-no-drag]";

const playAudioSafely = (src) => {
  if (!src) return;
  const audio = new Audio(src);
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      const unlockAudio = () => {
        audio.play().catch(() => {});
        window.removeEventListener("pointerdown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      };
      window.addEventListener("pointerdown", unlockAudio, { once: true });
      window.addEventListener("keydown", unlockAudio, { once: true });
    });
  }
};

export const CardWheel = ({
  items = [],
  defaultSelected = 0,
  onChange,
  cardWidth = 340,
  spacing = 1.15,
  mobileSpacing = 0.78,

  curve = 0.65,
  arc = 0.5,
  depth = 180,
  visibleCards = 7,

  blur = 2.5,
  fade = 0.45,
  minOpacity = 0.15,
  minScale = 0.65,
  smoothing = 250,

  loop = true,
  draggable = true,
  showDots = true,

  eeTurnsRequired = 10,
  eeAppearSound = "/sounds/chipbell.mp3",
  eeUnlockSound = "/sounds/magicClick.mp3",
  eeRoute = "/secret",
  eeRedirectDelay = 1000,
  className = "",
}) => {
  const outerRef = useRef(null);
  const stageRef = useRef(null);
  const itemRefs = useRef([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef(null);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const scrollStepsRef = useRef(0);
  const showEERef = useRef(false);
  const itemsLenRef = useRef(items.length);
  const eeTurnsRef = useRef(eeTurnsRequired);
  const eeSoundRef = useRef(eeAppearSound);
  const scaleRef = useRef(1);

  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);
  const [showEE, setShowEE] = useState(false);
  const [layout, setLayout] = useState({ scale: 1, spacing });

  const navigate = useNavigate();

  onChangeRef.current = onChange;
  showEERef.current = showEE;
  itemsLenRef.current = items.length;
  eeTurnsRef.current = eeTurnsRequired;
  eeSoundRef.current = eeAppearSound;
  scaleRef.current = layout.scale;

  const allItems = showEE ? [...items, { __isEE: true }] : items;
  const eeItemIndex = showEE ? items.length : -1;

  cfgRef.current = {
    count: allItems.length,
    items: allItems,
    cardW: Math.max(cardWidth * layout.spacing, 1),
    curve,
    arc,
    depth,
    visibleCards: Math.max(1, Math.floor(visibleCards)),
    blur,
    fade,
    minOpacity,
    minScale,
    loop,
    smoothing,
    draggable,
  };

  useEffect(() => {
    const compute = () => {
      const width = outerRef.current?.clientWidth || window.innerWidth;
      const height = window.innerHeight;

      const byWidth = (width * 0.78) / cardWidth;
      const byHeight = Math.max(height - 300, 160) / DESIGN_HEIGHT;
      const nextScale = Math.max(0.4, Math.min(1, byWidth, byHeight));
      const nextSpacing = width < 640 ? mobileSpacing : spacing;

      setLayout((prev) =>
        Math.abs(prev.scale - nextScale) < 0.005 && prev.spacing === nextSpacing
          ? prev
          : { scale: nextScale, spacing: nextSpacing }
      );
    };

    compute();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(compute) : null;
    if (observer && outerRef.current) observer.observe(outerRef.current);
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [cardWidth, spacing, mobileSpacing]);

  const getWrappedDistance = useCallback((index, position, count) => {
    let distance = index - position;
    if (count > 1) {
      distance = ((distance % count) + count) % count;
      if (distance > count / 2) distance -= count;
    }
    return distance;
  }, []);

  const getVisibleRadius = useCallback(() => {
    const count = cfgRef.current.visibleCards;
    return Math.floor((count - 1) / 2);
  }, []);

  const updateCardTransforms = useCallback(
    (currentPos) => {
      const elements = itemRefs.current;
      const cfg = cfgRef.current;
      const count = cfg.count;
      if (!count || elements.length === 0) return;

      const visibleRadius = getVisibleRadius();
      const totalArc = Math.PI * cfg.arc;
      const angleStep = visibleRadius > 0 ? totalArc / (visibleRadius * 2) : 0;
      const radiusX =
        visibleRadius > 0
          ? (cfg.cardW * visibleRadius) /
            Math.max(Math.sin(Math.min(Math.abs(angleStep), Math.PI / 2)), 0.01)
          : 0;
      const radiusZ = Math.max(cfg.depth, cfg.cardW * 0.35);

      for (let i = 0; i < count; i++) {
        const el = elements[i];
        if (!el) continue;

        const distance = cfg.loop
          ? getWrappedDistance(i, currentPos, count)
          : i - currentPos;

        const absDistance = Math.abs(distance);

        if (absDistance > visibleRadius + 1) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.style.visibility = "hidden";
          continue;
        }

        el.style.visibility = "visible";

        const normalized = visibleRadius > 0 ? distance / visibleRadius : 0;
        const angle = normalized * (totalArc / 2);
        let x = radiusX * Math.sin(angle);
        const y = Math.abs(normalized) * Math.abs(normalized) * cfg.cardW * cfg.curve * 0.14;
        const normalizedDepth = 1 - Math.cos(angle);
        let z = -normalizedDepth * radiusZ;

        if (Math.abs(distance) < 0.001) {
          x = 0;
          z = 0;
        }

        const depthScale = 1 - Math.min(absDistance / Math.max(visibleRadius, 1), 1) * (1 - cfg.minScale);
        const opacity = absDistance === 0 ? 1 : Math.max(cfg.minOpacity, 1 - absDistance * cfg.fade);
        const blurAmount = absDistance < 0.05 ? 0 : Math.min(absDistance * cfg.blur, 4);
        const rotateZ = normalized * -2.5;

        el.style.transform = `
          translate3d(
            calc(${x.toFixed(2)}px - 50%),
            calc(${y.toFixed(2)}px - 50%),
            ${z.toFixed(2)}px
          )
          scale(${depthScale.toFixed(4)})
          rotateZ(${rotateZ.toFixed(2)}deg)
        `;

        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blurAmount > 0 ? `blur(${blurAmount.toFixed(2)}px)` : "none";
        el.style.zIndex = String(Math.round(1000 - absDistance * 50));
        el.style.pointerEvents = absDistance <= Math.max(visibleRadius, 1) ? "auto" : "none";
      }
    },
    [getVisibleRadius, getWrappedDistance]
  );

  const runFrame = useCallback(
    (now) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const cfg = cfgRef.current;
      const tau = Math.max(cfg.smoothing, 1) / 1000;
      const k = 1 - Math.exp(-dt / tau);
      const target = targetRef.current;
      const current = posRef.current;

      let next = current + (target - current) * k;
      const settled = Math.abs(target - next) < 0.001;

      if (settled) next = target;
      posRef.current = next;

      updateCardTransforms(next);

      rafRef.current = settled ? null : requestAnimationFrame(runFrame);
    },
    [updateCardTransforms]
  );

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const applyTarget = useCallback(
    (value, snap = false, immediate = false) => {
      const cfg = cfgRef.current;
      if (cfg.count === 0) return;

      let nextValue = value;
      if (!cfg.loop) {
        nextValue = Math.min(Math.max(nextValue, 0), Math.max(cfg.count - 1, 0));
      }
      if (snap) nextValue = Math.round(nextValue);

      targetRef.current = nextValue;
      const index = ((Math.round(nextValue) % cfg.count) + cfg.count) % cfg.count;

      if (index !== selectedRef.current) {
        selectedRef.current = index;
        setSelectedIndex(index);
        onChangeRef.current?.(index, cfg.items[index]);
      }

      if (immediate) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        posRef.current = nextValue;
        updateCardTransforms(nextValue);
      } else {
        startLoop();
      }
    },
    [startLoop, updateCardTransforms]
  );

  useLayoutEffect(() => {
    updateCardTransforms(posRef.current);
  }, [allItems.length, layout, updateCardTransforms]);

  const revealEE = useCallback(() => {
    if (showEERef.current) return;

    const oldCount = itemsLenRef.current;
    if (cfgRef.current.loop && oldCount > 0) {
      const base = Math.round(posRef.current);
      const normalizedBase = ((base % oldCount) + oldCount) % oldCount;
      const shift = normalizedBase - base;
      if (shift !== 0) {
        posRef.current += shift;
        targetRef.current += shift;
        if (dragRef.current) {
          dragRef.current.start += shift;
          dragRef.current.lastValue += shift;
        }
      }
    }

    showEERef.current = true;
    setShowEE(true);
    playAudioSafely(eeSoundRef.current);
  }, []);

  const registerSteps = useCallback(
    (amount) => {
      if (showEERef.current || !amount) return;
      scrollStepsRef.current += amount;
      const required = Math.max(1, itemsLenRef.current) * Math.max(1, eeTurnsRef.current);
      if (scrollStepsRef.current >= required) revealEE();
    },
    [revealEE]
  );

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    const handleWheel = (event) => {
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const step = Math.max(-1, Math.min(1, delta / 120));

      registerSteps(Math.abs(step));
      applyTarget(targetRef.current + step, false);

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        applyTarget(targetRef.current, true);
      }, 140);
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget, registerSteps]);

  const handlePointerDown = useCallback((event) => {
    if (!cfgRef.current.draggable) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest?.(NO_DRAG_SELECTOR)) return;

    dragRef.current = {
      x: event.clientX,
      start: posRef.current,
      lastValue: posRef.current,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
      id: event.pointerId,
    };
    dragMovedRef.current = false;
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;

      const dx = event.clientX - drag.x;
      if (!dragMovedRef.current && Math.abs(dx) > 6) {
        dragMovedRef.current = true;
        setIsDragging(true);
        try {
          stageRef.current?.setPointerCapture(drag.id);
        } catch {
          /* noop */
        }
      }
      if (!dragMovedRef.current) return;

      const now = performance.now();
      const dt = now - drag.lastT;
      if (dt > 0) drag.velocity = (event.clientX - drag.lastX) / dt;
      drag.lastX = event.clientX;
      drag.lastT = now;

      const unit = scaleRef.current * cfgRef.current.cardW;
      registerSteps(Math.abs(drag.start - dx / unit - drag.lastValue));
      const next = drag.start - dx / unit;
      drag.lastValue = next;
      applyTarget(next, false, true);
    },
    [applyTarget, registerSteps]
  );

  const handlePointerEnd = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || (event && drag.id !== event.pointerId)) return;
      dragRef.current = null;
      setIsDragging(false);

      try {
        stageRef.current?.releasePointerCapture(drag.id);
      } catch {
        /* noop */
      }

      if (dragMovedRef.current) {
        const unit = scaleRef.current * cfgRef.current.cardW;
        const projected = (-drag.velocity / unit) * 160;
        const flick = Math.max(-1, Math.min(1, projected));
        applyTarget(Math.round(targetRef.current + flick), true);
        setTimeout(() => {
          dragMovedRef.current = false;
        }, 0);
      }
    },
    [applyTarget]
  );

  const getCurrentIndex = () => {
    const count = cfgRef.current.count;
    return ((Math.round(targetRef.current) % count) + count) % count;
  };

  const getShortestDistance = (from, to) => {
    const cfg = cfgRef.current;
    let distance = to - from;
    if (cfg.loop && cfg.count > 1) {
      if (distance > cfg.count / 2) distance -= cfg.count;
      else if (distance < -cfg.count / 2) distance += cfg.count;
    }
    return distance;
  };

  const handleCardClick = useCallback(
    (index, route) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      if (!cfg.count) return;

      const currentIndex = getCurrentIndex();

      if (currentIndex === index) {
        if (route && index !== eeItemIndex) navigate(route);
        return;
      }

      const distance = getShortestDistance(currentIndex, index);
      if (Math.abs(distance) !== 1) return;

      applyTarget(Math.round(targetRef.current) + distance, true);
    },
    [applyTarget, eeItemIndex, navigate]
  );

  const goTo = useCallback(
    (index) => {
      const cfg = cfgRef.current;
      if (!cfg.count) return;
      const distance = getShortestDistance(getCurrentIndex(), index);
      if (distance === 0) return;
      applyTarget(Math.round(targetRef.current) + distance, true);
    },
    [applyTarget]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      let delta = null;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta = -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") delta = 1;
      if (delta === null) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("input, textarea, select") || target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      registerSteps(1);
      applyTarget(Math.round(targetRef.current) + delta, true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applyTarget, registerSteps]);

  useEffect(() => {
    const count = items.length;
    if (count === 0) {
      posRef.current = 0;
      targetRef.current = 0;
      selectedRef.current = 0;
      setSelectedIndex(0);
      return;
    }
    if (!loop && targetRef.current > count - 1) {
      targetRef.current = count - 1;
      posRef.current = count - 1;
    }
    applyTarget(targetRef.current, false);
  }, [items, cardWidth, spacing, curve, arc, depth, visibleCards, blur, fade, minOpacity, minScale, loop, smoothing, applyTarget]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, []);

  return (
    <div ref={outerRef} className="w-full">
      <div
        ref={stageRef}
        role="region"
        tabIndex={0}
        aria-label="Selector de Proyectos"
        className={`relative w-full overflow-visible select-none outline-none [touch-action:none] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${className}`}
        style={{ height: `${DESIGN_HEIGHT * layout.scale}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className="absolute left-0 top-0 [perspective:1400px] [perspective-origin:center_center]"
          style={{
            width: `${100 / layout.scale}%`,
            height: `${DESIGN_HEIGHT}px`,
            transform: `scale(${layout.scale})`,
            transformOrigin: "top left",
          }}
        >
          <AnimatePresence>
            {allItems.map((app, index) => {
              const isCurrent = selectedIndex === index;
              const isEE = app.__isEE;

              return (
                <div
                  key={isEE ? "__ee_auth_card" : app.route || index}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  className="absolute left-1/2 top-1/2 will-change-[transform,opacity,filter] [transform-style:preserve-3d] [backface-visibility:hidden]"
                  style={{ width: `${cardWidth}px`, transformOrigin: "center center" }}
                  onClick={() => handleCardClick(index, app.route)}
                >
                  {isEE ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className="w-full h-full"
                    >
                      <EEAuthCard
                        isCurrent={isCurrent}
                        eeSound={eeUnlockSound}
                        eeRedirectDelay={eeRedirectDelay}
                        onSuccess={(resolvedRoute) => navigate(resolvedRoute || eeRoute)}
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full">
                      <ProjectCard app={app} isCurrent={isCurrent} />
                    </div>
                  )}
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {showDots && items.length > 1 && (
        <div
          role="tablist"
          aria-label="Proyectos"
          className="mt-3 flex items-center justify-center"
        >
          {items.map((app, index) => {
            const active = selectedIndex === index;
            return (
              <button
                key={app.route || index}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Ir a ${app.title || app.name || index + 1}`}
                onClick={() => goTo(index)}
                className="group cursor-pointer p-1.5 outline-none"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ease-out ${
                    active
                      ? "w-5 bg-[#E23F31] shadow-[0_0_10px_rgba(226,63,49,0.5)]"
                      : "w-1.5 bg-white/20 group-hover:bg-white/45"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};