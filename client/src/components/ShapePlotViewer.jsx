import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Download,
  FileCode,
  Eye,
  Camera,
  Globe,
  Plus,
  Minus,
  ArrowsClockwise,
  ArrowsLeftRight,
  Warning,
  X,
  CornersOut,
  CornersIn,
  Ruler,
  CaretLeft,
  CaretRight,
  Crosshair,
  ArrowsOut,
  Check
} from '@phosphor-icons/react';
import {
  detectDuplicateCoordinates,
  detectCoordinateInversion,
  formatSurveyBearing,
  calculateCadastralLine,
  generateDxfFile
} from '../utils/cadastralSurveyUtils';

export const AREA_PALETTES = [
  { id: 'cyan', stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.18)', dot: '#38bdf8', halo: 'rgba(56, 189, 248, 0.35)', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', labelBg: 'rgba(8, 47, 73, 0.92)' },
  { id: 'amber', stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.18)', dot: '#fbbf24', halo: 'rgba(245, 158, 11, 0.35)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', labelBg: 'rgba(69, 26, 3, 0.92)' },
  { id: 'emerald', stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.18)', dot: '#34d399', halo: 'rgba(16, 185, 129, 0.35)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', labelBg: 'rgba(6, 78, 59, 0.92)' },
  { id: 'purple', stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.18)', dot: '#c084fc', halo: 'rgba(168, 85, 247, 0.35)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', labelBg: 'rgba(59, 7, 100, 0.92)' },
  { id: 'rose', stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.18)', dot: '#fb7185', halo: 'rgba(244, 63, 94, 0.35)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', labelBg: 'rgba(76, 5, 25, 0.92)' },
  { id: 'teal', stroke: '#14b8a6', fill: 'rgba(20, 184, 166, 0.18)', dot: '#2dd4bf', halo: 'rgba(20, 184, 166, 0.35)', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40', labelBg: 'rgba(4, 47, 46, 0.92)' },
];

const ShapePlotViewer = ({ points, title = 'Survey Point Geometry', onSwapCoordinates }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const viewportRef = useRef(null);

  // --- Viewport & Fullscreen State ---
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 520 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Display & Layer Settings ---
  const [connectLines, setConnectLines] = useState(true);
  const [closeLoop, setCloseLoop] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  // labelMode: 'hidden' | 'short' | 'name' | 'code'
  const [labelMode, setLabelMode] = useState('hidden');
  // northRotation: 270 (Estate Grid North 270°0') | 0 (Standard North Up) | 90 | 180
  const [northRotation, setNorthRotation] = useState(270);
  const [selectedArea, setSelectedArea] = useState('all');
  const [isolateArea, setIsolateArea] = useState(false);
  const [showHealthScan, setShowHealthScan] = useState(false);

  // --- Inspection & Measurement Tools ---
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activePoint, setActivePoint] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]); // [p1, p2]
  const [cursorWorldPos, setCursorWorldPos] = useState(null);

  // --- Camera Zoom & Pan ---
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Pointer drag state ref for rock-solid interaction
  const pointerStateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
    dragDist: 0,
    pointerId: null
  });

  // Mobile pinch gesture refs
  const pinchRef = useRef(null);

  // Dynamic ResizeObserver to adapt canvas size to container
  useEffect(() => {
    const handleResize = () => {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const w = Math.max(Math.round(rect.width), 280);
      const h = Math.max(Math.round(rect.height), 280);
      setViewportSize({ width: w, height: h });
    };

    handleResize();

    let observer;
    if (typeof ResizeObserver !== 'undefined' && viewportRef.current) {
      observer = new ResizeObserver(handleResize);
      observer.observe(viewportRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);

  // Keyboard shortcut support: Escape exits measure / fullscreen, Arrow keys navigate traverse
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMeasuring) {
          setIsMeasuring(false);
          setMeasurePoints([]);
          setCursorWorldPos(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else if (activePoint) {
          setActivePoint(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMeasuring, isFullscreen, activePoint]);

  // --- Multi-Area Estate Clustering Engine ---
  const areaGroups = useMemo(() => {
    if (!points || points.length === 0) return { groups: {}, groupList: [] };

    const groups = {};
    points.forEach((pt, index) => {
      let code = (pt.code || '').trim().toUpperCase();
      if (!code) {
        const match = (pt.id || pt.name || '').match(/^([a-zA-Z_]+)/);
        code = match ? match[1].toUpperCase() : 'DEFAULT';
      }

      if (!groups[code]) {
        const paletteIdx = Object.keys(groups).length % AREA_PALETTES.length;
        groups[code] = {
          code,
          points: [],
          indices: [],
          palette: AREA_PALETTES[paletteIdx],
          minE: Infinity,
          maxE: -Infinity,
          minN: Infinity,
          maxN: -Infinity
        };
      }

      const e = parseFloat(pt.easting);
      const n = parseFloat(pt.northing);
      groups[code].points.push(pt);
      groups[code].indices.push(index);

      if (!isNaN(e) && !isNaN(n)) {
        if (e < groups[code].minE) groups[code].minE = e;
        if (e > groups[code].maxE) groups[code].maxE = e;
        if (n < groups[code].minN) groups[code].minN = n;
        if (n > groups[code].maxN) groups[code].maxN = n;
      }
    });

    const groupList = Object.values(groups).map((g) => {
      const spanE = g.maxE - g.minE;
      const spanN = g.maxN - g.minN;
      return {
        ...g,
        spanE: spanE > 0 ? spanE : 1,
        spanN: spanN > 0 ? spanN : 1
      };
    });

    return { groups, groupList };
  }, [points]);

  // Auto-detect duplicate coordinates within survey tolerance (5mm)
  const duplicateInfo = useMemo(() => detectDuplicateCoordinates(points), [points]);

  // Overall & Active Area Statistics
  const activePointsList = useMemo(() => {
    if (!points || points.length === 0) return [];
    if (selectedArea === 'all') return points;
    return areaGroups.groups[selectedArea]?.points || points;
  }, [points, selectedArea, areaGroups]);

  const stats = useMemo(() => {
    if (!points || points.length === 0) return null;

    let minE = Infinity, maxE = -Infinity;
    let minN = Infinity, maxN = -Infinity;

    points.forEach((p) => {
      const e = parseFloat(p.easting);
      const n = parseFloat(p.northing);
      if (!isNaN(e) && !isNaN(n)) {
        if (e < minE) minE = e;
        if (e > maxE) maxE = e;
        if (n < minN) minN = n;
        if (n > maxN) maxN = n;
      }
    });

    const spanE = maxE - minE;
    const spanN = maxN - minN;

    return {
      minE, maxE, minN, maxN,
      spanE: spanE > 0 ? spanE : 1,
      spanN: spanN > 0 ? spanN : 1,
      midE: (minE + maxE) / 2,
      midN: (minN + maxN) / 2
    };
  }, [points]);

  // Selected Area Specific Statistics (Shoelace Area & Perimeter)
  const areaStats = useMemo(() => {
    if (!activePointsList || activePointsList.length === 0) return null;

    let minE = Infinity, maxE = -Infinity;
    let minN = Infinity, maxN = -Infinity;
    activePointsList.forEach((p) => {
      const e = parseFloat(p.easting);
      const n = parseFloat(p.northing);
      if (!isNaN(e) && !isNaN(n)) {
        if (e < minE) minE = e;
        if (e > maxE) maxE = e;
        if (n < minN) minN = n;
        if (n > maxN) maxN = n;
      }
    });

    let area = 0;
    let perimeter = 0;
    if (activePointsList.length >= 3) {
      for (let i = 0; i < activePointsList.length; i++) {
        const p1 = activePointsList[i];
        const p2 = activePointsList[(i + 1) % activePointsList.length];
        const x1 = parseFloat(p1.easting);
        const y1 = parseFloat(p1.northing);
        const x2 = parseFloat(p2.easting);
        const y2 = parseFloat(p2.northing);
        area += (x1 * y2 - x2 * y1);
        perimeter += Math.hypot(x2 - x1, y2 - y1);
      }
      area = Math.abs(area) / 2;
    }

    return {
      minE, maxE, minN, maxN,
      spanE: (maxE - minE) > 0 ? (maxE - minE) : 1,
      spanN: (maxN - minN) > 0 ? (maxN - minN) : 1,
      area: area > 0 ? area : null,
      perimeter: perimeter > 0 ? perimeter : null
    };
  }, [activePointsList]);

  // Setting-Out Geometry Anomaly Detector
  const anomalies = useMemo(() => {
    if (!points || points.length === 0) return [];
    const list = [];

    // 1. Duplicates
    if (duplicateInfo.hasDuplicates) {
      duplicateInfo.groups.forEach((g) => {
        list.push({
          type: 'duplicate',
          severity: 'warning',
          title: `Duplicate Location (${g.pointNames})`,
          detail: `Coordinates match exactly within survey tolerance (${g.coordKey}).`
        });
      });
    }

    // 2. Large Spacing Jumps in each area (>100m)
    areaGroups.groupList.forEach((grp) => {
      for (let i = 0; i < grp.points.length - 1; i++) {
        const p1 = grp.points[i];
        const p2 = grp.points[i + 1];
        const dist = Math.hypot(parseFloat(p2.easting) - parseFloat(p1.easting), parseFloat(p2.northing) - parseFloat(p1.northing));
        if (dist > 100) {
          list.push({
            type: 'jump',
            severity: 'info',
            title: `Large Spacing in ${grp.code} (${dist.toFixed(1)}m)`,
            detail: `${p1.id || p1.name} -> ${p2.id || p2.name} is ${dist.toFixed(1)}m apart. Check if tie-in point or separate block.`
          });
        }
      }
    });

    // 3. Suspected Coordinate Inversion (X / Y Swapped)
    const inversionCheck = detectCoordinateInversion(points);
    if (inversionCheck.isInvertedSuspected) {
      list.push({
        type: 'inversion',
        severity: 'warning',
        title: 'Suspected Inverted Coordinates (X/Y Swapped)',
        detail: inversionCheck.reason,
        action: onSwapCoordinates ? 'swap' : null
      });
    }

    return list;
  }, [points, duplicateInfo, areaGroups, onSwapCoordinates]);

  // Rotation-Aware Scale & Base Centering:
  // Dynamically computes projected width & height for any rotation angle theta
  const { baseScale, projSpanW, projSpanH } = useMemo(() => {
    if (!stats) return { baseScale: 1, projSpanW: 10, projSpanH: 10 };
    const rotRad = (northRotation * Math.PI) / 180;
    const cosR = Math.abs(Math.cos(-rotRad));
    const sinR = Math.abs(Math.sin(-rotRad));

    const projW = stats.spanE * cosR + stats.spanN * sinR;
    const projH = stats.spanE * sinR + stats.spanN * cosR;

    const padding = 70;
    const availW = Math.max(viewportSize.width - padding * 2, 80);
    const availH = Math.max(viewportSize.height - padding * 2, 80);

    const scale = Math.min(availW / Math.max(projW, 8), availH / Math.max(projH, 8)) * 0.94;

    return {
      baseScale: scale > 0 ? scale : 1,
      projSpanW: projW,
      projSpanH: projH
    };
  }, [stats, northRotation, viewportSize]);

  // Helper to map Point (E, N) to Unrotated Centered Canvas Coordinates
  const getScreenCoordinates = useCallback((easting, northing, w = viewportSize.width, h = viewportSize.height) => {
    if (!stats) return { x: w / 2, y: h / 2 };
    const e = parseFloat(easting);
    const n = parseFloat(northing);
    return {
      x: w / 2 + (e - stats.midE) * baseScale,
      y: h / 2 - (n - stats.midN) * baseScale
    };
  }, [stats, baseScale, viewportSize]);

  // Inverse Screen-to-World Mapping: converts canvas pixel coordinates back to Easting, Northing
  const screenToWorld = useCallback((canvasX, canvasY) => {
    if (!stats) return { easting: '0.000', northing: '0.000' };
    const w = viewportSize.width;
    const h = viewportSize.height;
    const rotRad = (northRotation * Math.PI) / 180;

    const dx = canvasX - (w / 2 + pan.x);
    const dy = canvasY - (h / 2 + pan.y);

    const cosPos = Math.cos(rotRad);
    const sinPos = Math.sin(rotRad);
    const rx = dx * cosPos - dy * sinPos;
    const ry = dx * sinPos + dy * cosPos;

    const unscaledX = rx / zoom + w / 2;
    const unscaledY = ry / zoom + h / 2;

    const worldE = stats.midE + (unscaledX - w / 2) / baseScale;
    const worldN = stats.midN - (unscaledY - h / 2) / baseScale;

    return {
      easting: worldE.toFixed(3),
      northing: worldN.toFixed(3)
    };
  }, [stats, viewportSize, northRotation, pan, zoom, baseScale]);

  // Find Nearest Survey Point at Canvas Pixel (Consistent Screen-Space Detection Radius)
  const findPointAtPixel = useCallback((canvasX, canvasY) => {
    if (!stats || !points || points.length === 0) return null;
    const w = viewportSize.width;
    const h = viewportSize.height;
    const rotRad = (northRotation * Math.PI) / 180;

    const dx = canvasX - (w / 2 + pan.x);
    const dy = canvasY - (h / 2 + pan.y);

    const cosPos = Math.cos(rotRad);
    const sinPos = Math.sin(rotRad);
    const rx = dx * cosPos - dy * sinPos;
    const ry = dx * sinPos + dy * cosPos;

    const unscaledX = rx / zoom + w / 2;
    const unscaledY = ry / zoom + h / 2;

    let closest = null;
    let minScreenDist = 20; // 20 physical screen pixels hit target

    points.forEach((pt) => {
      if (isolateArea && selectedArea !== 'all') {
        const ptCode = (pt.code || '').trim().toUpperCase();
        if (ptCode !== selectedArea) return;
      }
      const scr = getScreenCoordinates(pt.easting, pt.northing, w, h);
      const worldDist = Math.hypot(unscaledX - scr.x, unscaledY - scr.y);
      const screenDist = worldDist * zoom;

      if (screenDist < minScreenDist) {
        minScreenDist = screenDist;
        closest = pt;
      }
    });

    return closest;
  }, [stats, points, viewportSize, northRotation, pan, zoom, isolateArea, selectedArea, getScreenCoordinates]);

  // Active Point Context (Distance & Bearing to next and previous beacons)
  const activePointContext = useMemo(() => {
    if (!activePoint || !points || points.length === 0) return null;
    const code = (activePoint.code || '').trim().toUpperCase();
    const grp = areaGroups.groups[code] || areaGroups.groupList[0];
    if (!grp || grp.points.length === 0) return null;

    const idx = grp.points.findIndex(
      (p) => (p.id && p.id === activePoint.id) || (p.easting === activePoint.easting && p.northing === activePoint.northing)
    );

    if (idx === -1) return null;

    const prevIdx = (idx - 1 + grp.points.length) % grp.points.length;
    const nextIdx = (idx + 1) % grp.points.length;

    const prevPt = grp.points[prevIdx];
    const nextPt = grp.points[nextIdx];

    const toNext = calculateCadastralLine(activePoint, nextPt);
    const fromPrev = calculateCadastralLine(prevPt, activePoint);

    return {
      areaName: grp.code,
      palette: grp.palette,
      indexInArea: idx + 1,
      totalInArea: grp.points.length,
      currentPoint: activePoint,
      prevPoint: prevPt,
      nextPoint: nextPt,
      toNext,
      fromPrev,
      hasNext: grp.points.length > 1,
      hasPrev: grp.points.length > 1
    };
  }, [activePoint, areaGroups, points]);

  // Reset / Fit Camera View with Full Rotation Awareness
  const handleFitView = useCallback((targetArea = selectedArea) => {
    setPan({ x: 0, y: 0 });
    if (targetArea === 'all' || !areaGroups.groups[targetArea]) {
      setZoom(1.0);
    } else {
      const g = areaGroups.groups[targetArea];
      if (stats && g.spanE > 0 && g.spanN > 0) {
        const rotRad = (northRotation * Math.PI) / 180;
        const cosR = Math.abs(Math.cos(-rotRad));
        const sinR = Math.abs(Math.sin(-rotRad));
        const grpProjW = g.spanE * cosR + g.spanN * sinR;
        const grpProjH = g.spanE * sinR + g.spanN * cosR;

        const fitScale = Math.min(Math.max(Math.min(projSpanW / Math.max(grpProjW, 10), projSpanH / Math.max(grpProjH, 10)) * 0.85, 1.0), 12.0);

        // Center on area centroid relative to global plot centroid
        const targetMidE = (g.minE + g.maxE) / 2;
        const targetMidN = (g.minN + g.maxN) / 2;
        const deltaE = (targetMidE - stats.midE) * baseScale;
        const deltaN = (targetMidN - stats.midN) * baseScale;

        const rx = -deltaE * Math.cos(-rotRad) - (-deltaN) * Math.sin(-rotRad);
        const ry = -deltaE * Math.sin(-rotRad) + (-deltaN) * Math.cos(-rotRad);

        setPan({ x: rx * fitScale, y: -ry * fitScale });
        setZoom(fitScale);
      } else {
        setZoom(1.5);
      }
    }
  }, [selectedArea, areaGroups, stats, northRotation, projSpanW, projSpanH, baseScale]);

  // Center & Focus on Single Survey Point
  const handleCenterOnPoint = useCallback((pt, targetZoom = 4.5) => {
    if (!pt || !stats) return;
    const ptE = parseFloat(pt.easting);
    const ptN = parseFloat(pt.northing);

    const deltaE = (ptE - stats.midE) * baseScale;
    const deltaN = (ptN - stats.midN) * baseScale;

    const rotRad = (northRotation * Math.PI) / 180;
    const rx = -deltaE * Math.cos(-rotRad) - (-deltaN) * Math.sin(-rotRad);
    const ry = -deltaE * Math.sin(-rotRad) + (-deltaN) * Math.cos(-rotRad);

    setPan({ x: rx * targetZoom, y: -ry * targetZoom });
    setZoom(targetZoom);
  }, [stats, baseScale, northRotation]);

  // Traverse Navigation: Step to Next / Previous Peg along Boundary
  const handleSelectNextPoint = useCallback(() => {
    if (activePointContext?.nextPoint) {
      setActivePoint(activePointContext.nextPoint);
      handleCenterOnPoint(activePointContext.nextPoint, zoom);
    }
  }, [activePointContext, handleCenterOnPoint, zoom]);

  const handleSelectPrevPoint = useCallback(() => {
    if (activePointContext?.prevPoint) {
      setActivePoint(activePointContext.prevPoint);
      handleCenterOnPoint(activePointContext.prevPoint, zoom);
    }
  }, [activePointContext, handleCenterOnPoint, zoom]);

  // Switch Area Selection
  const handleSelectArea = (code) => {
    setSelectedArea(code);
    setActivePoint(null);
    handleFitView(code);
  };

  // Cycle North Rotation: 270° -> 0° -> 90° -> 180° -> 270°
  const handleCycleRotation = () => {
    const sequence = [270, 0, 90, 180];
    const nextIdx = (sequence.indexOf(northRotation) + 1) % sequence.length;
    setNorthRotation(sequence[nextIdx]);
  };

  // --- Non-Passive Native Wheel Listener: Cursor-Anchored Zoom ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e) => {
      e.preventDefault(); // Stop webpage scrolling
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.8695;

      setZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.15), 50);
        const factor = nextZoom / prevZoom;

        setPan((prevPan) => ({
          x: mx - viewportSize.width / 2 - (mx - viewportSize.width / 2 - prevPan.x) * factor,
          y: my - viewportSize.height / 2 - (my - viewportSize.height / 2 - prevPan.y) * factor
        }));

        return nextZoom;
      });
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [viewportSize]);

  // --- Pointer Drag & Click Event Handlers ---
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointerStateRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
      dragDist: 0,
      pointerId: e.pointerId
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    const state = pointerStateRef.current;
    if (state.isDown) {
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      state.dragDist = Math.hypot(dx, dy);

      setPan({
        x: state.initialPanX + dx,
        y: state.initialPanY + dy
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const found = findPointAtPixel(mx, my);
    setHoveredPoint(found);

    if (isMeasuring && measurePoints.length === 1) {
      const world = screenToWorld(mx, my);
      setCursorWorldPos(world);
    }
  };

  const handlePointerUp = (e) => {
    const state = pointerStateRef.current;
    if (!state.isDown) return;
    state.isDown = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    // Distinguish Pan from Click using 6px threshold
    if (state.dragDist < 6) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const clicked = findPointAtPixel(mx, my);

      if (isMeasuring) {
        if (clicked) {
          handleMeasureClick(clicked);
        } else {
          const freeWorld = screenToWorld(mx, my);
          handleMeasureClick({
            id: 'MEASURE_PT',
            name: `E:${freeWorld.easting}, N:${freeWorld.northing}`,
            easting: freeWorld.easting,
            northing: freeWorld.northing,
            elevation: '0.000'
          });
        }
      } else {
        if (clicked) {
          setActivePoint(clicked);
        } else {
          setActivePoint(null); // Click empty space deselects
        }
      }
    }
  };

  // Cadastral Ruler: Handle Point Selection
  const handleMeasureClick = (pt) => {
    if (measurePoints.length === 0) {
      setMeasurePoints([pt]);
      setCursorWorldPos(null);
    } else if (measurePoints.length === 1) {
      setMeasurePoints([measurePoints[0], pt]);
      setCursorWorldPos(null);
    } else {
      // Start new measurement from clicked point
      setMeasurePoints([pt]);
      setCursorWorldPos(null);
    }
  };

  const activeMeasurement = useMemo(() => {
    if (measurePoints.length === 2) {
      return calculateCadastralLine(measurePoints[0], measurePoints[1]);
    }
    if (measurePoints.length === 1 && cursorWorldPos) {
      return calculateCadastralLine(measurePoints[0], cursorWorldPos);
    }
    return null;
  }, [measurePoints, cursorWorldPos]);

  // Mobile Touch Pan & Pinch-to-Zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

      pinchRef.current = {
        startDist: dist,
        startZoom: zoom,
        midX,
        midY,
        initialPan: { ...pan }
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scaleRatio = dist / pinchRef.current.startDist;
      const nextZoom = Math.min(Math.max(pinchRef.current.startZoom * scaleRatio, 0.15), 50);
      const factor = nextZoom / zoom;

      setZoom(nextZoom);
      setPan((prevPan) => ({
        x: pinchRef.current.midX - viewportSize.width / 2 - (pinchRef.current.midX - viewportSize.width / 2 - prevPan.x) * factor,
        y: pinchRef.current.midY - viewportSize.height / 2 - (pinchRef.current.midY - viewportSize.height / 2 - prevPan.y) * factor
      }));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      pinchRef.current = null;
    }
  };

  // --- Main Canvas Render Loop (Retina-Scaled) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stats || points.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = viewportSize.width;
    const height = viewportSize.height;

    // High-contrast CAD dark workspace
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Pan & Zoom with Rotation applied around center
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    const rotRad = (northRotation * Math.PI) / 180;
    ctx.rotate(-rotRad);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // 1. Survey Grid Lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 1 / zoom;
      const step = 50;
      for (let x = -width * 2; x < width * 3; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, -height * 2);
        ctx.lineTo(x, height * 3);
        ctx.stroke();
      }
      for (let y = -height * 2; y < height * 3; y += step) {
        ctx.beginPath();
        ctx.moveTo(-width * 2, y);
        ctx.lineTo(width * 3, y);
        ctx.stroke();
      }
    }

    // 2. Draw Connecting Lines & Closed Polygons (Clustered by Area)
    if (connectLines) {
      areaGroups.groupList.forEach((grp) => {
        const isDimmed = selectedArea !== 'all' && grp.code !== selectedArea;
        if (isDimmed && isolateArea) return;

        if (grp.points.length > 1) {
          ctx.beginPath();
          const first = getScreenCoordinates(grp.points[0].easting, grp.points[0].northing, width, height);
          ctx.moveTo(first.x, first.y);

          for (let i = 1; i < grp.points.length; i++) {
            const pt = getScreenCoordinates(grp.points[i].easting, grp.points[i].northing, width, height);
            ctx.lineTo(pt.x, pt.y);
          }

          if (closeLoop && grp.points.length >= 3) {
            ctx.closePath();
            ctx.fillStyle = isDimmed ? 'rgba(71, 85, 105, 0.08)' : grp.palette.fill;
            ctx.fill();
          }

          ctx.strokeStyle = isDimmed ? 'rgba(100, 116, 139, 0.35)' : grp.palette.stroke;
          ctx.lineWidth = (isDimmed ? 1.5 : 2.5) / zoom;
          if (isDimmed) {
            ctx.setLineDash([4 / zoom, 4 / zoom]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // 3. Draw Survey Beacons & Pillars
    points.forEach((pt, index) => {
      const ptCode = (pt.code || '').trim().toUpperCase();
      const grp = areaGroups.groups[ptCode] || areaGroups.groupList[0] || { palette: AREA_PALETTES[0] };
      const isDimmed = selectedArea !== 'all' && ptCode !== selectedArea;
      if (isDimmed && isolateArea) return;

      const scr = getScreenCoordinates(pt.easting, pt.northing, width, height);
      const isDup = duplicateInfo.duplicateIndices.has(index);
      const isHovered = hoveredPoint && (hoveredPoint.id === pt.id || (hoveredPoint.easting === pt.easting && hoveredPoint.northing === pt.northing));
      const isActive = activePoint && (activePoint.id === pt.id || (activePoint.easting === pt.easting && activePoint.northing === pt.northing));

      // Outer Selection Reticle / Glow
      if (isActive) {
        // High-visibility targeting reticle
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 16 / zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 12 / zoom, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(scr.x - 18 / zoom, scr.y);
        ctx.lineTo(scr.x + 18 / zoom, scr.y);
        ctx.moveTo(scr.x, scr.y - 18 / zoom);
        ctx.lineTo(scr.x, scr.y + 18 / zoom);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1 / zoom;
        ctx.stroke();
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 13 / zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 10 / zoom, 0, Math.PI * 2);
        ctx.stroke();
      } else if (isDup) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 10 / zoom, 0, Math.PI * 2);
        ctx.fill();
      } else if (!isDimmed) {
        ctx.fillStyle = grp.palette.halo;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 8 / zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center Beacon Core Dot
      ctx.fillStyle = isDimmed
        ? 'rgba(148, 163, 184, 0.5)'
        : isDup
        ? '#f59e0b'
        : grp.palette.dot;

      ctx.beginPath();
      ctx.arc(scr.x, scr.y, (isDup || isActive ? 5.5 : 4.2) / zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isDimmed ? '#475569' : isDup ? '#fef08a' : '#ffffff';
      ctx.lineWidth = (isDup ? 2 : 1.5) / zoom;
      ctx.stroke();

      // 4. Point Labels (With Upright Counter-Rotation)
      if (labelMode !== 'hidden' && (!isDimmed || isActive)) {
        let labelText = '';
        if (labelMode === 'short') {
          const numMatch = (pt.id || pt.name || '').match(/(\d+)$/);
          labelText = numMatch ? numMatch[1] : (pt.id || pt.name || `${index + 1}`);
        } else if (labelMode === 'code') {
          labelText = pt.code || grp.code;
        } else {
          labelText = pt.id || pt.name || `P${index + 1}`;
        }

        if (isDup) labelText += ' [DUP]';

        ctx.save();
        ctx.translate(scr.x, scr.y);
        ctx.rotate(rotRad); // Counter-rotate so text is always horizontal

        ctx.font = `bold ${Math.max(10, 11 / zoom)}px system-ui, sans-serif`;
        const textWidth = ctx.measureText(labelText).width;

        // Label Background Pill
        ctx.fillStyle = isDup ? 'rgba(35, 20, 10, 0.95)' : grp.palette.labelBg;
        ctx.fillRect(8 / zoom, -14 / zoom, textWidth + 8 / zoom, 16 / zoom);

        ctx.strokeStyle = isDup ? '#f59e0b' : grp.palette.stroke;
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(8 / zoom, -14 / zoom, textWidth + 8 / zoom, 16 / zoom);

        ctx.fillStyle = isDup ? '#fef08a' : '#f8fafc';
        ctx.fillText(labelText, 12 / zoom, -2 / zoom);

        ctx.restore();
      }
    });

    // 5. Draw Live Measurement Line (Cadastral Ruler)
    if (isMeasuring && measurePoints.length > 0) {
      const p1 = measurePoints[0];
      const p2 = measurePoints[1] || (cursorWorldPos ? cursorWorldPos : null);
      const scr1 = getScreenCoordinates(p1.easting, p1.northing, width, height);

      // Point 1 marker
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(scr1.x, scr1.y, 7 / zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();

      if (p2) {
        const scr2 = getScreenCoordinates(p2.easting, p2.northing, width, height);

        // Dashed measurement rubberband line
        ctx.beginPath();
        ctx.moveTo(scr1.x, scr1.y);
        ctx.lineTo(scr2.x, scr2.y);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([6 / zoom, 4 / zoom]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Point 2 marker
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(scr2.x, scr2.y, 6 / zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / zoom;
        ctx.stroke();

        // Dimension badge at midpoint
        if (activeMeasurement) {
          const midX = (scr1.x + scr2.x) / 2;
          const midY = (scr1.y + scr2.y) / 2;

          ctx.save();
          ctx.translate(midX, midY);
          ctx.rotate(rotRad);

          const tag = `${activeMeasurement.distance.toFixed(3)}m @ ${activeMeasurement.bearingFormatted}`;
          ctx.font = `bold ${Math.max(10, 11 / zoom)}px monospace`;
          const tagW = ctx.measureText(tag).width;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.fillRect(-tagW / 2 - 6 / zoom, -18 / zoom, tagW + 12 / zoom, 18 / zoom);

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1 / zoom;
          ctx.strokeRect(-tagW / 2 - 6 / zoom, -18 / zoom, tagW + 12 / zoom, 18 / zoom);

          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.fillText(tag, 0, -5 / zoom);

          ctx.restore();
        }
      }
    }

    ctx.restore(); // Restore world transform

    // 6. Draw Digital North Compass Rose (Fixed in Corner)
    const naX = width - 48;
    const naY = 48;
    ctx.save();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.arc(naX, naY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(naX, naY);
    ctx.rotate(-rotRad);

    // North arrow head (Red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-6, 2);
    ctx.lineTo(0, -2);
    ctx.closePath();
    ctx.fill();

    // South arrow tail
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(6, 2);
    ctx.lineTo(0, -2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-5, 0);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -22);

    ctx.restore();

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`N: ${northRotation}°00'`, naX, naY + 38);
    ctx.restore();

    // 7. Dynamic Metric Scale Bar (Bottom-Left)
    const metersPerPixel = 1 / (baseScale * zoom);
    const candidateDistances = [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
    let chosenDist = candidateDistances[0];
    for (const d of candidateDistances) {
      if (d / metersPerPixel >= 65) {
        chosenDist = d;
        break;
      }
    }
    const barWidth = Math.min(Math.max(chosenDist / metersPerPixel, 40), 200);

    const sbX = 18;
    const sbY = height - 42;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(sbX - 6, sbY - 14, barWidth + 12, 28);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(sbX - 6, sbY - 14, barWidth + 12, 28);

    // Scale bar ticks
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sbX, sbY);
    ctx.lineTo(sbX + barWidth, sbY);
    ctx.moveTo(sbX, sbY - 4);
    ctx.lineTo(sbX, sbY + 4);
    ctx.moveTo(sbX + barWidth / 2, sbY - 3);
    ctx.lineTo(sbX + barWidth / 2, sbY + 3);
    ctx.moveTo(sbX + barWidth, sbY - 4);
    ctx.lineTo(sbX + barWidth, sbY + 4);
    ctx.stroke();

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`${chosenDist} m`, sbX + barWidth / 2, sbY + 11);
    ctx.restore();

    // 8. Dimensional Extents Legend
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '10px monospace';
    const displayStats = areaStats || stats;
    ctx.fillText(
      `E: ${displayStats.minE.toFixed(2)}m → ${displayStats.maxE.toFixed(2)}m (W: ${displayStats.spanE.toFixed(2)}m)`,
      sbX + barWidth + 24,
      height - 32
    );
    ctx.fillText(
      `N: ${displayStats.minN.toFixed(2)}m → ${displayStats.maxN.toFixed(2)}m (L: ${displayStats.spanN.toFixed(2)}m)`,
      sbX + barWidth + 24,
      height - 18
    );
  }, [
    points,
    stats,
    areaStats,
    areaGroups,
    selectedArea,
    isolateArea,
    connectLines,
    closeLoop,
    labelMode,
    northRotation,
    showGrid,
    zoom,
    pan,
    hoveredPoint,
    activePoint,
    duplicateInfo,
    isMeasuring,
    measurePoints,
    cursorWorldPos,
    activeMeasurement,
    viewportSize,
    baseScale,
    getScreenCoordinates
  ]);

  // Export High-Res PNG Plot Image
  const downloadPlotImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displayStats = areaStats || stats;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 1100;
    const expCtx = exportCanvas.getContext('2d');

    expCtx.fillStyle = '#080d1a';
    expCtx.fillRect(0, 0, 1600, 1100);
    expCtx.drawImage(canvas, 40, 130, 1520, 910);

    // Title Block
    expCtx.fillStyle = '#1e293b';
    expCtx.fillRect(40, 30, 1520, 85);
    expCtx.strokeStyle = '#334155';
    expCtx.lineWidth = 1;
    expCtx.strokeRect(40, 30, 1520, 85);

    expCtx.font = 'bold 22px system-ui, sans-serif';
    expCtx.fillStyle = '#38bdf8';
    expCtx.fillText(`${title.toUpperCase()} — ESTATE SETTING-OUT`, 60, 66);

    expCtx.font = '13px monospace';
    expCtx.fillStyle = '#94a3b8';
    expCtx.fillText(
      `Points: ${points.length}  |  Orientation: North ${northRotation}°00'00"  |  Areas: ${areaGroups.groupList.map((g) => `${g.code} (${g.points.length})`).join(', ')}`,
      60,
      94
    );

    if (displayStats) {
      expCtx.textAlign = 'right';
      expCtx.fillText(`Easting: ${displayStats.spanE.toFixed(3)}m  |  Northing: ${displayStats.spanN.toFixed(3)}m`, 1540, 66);
      if (displayStats.area) {
        expCtx.fillText(
          `Area: ${displayStats.area.toFixed(2)} m² (${(displayStats.area / 10000).toFixed(4)} Ha)  |  Perimeter: ${displayStats.perimeter.toFixed(2)}m`,
          1540,
          94
        );
      }
      expCtx.textAlign = 'left';
    }

    const link = document.createElement('a');
    link.download = `Estate_SettingOut_Plot_N${northRotation}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  // Export CSV
  const downloadCsvFromPoints = () => {
    if (!points || points.length === 0) return;
    let csv = 'PointID,Code,Easting,Northing,Elevation\n';
    points.forEach((p, idx) => {
      const id = p.id || p.name || `P${idx + 1}`;
      const code = p.code || '';
      csv += `${id},${code},${p.easting},${p.northing},${p.elevation || '0.000'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estate_SettingOut_Points_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export DXF CAD
  const downloadDxfFromPoints = () => {
    if (!points || points.length === 0) return;
    const dxfContent = generateDxfFile(points, { closeLoop });
    const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estate_SettingOut_Drawing_${new Date().toISOString().split('T')[0]}.dxf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!points || points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 min-h-[360px]">
        <Eye size={40} className="text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-300">No Points Loaded Yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Paste AutoCAD coordinates, CSV data, or drop a file above to visualize the closed geometric plot.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 p-3 sm:p-5 bg-slate-950/98 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-2xl'
          : 'bg-slate-900 rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-xl flex flex-col space-y-3.5 select-none'
      }`}
    >
      {/* 1. TOP BAR: Area Selection & Quick Jump Chips */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Estate Areas:
            </span>
            <button
              type="button"
              onClick={() => handleSelectArea('all')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedArea === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Globe size={13} weight="bold" /> All Areas ({points.length})
            </button>

            {areaGroups.groupList.map((grp) => {
              const isSelected = selectedArea === grp.code;
              return (
                <button
                  key={grp.code}
                  type="button"
                  onClick={() => handleSelectArea(grp.code)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? `${grp.palette.badge} bg-slate-800 font-bold shadow-sm`
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: grp.palette.dot }}
                  />
                  <span>{grp.code}</span>
                  <span className="text-[10px] opacity-75">({grp.points.length})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Setting-Out Health / Anomalies Alert Badge */}
            {anomalies.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHealthScan(!showHealthScan)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/25 transition cursor-pointer"
              >
                <Warning size={13} weight="fill" />
                <span>{anomalies.length} Setting-Out Alert{anomalies.length > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Fullscreen Expansion Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                isFullscreen
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen CAD view'}
            >
              {isFullscreen ? <CornersIn size={15} weight="bold" /> : <CornersOut size={15} weight="bold" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'CAD View'}</span>
            </button>
          </div>
        </div>

        {/* 2. TOOLBAR: North Orientation, Labels, Cadastral Ruler, Layers & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* North 270°0' Orientation Selector */}
            <div className="inline-flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setNorthRotation(270)}
                className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  northRotation === 270
                    ? 'bg-sky-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Rotate layout to Estate Grid North 270°0' (West / Left)"
              >
                <span>🧭 North 270°0'</span>
              </button>
              <button
                type="button"
                onClick={() => setNorthRotation(0)}
                className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                  northRotation === 0
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Reset layout to True North Up (0°)"
              >
                <span>N 0° Up</span>
              </button>
              <button
                type="button"
                onClick={handleCycleRotation}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                title={`Cycle rotation 90° (Current: ${northRotation}°)`}
                aria-label="Rotate 90 degrees"
              >
                <ArrowsClockwise size={13} weight="bold" />
              </button>
            </div>

            {/* Cadastral Measure Tool Button */}
            <button
              type="button"
              onClick={() => {
                setIsMeasuring(!isMeasuring);
                setMeasurePoints([]);
                setCursorWorldPos(null);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isMeasuring
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Click any two beacons to measure survey distance and bearing"
            >
              <Ruler size={14} weight="bold" />
              <span>{isMeasuring ? 'Measuring...' : 'Measure Ruler'}</span>
            </button>

            {/* Point Labels Mode Selector */}
            <div className="inline-flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px]">
              <span className="px-2 text-slate-400 font-medium text-[10px] uppercase">Labels:</span>
              <button
                type="button"
                onClick={() => setLabelMode('hidden')}
                className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                  labelMode === 'hidden'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Hide point names completely (clean dots for mobile)"
              >
                Hide
              </button>
              <button
                type="button"
                onClick={() => setLabelMode('short')}
                className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                  labelMode === 'short'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Show short number index only (1, 2, 23)"
              >
                Short
              </button>
              <button
                type="button"
                onClick={() => setLabelMode('name')}
                className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                  labelMode === 'name'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Show full point names (e.g. CLEARWATERRD1)"
              >
                Full
              </button>
            </div>

            {/* Geometry Polylines & Close Loop Checkboxes */}
            <label className="inline-flex items-center gap-1 py-1 px-2 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-medium cursor-pointer transition select-none text-[11px]">
              <input
                type="checkbox"
                checked={connectLines}
                onChange={(e) => setConnectLines(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 w-3 h-3"
              />
              Lines
            </label>

            {connectLines && (
              <label className="inline-flex items-center gap-1 py-1 px-2 rounded-md bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/70 text-sky-300 font-semibold cursor-pointer transition select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={closeLoop}
                  onChange={(e) => setCloseLoop(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 w-3 h-3"
                />
                Close Loop
              </label>
            )}

            <label className="inline-flex items-center gap-1 py-1 px-2 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-medium cursor-pointer transition select-none text-[11px]">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 w-3 h-3"
              />
              Grid
            </label>

            {selectedArea !== 'all' && (
              <label className="inline-flex items-center gap-1 py-1 px-2 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isolateArea}
                  onChange={(e) => setIsolateArea(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-500 w-3 h-3"
                />
                Isolate Area
              </label>
            )}
          </div>

          {/* Export & Coordinate Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {onSwapCoordinates && (
              <button
                type="button"
                onClick={onSwapCoordinates}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs transition border border-amber-500/40 cursor-pointer"
                title="Swap Easting and Northing coordinates (X ⇄ Y)"
              >
                <ArrowsLeftRight size={13} weight="bold" /> Swap X ⇄ Y
              </button>
            )}
            <button
              type="button"
              onClick={downloadCsvFromPoints}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 cursor-pointer"
              title="Download points as CSV file"
            >
              <Download size={13} weight="bold" /> .csv
            </button>
            <button
              type="button"
              onClick={downloadDxfFromPoints}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition cursor-pointer"
              title="Download AutoCAD DXF CAD drawing"
            >
              <FileCode size={13} weight="bold" /> .dxf
            </button>
            <button
              type="button"
              onClick={downloadPlotImage}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer"
              title="Download high-res PNG plot image"
            >
              <Camera size={13} weight="bold" /> Plot PNG
            </button>
          </div>
        </div>
      </div>

      {/* 3. SETTING-OUT ANOMALY SCAN ACCORDION (COLLAPSIBLE) */}
      {showHealthScan && anomalies.length > 0 && (
        <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 text-xs space-y-2 shrink-0">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Warning size={15} weight="fill" /> Estate Geometry & Setting-Out Diagnostic
            </span>
            <button
              type="button"
              onClick={() => setShowHealthScan(false)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {anomalies.map((anom, aIdx) => (
              <div key={aIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="font-semibold text-amber-200 block">{anom.title}</span>
                  <span className="text-slate-400 block mt-0.5">{anom.detail}</span>
                </div>
                {anom.action === 'swap' && onSwapCoordinates && (
                  <button
                    type="button"
                    onClick={onSwapCoordinates}
                    className="mt-2 inline-flex items-center gap-1 self-start px-2 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer transition"
                  >
                    <ArrowsLeftRight size={12} weight="bold" /> Swap Coordinates Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAIN RESPONSIVE CANVAS VIEWPORT */}
      <div
        ref={viewportRef}
        className={`relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 touch-none ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[520px] sm:h-[600px]'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={viewportSize.width}
          height={viewportSize.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{
            width: viewportSize.width,
            height: viewportSize.height,
            touchAction: 'none'
          }}
          className={`w-full h-full block ${
            isMeasuring
              ? 'cursor-crosshair'
              : isDragging
              ? 'cursor-grabbing'
              : hoveredPoint
              ? 'cursor-pointer'
              : 'cursor-grab'
          }`}
        />

        {/* FLOATING CAD CONTROLS (BOTTOM-RIGHT) */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-1 border border-slate-700/80 shadow-2xl flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                const centerMx = viewportSize.width / 2;
                const centerMy = viewportSize.height / 2;
                setZoom((prevZoom) => {
                  const nextZoom = Math.min(prevZoom * 1.25, 50);
                  const factor = nextZoom / prevZoom;
                  setPan((prevPan) => ({
                    x: centerMx - viewportSize.width / 2 - (centerMx - viewportSize.width / 2 - prevPan.x) * factor,
                    y: centerMy - viewportSize.height / 2 - (centerMy - viewportSize.height / 2 - prevPan.y) * factor
                  }));
                  return nextZoom;
                });
              }}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700/80 active:bg-blue-600 rounded-lg transition text-base font-bold cursor-pointer"
              title="Zoom In (+)"
              aria-label="Zoom In"
            >
              <Plus size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => {
                const centerMx = viewportSize.width / 2;
                const centerMy = viewportSize.height / 2;
                setZoom((prevZoom) => {
                  const nextZoom = Math.max(prevZoom * 0.8, 0.15);
                  const factor = nextZoom / prevZoom;
                  setPan((prevPan) => ({
                    x: centerMx - viewportSize.width / 2 - (centerMx - viewportSize.width / 2 - prevPan.x) * factor,
                    y: centerMy - viewportSize.height / 2 - (centerMy - viewportSize.height / 2 - prevPan.y) * factor
                  }));
                  return nextZoom;
                });
              }}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700/80 active:bg-blue-600 rounded-lg transition text-base font-bold cursor-pointer"
              title="Zoom Out (-)"
              aria-label="Zoom Out"
            >
              <Minus size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => handleFitView()}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-sky-400 hover:text-sky-300 hover:bg-slate-700/80 active:bg-blue-600 rounded-lg transition text-[10px] font-bold uppercase cursor-pointer"
              title="Fit Plot to Viewport"
              aria-label="Fit View"
            >
              <ArrowsOut size={15} weight="bold" />
            </button>
          </div>
        </div>

        {/* MEASURE RULER ACTIVE STATUS CARD (TOP-LEFT OVERLAY) */}
        {isMeasuring && (
          <div className="absolute top-3 left-3 bg-slate-900/95 border border-amber-500/80 p-3 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md text-slate-200 z-30 max-w-sm">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Ruler size={16} weight="bold" /> Cadastral Distance & Bearing Ruler
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMeasuring(false);
                  setMeasurePoints([]);
                  setCursorWorldPos(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-2 space-y-1 text-[11px]">
              <div className="text-slate-400">
                {measurePoints.length === 0 && 'Click first beacon or point on map...'}
                {measurePoints.length === 1 && 'Click second beacon to complete measurement...'}
                {measurePoints.length === 2 && 'Measurement locked.'}
              </div>

              {activeMeasurement && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ground Distance:</span>
                    <strong className="text-white text-xs">{activeMeasurement.distance.toFixed(3)} m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Survey Bearing:</span>
                    <strong className="text-amber-400 text-xs">{activeMeasurement.bearingFormatted}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinate Diff:</span>
                    <span className="text-slate-300">
                      ΔE: {activeMeasurement.deltaE >= 0 ? `+${activeMeasurement.deltaE.toFixed(3)}` : activeMeasurement.deltaE.toFixed(3)}m, 
                      ΔN: {activeMeasurement.deltaN >= 0 ? `+${activeMeasurement.deltaN.toFixed(3)}` : activeMeasurement.deltaN.toFixed(3)}m
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMeasurePoints([]);
                  setCursorWorldPos(null);
                }}
                className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
              >
                Clear Line
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMeasuring(false);
                  setMeasurePoints([]);
                  setCursorWorldPos(null);
                }}
                className="py-1 px-2 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-semibold"
              >
                Exit Measure
              </button>
            </div>
          </div>
        )}

        {/* HOVER TOOLTIP (DESKTOP) */}
        {hoveredPoint && !activePoint && !isMeasuring && (
          <div className="absolute top-3 left-3 bg-slate-900/95 border border-sky-500/60 p-2.5 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md pointer-events-none text-slate-200 z-10">
            <div className="font-bold text-sky-400 text-sm flex items-center gap-2">
              <span>{hoveredPoint.id || hoveredPoint.name}</span>
              {hoveredPoint.code && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {hoveredPoint.code}
                </span>
              )}
            </div>
            <div className="mt-1 text-slate-300 text-[11px] space-y-0.5">
              <div>E: <span className="text-white font-semibold">{hoveredPoint.easting}</span></div>
              <div>N: <span className="text-white font-semibold">{hoveredPoint.northing}</span></div>
              <div>Z: <span className="text-slate-400">{hoveredPoint.elevation || '0.000'}m</span></div>
            </div>
            <div className="mt-1 text-[10px] text-sky-400/80">Click to lock & inspect traverse</div>
          </div>
        )}

        {/* ACTIVE POINT INSPECTOR DRAWER (WITH TRAVERSE SEQUENTIAL WALK) */}
        {activePoint && activePointContext && !isMeasuring && (
          <div className="absolute bottom-3 left-3 right-16 sm:right-auto sm:w-80 bg-slate-900/95 border border-sky-500/80 p-3.5 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md text-slate-200 z-30">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activePointContext.palette.dot }}
                />
                <span className="font-bold text-sky-400 text-sm">{activePoint.id || activePoint.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {activePoint.code || activePointContext.areaName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePoint(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Close Inspector"
              >
                <X size={14} />
              </button>
            </div>

            {/* Coordinate Grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2.5 text-[11px]">
              <div>Easting: <span className="text-white font-bold">{activePoint.easting}</span></div>
              <div>Northing: <span className="text-white font-bold">{activePoint.northing}</span></div>
              <div>Elev (Z): <span className="text-slate-300">{activePoint.elevation || '0.000'}m</span></div>
              <div>Peg #{activePointContext.indexInArea} of {activePointContext.totalInArea}</div>
            </div>

            {/* Staking Out Boundary Traverse Guide (To Next & From Prev) */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
              {activePointContext.toNext && (
                <div className="flex justify-between text-sky-300">
                  <span className="text-slate-400">To Next ({activePointContext.nextPoint.id || activePointContext.nextPoint.name}):</span>
                  <span>
                    <strong className="text-white">{activePointContext.toNext.distance.toFixed(3)}m</strong> @{' '}
                    <strong className="text-amber-400">{activePointContext.toNext.bearingFormatted}</strong>
                  </span>
                </div>
              )}
              {activePointContext.fromPrev && (
                <div className="flex justify-between text-slate-400">
                  <span>From Prev ({activePointContext.prevPoint.id || activePointContext.prevPoint.name}):</span>
                  <span>
                    <strong className="text-slate-200">{activePointContext.fromPrev.distance.toFixed(3)}m</strong> @{' '}
                    <strong className="text-slate-300">{activePointContext.fromPrev.bearingFormatted}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Sequential Traverse Walk Buttons */}
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={handleSelectPrevPoint}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Step to Previous Peg in Boundary"
              >
                <CaretLeft size={13} weight="bold" /> Prev Peg
              </button>
              <button
                type="button"
                onClick={() => handleCenterOnPoint(activePoint)}
                className="py-1.5 px-2.5 bg-sky-600/80 hover:bg-sky-600 text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Center on this Beacon"
              >
                <Crosshair size={13} weight="bold" />
              </button>
              <button
                type="button"
                onClick={handleSelectNextPoint}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Step to Next Peg in Boundary"
              >
                Next Peg <CaretRight size={13} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* Interactive Gesture & Orientation Overlay Tag */}
        <div className="absolute top-3 right-20 text-[10px] font-mono text-slate-400 bg-slate-900/85 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm pointer-events-none hidden sm:block">
          Scroll to Zoom • Drag to Pan • Click Point to Inspect • North {northRotation}°00'
        </div>
      </div>

      {/* 5. DIMENSIONAL SUMMARY FOOTER */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs shrink-0">
          <div>
            <span className="text-slate-500 block text-[11px]">Area Displayed:</span>
            <span className="text-slate-200 font-bold font-mono text-xs">
              {selectedArea === 'all' ? `Estate-wide (${points.length} Pts)` : `${selectedArea} (${activePointsList.length} Pts)`}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">East Span (Width):</span>
            <span className="text-slate-200 font-bold font-mono text-xs">
              {(areaStats || stats).spanE.toFixed(2)} m
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">North Span (Length):</span>
            <span className="text-slate-200 font-bold font-mono text-xs">
              {(areaStats || stats).spanN.toFixed(2)} m
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              {(areaStats || stats).area ? 'Surface Area:' : 'Layout Orientation:'}
            </span>
            <span className="text-emerald-400 font-bold font-mono text-xs">
              {(areaStats || stats).area
                ? `${(areaStats || stats).area.toFixed(1)} m² (${((areaStats || stats).area / 10000).toFixed(4)} Ha)`
                : `North ${northRotation}°00'`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapePlotViewer;
