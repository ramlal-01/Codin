import { getStroke } from "perfect-freehand";
import { useEffect, useMemo, useRef, useState } from "react";

const paperStyles = {
  blank: { label: "Blank", background: "#020617" },
  ruled: {
    label: "Ruled",
    background:
      "linear-gradient(rgba(148,163,184,0.22) 1px, transparent 1px), #020617",
    backgroundSize: "100% 34px",
  },
  grid: {
    label: "Grid",
    background:
      "linear-gradient(rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.16) 1px, transparent 1px), #020617",
    backgroundSize: "32px 32px",
  },
  dots: {
    label: "Dots",
    background: "radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1.5px), #020617",
    backgroundSize: "28px 28px",
  },
};

const penPresets = {
  pencil: { label: "Pencil", size: 3, opacity: 0.75, thinning: 0.65 },
  pen: { label: "Pen", size: 6, opacity: 1, thinning: 0.5 },
  marker: { label: "Marker", size: 12, opacity: 0.9, thinning: 0.25 },
  highlighter: { label: "Highlighter", size: 22, opacity: 0.34, thinning: 0.12 },
};

const colorSwatches = ["#f8fafc", "#22d3ee", "#a78bfa", "#fb7185", "#facc15", "#4ade80"];
const eraserRadius = 24;

function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (path, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      path.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return path;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
}

