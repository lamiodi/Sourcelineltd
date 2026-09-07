import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Copy,
  Gear,
  CheckCircle,
  Trash,
  FileCode,
  FileText,
  Sparkle,
  Info,
  Eye,
  Camera,
  Globe,
  Plus,
  Minus,
  ArrowsClockwise,
  Warning,
  WarningCircle,
  ShieldCheck
} from '@phosphor-icons/react';

// ============================================================================
// GEODETIC DATUM TRANSFORMATION ENGINE (MINNA <-> WGS84)
// ============================================================================
// Nigerian Minna Datum (Clarke 1880 modified): a = 6378249.145m, 1/f = 293.465
// WGS84: a = 6378137.0m, 1/f = 298.257223563
// Standard 3-parameter transformation for Nigeria (NGB / EPSG 26391 / 26392):
// dX = -92m, dY = -93m, dZ = +122m
function utmToLatLon(easting, northing, zone = 31, a = 6378137.0, f = 1 / 298.257223563) {
  const k0 = 0.9996;
  const e = Math.sqrt(2 * f - f * f);
  const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));
  const x = easting - 500000.0;
  const y = northing;

  const m = y / k0;
  const mu = m / (a * (1 - (e * e) / 4 - (3 * Math.pow(e, 4)) / 64 - (5 * Math.pow(e, 6)) / 256));

  const phi1Rad = mu +
    (3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32) * Math.sin(2 * mu) +
    (21 * Math.pow(e1, 2) / 16 - 55 * Math.pow(e1, 4) / 32) * Math.sin(4 * mu) +
    (151 * Math.pow(e1, 3) / 96) * Math.sin(6 * mu) +
    (1097 * Math.pow(e1, 4) / 512) * Math.sin(8 * mu);

  const n1 = a / Math.sqrt(1 - e * e * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  const t1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  const c1 = (e * e / (1 - e * e)) * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  const r1 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  const d = x / (n1 * k0);

  const lat = phi1Rad - (n1 * Math.tan(phi1Rad) / r1) * (
    (d * d) / 2 -
    (5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * (e * e / (1 - e * e))) * Math.pow(d, 4) / 24 +
    (61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * (e * e / (1 - e * e)) - 3 * c1 * c1) * Math.pow(d, 6) / 720
  );

  const lon = (
    d -
    (1 + 2 * t1 + c1) * Math.pow(d, 3) / 6 +
    (5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * (e * e / (1 - e * e)) + 24 * t1 * t1) * Math.pow(d, 5) / 120
  ) / Math.cos(phi1Rad);

  const lambda0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;
  return {
    lat: (lat * 180) / Math.PI,
    lon: ((lon + lambda0) * 180) / Math.PI
  };
}

function latLonToUtm(lat, lon, zone = 31, a = 6378137.0, f = 1 / 298.257223563) {
  const k0 = 0.9996;
  const phi = (lat * Math.PI) / 180.0;
  const lambda = (lon * Math.PI) / 180.0;
  const lambda0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180.0;

  const e = Math.sqrt(2 * f - f * f);
  const ep2 = (e * e) / (1 - e * e);
  const n = a / Math.sqrt(1 - e * e * Math.sin(phi) * Math.sin(phi));
  const t = Math.tan(phi) * Math.tan(phi);
  const c = ep2 * Math.cos(phi) * Math.cos(phi);
  const aa = (lambda - lambda0) * Math.cos(phi);

  const m = a * (
    (1 - (e * e) / 4 - (3 * Math.pow(e, 4)) / 64 - (5 * Math.pow(e, 6)) / 256) * phi -
    ((3 * e * e) / 8 + (3 * Math.pow(e, 4)) / 32 + (45 * Math.pow(e, 6)) / 1024) * Math.sin(2 * phi) +
    ((15 * Math.pow(e, 4)) / 256 + (45 * Math.pow(e, 6)) / 1024) * Math.sin(4 * phi) -
    ((35 * Math.pow(e, 6)) / 3072) * Math.sin(6 * phi)
  );

  const easting = 500000.0 + k0 * n * (
    aa +
    (1 - t + c) * Math.pow(aa, 3) / 6 +
    (5 - 18 * t + t * t + 72 * c - 58 * ep2) * Math.pow(aa, 5) / 120
  );

  const northing = k0 * (
    m + n * Math.tan(phi) * (
      (aa * aa) / 2 +
      (5 - t + 9 * c + 4 * c * c) * Math.pow(aa, 4) / 24 +
      (61 - 58 * t + t * t + 600 * c - 330 * ep2) * Math.pow(aa, 6) / 720
    )
  );

  return { easting, northing };
}

// Convert Minna Datum UTM to WGS84 (Lat/Lon) with standard datum shift
function minnaUtmToWgs84(easting, northing, zone = 31) {
  // 1. Unproject Minna UTM using Clarke 1880 modified ellipsoid
  const clarke1880A = 6378249.145;
  const clarke1880F = 1 / 293.465;
  const minnaGeo = utmToLatLon(easting, northing, zone, clarke1880A, clarke1880F);

  // 2. Datum shift from Minna to WGS84 (Abridged Molodensky)
  // Nigeria Standard: dX = -92m, dY = -93m, dZ = +122m
  const dx = -92.0;
  const dy = -93.0;
  const dz = 122.0;

  const latRad = (minnaGeo.lat * Math.PI) / 180;
  const lonRad = (minnaGeo.lon * Math.PI) / 180;

  const dLatSeconds = ((-dx * Math.sin(latRad) * Math.cos(lonRad) - dy * Math.sin(latRad) * Math.sin(lonRad) + dz * Math.cos(latRad)) / clarke1880A) * (180 / Math.PI) * 3600;
  const dLonSeconds = ((-dx * Math.sin(lonRad) + dy * Math.cos(lonRad)) / (clarke1880A * Math.cos(latRad))) * (180 / Math.PI) * 3600;

  const wgsLat = minnaGeo.lat + dLatSeconds / 3600;
  const wgsLon = minnaGeo.lon + dLonSeconds / 3600;

  return { lat: wgsLat, lon: wgsLon };
}

// Convert WGS84 (Lat/Lon) to Minna Datum UTM
function wgs84ToMinnaUtm(lat, lon, zone = 31) {
  const clarke1880A = 6378249.145;
  const clarke1880F = 1 / 293.465;

  const dx = 92.0;
  const dy = 93.0;
  const dz = -122.0;

  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const dLatSeconds = ((-dx * Math.sin(latRad) * Math.cos(lonRad) - dy * Math.sin(latRad) * Math.sin(lonRad) + dz * Math.cos(latRad)) / clarke1880A) * (180 / Math.PI) * 3600;
  const dLonSeconds = ((-dx * Math.sin(lonRad) + dy * Math.cos(lonRad)) / (clarke1880A * Math.cos(latRad))) * (180 / Math.PI) * 3600;

  const minnaLat = lat + dLatSeconds / 3600;
  const minnaLon = lon + dLonSeconds / 3600;

  return latLonToUtm(minnaLat, minnaLon, zone, clarke1880A, clarke1880F);
}

