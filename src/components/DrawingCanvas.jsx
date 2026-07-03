import { useRef, useEffect } from 'react';

const STROKE_COLOR = '#1A1C2E';
const STROKE_WIDTH = 5;
const GUIDE_ALPHA  = 0.11;
const GUIDE_COLOR  = '#5C6BC0';

// ─── Pure render ──────────────────────────────────────────────────────────────
function renderCanvas(canvas, strokes, guideChar, liveStroke) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.width  / dpr;
  const H   = canvas.height / dpr;

  ctx.clearRect(0, 0, W, H);

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Dashed border
  ctx.save();
  ctx.strokeStyle = '#DDE0F0';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(5, 5, W - 10, H - 10);
  ctx.restore();

  // Centre crosshairs (light guide)
  ctx.save();
  ctx.strokeStyle = '#ECEEF8';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10);
  ctx.moveTo(10, H / 2); ctx.lineTo(W - 10, H / 2);
  ctx.stroke();
  ctx.restore();

  // Faint guide character (trace mode only)
  if (guideChar) {
    ctx.save();
    ctx.globalAlpha    = GUIDE_ALPHA;
    ctx.fillStyle      = GUIDE_COLOR;
    ctx.font           = `${H * 0.60}px 'Noto Sans Ethiopic', serif`;
    ctx.textAlign      = 'center';
    ctx.textBaseline   = 'middle';
    ctx.fillText(guideChar, W / 2, H / 2);
    ctx.restore();
  }

  // Committed strokes
  for (const stroke of strokes) {
    paintStroke(ctx, stroke);
  }

  // Live (in-progress) stroke
  if (liveStroke && liveStroke.length > 0) {
    paintStroke(ctx, liveStroke);
  }
}

function paintStroke(ctx, points) {
  if (!points || points.length === 0) return;
  ctx.save();
  ctx.strokeStyle = STROKE_COLOR;
  ctx.fillStyle   = STROKE_COLOR;
  ctx.lineWidth   = STROKE_WIDTH;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

function getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;
  return { x: src.clientX - rect.left, y: src.clientY - rect.top };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DrawingCanvas({ guideChar = null, strokes, onStrokesChange }) {
  const canvasRef    = useRef(null);
  const isDrawing    = useRef(false);
  const liveStroke   = useRef([]);

  // Refs that mirror props so event handlers always see the latest values
  // without needing to be re-registered.
  const strokesRef   = useRef(strokes);
  const guideRef     = useRef(guideChar);
  const onChangeRef  = useRef(onStrokesChange);
  useEffect(() => { strokesRef.current  = strokes;          }, [strokes]);
  useEffect(() => { guideRef.current    = guideChar;        }, [guideChar]);
  useEffect(() => { onChangeRef.current = onStrokesChange;  }, [onStrokesChange]);

  // Initial sizing + ResizeObserver (registered once)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function sizeCanvas() {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      renderCanvas(canvas, strokesRef.current, guideRef.current, liveStroke.current);
    }

    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Re-render when strokes or guideChar prop changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    renderCanvas(canvas, strokes, guideChar, liveStroke.current);
  }, [strokes, guideChar]);

  // Touch handlers (non-passive so we can preventDefault to block scroll)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => {
      e.preventDefault();
      isDrawing.current  = true;
      liveStroke.current = [getCanvasPos(e, canvas)];
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      liveStroke.current.push(getCanvasPos(e, canvas));
      renderCanvas(canvas, strokesRef.current, guideRef.current, liveStroke.current);
    };

    const onTouchEnd = (e) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      isDrawing.current = false;
      if (liveStroke.current.length > 0) {
        onChangeRef.current([...strokesRef.current, [...liveStroke.current]]);
      }
      liveStroke.current = [];
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  }, []); // register once; all mutable data accessed via refs

  // Mouse handlers (React synthetic events — always fresh closure)
  function onMouseDown(e) {
    isDrawing.current  = true;
    liveStroke.current = [getCanvasPos(e, canvasRef.current)];
  }

  function onMouseMove(e) {
    if (!isDrawing.current) return;
    liveStroke.current.push(getCanvasPos(e, canvasRef.current));
    renderCanvas(canvasRef.current, strokesRef.current, guideRef.current, liveStroke.current);
  }

  function onMouseUp() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (liveStroke.current.length > 0) {
      onStrokesChange([...strokesRef.current, [...liveStroke.current]]);
    }
    liveStroke.current = [];
  }

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}