function WhiteboardCanvas({ state, onChange }) {
  const savedPage = state?.page || {};
  const [strokes, setStrokes] = useState(state?.strokes || []);
  const [tool, setTool] = useState("pen");
  const [paper, setPaper] = useState(savedPage.paper || "ruled");
  const [pageSize, setPageSize] = useState({
    width: savedPage.width || 1800,
    height: savedPage.height || 2200,
  });
  const [color, setColor] = useState("#f8fafc");
  const [customSize, setCustomSize] = useState(6);
  const svgRef = useRef(null);
  const scrollRef = useRef(null);
  const drawingRef = useRef(false);
  const activePointerIdRef = useRef(null);

  useEffect(() => {
    if (drawingRef.current) return;
    setStrokes(state?.strokes || []);
    if (state?.page) {
      setPaper(state.page.paper || "ruled");
      setPageSize({
        width: state.page.width || 1800,
        height: state.page.height || 2200,
      });
    }
  }, [state]);

  const activePreset = penPresets[tool] || penPresets.pen;
  const activeSize = customSize;
  const activeOpacity = activePreset.opacity;

  const paths = useMemo(
    () =>
      strokes.map((stroke) => ({
        ...stroke,
        path: getSvgPathFromStroke(
          getStroke(stroke.points, {
            size: stroke.size || 6,
            thinning: stroke.thinning ?? 0.5,
            smoothing: 0.55,
            streamline: 0.35,
          })
        ),
      })),
    [strokes]
  );

  function pageState(nextStrokes = strokes, nextPageSize = pageSize, nextPaper = paper) {
    return {
      strokes: nextStrokes,
      page: {
        width: nextPageSize.width,
        height: nextPageSize.height,
        paper: nextPaper,
      },
    };
  }

  function getPoint(event) {
    const rect = svgRef.current.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top, event.pressure || 0.5];
  }

  function commitState(nextStrokes, nextPageSize = pageSize, nextPaper = paper) {
    setStrokes(nextStrokes);
    setPageSize(nextPageSize);
    setPaper(nextPaper);
    onChange(pageState(nextStrokes, nextPageSize, nextPaper));
  }

  function strokeTouchesPoint(stroke, point, radius = eraserRadius) {
    const radiusSquared = radius * radius;
    return stroke.points.some(([x, y]) => {
      const dx = x - point[0];
      const dy = y - point[1];
      return dx * dx + dy * dy <= radiusSquared;
    });
  }

  function eraseAtPoint(point) {
    setStrokes((currentStrokes) => {
      const nextStrokes = currentStrokes.filter((stroke) => !strokeTouchesPoint(stroke, point));
      if (nextStrokes.length !== currentStrokes.length) {
        onChange(pageState(nextStrokes));
      }
      return nextStrokes;
    });
  }

  function releasePointer(event) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drawingRef.current = false;
    activePointerIdRef.current = null;
  }

  function extendPage(extraHeight = 900) {
    const nextPageSize = { ...pageSize, height: pageSize.height + extraHeight };
    commitState(strokes, nextPageSize);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }

  function maybeExtendForPoint(point, nextStrokes) {
    const currentPageSize = pageSize;
    if (point[1] < currentPageSize.height - 220) return currentPageSize;
    const nextPageSize = { ...currentPageSize, height: currentPageSize.height + 900 };
    setPageSize(nextPageSize);
    onChange(pageState(nextStrokes, nextPageSize));
    return nextPageSize;
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || activePointerIdRef.current !== null) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    activePointerIdRef.current = event.pointerId;
    const point = getPoint(event);

    if (tool === "eraser") {
      eraseAtPoint(point);
      return;
    }

    const nextStroke = {
      id: crypto.randomUUID(),
      points: [point],
      color,
      size: activeSize,
      opacity: activeOpacity,
      thinning: activePreset.thinning ?? 0.5,
      tool,
    };
    const nextStrokes = [...strokes, nextStroke];
    const nextPageSize = maybeExtendForPoint(point, nextStrokes);
    commitState(nextStrokes, nextPageSize);
  }

  function handlePointerMove(event) {
    if (!drawingRef.current || activePointerIdRef.current !== event.pointerId) return;

    event.preventDefault();
    const point = getPoint(event);

    if (tool === "eraser") {
      eraseAtPoint(point);
      return;
    }

    setStrokes((currentStrokes) => {
      const nextStrokes = currentStrokes.map((stroke, index) =>
        index === currentStrokes.length - 1 ? { ...stroke, points: [...stroke.points, point] } : stroke
      );
      const nextPageSize = maybeExtendForPoint(point, nextStrokes);
      onChange(pageState(nextStrokes, nextPageSize));
      return nextStrokes;
    });
  }

  function handlePointerUp(event) {
    if (activePointerIdRef.current !== event.pointerId) return;
    event.preventDefault();
    releasePointer(event);
  }

  function changePaper(nextPaper) {
    commitState(strokes, pageSize, nextPaper);
  }

  function clear() {
    commitState([]);
  }

  const paperStyle = paperStyles[paper] || paperStyles.ruled;

  return (
    <div className="flex min-h-[calc(100vh-128px)] w-full flex-col overflow-hidden bg-slate-950">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900 p-3">
        <div className="flex flex-wrap gap-2">
          {Object.entries(penPresets).map(([value, preset]) => (
            <button
              key={value}
              onClick={() => {
                setTool(value);
                setCustomSize(preset.size);
              }}
              className={`rounded-full px-3 py-2 text-sm font-medium ${tool === value ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
            >
              {preset.label}
            </button>
          ))}
          <button onClick={() => setTool("eraser")} className={`rounded-full px-3 py-2 text-sm font-medium ${tool === "eraser" ? "bg-red-400 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}>
            Eraser
          </button>
          <button onClick={() => commitState(strokes.slice(0, -1))} className="rounded-full bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700">
            Undo
          </button>
        </div>

        <div className="flex items-center gap-2">
          {colorSwatches.map((swatch) => (
            <button
              key={swatch}
              onClick={() => setColor(swatch)}
              className={`h-8 w-8 rounded-full border ${color === swatch ? "border-white ring-2 ring-cyan-300" : "border-slate-700"}`}
              style={{ backgroundColor: swatch }}
              title={swatch}
            />
          ))}
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-9 w-12 rounded border border-slate-700 bg-slate-800" />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          Size
          <input type="range" min="2" max="28" value={customSize} onChange={(event) => setCustomSize(Number(event.target.value))} className="max-w-28" />
        </label>

        <select value={paper} onChange={(event) => changePaper(event.target.value)} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
          {Object.entries(paperStyles).map(([value, style]) => (
            <option key={value} value={value}>
              {style.label} Paper
            </option>
          ))}
        </select>

        <button onClick={() => extendPage()} className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
          Add Page Space
        </button>
        <button onClick={clear} className="rounded-full border border-red-800 px-3 py-2 text-sm text-red-200 hover:bg-red-950">
          Clear
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4">
        <div className="mx-auto w-max rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl shadow-slate-950/60">
          <svg
            ref={svgRef}
            width={pageSize.width}
            height={pageSize.height}
            className={`${tool === "eraser" ? "cursor-cell" : "cursor-crosshair"} touch-none select-none rounded-xl`}
            style={{
              background: paperStyle.background,
              backgroundSize: paperStyle.backgroundSize,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
            onContextMenu={(event) => event.preventDefault()}
          >
            {paths.map((stroke) => (
              <path
                key={stroke.id}
                d={stroke.path}
                fill={stroke.color || "#f8fafc"}
                opacity={stroke.opacity ?? 1}
                pointerEvents="none"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default WhiteboardCanvas;
