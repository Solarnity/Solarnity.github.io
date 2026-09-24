import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { EEAuthCard } from "./EEAuthCard";

const playAudioSafely = (src) => {
  if (!src) return;
  const audio = new Audio(src);
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Si el navegador bloqueó el audio en el evento wheel, lo reproduce al primer toque o interacción
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

  eeTurnsRequired = 10,
  eeAppearSound = "/sounds/chipbell.mp3",
  eeUnlockSound = "/sounds/magicClick.mp3",
  eeRoute = "/secret",
  eeRedirectDelay = 1000,
  className = "",
}) => {
  const rootRef = useRef(null);
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

  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);
  const [showEE, setShowEE] = useState(false);

  const scrollStepsRef = useRef(0);
  const navigate = useNavigate();

  onChangeRef.current = onChange;

  const allItems = showEE ? [...items, { __isEE: true }] : items;
  const eeItemIndex = showEE ? items.length : -1;

  cfgRef.current = {
    count: allItems.length,
    items: allItems,
    cardW: Math.max(cardWidth * spacing, 1),
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

        let distance = cfg.loop
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
        el.style.pointerEvents = absDistance <= visibleRadius ? "auto" : "none";
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
    (value, snap = false) => {
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
      startLoop();
    },
    [startLoop]
  );

  useLayoutEffect(() => {
    updateCardTransforms(posRef.current);
  }, [allItems.length, updateCardTransforms]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const handleWheel = (event) => {
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const step = Math.max(-1, Math.min(1, delta / 120));

      applyTarget(targetRef.current + step, false);

      scrollStepsRef.current += Math.abs(step);
      const totalStepsRequired = Math.max(1, items.length) * Math.max(1, eeTurnsRequired);

      if (!showEE && scrollStepsRef.current >= totalStepsRequired) {
        setShowEE(true);
        playAudioSafely(eeAppearSound);
        startLoop();
      }

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
  }, [applyTarget, eeAppearSound, eeTurnsRequired, items.length, showEE, startLoop]);

  const handlePointerDown = useCallback((event) => {
    if (!cfgRef.current.draggable) return;
    dragRef.current = { x: event.clientX, start: targetRef.current, id: event.pointerId };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.x;
      if (!dragMovedRef.current && Math.abs(dx) > 5) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) {
        applyTarget(drag.start - dx / cfgRef.current.cardW, false);
      }
    },
    [applyTarget]
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget]);

  const handleCardClick = useCallback(
    (index, route) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      if (!cfg.count) return;

      const current = targetRef.current;
      const currentIndex = ((Math.round(current) % cfg.count) + cfg.count) % cfg.count;

      if (currentIndex === index) {
        if (route && index !== eeItemIndex) {
          navigate(route);
        }
        return;
      }

      let distance = index - currentIndex;
      if (cfg.loop && cfg.count > 1) {
        if (distance > cfg.count / 2) distance -= cfg.count;
        else if (distance < -cfg.count / 2) distance += cfg.count;
      }

      applyTarget(current + distance, true);
    },
    [applyTarget, eeItemIndex, navigate]
  );

  const handleKeyDown = useCallback(
    (event) => {
      let delta = null;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta = -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") delta = 1;
      if (delta === null) return;
      event.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget]
  );

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
    <div
      ref={rootRef}
      role="region"
      tabIndex={0}
      aria-label="Selector de Proyectos"
      className={`relative flex h-[430px] w-full items-center justify-center overflow-visible select-none outline-none
        [touch-action:none] [perspective:1400px] [perspective-origin:center_center] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
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
                  layout
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
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="w-full h-full"
                >
                  <ProjectCard app={app} isCurrent={isCurrent} />
                </motion.div>
              )}
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};