// ============================================================================
// DXF GENERATOR (STANDARD ASCII R12/2000 CAD FORMAT)
// ============================================================================
function generateDxfFile(points, options = { closeLoop: true, textHeight: 2.5 }) {
  let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n`;
  dxf += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n3\n`;
  dxf += `0\nLAYER\n2\nSURVEY_POINTS\n70\n0\n62\n4\n6\nCONTINUOUS\n0\n`;
  dxf += `LAYER\n2\nSURVEY_LABELS\n70\n0\n62\n2\n6\nCONTINUOUS\n0\n`;
  dxf += `LAYER\n2\nSURVEY_BOUNDARY\n70\n0\n62\n1\n6\nCONTINUOUS\n0\nENDTAB\n0\nENDSEC\n`;
  dxf += `0\nSECTION\n2\nENTITIES\n`;

  // Draw Point entities
  points.forEach((p) => {
    dxf += `0\nPOINT\n8\nSURVEY_POINTS\n10\n${p.easting}\n20\n${p.northing}\n30\n${p.elevation || 0.0}\n`;
    const label = p.id || p.name || 'PT';
    dxf += `0\nTEXT\n8\nSURVEY_LABELS\n10\n${parseFloat(p.easting) + 0.8}\n20\n${parseFloat(p.northing) + 0.8}\n30\n${p.elevation || 0.0}\n40\n${options.textHeight || 2.5}\n1\n${label}\n`;
  });

  // Draw Closed Boundary Polygon if 3 or more points
  if (points.length >= 3 && options.closeLoop) {
    dxf += `0\nLWPOLYLINE\n8\nSURVEY_BOUNDARY\n90\n${points.length}\n70\n1\n`; // 70=1 is closed
    points.forEach((p) => {
      dxf += `10\n${p.easting}\n20\n${p.northing}\n`;
    });
  }

  dxf += `0\nENDSEC\n0\nEOF\n`;
  return dxf;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================
const SAMPLE_AUTOCAD_DATA = `                  LWPOLYLINE  Layer: "0"
                            Space: Model space
                   Handle = 1f4
                    Closed
    Constant width    0.0000
              area  6250.0000
         perimeter  320.0000
             at point  X= 905.4063  Y=1219.5800  Z=   0.0000
             at point  X= 855.9905  Y=1282.4933  Z=   0.0000
             at point  X= 816.6697  Y=1251.6084  Z=   0.0000
             at point  X= 866.0855  Y=1188.6952  Z=   0.0000`;

const SAMPLE_CSV_DATA = `PointID,Easting,Northing,Elevation,Code
Pillar1,762517.017,547764.142,64.460,BM
Pillar2,762636.060,547651.161,65.543,PILLAR
Pillar3,762486.991,547443.525,62.398,PILLAR
Pillar4,762517.073,547764.076,63.988,PILLAR`;

// ============================================================================
// AUTO-DETECT DUPLICATE COORDINATE ENGINE
// ============================================================================
const detectDuplicateCoordinates = (points, tolerance = 0.005) => {
  if (!points || points.length < 2) {
    return {
      hasDuplicates: false,
      duplicateCount: 0,
      uniqueCount: points ? points.length : 0,
      groups: [],
      duplicateIndices: new Set(),
      loopClosureGroup: null,
      redundantCount: 0
    };
  }

  const groups = [];
  const duplicateIndices = new Set();
  let loopClosureGroup = null;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const e1 = parseFloat(p1.easting);
    const n1 = parseFloat(p1.northing);
    if (isNaN(e1) || isNaN(n1)) continue;

    let matchedGroup = null;
    for (const g of groups) {
      const refPt = g.items[0].point;
      const refE = parseFloat(refPt.easting);
      const refN = parseFloat(refPt.northing);
      if (Math.hypot(e1 - refE, n1 - refN) <= tolerance) {
        matchedGroup = g;
        break;
      }
    }

    if (matchedGroup) {
      matchedGroup.items.push({ index: i, point: p1 });
    } else {
      groups.push({
        coordKey: `E: ${e1.toFixed(3)}, N: ${n1.toFixed(3)}`,
        items: [{ index: i, point: p1 }]
      });
    }
  }

  const dupGroups = groups.filter((g) => g.items.length > 1);

  dupGroups.forEach((g) => {
    g.items.forEach((it) => duplicateIndices.add(it.index));
    const isLoop =
      g.items.length === 2 &&
      g.items.some((it) => it.index === 0) &&
      g.items.some((it) => it.index === points.length - 1);

    g.isLoopClosure = isLoop;
    g.pointNames = g.items
      .map((it) => it.point.id || it.point.name || `P${it.index + 1}`)
      .join(' & ');

    if (isLoop) {
      loopClosureGroup = g;
    }
  });

  const redundantCount = duplicateIndices.size - (loopClosureGroup ? 2 : 0);

  return {
    hasDuplicates: dupGroups.length > 0,
    duplicateCount: duplicateIndices.size,
    uniqueCount: points.length - dupGroups.reduce((acc, g) => acc + (g.items.length - 1), 0),
    groups: dupGroups,
    duplicateIndices,
    loopClosureGroup,
    redundantCount: Math.max(0, redundantCount)
  };
};

