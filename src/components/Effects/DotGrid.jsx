import React, { useEffect, useRef } from "react";

const DEFAULT_COLOR = [59, 130, 246];

const DotGrid = ({
  color = DEFAULT_COLOR,
  gap = 30,
  dotRadius = 1.4,
  influence = 150,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    const mouse = { x: -9999, y: -9999 };
    const [r, g, b] = color;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      const t = time / 1000;
      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const offX = (width - (cols - 1) * gap) / 2;
      const offY = (height - (rows - 1) * gap) / 2;

      for (let i = 0; i < cols; i++) {
        const x = offX + i * gap;
        for (let j = 0; j < rows; j++) {
          const y = offY + j * gap;

          const wave = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.9 + (i + j) * 0.35);
          let alpha = 0.1 + wave * 0.12;
          let radius = dotRadius;

          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < influence) {
            const k = 1 - dist / influence;
            alpha += k * 0.7;
            radius += k * 2.4;
          }

          ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || now - last < 33) return;
      last = now;
      draw(now);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (reduceMotion) draw(0);
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
      if (reduceMotion) draw(0);
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });
    observer.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    if (reduceMotion) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [color, gap, dotRadius, influence]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} />;
};

export default DotGrid;