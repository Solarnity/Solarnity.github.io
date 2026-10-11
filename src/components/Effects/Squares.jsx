import React, { useEffect, useRef } from "react";

const Squares = ({
  color = DEFAULT_COLOR,
  squareSize = 46,
  speed = 0.35,
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
    let offset = 0;
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

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const s = squareSize;
      const startX = -(offset % s) - s;
      const startY = -(offset % s) - s;

      const hx = Math.floor((mouse.x - startX) / s);
      const hy = Math.floor((mouse.y - startY) / s);

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.14)`;

      for (let x = startX; x < width + s; x += s) {
        for (let y = startY; y < height + s; y += s) {
          const ix = Math.round((x - startX) / s);
          const iy = Math.round((y - startY) / s);
          if (mouse.x > -9000 && ix === hx && iy === hy) {
            ctx.fillStyle = `rgba(${r},${g},${b},0.16)`;
            ctx.fillRect(x, y, s, s);
          }
          ctx.strokeRect(x + 0.5, y + 0.5, s, s);
        }
      }

      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.hypot(width, height) / 2
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(10,8,4,0.9)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || now - last < 33) return;
      last = now;
      offset += speed * 2;
      draw();
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (reduceMotion) draw();
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    observer.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });

    if (reduceMotion) draw();
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [color, squareSize, speed]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} />;
};

export default Squares;