// ============================================================================
// 2D SHAPE CANVAS PREVIEW COMPONENT (WITH PAN, ZOOM & CLOSED PLOT)
// ============================================================================
const ShapePlotViewer = ({ points, title = 'Survey Point Geometry' }) => {
  const canvasRef = useRef(null);
  const [connectLines, setConnectLines] = useState(true);
  const [closeLoop, setCloseLoop] = useState(true); // Default to true so 4 points show all 4 lines!
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Pan & Zoom State
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Auto-detect duplicate coordinates within survey tolerance
  const duplicateInfo = useMemo(() => detectDuplicateCoordinates(points), [points]);

  // Check if currently hovered point has duplicates
  const hoveredDupGroup = useMemo(() => {
    if (!hoveredPoint || !duplicateInfo.hasDuplicates) return null;
    return duplicateInfo.groups.find((g) =>
      g.items.some(
        (it) =>
          (it.point.id && it.point.id === hoveredPoint.id) ||
          (it.point.name && it.point.name === hoveredPoint.name) ||
          (it.point.easting === hoveredPoint.easting && it.point.northing === hoveredPoint.northing)
      )
    );
  }, [hoveredPoint, duplicateInfo]);

  // Calculate coordinate bounds and statistics
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

    // Shoelace formula for area & perimeter
    let area = 0;
    let perimeter = 0;
    if (points.length >= 3) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
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
      spanE: spanE > 0 ? spanE : 1,
      spanN: spanN > 0 ? spanN : 1,
      area: area > 0 ? area : null,
      perimeter: perimeter > 0 ? perimeter : null
    };
  }, [points]);

  // Reset View to extents
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Render to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stats || points.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Apply Pan and Zoom transform
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    const padding = 60;
    const availW = width - padding * 2;
    const availH = height - padding * 2;

    // 1:1 isometric scale
    const baseScale = Math.min(availW / stats.spanE, availH / stats.spanN);
    const offsetX = padding + (availW - stats.spanE * baseScale) / 2;
    const offsetY = padding + (availH - stats.spanN * baseScale) / 2;

    const toScreen = (e, n) => ({
      x: offsetX + (parseFloat(e) - stats.minE) * baseScale,
      y: height - (offsetY + (parseFloat(n) - stats.minN) * baseScale)
    });

    // Draw grid lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1 / zoom;
      const step = 40;
      for (let x = -width; x < width * 2; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, -height);
        ctx.lineTo(x, height * 2);
        ctx.stroke();
      }
      for (let y = -height; y < height * 2; y += step) {
        ctx.beginPath();
        ctx.moveTo(-width, y);
        ctx.lineTo(width * 2, y);
        ctx.stroke();
      }
    }

    // Draw connecting lines / boundary polygon
    if (connectLines && points.length > 1) {
      ctx.beginPath();
      const first = toScreen(points[0].easting, points[0].northing);
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < points.length; i++) {
        const pt = toScreen(points[i].easting, points[i].northing);
        ctx.lineTo(pt.x, pt.y);
      }

      // If closeLoop is enabled and >= 3 points, close the polygon (4 lines for 4 points!)
      if (closeLoop && points.length >= 3) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
        ctx.fill();
      }

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5 / zoom;
      ctx.stroke();
    }

    // Draw points and labels
    points.forEach((pt, index) => {
      const scr = toScreen(pt.easting, pt.northing);
      const isDup = duplicateInfo.duplicateIndices.has(index);
      const isLoopClose = duplicateInfo.loopClosureGroup &&
        (index === 0 || index === points.length - 1) &&
        duplicateInfo.loopClosureGroup.items.some((it) => it.index === index);

      // Outer glow circle
      if (isDup) {
        ctx.fillStyle = isLoopClose ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.45)';
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 11 / zoom, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 8 / zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core point dot
      ctx.fillStyle = isDup ? (isLoopClose ? '#60a5fa' : '#f59e0b') : '#38bdf8';
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, (isDup ? 5.5 : 4.5) / zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isDup ? '#fef08a' : '#ffffff';
      ctx.lineWidth = (isDup ? 2 : 1.5) / zoom;
      ctx.stroke();

      // Point label text
      if (showLabels) {
        let label = pt.id || pt.name || `P${index + 1}`;
        if (isDup) {
          label += isLoopClose ? ' [CLOSE]' : ' [DUP]';
        }
        ctx.font = `bold ${Math.max(10, 11 / zoom)}px system-ui, sans-serif`;
        const textWidth = ctx.measureText(label).width;

        // Label pill background
        ctx.fillStyle = isDup ? 'rgba(35, 20, 10, 0.95)' : 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(scr.x + 8 / zoom, scr.y - 14 / zoom, textWidth + 8 / zoom, 16 / zoom);
        ctx.strokeStyle = isDup ? 'rgba(245, 158, 11, 0.9)' : 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(scr.x + 8 / zoom, scr.y - 14 / zoom, textWidth + 8 / zoom, 16 / zoom);

        ctx.fillStyle = isDup ? '#fef08a' : '#f8fafc';
        ctx.fillText(label, scr.x + 12 / zoom, scr.y - 2 / zoom);
      }
    });

    ctx.restore(); // Restore pan/zoom

    // Draw North Arrow (fixed in top-right corner)
    const naX = width - 40;
    const naY = 40;
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(naX, naY - 20);
    ctx.lineTo(naX - 7, naY + 5);
    ctx.lineTo(naX, naY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(naX, naY - 20);
    ctx.lineTo(naX + 7, naY + 5);
    ctx.lineTo(naX, naY);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('N', naX, naY - 24);
    ctx.restore();

    // Coordinate Extents Text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.fillText(`E: ${stats.minE.toFixed(2)}m → ${stats.maxE.toFixed(2)}m  (Width: ${stats.spanE.toFixed(2)}m)`, 16, height - 24);
    ctx.fillText(`N: ${stats.minN.toFixed(2)}m → ${stats.maxN.toFixed(2)}m  (Length: ${stats.spanN.toFixed(2)}m)`, 16, height - 10);

  }, [points, stats, connectLines, closeLoop, showLabels, showGrid, zoom, pan, duplicateInfo]);

  // Pan & Zoom Event Handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.3), 15));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }

    // Tooltip detection
    const canvas = canvasRef.current;
    if (!canvas || !stats || points.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Transform mouse coordinate to account for pan/zoom
    const transX = (mouseX - (canvas.width / 2 + pan.x)) / zoom + canvas.width / 2;
    const transY = (mouseY - (canvas.height / 2 + pan.y)) / zoom + canvas.height / 2;

    const padding = 60;
    const availW = canvas.width - padding * 2;
    const availH = canvas.height - padding * 2;
    const baseScale = Math.min(availW / stats.spanE, availH / stats.spanN);
    const offsetX = padding + (availW - stats.spanE * baseScale) / 2;
    const offsetY = padding + (availH - stats.spanN * baseScale) / 2;

    let found = null;
    points.forEach((pt) => {
      const scrX = offsetX + (parseFloat(pt.easting) - stats.minE) * baseScale;
      const scrY = canvas.height - (offsetY + (parseFloat(pt.northing) - stats.minN) * baseScale);
      const dist = Math.hypot(transX - scrX, transY - scrY);
      if (dist < 14 / zoom) {
        found = pt;
      }
    });
    setHoveredPoint(found);
  };

  const handleMouseUp = () => setIsDragging(false);

  // Export high-res PNG image
  const downloadPlotImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 1100;
    const expCtx = exportCanvas.getContext('2d');

    expCtx.fillStyle = '#090d16';
    expCtx.fillRect(0, 0, 1600, 1100);
    expCtx.drawImage(canvas, 40, 120, 1520, 920);

    // Title block
    expCtx.fillStyle = '#1e293b';
    expCtx.fillRect(40, 30, 1520, 80);
    expCtx.strokeStyle = '#334155';
    expCtx.lineWidth = 1;
    expCtx.strokeRect(40, 30, 1520, 80);

    expCtx.font = 'bold 24px system-ui, sans-serif';
    expCtx.fillStyle = '#38bdf8';
    expCtx.fillText(title.toUpperCase(), 60, 68);

    expCtx.font = '14px monospace';
    expCtx.fillStyle = '#94a3b8';
    expCtx.fillText(`Points: ${points.length}  |  Date: ${new Date().toLocaleDateString()}  |  True 1:1 Scale`, 60, 94);

    if (stats) {
      expCtx.textAlign = 'right';
      expCtx.fillText(`Width: ${stats.spanE.toFixed(3)}m  |  Length: ${stats.spanN.toFixed(3)}m`, 1540, 68);
      if (stats.area) {
        expCtx.fillText(`Area: ${stats.area.toFixed(2)} m² (${(stats.area / 10000).toFixed(4)} Ha)  |  Perimeter: ${stats.perimeter.toFixed(2)}m`, 1540, 94);
      }
      expCtx.textAlign = 'left';
    }

    const link = document.createElement('a');
    link.download = `Survey_Plot_${new Date().toISOString().split('T')[0]}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  // Export clean CSV directly from points array
  const downloadCsvFromPoints = () => {
    if (!points || points.length === 0) return;
    let csv = 'PointID,Easting,Northing,Elevation,Code\n';
    points.forEach((p, idx) => {
      const id = p.id || p.name || `P${idx + 1}`;
      const code = p.code || '';
      csv += `${id},${p.easting},${p.northing},${p.elevation || '0.000'},${code}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Survey_Points_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export DXF vector file directly from points
  const downloadDxfFromPoints = () => {
    if (!points || points.length === 0) return;
    const dxfContent = generateDxfFile(points, { closeLoop });
    const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Survey_Drawing_${new Date().toISOString().split('T')[0]}.dxf`;
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
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col space-y-4">
      {/* Top Bar Controls & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-slate-300 font-medium cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={connectLines}
              onChange={(e) => setConnectLines(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            Connect Boundary Lines
          </label>

          {connectLines && (
            <label className="inline-flex items-center gap-1.5 text-sky-300 font-semibold cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={closeLoop}
                onChange={(e) => setCloseLoop(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
              />
              Close Plot Loop (All 4 Sides)
            </label>
          )}

          <label className="inline-flex items-center gap-1.5 text-slate-300 font-medium cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            Show Labels
          </label>

          <label className="inline-flex items-center gap-1.5 text-slate-300 font-medium cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            Show Grid
          </label>

          {duplicateInfo.hasDuplicates ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
              title={duplicateInfo.groups.map((g) => `${g.pointNames}: ${g.coordKey}`).join(' | ')}
            >
              <Warning size={13} weight="fill" className="text-amber-400" />
              {duplicateInfo.groups.length} Duplicate Location{duplicateInfo.groups.length > 1 ? 's' : ''}
              {duplicateInfo.loopClosureGroup && ' (Loop Close)'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <CheckCircle size={12} weight="fill" /> Unique Coords
            </span>
          )}
        </div>

        {/* Pan / Zoom and Export Actions */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z * 1.25, 15))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              title="Zoom In"
            >
              <Plus size={14} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z * 0.8, 0.3))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              title="Zoom Out"
            >
              <Minus size={14} weight="bold" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded text-[11px] font-semibold"
              title="Fit to Extents"
            >
              Fit
            </button>
          </div>

          <button
            type="button"
            onClick={downloadCsvFromPoints}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 shadow-sm"
            title="Download points as CSV file"
          >
            <Download size={14} weight="bold" /> .csv
          </button>
          <button
            type="button"
            onClick={downloadDxfFromPoints}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition shadow-sm"
            title="Download AutoCAD DXF CAD drawing"
          >
            <FileCode size={14} weight="bold" /> .dxf CAD
          </button>
          <button
            type="button"
            onClick={downloadPlotImage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm"
            title="Download high-res PNG image"
          >
            <Camera size={14} weight="bold" /> Plot PNG
          </button>
        </div>
      </div>

      {/* Main Canvas Plot with Pan & Zoom */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 select-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setHoveredPoint(null);
          }}
          className="w-full h-auto max-h-[500px] object-contain cursor-grab active:cursor-grabbing block"
        />

        {/* Hovered Point Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-blue-500/50 p-2.5 rounded-lg text-xs font-mono shadow-2xl backdrop-blur-sm pointer-events-none text-slate-200">
            <div className="font-bold text-sky-400 text-sm mb-1">{hoveredPoint.id || hoveredPoint.name}</div>
            <div>Easting: <span className="text-white">{hoveredPoint.easting}</span></div>
            <div>Northing: <span className="text-white">{hoveredPoint.northing}</span></div>
            <div>Elev (Z): <span className="text-slate-400">{hoveredPoint.elevation || '0.000'}</span></div>
            {hoveredPoint.code && <div>Code: <span className="text-yellow-400">{hoveredPoint.code}</span></div>}
            {hoveredDupGroup && (
              <div className="mt-2 pt-2 border-t border-amber-500/30 text-[11px]">
                <div className="text-amber-300 font-bold flex items-center gap-1">
                  <Warning size={13} weight="fill" className="text-amber-400 shrink-0" />
                  {hoveredDupGroup.isLoopClosure ? 'Traverse Loop Closure Point' : 'Duplicate Coordinates Detected'}
                </div>
                <div className="text-amber-200/90 mt-0.5">
                  Matches: <strong className="text-white">{hoveredDupGroup.pointNames}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pan/Zoom Hint */}
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          Scroll to zoom • Drag to pan
        </div>
      </div>

      {/* Dimensional Summary Footer */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">Total Plotted:</span>
            <span className="text-slate-200 font-bold font-mono">{points.length} Points ({closeLoop && points.length >= 3 ? `${points.length} Closed Sides` : `${points.length - 1} Lines`})</span>
          </div>
          <div>
            <span className="text-slate-500 block">East Span (Width):</span>
            <span className="text-slate-200 font-bold font-mono">{stats.spanE.toFixed(2)} m</span>
          </div>
          <div>
            <span className="text-slate-500 block">North Span (Length):</span>
            <span className="text-slate-200 font-bold font-mono">{stats.spanN.toFixed(2)} m</span>
          </div>
          <div>
            <span className="text-slate-500 block">{stats.area ? 'Calculated Area:' : 'Scale:'}</span>
            <span className="text-emerald-400 font-bold font-mono">
              {stats.area ? `${stats.area.toFixed(1)} m² (${(stats.area / 10000).toFixed(4)} Ha)` : '1:1 True Scale'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN POINT CONVERTER PAGE
// ============================================================================
const PointConverter = () => {
  const [activeTab, setActiveTab] = useState('toCsv'); // 'toCsv' | 'toScript' | 'datum'

  // --- AutoCAD to DGPS CSV State ---
  const [autoCadInput, setAutoCadInput] = useState('');
  const [prefix, setPrefix] = useState('TOSET');
  const [startNum, setStartNum] = useState(1);
  const [code, setCode] = useState('COL');
  const [defaultElev, setDefaultElev] = useState('0.000');
  const [csvFormat, setCsvFormat] = useState('P,E,N,Z,D');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [csvOutput, setCsvOutput] = useState('');
  const [parsedCsvPoints, setParsedCsvPoints] = useState([]);
  const [viewModeCsv, setViewModeCsv] = useState('text');

  // --- CSV to AutoCAD Script State ---
  const [csvInput, setCsvInput] = useState('');
  const [csvFormatMode, setCsvFormatMode] = useState('auto');
  const [includeTextLabels, setIncludeTextLabels] = useState(true);
  const [textHeight, setTextHeight] = useState('2.5');
  const [includePdmode, setIncludePdmode] = useState(true);
  const [includeZoomExtents, setIncludeZoomExtents] = useState(true);
  const [includePline, setIncludePline] = useState(true); // Draw closed boundary in script
  const [scriptOutput, setScriptOutput] = useState('');
  const [parsedScriptPoints, setParsedScriptPoints] = useState([]);
  const [viewModeScript, setViewModeScript] = useState('text');

  // --- Datum Transformation State (Minna <-> WGS84) ---
  const [datumMode, setDatumMode] = useState('minnaToWgs'); // 'minnaToWgs' | 'wgsToMinna'
  const [datumZone, setDatumZone] = useState(31); // 31 (Lagos/West) or 32 (East/Central)
  const [datumInput, setDatumInput] = useState('');
  const [datumOutput, setDatumOutput] = useState('');
  const [datumConvertedPoints, setDatumConvertedPoints] = useState([]);

  // --- Feedback States ---
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // --- Auto-Detect Duplicate Coordinates State ---
  const csvDuplicates = useMemo(() => detectDuplicateCoordinates(parsedCsvPoints), [parsedCsvPoints]);
  const scriptDuplicates = useMemo(() => detectDuplicateCoordinates(parsedScriptPoints), [parsedScriptPoints]);

  // Helper: File Upload Handler for Drag & Drop or Click
  const handleFileUpload = (file, targetSetter) => {
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      targetSetter(text);
    };
    reader.readAsText(file);
  };

  // Helper: Split line by commas, tabs, semicolons, or whitespace with quote stripping
  const splitLine = (line) => {
    let parts = [];
    if (line.includes(',')) parts = line.split(',');
    else if (line.includes('\t')) parts = line.split('\t');
    else if (line.includes(';')) parts = line.split(';');
    else parts = line.trim().split(/\s+/);

    return parts.map((p) => p.trim().replace(/^["']|["']$/g, ''));
  };

  // Helper: Check if line is a typical survey header row
  const isHeaderRow = (parts) => {
    const headerKeywords = ['point', 'pt', 'id', 'east', 'northing', 'north', 'easting', 'elev', 'elevation', 'code', 'desc', 'description', 'x', 'y', 'z', 'lat', 'lon', 'latitude', 'longitude'];
    const lowerParts = parts.map((p) => p.toLowerCase());
    return lowerParts.some((p) => headerKeywords.includes(p));
  };

  // --- Multi-Strategy Parser for AutoCAD text ---
  const parseAutoCadCoordinates = (rawText) => {
    if (!rawText || !rawText.trim()) return [];

    const extracted = [];
    const fallbackZ = defaultElev || '0.000';

    // Strategy 1: Multi-line Global Regex for explicit X= ... Y= ... (Z= ...) or Easting= ... Northing= ...
    const explicitPattern = /(?:X|EASTING|EAST|E)\s*=\s*(-?\d+(?:\.\d+)?)[,\s\t\r\n]+(?:Y|NORTHING|NORTH|N)\s*=\s*(-?\d+(?:\.\d+)?)(?:[,\s\t\r\n]+(?:Z|ELEV|ELEVATION)\s*=\s*(-?\d+(?:\.\d+)?))?/gi;
    let match;
    while ((match = explicitPattern.exec(rawText)) !== null) {
      extracted.push({
        easting: parseFloat(match[1]).toFixed(3),
        northing: parseFloat(match[2]).toFixed(3),
        elevation: match[3] !== undefined ? parseFloat(match[3]).toFixed(3) : parseFloat(fallbackZ).toFixed(3)
      });
    }

    if (extracted.length > 0) {
      return extracted;
    }

    // Strategy 2: Line-by-line fallback for raw coordinates
    const lines = rawText.split(/\r\n|\r|\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (/^(?:handle|layer|space|model|constant\s+width|area|perimeter|closed|open|select\s+object|command:|lwpolyline|polyline|line|point\s+layer)/i.test(trimmed)) {
        return;
      }

      const cleanLine = trimmed
        .replace(/^(?:point|pt|id|pk)\s*\d+[:\s-]*/i, '')
        .replace(/^(?:at|from|to)\s+point\s*/i, '');

      const numbers = cleanLine.match(/-?\d+\.\d+|-?\d+/g);
      if (numbers && numbers.length >= 2) {
        const e = numbers[0];
        const n = numbers[1];
        const z = numbers[2] !== undefined ? numbers[2] : fallbackZ;

        if (!isNaN(parseFloat(e)) && !isNaN(parseFloat(n))) {
          extracted.push({
            easting: parseFloat(e).toFixed(3),
            northing: parseFloat(n).toFixed(3),
            elevation: !isNaN(parseFloat(z)) ? parseFloat(z).toFixed(3) : parseFloat(fallbackZ).toFixed(3)
          });
        }
      }
    });

    return extracted;
  };

  // Helper to build CSV string from points array
  const buildCsvString = (pointsList) => {
    let result = '';
    if (includeHeader) {
      if (csvFormat === 'P,E,N,Z,D') result += 'PointID,Easting,Northing,Elevation,Code\n';
      else if (csvFormat === 'P,N,E,Z,D') result += 'PointID,Northing,Easting,Elevation,Code\n';
      else if (csvFormat === 'P,D,E,N,Z') result += 'PointID,Code,Easting,Northing,Elevation\n';
      else if (csvFormat === 'P,E,N,Z') result += 'PointID,Easting,Northing,Elevation\n';
    }

    pointsList.forEach((pt) => {
      if (csvFormat === 'P,E,N,Z,D') {
        result += `${pt.id},${pt.easting},${pt.northing},${pt.elevation},${pt.code}\n`;
      } else if (csvFormat === 'P,N,E,Z,D') {
        result += `${pt.id},${pt.northing},${pt.easting},${pt.elevation},${pt.code}\n`;
      } else if (csvFormat === 'P,D,E,N,Z') {
        result += `${pt.id},${pt.code},${pt.easting},${pt.northing},${pt.elevation}\n`;
      } else if (csvFormat === 'P,E,N,Z') {
        result += `${pt.id},${pt.easting},${pt.northing},${pt.elevation}\n`;
      }
    });
    return result;
  };

  // --- Parser logic for AutoCAD to CSV ---
  const handleGenerateCsv = () => {
    if (!autoCadInput.trim()) {
      setCsvOutput('');
      setParsedCsvPoints([]);
      return;
    }

    const coords = parseAutoCadCoordinates(autoCadInput);
    let currentIndex = parseInt(startNum, 10) || 1;
    const points = [];

    coords.forEach((coord) => {
      const ptId = `${prefix}${currentIndex}`;
      points.push({
        id: ptId,
        code: code || 'COL',
        easting: coord.easting,
        northing: coord.northing,
        elevation: coord.elevation
      });
      currentIndex++;
    });

    setParsedCsvPoints(points);
    setCsvOutput(buildCsvString(points));
  };

  // Remove duplicate coordinates from AutoCAD-converted points
  const handleRemoveCsvDuplicates = (keepLoopClosure = false) => {
    if (parsedCsvPoints.length === 0) return;
    const seen = new Set();
    const cleaned = [];
    const lastIdx = parsedCsvPoints.length - 1;
    const firstKey = `${parseFloat(parsedCsvPoints[0].easting).toFixed(3)},${parseFloat(parsedCsvPoints[0].northing).toFixed(3)}`;

    parsedCsvPoints.forEach((pt, idx) => {
      const key = `${parseFloat(pt.easting).toFixed(3)},${parseFloat(pt.northing).toFixed(3)}`;
      if (keepLoopClosure && idx === lastIdx && idx > 0 && key === firstKey) {
        cleaned.push(pt);
        return;
      }
      if (!seen.has(key)) {
        seen.add(key);
        cleaned.push(pt);
      }
    });

    setParsedCsvPoints(cleaned);
    setCsvOutput(buildCsvString(cleaned));
  };

  const downloadCsv = () => {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Converted_Points_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadDxfAutoCad = () => {
    if (parsedCsvPoints.length === 0) return;
    const dxfContent = generateDxfFile(parsedCsvPoints, { closeLoop: true });
    const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Survey_Drawing_${new Date().toISOString().split('T')[0]}.dxf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Parser logic for CSV to AutoCAD Script ---
  const handleGenerateScript = () => {
    if (!csvInput.trim()) {
      setScriptOutput('');
      setParsedScriptPoints([]);
      return;
    }

    const lines = csvInput.trim().split(/\r\n|\r|\n/);
    const points = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = splitLine(trimmed).filter((p) => p !== '');
      if (parts.length < 2) return;

      // Skip header row
      if (index === 0 && isHeaderRow(parts)) return;

      let name = `P${index + 1}`;
      let easting = null;
      let northing = null;
      let elevation = '0.000';
      let pointCode = '';

      if (csvFormatMode === 'P,D,E,N,Z') {
        name = parts[0] || `P${index + 1}`;
        pointCode = parts[1] || '';
        easting = parts[2];
        northing = parts[3];
        elevation = parts[4] || '0.000';
      } else if (csvFormatMode === 'P,N,E,Z,D') {
        name = parts[0] || `P${index + 1}`;
        northing = parts[1];
        easting = parts[2];
        elevation = parts[3] || '0.000';
        pointCode = parts[4] || '';
      } else if (csvFormatMode === 'P,E,N,Z,D') {
        name = parts[0] || `P${index + 1}`;
        easting = parts[1];
        northing = parts[2];
        elevation = parts[3] || '0.000';
        pointCode = parts[4] || '';
      } else if (csvFormatMode === 'P,E,N,Z') {
        name = parts[0] || `P${index + 1}`;
        easting = parts[1];
        northing = parts[2];
        elevation = parts[3] || '0.000';
      } else if (csvFormatMode === 'E,N,Z') {
        easting = parts[0];
        northing = parts[1];
        elevation = parts[2] || '0.000';
      } else {
        // Auto-detect mode
        if (parts.length >= 5) {
          const part1IsNum = !isNaN(parseFloat(parts[1]));
          const part2IsNum = !isNaN(parseFloat(parts[2]));

          if (!part1IsNum && part2IsNum) {
            name = parts[0];
            pointCode = parts[1];
            easting = parts[2];
            northing = parts[3];
            elevation = parts[4] || '0.000';
          } else {
            name = parts[0];
            easting = parts[1];
            northing = parts[2];
            elevation = parts[3] || '0.000';
            pointCode = parts[4] || '';
          }
        } else if (parts.length === 4) {
          name = parts[0];
          easting = parts[1];
          northing = parts[2];
          elevation = parts[3];
        } else if (parts.length === 3) {
          const p0 = parseFloat(parts[0]);
          const p1 = parseFloat(parts[1]);
          const p2 = parseFloat(parts[2]);

          if (isNaN(p0) || (p1 > 1000 && p2 > 1000)) {
            name = parts[0];
            easting = parts[1];
            northing = parts[2];
            elevation = '0.000';
          } else {
            easting = parts[0];
            northing = parts[1];
            elevation = parts[2];
          }
        } else if (parts.length === 2) {
          easting = parts[0];
          northing = parts[1];
          elevation = '0.000';
        }
      }

      const eastNum = parseFloat(easting);
      const northNum = parseFloat(northing);
      const elevNum = parseFloat(elevation);

      if (!isNaN(eastNum) && !isNaN(northNum)) {
        points.push({
          id: name || `P${index + 1}`,
          name: name || `P${index + 1}`,
          code: pointCode,
          easting: eastNum.toFixed(3),
          northing: northNum.toFixed(3),
          elevation: !isNaN(elevNum) ? elevNum.toFixed(3) : '0.000'
        });
      }
    });

    setParsedScriptPoints(points);
    setScriptOutput(buildScriptString(points));
  };

  // Helper to build AutoCAD script from points array
  const buildScriptString = (pointsList) => {
    let script = '';
    if (includePdmode) {
      script += '; --- AutoCAD Point Setup ---\n';
      script += 'PDMODE 35\n';
      script += 'PDSIZE 1.0\n';
    }

    script += '; --- Generated Survey Coordinates ---\n';
    pointsList.forEach((pt) => {
      script += `_POINT ${pt.easting},${pt.northing},${pt.elevation}\n`;
      const ptLabel = pt.name || pt.id;
      if (includeTextLabels && ptLabel) {
        const labelText = pt.code ? `${ptLabel} (${pt.code})` : ptLabel;
        script += `_-TEXT ${pt.easting},${pt.northing},${pt.elevation} ${textHeight} 0 ${labelText}\n`;
      }
    });

    // Draw closed polyline connecting all boundary points (all 4 lines for 4 points!)
    if (includePline && pointsList.length >= 3) {
      script += '; --- Closed Boundary Polyline ---\n';
      script += '_PLINE ';
      pointsList.forEach((pt) => {
        script += `${pt.easting},${pt.northing} `;
      });
      script += '_C\n'; // Close the boundary loop!
    }

    if (includeZoomExtents) {
      script += '; --- Zoom Extents ---\n';
      script += '_ZOOM _E\n';
    }

    return script;
  };

  // Remove duplicate coordinates from CSV-converted script points
  const handleRemoveScriptDuplicates = (keepLoopClosure = false) => {
    if (parsedScriptPoints.length === 0) return;
    const seen = new Set();
    const cleaned = [];
    const lastIdx = parsedScriptPoints.length - 1;
    const firstKey = `${parseFloat(parsedScriptPoints[0].easting).toFixed(3)},${parseFloat(parsedScriptPoints[0].northing).toFixed(3)}`;

    parsedScriptPoints.forEach((pt, idx) => {
      const key = `${parseFloat(pt.easting).toFixed(3)},${parseFloat(pt.northing).toFixed(3)}`;
      if (keepLoopClosure && idx === lastIdx && idx > 0 && key === firstKey) {
        cleaned.push(pt);
        return;
      }
      if (!seen.has(key)) {
        seen.add(key);
        cleaned.push(pt);
      }
    });

    setParsedScriptPoints(cleaned);
    setScriptOutput(buildScriptString(cleaned));
  };

  const downloadScript = () => {
    if (!scriptOutput) return;
    const blob = new Blob([scriptOutput], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoCAD_Points_${new Date().toISOString().split('T')[0]}.scr`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Datum Transformation Logic (Minna <-> WGS84) ---
  const handleConvertDatum = () => {
    if (!datumInput.trim()) return;

    const lines = datumInput.trim().split(/\r\n|\r|\n/);
    const converted = [];
    let outText = '';

    if (datumMode === 'minnaToWgs') {
      outText += 'PointID,WGS84_Latitude,WGS84_Longitude,Elevation\n';
    } else {
      outText += `PointID,Minna_Easting_Z${datumZone},Minna_Northing_Z${datumZone},Elevation\n`;
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = splitLine(trimmed).filter((p) => p !== '');
      if (parts.length < 2) return;
      if (index === 0 && isHeaderRow(parts)) return;

      let id = `P${index + 1}`;
      let col1 = null, col2 = null, elev = '0.000';

      if (parts.length >= 3 && isNaN(parseFloat(parts[0]))) {
        id = parts[0];
        col1 = parseFloat(parts[1]);
        col2 = parseFloat(parts[2]);
        if (parts[3]) elev = parts[3];
      } else {
        col1 = parseFloat(parts[0]);
        col2 = parseFloat(parts[1]);
        if (parts[2]) elev = parts[2];
      }

      if (isNaN(col1) || isNaN(col2)) return;

      if (datumMode === 'minnaToWgs') {
        // col1 = Easting, col2 = Northing
        const wgs = minnaUtmToWgs84(col1, col2, parseInt(datumZone, 10));
        converted.push({
          id,
          lat: wgs.lat.toFixed(7),
          lon: wgs.lon.toFixed(7),
          elevation: elev
        });
        outText += `${id},${wgs.lat.toFixed(7)},${wgs.lon.toFixed(7)},${elev}\n`;
      } else {
        // col1 = Latitude, col2 = Longitude
        const utm = wgs84ToMinnaUtm(col1, col2, parseInt(datumZone, 10));
        converted.push({
          id,
          easting: utm.easting.toFixed(3),
          northing: utm.northing.toFixed(3),
          elevation: elev
        });
        outText += `${id},${utm.easting.toFixed(3)},${utm.northing.toFixed(3)},${elev}\n`;
      }
    });

    setDatumConvertedPoints(converted);
    setDatumOutput(outText);
  };

  const copyToClipboard = (text, setCopiedState) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-4 shadow-sm">
            <Sparkle weight="fill" className="text-blue-600" />
            Professional Surveying Precision Suite
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3"
          >
            Survey Point Converter & Cad Suite
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Convert between AutoCAD, DGPS CSV, and Script formats with instant 2D geometric shape preview, DXF CAD export, and Minna/WGS84 datum transformation.
          </motion.p>
        </div>

        {/* Custom Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 inline-flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('toCsv')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'toCsv' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText weight={activeTab === 'toCsv' ? 'fill' : 'regular'} />
              AutoCAD to DGPS (CSV)
            </button>
            <button
              onClick={() => setActiveTab('toScript')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'toScript' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCode weight={activeTab === 'toScript' ? 'fill' : 'regular'} />
              CSV to AutoCAD Script (.scr)
            </button>
            <button
              onClick={() => setActiveTab('datum')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'datum' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Globe weight={activeTab === 'datum' ? 'fill' : 'regular'} />
              Minna ↔ WGS84 Datum
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AutoCAD to DGPS CSV */}
        {/* ========================================================================= */}
        {activeTab === 'toCsv' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Column */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">1</span>
                    <h2 className="text-base font-bold text-slate-800">Paste or Drop AutoCAD Points</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoCadInput(SAMPLE_AUTOCAD_DATA)}
                      className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                      title="Load realistic AutoCAD points"
                    >
                      Load Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoCadInput('');
                        setCsvOutput('');
                        setParsedCsvPoints([]);
                        setUploadedFileName('');
                      }}
                      className="text-xs font-semibold p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Clear input"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col space-y-4">
                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Prefix</label>
                      <input 
                        type="text" 
                        value={prefix} 
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="e.g. TOSET"
                        className="w-full text-xs font-medium border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Start Num</label>
                      <input 
                        type="number" 
                        value={startNum} 
                        onChange={(e) => setStartNum(e.target.value)}
                        min="1"
                        className="w-full text-xs font-medium border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Feature Code</label>
                      <input 
                        type="text" 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. COL"
                        className="w-full text-xs font-medium border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Default Elev (Z)</label>
                      <input 
                        type="text" 
                        value={defaultElev} 
                        onChange={(e) => setDefaultElev(e.target.value)}
                        placeholder="e.g. 0.000"
                        className="w-full text-xs font-medium border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
                      />
                    </div>
                  </div>

                  {/* Format & Header Settings */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-slate-700">DGPS Format:</label>
                      <select
                        value={csvFormat}
                        onChange={(e) => setCsvFormat(e.target.value)}
                        className="border border-slate-200 rounded-md p-1.5 text-xs bg-white focus:ring-blue-500 focus:border-blue-500 font-medium"
                      >
                        <option value="P,E,N,Z,D">Point, Easting, Northing, Elev, Code (P,E,N,Z,D)</option>
                        <option value="P,N,E,Z,D">Point, Northing, Easting, Elev, Code (P,N,E,Z,D)</option>
                        <option value="P,D,E,N,Z">Point, Code, Easting, Northing, Elev (P,D,E,N,Z)</option>
                        <option value="P,E,N,Z">Point, Easting, Northing, Elev (P,E,N,Z)</option>
                      </select>
                    </div>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={includeHeader}
                        onChange={(e) => setIncludeHeader(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Include CSV Header
                    </label>
                  </div>

                  {/* Drag & Drop File Upload Area */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0], setAutoCadInput);
                      }
                    }}
                    className="relative flex-grow flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600">AutoCAD Text or File Drop:</label>
                      <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        Choose File (.txt, .csv, .log)
                        <input
                          type="file"
                          accept=".txt,.csv,.scr,.log,.xyz"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0], setAutoCadInput);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {uploadedFileName && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 border border-emerald-200 flex items-center gap-1.5 font-medium">
                        <CheckCircle weight="fill" /> Loaded file: {uploadedFileName}
                      </div>
                    )}

                    <textarea
                      className="w-full flex-grow min-h-[230px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none text-slate-800 placeholder-slate-400 bg-white"
                      placeholder={`Paste coordinates from AutoCAD command line, ID, or LIST...\nExample:\n             at point  X= 905.4063  Y=1219.5800  Z=   0.0000\n             at point  X= 855.9905  Y=1282.4933  Z=   0.0000\n             at point  X= 816.6697  Y=1251.6084  Z=   0.0000\n             at point  X= 866.0855  Y=1188.6952  Z=   0.0000`}
                      value={autoCadInput}
                      onChange={(e) => setAutoCadInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCsv}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Gear weight="bold" size={18} /> Convert to DGPS CSV & Plot Closed Shape
                  </button>
                </div>
              </div>

              {/* Output Column */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">2</span>
                    <h2 className="text-base font-bold text-slate-800">DGPS CSV Data</h2>
                  </div>
                  {parsedCsvPoints.length > 0 && (
                    <div className="flex items-center gap-2">
                      {csvDuplicates.hasDuplicates ? (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full flex items-center gap-1 shadow-2xs">
                          <Warning size={13} weight="fill" className="text-amber-600" />
                          {csvDuplicates.groups.length} Duplicate Location{csvDuplicates.groups.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                          <CheckCircle weight="fill" size={13} /> {parsedCsvPoints.length} Points (Unique)
                        </span>
                      )}
                      <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-white text-xs">
                        <button
                          onClick={() => setViewModeCsv('text')}
                          className={`px-2.5 py-1 rounded font-medium ${viewModeCsv === 'text' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Raw CSV
                        </button>
                        <button
                          onClick={() => setViewModeCsv('table')}
                          className={`px-2.5 py-1 rounded font-medium ${viewModeCsv === 'table' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Table
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  {/* Auto-Detect Duplicate Coordinates Warning Banner */}
                  {csvDuplicates.hasDuplicates && (
                    <div className="mb-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Warning size={18} className="text-amber-600 shrink-0 mt-0.5" weight="fill" />
                          <div>
                            <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                              <span>Auto-Detected {csvDuplicates.groups.length} Duplicate Coordinate Location{csvDuplicates.groups.length > 1 ? 's' : ''} ({csvDuplicates.duplicateCount} points total)</span>
                              {csvDuplicates.loopClosureGroup ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                                  Traverse Loop Closure
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                                  Redundant Points
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                              {csvDuplicates.loopClosureGroup && csvDuplicates.groups.length === 1
                                ? `Traverse loop closure detected: Start point (${csvDuplicates.loopClosureGroup.items[0].point.id}) matches end point (${csvDuplicates.loopClosureGroup.items[1].point.id}) to close the polygon.`
                                : `Survey coordinates match within standard 5mm tolerance. You can clean redundant duplicates or keep closing point.`}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {csvDuplicates.groups.map((grp, gIdx) => (
                                <span key={gIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-amber-200 rounded-md text-[11px] font-mono text-slate-700 shadow-2xs">
                                  <span className="font-bold text-amber-800">{grp.pointNames}:</span>
                                  <span>{grp.coordKey}</span>
                                  {grp.isLoopClosure && <span className="text-blue-600 font-semibold text-[10px]">(Closure)</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0 sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveCsvDuplicates(false)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1"
                            title="Remove all duplicate coordinates, keeping only the first occurrence"
                          >
                            <Trash size={14} /> Remove Duplicates
                          </button>
                          {csvDuplicates.loopClosureGroup && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCsvDuplicates(true)}
                              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1"
                              title="Remove redundant points but preserve the starting point at the end of the survey"
                            >
                              Keep Loop Closure
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {viewModeCsv === 'text' ? (
                    <textarea
                      readOnly
                      className="w-full flex-grow min-h-[300px] p-4 border border-slate-200 rounded-xl bg-slate-50/50 font-mono text-xs leading-relaxed resize-none text-slate-800"
                      placeholder="Converted CSV points will appear here ready to download or copy..."
                      value={csvOutput}
                    />
                  ) : (
                    <div className="w-full flex-grow min-h-[300px] border border-slate-200 rounded-xl overflow-auto max-h-[360px] bg-white">
                      <table className="min-w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-bold">
                          <tr>
                            <th className="px-3 py-2">Point ID</th>
                            <th className="px-3 py-2">Code</th>
                            <th className="px-3 py-2">Easting (X)</th>
                            <th className="px-3 py-2">Northing (Y)</th>
                            <th className="px-3 py-2">Elevation (Z)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {parsedCsvPoints.map((pt, i) => {
                            const isDup = csvDuplicates.duplicateIndices.has(i);
                            const isClosure = csvDuplicates.loopClosureGroup &&
                              (i === 0 || i === parsedCsvPoints.length - 1) &&
                              csvDuplicates.loopClosureGroup.items.some((it) => it.index === i);

                            return (
                              <tr
                                key={i}
                                className={
                                  isDup
                                    ? isClosure
                                      ? 'bg-blue-50/70 font-mono hover:bg-blue-100/60 border-l-2 border-l-blue-500'
                                      : 'bg-amber-50/70 font-mono hover:bg-amber-100/70 border-l-2 border-l-amber-500'
                                    : 'hover:bg-slate-50 font-mono'
                                }
                              >
                                <td className="px-3 py-1.5 font-bold text-blue-700 flex items-center gap-1.5">
                                  {pt.id}
                                  {isDup && (
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                                        isClosure
                                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                                          : 'bg-amber-200 text-amber-900 border-amber-300'
                                      }`}
                                    >
                                      {isClosure ? 'LOOP CLOSE' : 'DUPLICATE'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-1.5 text-slate-600">{pt.code}</td>
                                <td className="px-3 py-1.5 text-slate-800 font-semibold">{pt.easting}</td>
                                <td className="px-3 py-1.5 text-slate-800 font-semibold">{pt.northing}</td>
                                <td className="px-3 py-1.5 text-slate-600">{pt.elevation}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(csvOutput, setCopiedCsv)}
                      disabled={!csvOutput}
                      className={`flex-1 min-w-[120px] font-semibold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 border text-xs sm:text-sm ${
                        !csvOutput
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
                      }`}
                    >
                      {copiedCsv ? <CheckCircle className="text-emerald-600" weight="fill" size={18} /> : <Copy weight="bold" size={18} />}
                      {copiedCsv ? 'Copied CSV!' : 'Copy Text'}
                    </button>
                    <button
                      type="button"
                      onClick={downloadCsv}
                      disabled={!csvOutput}
                      className={`flex-1 min-w-[140px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        !csvOutput
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      <Download weight="bold" size={18} /> Download .csv
                    </button>
                    <button
                      type="button"
                      onClick={downloadDxfAutoCad}
                      disabled={parsedCsvPoints.length === 0}
                      className={`flex-1 min-w-[140px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        parsedCsvPoints.length === 0
                          ? 'bg-emerald-200 text-white cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      <FileCode weight="bold" size={18} /> Download .dxf
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2D Geometric Shape Preview Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye size={20} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">2D Geometry & Closed Plot Preview</h3>
                </div>
                <span className="text-xs font-medium text-slate-500">True 1:1 Isometric Scale</span>
              </div>
              <ShapePlotViewer points={parsedCsvPoints} title="AutoCAD to DGPS Closed Plot" />
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CSV to AutoCAD Script */}
        {/* ========================================================================= */}
        {activeTab === 'toScript' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Column */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">1</span>
                    <h2 className="text-base font-bold text-slate-800">Paste or Drop Survey CSV Data</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCsvInput(SAMPLE_CSV_DATA)}
                      className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                      title="Load realistic survey points"
                    >
                      Load Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvInput('');
                        setScriptOutput('');
                        setParsedScriptPoints([]);
                        setUploadedFileName('');
                      }}
                      className="text-xs font-semibold p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Clear input"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col space-y-4">
                  {/* Configuration Options */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <label className="font-semibold text-slate-700">Column Mapping:</label>
                        <select
                          value={csvFormatMode}
                          onChange={(e) => setCsvFormatMode(e.target.value)}
                          className="border border-slate-200 rounded-md p-1.5 text-xs bg-white focus:ring-blue-500 focus:border-blue-500 font-medium"
                        >
                          <option value="auto">Auto Detect (P-E-N-Z-D / P-D-E-N-Z / P-E-N-Z)</option>
                          <option value="P,E,N,Z,D">P, E, N, Z, D (Name, East, North, Elev, Code)</option>
                          <option value="P,D,E,N,Z">P, D, E, N, Z (Name, Code, East, North, Elev)</option>
                          <option value="P,N,E,Z,D">P, N, E, Z, D (Name, North, East, Elev, Code)</option>
                          <option value="P,E,N,Z">P, E, N, Z (Name, East, North, Elev)</option>
                          <option value="E,N,Z">E, N, Z (East, North, Elev only)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeTextLabels}
                          onChange={(e) => setIncludeTextLabels(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Add Text Labels (Point Names)
                      </label>

                      {includeTextLabels && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-600 font-medium">Text Height:</span>
                          <input
                            type="text"
                            value={textHeight}
                            onChange={(e) => setTextHeight(e.target.value)}
                            className="w-16 border border-slate-200 rounded p-1 text-xs text-center bg-white font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 pt-1">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-sky-700 font-semibold">
                        <input
                          type="checkbox"
                          checked={includePline}
                          onChange={(e) => setIncludePline(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Draw Closed Boundary (<code className="text-blue-600">_PLINE _C</code>)
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includePdmode}
                          onChange={(e) => setIncludePdmode(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Point Display (<code className="text-blue-600">PDMODE 35</code>)
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeZoomExtents}
                          onChange={(e) => setIncludeZoomExtents(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Zoom Extents (<code className="text-blue-600">ZOOM E</code>)
                      </label>
                    </div>
                  </div>

                  {/* Drag & Drop File Upload Area */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0], setCsvInput);
                      }
                    }}
                    className="relative flex-grow flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600">CSV Coordinates or File Drop:</label>
                      <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        Choose File (.csv, .txt)
                        <input
                          type="file"
                          accept=".csv,.txt,.dat,.xyz"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0], setCsvInput);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {uploadedFileName && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 border border-emerald-200 flex items-center gap-1.5 font-medium">
                        <CheckCircle weight="fill" /> Loaded file: {uploadedFileName}
                      </div>
                    )}

                    <textarea
                      className="w-full flex-grow min-h-[230px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none text-slate-800 placeholder-slate-400 bg-white"
                      placeholder={`Paste CSV, Excel, or tabular points here...\nExample:\nPl1, 762636.060, 547651.161, 65.543\nPl2, 762486.991, 547443.525, 62.398\nPl3, 762517.073, 547764.076, 63.988\nPl4, 762530.132, 547759.957, 63.867`}
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateScript}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Gear weight="bold" size={18} /> Generate Script, CAD & Plot Shape
                  </button>
                </div>
              </div>

              {/* Output Column */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">2</span>
                    <h2 className="text-base font-bold text-slate-800">AutoCAD Script (.scr)</h2>
                  </div>
                  {parsedScriptPoints.length > 0 && (
                    <div className="flex items-center gap-2">
                      {scriptDuplicates.hasDuplicates ? (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full flex items-center gap-1 shadow-2xs">
                          <Warning size={13} weight="fill" className="text-amber-600" />
                          {scriptDuplicates.groups.length} Duplicate Location{scriptDuplicates.groups.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                          <CheckCircle weight="fill" size={13} /> {parsedScriptPoints.length} Points (Unique)
                        </span>
                      )}
                      <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-white text-xs">
                        <button
                          onClick={() => setViewModeScript('text')}
                          className={`px-2.5 py-1 rounded font-medium ${viewModeScript === 'text' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Script
                        </button>
                        <button
                          onClick={() => setViewModeScript('table')}
                          className={`px-2.5 py-1 rounded font-medium ${viewModeScript === 'table' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Table
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  {/* Auto-Detect Duplicate Coordinates Warning Banner */}
                  {scriptDuplicates.hasDuplicates && (
                    <div className="mb-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Warning size={18} className="text-amber-600 shrink-0 mt-0.5" weight="fill" />
                          <div>
                            <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                              <span>Auto-Detected {scriptDuplicates.groups.length} Duplicate Coordinate Location{scriptDuplicates.groups.length > 1 ? 's' : ''} ({scriptDuplicates.duplicateCount} points total)</span>
                              {scriptDuplicates.loopClosureGroup ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                                  Traverse Loop Closure
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                                  Redundant Points
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                              {scriptDuplicates.loopClosureGroup && scriptDuplicates.groups.length === 1
                                ? `Traverse loop closure detected: Start point (${scriptDuplicates.loopClosureGroup.items[0].point.name || scriptDuplicates.loopClosureGroup.items[0].point.id}) matches end point (${scriptDuplicates.loopClosureGroup.items[1].point.name || scriptDuplicates.loopClosureGroup.items[1].point.id}) to close the polygon.`
                                : `Survey coordinates match within standard 5mm tolerance. You can clean redundant duplicates or keep closing point.`}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {scriptDuplicates.groups.map((grp, gIdx) => (
                                <span key={gIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-amber-200 rounded-md text-[11px] font-mono text-slate-700 shadow-2xs">
                                  <span className="font-bold text-amber-800">{grp.pointNames}:</span>
                                  <span>{grp.coordKey}</span>
                                  {grp.isLoopClosure && <span className="text-blue-600 font-semibold text-[10px]">(Closure)</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0 sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveScriptDuplicates(false)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1"
                            title="Remove all duplicate coordinates, keeping only the first occurrence"
                          >
                            <Trash size={14} /> Remove Duplicates
                          </button>
                          {scriptDuplicates.loopClosureGroup && (
                            <button
                              type="button"
                              onClick={() => handleRemoveScriptDuplicates(true)}
                              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1"
                              title="Remove redundant points but preserve the starting point at the end of the survey"
                            >
                              Keep Loop Closure
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50/70 border border-blue-200/60 p-3 rounded-xl mb-4 text-xs text-blue-900 flex items-start gap-2">
                    <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>AutoCAD execution:</strong> Drag & drop the downloaded <code>.scr</code> file directly into AutoCAD, or open the <code>.dxf</code> drawing directly.
                    </div>
                  </div>

                  {viewModeScript === 'text' ? (
                    <textarea
                      readOnly
                      className="w-full flex-grow min-h-[260px] p-4 border border-slate-200 rounded-xl bg-slate-50/50 font-mono text-xs leading-relaxed resize-none text-slate-800"
                      placeholder="Generated AutoCAD script will appear here ready to plot all points instantly..."
                      value={scriptOutput}
                    />
                  ) : (
                    <div className="w-full flex-grow min-h-[260px] border border-slate-200 rounded-xl overflow-auto max-h-[320px] bg-white">
                      <table className="min-w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-bold">
                          <tr>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Code</th>
                            <th className="px-3 py-2">Easting (X)</th>
                            <th className="px-3 py-2">Northing (Y)</th>
                            <th className="px-3 py-2">Elevation (Z)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {parsedScriptPoints.map((pt, i) => {
                            const isDup = scriptDuplicates.duplicateIndices.has(i);
                            const isClosure = scriptDuplicates.loopClosureGroup &&
                              (i === 0 || i === parsedScriptPoints.length - 1) &&
                              scriptDuplicates.loopClosureGroup.items.some((it) => it.index === i);

                            return (
                              <tr
                                key={i}
                                className={
                                  isDup
                                    ? isClosure
                                      ? 'bg-blue-50/70 font-mono hover:bg-blue-100/60 border-l-2 border-l-blue-500'
                                      : 'bg-amber-50/70 font-mono hover:bg-amber-100/70 border-l-2 border-l-amber-500'
                                    : 'hover:bg-slate-50 font-mono'
                                }
                              >
                                <td className="px-3 py-1.5 font-bold text-blue-700 flex items-center gap-1.5">
                                  {pt.name}
                                  {isDup && (
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                                        isClosure
                                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                                          : 'bg-amber-200 text-amber-900 border-amber-300'
                                      }`}
                                    >
                                      {isClosure ? 'LOOP CLOSE' : 'DUPLICATE'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-1.5 text-slate-600">{pt.code || '-'}</td>
                                <td className="px-3 py-1.5 text-slate-800 font-semibold">{pt.easting}</td>
                                <td className="px-3 py-1.5 text-slate-800 font-semibold">{pt.northing}</td>
                                <td className="px-3 py-1.5 text-slate-600">{pt.elevation}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(scriptOutput, setCopiedScript)}
                      disabled={!scriptOutput}
                      className={`flex-1 min-w-[120px] font-semibold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 border text-xs sm:text-sm ${
                        !scriptOutput
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
                      }`}
                    >
                      {copiedScript ? <CheckCircle className="text-emerald-600" weight="fill" size={18} /> : <Copy weight="bold" size={18} />}
                      {copiedScript ? 'Copied!' : 'Copy Script'}
                    </button>
                    <button
                      type="button"
                      onClick={downloadScript}
                      disabled={!scriptOutput}
                      className={`flex-1 min-w-[140px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        !scriptOutput
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      <Download weight="bold" size={18} /> Download .scr
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (parsedScriptPoints.length === 0) return;
                        const dxfContent = generateDxfFile(parsedScriptPoints, { closeLoop: true });
                        const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8;' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Survey_Drawing_${new Date().toISOString().split('T')[0]}.dxf`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      disabled={parsedScriptPoints.length === 0}
                      className={`flex-1 min-w-[140px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        parsedScriptPoints.length === 0
                          ? 'bg-emerald-200 text-white cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      <FileCode weight="bold" size={18} /> Download .dxf
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2D Geometric Shape Preview Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye size={20} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">2D Geometry & Closed Plot Preview</h3>
                </div>
                <span className="text-xs font-medium text-slate-500">True 1:1 Isometric Scale</span>
              </div>
              <ShapePlotViewer points={parsedScriptPoints} title="Survey CSV Closed Plot" />
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Datum Transformation (Minna UTM ↔ WGS84 Lat/Long) */}
        {/* ========================================================================= */}
        {activeTab === 'datum' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Datum Input Column */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">1</span>
                    <h2 className="text-base font-bold text-slate-800">Coordinates to Transform</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (datumMode === 'minnaToWgs') {
                        setDatumInput(`Pl1, 762636.060, 547651.161, 65.543\nPl2, 762486.991, 547443.525, 62.398`);
                      } else {
                        setDatumInput(`Pl1, 6.4524102, 3.3912044, 25.000\nPl2, 6.4518201, 3.3921005, 24.500`);
                      }
                    }}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    Load Sample
                  </button>
                </div>

                <div className="p-6 flex-grow flex flex-col space-y-4">
                  {/* Mode & Zone Selection */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Conversion Type:</label>
                      <select
                        value={datumMode}
                        onChange={(e) => setDatumMode(e.target.value)}
                        className="w-full border border-slate-200 rounded-md p-1.5 text-xs bg-white focus:ring-blue-500 font-medium"
                      >
                        <option value="minnaToWgs">Minna UTM → WGS84 GPS (Lat/Lon)</option>
                        <option value="wgsToMinna">WGS84 GPS (Lat/Lon) → Minna UTM</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">UTM Zone (Nigeria):</label>
                      <select
                        value={datumZone}
                        onChange={(e) => setDatumZone(e.target.value)}
                        className="w-full border border-slate-200 rounded-md p-1.5 text-xs bg-white focus:ring-blue-500 font-medium"
                      >
                        <option value="31">UTM Zone 31N (Lagos, Ogun, Oyo, Osun, Ondo, Ekiti)</option>
                        <option value="32">UTM Zone 32N (Abuja, Edo, Delta, Rivers, Enugu, Kano)</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative flex-grow flex flex-col">
                    <label className="text-xs font-semibold text-slate-600 mb-1">
                      {datumMode === 'minnaToWgs' ? 'Paste Minna Easting, Northing Coordinates:' : 'Paste WGS84 Latitude, Longitude Coordinates:'}
                    </label>
                    <textarea
                      className="w-full flex-grow min-h-[250px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none text-slate-800 placeholder-slate-400 bg-white"
                      placeholder={datumMode === 'minnaToWgs' ? `Format: PointID, Easting, Northing, Elevation\ne.g. Pillar1, 762636.060, 547651.161, 65.543` : `Format: PointID, Latitude, Longitude, Elevation\ne.g. Pillar1, 6.4524102, 3.3912044, 25.000`}
                      value={datumInput}
                      onChange={(e) => setDatumInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConvertDatum}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ArrowsClockwise weight="bold" size={18} /> Transform Coordinates
                  </button>
                </div>
              </div>

              {/* Datum Output Column */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">2</span>
                    <h2 className="text-base font-bold text-slate-800">Transformed Coordinates</h2>
                  </div>
                  {datumConvertedPoints.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      {datumConvertedPoints.length} Points Converted
                    </span>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <textarea
                    readOnly
                    className="w-full flex-grow min-h-[300px] p-4 border border-slate-200 rounded-xl bg-slate-50/50 font-mono text-xs leading-relaxed resize-none text-slate-800"
                    placeholder="Transformed coordinates will appear here ready to copy or download as CSV..."
                    value={datumOutput}
                  />

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(datumOutput, setCopiedCsv)}
                      disabled={!datumOutput}
                      className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 border text-sm ${
                        !datumOutput
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
                      }`}
                    >
                      {copiedCsv ? <CheckCircle className="text-emerald-600" weight="fill" size={18} /> : <Copy weight="bold" size={18} />}
                      {copiedCsv ? 'Copied!' : 'Copy Converted'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!datumOutput) return;
                        const blob = new Blob([datumOutput], { type: 'text/csv;charset=utf-8;' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Datum_Transformed_${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      disabled={!datumOutput}
                      className={`flex-1 font-bold py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-sm ${
                        !datumOutput
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      <Download weight="bold" size={18} /> Download CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              AutoCAD LIST & ID Support
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Extracts coordinates directly from AutoCAD command lines, polylines, and point tables while discarding metadata.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              DXF Vector CAD Export
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Export standard ASCII DXF files with layers for survey points, boundary lines, and text labels for any CAD software.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              Closed Plot & Pan/Zoom
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Automatically closes the 4th side on 4-point parcels, with real-time area calculation, perimeter, and scroll-to-zoom.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Auto-Detect Duplicates
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Scans coordinates within 5mm tolerance, flags loop closure vs redundant shots, and provides one-click deduplication.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Minna ↔ WGS84 Datum
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Standard Nigerian geodetic datum shifts between Clarke 1880 Minna UTM Zones 31N/32N and WGS84 GPS Lat/Long.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PointConverter;
