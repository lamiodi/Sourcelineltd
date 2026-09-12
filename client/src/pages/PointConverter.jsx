import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  ArrowsLeftRight,
  Warning,
  WarningCircle,
  ShieldCheck,
  X,
  Broadcast,
  ClockCountdown,
  WifiSlash,
  QrCode,
  Radio,
  CloudArrowDown
} from '@phosphor-icons/react';
import { API_URL } from '../config';

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
// AUTO-DETECT COORDINATE INVERSION (X / Y SWAP) ENGINE
// ============================================================================
export const detectCoordinateInversion = (points) => {
  if (!points || points.length === 0) {
    return {
      isInvertedSuspected: false,
      reason: '',
      avgEasting: 0,
      avgNorthing: 0,
      confidence: 0
    };
  }

  let sumE = 0;
  let sumN = 0;
  let validCount = 0;

  for (let i = 0; i < points.length; i++) {
    const e = parseFloat(points[i].easting);
    const n = parseFloat(points[i].northing);
    if (!isNaN(e) && !isNaN(n)) {
      sumE += e;
      sumN += n;
      validCount++;
    }
  }

  if (validCount === 0) {
    return {
      isInvertedSuspected: false,
      reason: '',
      avgEasting: 0,
      avgNorthing: 0,
      confidence: 0
    };
  }

  const avgE = sumE / validCount;
  const avgN = sumN / validCount;

  // Case 1: Standard Nigerian UTM Zone 31N / 32N coordinates (Minna or WGS84 UTM)
  // Easting: typically 300,000 to 780,000 (Lagos/Ogun/Oyo: ~500k - 700k)
  // Northing: typically 650,000 to 1,500,000 (Lagos/Ogun: ~700k - 800k+, North: > 1,000,000)
  // If the Easting column contains values characteristic of Northing (> 650,000 and greater than Northing column),
  // or Northing is distinctly in the typical Easting range (< 600,000 while Easting is > 650,000):
  const isUtmRange = (avgE > 100000 || avgN > 100000);
  if (isUtmRange) {
    if (avgE > 650000 && avgN < 600000) {
      return {
        isInvertedSuspected: true,
        reason: `Easting (~${avgE.toFixed(0)}m) is larger than Northing (~${avgN.toFixed(0)}m), matching an inverted N,E column order typical in Total Station exports.`,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.95
      };
    }
    if (avgE > avgN && (avgE - avgN > 40000)) {
      return {
        isInvertedSuspected: true,
        reason: `Values in the Easting column exceed Northing by ${(avgE - avgN).toFixed(0)}m. Cadastral records in this zone typically have Northing > Easting.`,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.85
      };
    }
  }

  // Case 2: Geographic coordinates (Lat/Long in decimal degrees)
  // In Nigeria: Latitude is ~4°N to ~14°N, Longitude is ~2°E to ~15°E
  if (Math.abs(avgE) <= 180 && Math.abs(avgN) <= 180) {
    if (avgE >= 4 && avgE <= 14 && avgN >= 2 && avgN <= 8) {
      return {
        isInvertedSuspected: true,
        reason: `Column 1 (${avgE.toFixed(4)}°) resembles Latitude and Column 2 (${avgN.toFixed(4)}°) resembles Longitude. Standard GIS format requires Longitude (X), Latitude (Y).`,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.9
      };
    }
  }

  return {
    isInvertedSuspected: false,
    reason: '',
    avgEasting: avgE,
    avgNorthing: avgN,
    confidence: 0
  };
};

export const swapPointCoordinates = (points) => {
  if (!points || points.length === 0) return [];
  return points.map((pt) => ({
    ...pt,
    easting: pt.northing,
    northing: pt.easting
  }));
};

// ============================================================================
// MOBILE & DESKTOP FILE UPLOAD CARD COMPONENT
// ============================================================================
const MobileFileUploadCard = ({
  onFileLoaded,
  uploadedFileName,
  onClearFile,
  accept = ".csv,.txt,.scr,.log,.xyz,.dat",
  title = "Upload Survey File",
  subtitle = "Tap to choose file from phone or computer (.csv, .txt, .log, .scr)"
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-slate-50 border-2 border-dashed border-blue-200/80 hover:border-blue-400 rounded-xl p-3 sm:p-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText size={22} weight="bold" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{title}</div>
            <div className="text-[11px] text-slate-500">{subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {uploadedFileName ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium w-full sm:w-auto justify-between shadow-2xs">
              <span className="truncate max-w-[170px] sm:max-w-[220px] font-mono flex items-center gap-1.5">
                <CheckCircle size={15} weight="fill" className="text-emerald-600 shrink-0" />
                {uploadedFileName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFile();
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 hover:bg-emerald-100 rounded text-slate-500 hover:text-red-600 transition shrink-0 cursor-pointer"
                title="Remove loaded file"
                aria-label="Remove loaded file"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              <span>Tap to Select File</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileLoaded(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2D SHAPE CANVAS PREVIEW COMPONENT (WITH PAN, ZOOM & CLOSED PLOT)
// ============================================================================
// ESTATE SETTING-OUT PREVIEW & GEOMETRIC PLOT VIEWER
// Enhanced with Area Clustering, North 270°0' Rotation, Mobile Pinch-to-Zoom,
// Point Name Decluttering/Hiding, and Setting-Out Anomaly Detection
// ============================================================================
const AREA_PALETTES = [
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

  // --- Display & Layer Settings ---
  const [connectLines, setConnectLines] = useState(true);
  const [closeLoop, setCloseLoop] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  // labelMode: 'hidden' (Clean Dots) | 'short' (Number/ID) | 'name' (Full Name) | 'code' (Area/Code)
  const [labelMode, setLabelMode] = useState('hidden');
  // northOrientation: 270 (Estate Grid - North 270°0') | 0 (Standard North Up) | 90 | 180
  const [northRotation, setNorthRotation] = useState(270);
  const [selectedArea, setSelectedArea] = useState('all');
  const [isolateArea, setIsolateArea] = useState(false);
  const [showHealthScan, setShowHealthScan] = useState(false);

  // --- Interaction & Inspection State ---
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activePoint, setActivePoint] = useState(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch gesture refs
  const touchStartRef = useRef(null);
  const pinchRef = useRef(null);
  const lastTapRef = useRef(0);

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
      spanN: spanN > 0 ? spanN : 1
    };
  }, [points]);

  // Selected Area Specific Statistics
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

    // 2. Outliers / Large Jumps in each area
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

  // Active Point Context (Distance & Bearing to next point in area)
  const activePointContext = useMemo(() => {
    if (!activePoint) return null;
    const code = (activePoint.code || '').trim().toUpperCase();
    const grp = areaGroups.groups[code] || areaGroups.groupList[0];
    if (!grp) return null;

    const idx = grp.points.findIndex(
      (p) => (p.id && p.id === activePoint.id) || (p.easting === activePoint.easting && p.northing === activePoint.northing)
    );

    let nextInfo = null;
    if (idx !== -1 && idx < grp.points.length - 1) {
      const nextPt = grp.points[idx + 1];
      const dE = parseFloat(nextPt.easting) - parseFloat(activePoint.easting);
      const dN = parseFloat(nextPt.northing) - parseFloat(activePoint.northing);
      const dist = Math.hypot(dE, dN);
      let brg = (Math.atan2(dE, dN) * 180 / Math.PI + 360) % 360;
      nextInfo = {
        name: nextPt.id || nextPt.name,
        distance: dist.toFixed(3),
        bearing: brg.toFixed(1)
      };
    }

    return {
      areaName: grp.code,
      palette: grp.palette,
      indexInArea: idx + 1,
      totalInArea: grp.points.length,
      next: nextInfo
    };
  }, [activePoint, areaGroups]);

  // Reset / Fit camera view
  const handleFitView = (targetArea = selectedArea) => {
    setPan({ x: 0, y: 0 });
    if (targetArea === 'all' || !areaGroups.groups[targetArea]) {
      setZoom(1.0);
    } else {
      const g = areaGroups.groups[targetArea];
      if (stats && g.spanE > 0 && g.spanN > 0) {
        const scaleX = stats.spanE / Math.max(g.spanE, 15);
        const scaleY = stats.spanN / Math.max(g.spanN, 15);
        const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.7, 1.0), 12.0);

        // Center on area centroid
        const targetMidE = (g.minE + g.maxE) / 2;
        const targetMidN = (g.minN + g.maxN) / 2;
        const globalMidE = (stats.minE + stats.maxE) / 2;
        const globalMidN = (stats.minN + stats.maxN) / 2;

        const availW = 800 - 120;
        const availH = 500 - 120;
        const baseScale = Math.min(availW / stats.spanE, availH / stats.spanN);

        const deltaE = (targetMidE - globalMidE) * baseScale;
        const deltaN = (targetMidN - globalMidN) * baseScale;

        // Account for rotation
        const rotRad = (northRotation * Math.PI) / 180;
        const rx = -deltaE * Math.cos(-rotRad) - (-deltaN) * Math.sin(-rotRad);
        const ry = -deltaE * Math.sin(-rotRad) + (-deltaN) * Math.cos(-rotRad);

        setPan({ x: rx * fitScale, y: -ry * fitScale });
        setZoom(fitScale);
      } else {
        setZoom(1.5);
      }
    }
  };

  // Center on single point
  const handleCenterOnPoint = (pt) => {
    if (!pt || !stats) return;
    const ptE = parseFloat(pt.easting);
    const ptN = parseFloat(pt.northing);
    const globalMidE = (stats.minE + stats.maxE) / 2;
    const globalMidN = (stats.minN + stats.maxN) / 2;

    const availW = 800 - 120;
    const availH = 500 - 120;
    const baseScale = Math.min(availW / stats.spanE, availH / stats.spanN);

    const deltaE = (ptE - globalMidE) * baseScale;
    const deltaN = (ptN - globalMidN) * baseScale;

    const rotRad = (northRotation * Math.PI) / 180;
    const rx = -deltaE * Math.cos(-rotRad) - (-deltaN) * Math.sin(-rotRad);
    const ry = -deltaE * Math.sin(-rotRad) + (-deltaN) * Math.cos(-rotRad);

    setPan({ x: rx * 4.0, y: -ry * 4.0 });
    setZoom(4.0);
  };

  // Switch Area & auto-fit
  const handleSelectArea = (code) => {
    setSelectedArea(code);
    setActivePoint(null);
    handleFitView(code);
  };

  // Cycle North rotation: 270 -> 0 -> 90 -> 180 -> 270
  const handleCycleRotation = () => {
    const sequence = [270, 0, 90, 180];
    const nextIdx = (sequence.indexOf(northRotation) + 1) % sequence.length;
    setNorthRotation(sequence[nextIdx]);
  };

  // Helper to map Point (E, N) to Screen Pixel
  const getScreenCoordinates = useCallback((easting, northing, width, height) => {
    if (!stats) return { x: 0, y: 0 };
    const padding = 60;
    const availW = width - padding * 2;
    const availH = height - padding * 2;
    const baseScale = Math.min(availW / stats.spanE, availH / stats.spanN);
    const offsetX = padding + (availW - stats.spanE * baseScale) / 2;
    const offsetY = padding + (availH - stats.spanN * baseScale) / 2;

    return {
      x: offsetX + (parseFloat(easting) - stats.minE) * baseScale,
      y: height - (offsetY + (parseFloat(northing) - stats.minN) * baseScale)
    };
  }, [stats]);

  // Invert Screen Mouse/Touch Point to locate nearest survey point
  const findPointAtPixel = (canvasX, canvasY) => {
    const canvas = canvasRef.current;
    if (!canvas || !stats || points.length === 0) return null;

    const width = canvas.width;
    const height = canvas.height;
    const rotRad = (northRotation * Math.PI) / 180;

    // Invert canvas transformation:
    // 1. Pan offset relative to center
    const dx = canvasX - (width / 2 + pan.x);
    const dy = canvasY - (height / 2 + pan.y);

    // 2. Rotate by +rotRad (counteracting the -rotRad canvas rotation)
    const cosPos = Math.cos(rotRad);
    const sinPos = Math.sin(rotRad);
    const rx = dx * cosPos - dy * sinPos;
    const ry = dx * sinPos + dy * cosPos;

    // 3. Unscale by zoom
    const ux = rx / zoom;
    const uy = ry / zoom;

    // 4. Translate back
    const invX = ux + width / 2;
    const invY = uy + height / 2;

    let closest = null;
    let minDistance = 22 / zoom; // Detection radius in plot units

    points.forEach((pt) => {
      if (isolateArea && selectedArea !== 'all') {
        const ptCode = (pt.code || '').trim().toUpperCase();
        if (ptCode !== selectedArea) return;
      }
      const scr = getScreenCoordinates(pt.easting, pt.northing, width, height);
      const dist = Math.hypot(invX - scr.x, invY - scr.y);
      if (dist < minDistance) {
        minDistance = dist;
        closest = pt;
      }
    });

    return closest;
  };

  // --- Main Canvas Render ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stats || points.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // High-contrast CAD dark workspace
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Pan & Zoom with Rotation
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    const rotRad = (northRotation * Math.PI) / 180;
    // Rotate canvas around center: when northRotation = 270, North (up) rotates to left (-X)
    ctx.rotate(-rotRad);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // 1. Survey Grid Lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1 / zoom;
      const step = 45;
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

    // 2. Draw Connecting Lines & Closed Polygons (PER AREA - NO SPIDERWEB!)
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

    // 3. Draw Survey Points & Pillars
    points.forEach((pt, index) => {
      const ptCode = (pt.code || '').trim().toUpperCase();
      const grp = areaGroups.groups[ptCode] || areaGroups.groupList[0] || { palette: AREA_PALETTES[0] };
      const isDimmed = selectedArea !== 'all' && ptCode !== selectedArea;
      if (isDimmed && isolateArea) return;

      const scr = getScreenCoordinates(pt.easting, pt.northing, width, height);
      const isDup = duplicateInfo.duplicateIndices.has(index);
      const isHovered = hoveredPoint && (hoveredPoint.id === pt.id || (hoveredPoint.easting === pt.easting && hoveredPoint.northing === pt.northing));
      const isActive = activePoint && (activePoint.id === pt.id || (activePoint.easting === pt.easting && activePoint.northing === pt.northing));

      // Outer glow / Selection Ring
      if (isActive || isHovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 14 / zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 11 / zoom, 0, Math.PI * 2);
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

      // Center Core Dot
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
          // Extract numeric suffix or short name
          const numMatch = (pt.id || pt.name || '').match(/(\d+)$/);
          labelText = numMatch ? numMatch[1] : (pt.id || pt.name || `${index + 1}`);
        } else if (labelMode === 'code') {
          labelText = pt.code || grp.code;
        } else {
          labelText = pt.id || pt.name || `P${index + 1}`;
        }

        if (isDup) labelText += ' [DUP]';

        ctx.save();
        // Translate to point screen position and counter-rotate so text is always horizontal!
        ctx.translate(scr.x, scr.y);
        ctx.rotate(rotRad);

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

    ctx.restore(); // Restore world transform

    // 5. Draw Digital North Compass Rose (Fixed in Corner)
    const naX = width - 48;
    const naY = 48;
    ctx.save();

    // Compass dial circle
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(naX, naY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rotate compass needle to reflect True North relative to view rotation
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

    // South arrow tail (Silver)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(6, 2);
    ctx.lineTo(0, -2);
    ctx.closePath();
    ctx.fill();

    // South needle
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

    ctx.restore(); // Restore needle transform

    // Bearing label below compass
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`N: ${northRotation}°00'`, naX, naY + 38);
    ctx.restore();

    // 6. Dimensional and Coordinate Extents Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '10px monospace';
    const displayStats = areaStats || stats;
    ctx.fillText(
      `E: ${displayStats.minE.toFixed(2)}m → ${displayStats.maxE.toFixed(2)}m (W: ${displayStats.spanE.toFixed(2)}m)`,
      16,
      height - 22
    );
    ctx.fillText(
      `N: ${displayStats.minN.toFixed(2)}m → ${displayStats.maxN.toFixed(2)}m (L: ${displayStats.spanN.toFixed(2)}m)`,
      16,
      height - 8
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
    getScreenCoordinates
  ]);

  // Desktop Mouse Interactions
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.25), 35));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const found = findPointAtPixel(mouseX, mouseY);
    setHoveredPoint(found);
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const clickedPt = findPointAtPixel(mouseX, mouseY);
    if (clickedPt) {
      setActivePoint(clickedPt);
    }
  };

  // Mobile Touch Pan & Pinch-to-Zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      setIsDragging(true);
      setDragStart({ x: t.clientX - pan.x, y: t.clientY - pan.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchRef.current = {
        startDist: dist,
        startZoom: zoom
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const t = e.touches[0];
      setPan({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
    } else if (e.touches.length === 2 && pinchRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scaleRatio = dist / pinchRef.current.startDist;
      const newZoom = Math.min(Math.max(pinchRef.current.startZoom * scaleRatio, 0.25), 35);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      pinchRef.current = null;

      // Detect Tap vs Drag
      if (touchStartRef.current && e.changedTouches.length > 0) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dist = Math.hypot(endX - touchStartRef.current.x, endY - touchStartRef.current.y);
        const duration = Date.now() - touchStartRef.current.time;

        if (dist < 12 && duration < 350) {
          const now = Date.now();
          const isDoubleTap = now - lastTapRef.current < 300;
          lastTapRef.current = now;

          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const canvasX = (endX - rect.left) * (canvas.width / rect.width);
            const canvasY = (endY - rect.top) * (canvas.height / rect.height);

            if (isDoubleTap) {
              // Double-tap zooms in 2x centered on tap
              setZoom((z) => Math.min(z * 1.8, 30));
            } else {
              const tappedPt = findPointAtPixel(canvasX, canvasY);
              setActivePoint(tappedPt);
            }
          }
        }
      }
    }
  };

  // Export PNG Image (Includes North orientation and area legend)
  const downloadPlotImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displayStats = areaStats || stats;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 1100;
    const expCtx = exportCanvas.getContext('2d');

    expCtx.fillStyle = '#090d16';
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
    <div ref={containerRef} className="bg-slate-900 rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-xl flex flex-col space-y-3.5 select-none">
      {/* 1. TOP BAR: Area Selection & Quick Jump Chips */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Estate Areas:
            </span>
            {/* All Areas Chip */}
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

            {/* Individual Area Chips */}
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
        </div>

        {/* 2. TOOLBAR: North 270° Orientation, Labels Toggle, and Drawing Options */}
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs transition border border-amber-500/40 cursor-pointer shadow-2xs"
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
        <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 text-xs space-y-2">
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

      {/* 4. MAIN CANVAS PLOT (MOBILE OPTIMIZED TOUCH VIEWPORT) */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 touch-none">
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: 'none' }}
          className="w-full h-auto max-h-[500px] object-contain cursor-grab active:cursor-grabbing block"
        />

        {/* FLOATING MOBILE THUMB CONTROL PAD (BOTTOM-RIGHT) */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-1 border border-slate-700/80 shadow-2xl flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z * 1.3, 35))}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700/80 active:bg-blue-600 rounded-lg transition text-base font-bold cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <Plus size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z * 0.75, 0.25))}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700/80 active:bg-blue-600 rounded-lg transition text-base font-bold cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <Minus size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => handleFitView()}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-sky-400 hover:text-sky-300 hover:bg-slate-700/80 active:bg-blue-600 rounded-lg transition text-[10px] font-bold uppercase cursor-pointer"
              title="Fit to bounds"
              aria-label="Fit View"
            >
              FIT
            </button>
          </div>
        </div>

        {/* HOVER TOOLTIP (DESKTOP) */}
        {hoveredPoint && !activePoint && (
          <div className="absolute top-3 left-3 bg-slate-900/95 border border-sky-500/50 p-2.5 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md pointer-events-none text-slate-200 z-10">
            <div className="font-bold text-sky-400 text-sm flex items-center gap-2">
              <span>{hoveredPoint.id || hoveredPoint.name}</span>
              {hoveredPoint.code && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {hoveredPoint.code}
                </span>
              )}
            </div>
            <div className="mt-1 text-slate-300 text-[11px]">
              <div>E: <span className="text-white font-semibold">{hoveredPoint.easting}</span></div>
              <div>N: <span className="text-white font-semibold">{hoveredPoint.northing}</span></div>
              <div>Z: <span className="text-slate-400">{hoveredPoint.elevation || '0.000'}</span></div>
            </div>
          </div>
        )}

        {/* ACTIVE POINT INSPECTOR DRAWER (MOBILE TAP & FIELD INSPECT) */}
        {activePoint && activePointContext && (
          <div className="absolute bottom-3 left-3 right-16 sm:right-auto sm:max-w-xs bg-slate-900/95 border border-sky-500/80 p-3 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md text-slate-200 z-30">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
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
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[11px]">
              <div>Easting: <span className="text-white font-bold">{activePoint.easting}</span></div>
              <div>Northing: <span className="text-white font-bold">{activePoint.northing}</span></div>
              <div>Elev (Z): <span className="text-slate-300">{activePoint.elevation || '0.000'}m</span></div>
              <div>Peg #{activePointContext.indexInArea} of {activePointContext.totalInArea}</div>
            </div>

            {/* Staking out guide to next peg */}
            {activePointContext.next && (
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-sky-300">
                <span className="text-slate-400">Next ({activePointContext.next.name}): </span>
                <strong className="text-white">{activePointContext.next.distance}m</strong> @ bearing{' '}
                <strong className="text-amber-400">{activePointContext.next.bearing}°</strong>
              </div>
            )}

            <div className="mt-2.5 pt-1.5 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCenterOnPoint(activePoint)}
                className="flex-1 py-1 px-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold transition"
              >
                Center Point (4x Zoom)
              </button>
              <button
                type="button"
                onClick={() => setActivePoint(null)}
                className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Interactive Gesture & Orientation Overlay Tag */}
        <div className="absolute top-3 right-20 text-[10px] font-mono text-slate-400 bg-slate-900/85 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm pointer-events-none hidden sm:block">
          Pinch to Zoom • Tap Point to Inspect • North {northRotation}°00'
        </div>
      </div>

      {/* 5. DIMENSIONAL SUMMARY FOOTER */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs">
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

  // --- Field Data Collector Hub (PDA Drop) State ---
  const [transferInput, setTransferInput] = useState('');
  const [transferFileName, setTransferFileName] = useState('');
  const [transferJobName, setTransferJobName] = useState('');
  const [transferPoints, setTransferPoints] = useState([]);
  const [activeTransfer, setActiveTransfer] = useState(() => {
    try {
      const saved = localStorage.getItem('sourceline_field_transfer_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed;
        } else {
          localStorage.removeItem('sourceline_field_transfer_v1');
        }
      }
    } catch {
      // Ignore local storage parse errors
    }
    return null;
  });
  const [transferCountdown, setTransferCountdown] = useState(0);
  const [lookupPin, setLookupPin] = useState('');
  const [isStagingLoading, setIsStagingLoading] = useState(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [wifiOffAcknowledged, setWifiOffAcknowledged] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [transferTabSubView, setTransferTabSubView] = useState('upload'); // 'upload' | 'receive'

  // --- Feedback & Error States ---
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileNameScript, setUploadedFileNameScript] = useState('');
  const [uploadedFileNameDatum, setUploadedFileNameDatum] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live countdown timer for active transfer self-destruct (1-hour auto-purge)
  useEffect(() => {
    if (!activeTransfer || !activeTransfer.expiresAt) {
      setTransferCountdown(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((activeTransfer.expiresAt - now) / 1000));
      setTransferCountdown(diffSec);

      if (diffSec <= 0) {
        setActiveTransfer(null);
        setTransferPoints([]);
        try {
          localStorage.removeItem('sourceline_field_transfer_v1');
        } catch {
          // Ignore removal error
        }
        setErrorMsg('Field transfer expired (1-hour limit reached). Coordinates have been automatically purged from the hub.');
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeTransfer]);

  // Check URL query parameters for direct QR code scan (?transfer=PIN)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pinParam = params.get('transfer');
      if (pinParam) {
        setActiveTab('fieldTransfer');
        setTransferTabSubView('receive');
        setLookupPin(pinParam);
        handleLookupTransferByPin(pinParam);
      }
    } catch {
      // Ignore URL parse error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00 (Expired)';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleCreateFieldTransfer = async (overrideContent, overridePoints, overrideName) => {
    setErrorMsg('');
    const raw = typeof overrideContent === 'string' ? overrideContent : transferInput;
    if (!raw || !raw.trim()) {
      setErrorMsg('Please select a CSV file or paste survey coordinates to stage for your Data Collector.');
      return;
    }

    const pts = overridePoints && overridePoints.length > 0 ? overridePoints : parseAutoCadOrCsv(raw);
    const count = pts.length;
    const finalFilename = overrideName || transferFileName || 'Survey_Field_Points.csv';
    const cleanFilename = finalFilename.toLowerCase().endsWith('.csv') ? finalFilename : `${finalFilename}.csv`;

    setIsStagingLoading(true);

    let serverJob = null;
    try {
      const res = await fetch(`${API_URL}/field-transfer/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: cleanFilename,
          content: raw.trim(),
          pointCount: count,
          jobName: transferJobName || 'Survey Field Job',
          ttlMinutes: 60
        })
      });
      if (res.ok) {
        serverJob = await res.json();
      }
    } catch (err) {
      console.warn('Backend field-transfer API unreachable, staging locally with 1-hr timer:', err);
    }

    const now = Date.now();
    const expiresAt = serverJob?.expiresAt || (now + 60 * 60 * 1000);
    const pin = serverJob?.code || Math.floor(100000 + Math.random() * 900000).toString();
    const displayCode = serverJob?.displayCode || `${pin.slice(0, 3)}-${pin.slice(3)}`;

    const stagedPackage = {
      id: serverJob?.id || `local-${Date.now()}`,
      code: pin,
      displayCode,
      filename: cleanFilename,
      content: raw.trim(),
      pointCount: count,
      fileSize: new Blob([raw.trim()]).size,
      jobName: transferJobName || 'Survey Field Job',
      createdAt: now,
      expiresAt
    };

    setActiveTransfer(stagedPackage);
    setTransferPoints(pts);
    try {
      localStorage.setItem('sourceline_field_transfer_v1', JSON.stringify(stagedPackage));
    } catch {
      // Ignore local storage error
    }

    setIsStagingLoading(false);
    setWifiOffAcknowledged(false);
    setSuccessMsg(`Survey points staged! Transfer PIN: ${displayCode}. Auto-deletes in 60 minutes.`);
  };

  const handleLookupTransferByPin = async (pinOverride) => {
    const rawPin = pinOverride || lookupPin;
    const cleanPin = String(rawPin).replace(/[^a-zA-Z0-9]/g, '').trim();
    if (!cleanPin) {
      setErrorMsg('Please enter a valid 6-digit Transfer PIN.');
      return;
    }

    setIsFetchingPin(true);
    setErrorMsg('');

    // Check local storage first
    try {
      const saved = localStorage.getItem('sourceline_field_transfer_v1');
      if (saved) {
        const localObj = JSON.parse(saved);
        if (localObj.code === cleanPin && localObj.expiresAt > Date.now()) {
          setActiveTransfer(localObj);
          setTransferPoints(parseAutoCadOrCsv(localObj.content));
          setIsFetchingPin(false);
          setSuccessMsg(`Retrieved file "${localObj.filename}" with ${localObj.pointCount} points!`);
          return;
        }
      }
    } catch {
      // Ignore local storage parse error
    }

    try {
      const res = await fetch(`${API_URL}/field-transfer/${cleanPin}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTransfer(data);
        setTransferPoints(parseAutoCadOrCsv(data.content));
        setSuccessMsg(`Retrieved file "${data.filename}" with ${data.pointCount} points!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || 'Transfer PIN not found or file has already expired (1-hour limit reached).');
      }
    } catch {
      setErrorMsg('Failed to connect to field transfer hub. Ensure network/hotspot connectivity.');
    } finally {
      setIsFetchingPin(false);
    }
  };

  const handlePurgeTransfer = async () => {
    if (!activeTransfer) return;
    const codeToDel = activeTransfer.code;
    try {
      await fetch(`${API_URL}/field-transfer/${codeToDel}`, { method: 'DELETE' });
    } catch {
      // Ignore delete fetch error
    }
    setActiveTransfer(null);
    setTransferPoints([]);
    setTransferInput('');
    setTransferFileName('');
    try {
      localStorage.removeItem('sourceline_field_transfer_v1');
    } catch {
      // Ignore local storage error
    }
    setSuccessMsg('Transfer package permanently deleted from field hub.');
  };

  const handleDownloadTransferredCsv = () => {
    if (!activeTransfer || !activeTransfer.content) return;
    const blob = new Blob([activeTransfer.content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTransfer.filename;
    a.click();
    window.URL.revokeObjectURL(url);
    setSuccessMsg(`Downloaded "${activeTransfer.filename}" to Data Collector! Remember to TURN OFF PDA Wi-Fi now.`);
  };

  const handleStageFromOtherTab = (content, points, defaultName) => {
    if (!content) return;
    setTransferInput(content);
    setTransferFileName(defaultName || 'Survey_Field_Points.csv');
    setTransferPoints(points || []);
    setActiveTab('fieldTransfer');
    setTransferTabSubView('upload');
    handleCreateFieldTransfer(content, points, defaultName);
  };

  // Auto-dismiss temporary feedback messages after 6 seconds
  useEffect(() => {
    if (!errorMsg && !successMsg) return;
    const timer = setTimeout(() => {
      setErrorMsg('');
      setSuccessMsg('');
    }, 6000);
    return () => clearTimeout(timer);
  }, [errorMsg, successMsg]);

  // Tab change handler that resets temporary notices
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // --- Auto-Detect Duplicate Coordinates State ---
  const csvDuplicates = useMemo(() => detectDuplicateCoordinates(parsedCsvPoints), [parsedCsvPoints]);
  const scriptDuplicates = useMemo(() => detectDuplicateCoordinates(parsedScriptPoints), [parsedScriptPoints]);

  // --- Auto-Detect Inverted Coordinates (X/Y Swap) State ---
  const csvInversion = useMemo(() => detectCoordinateInversion(parsedCsvPoints), [parsedCsvPoints]);
  const scriptInversion = useMemo(() => detectCoordinateInversion(parsedScriptPoints), [parsedScriptPoints]);

  // Helper: File Upload Handler for Mobile & Desktop
  const handleFileUpload = (file, targetSetter, fileNameSetter, autoProcessCallback) => {
    if (!file) return;
    setErrorMsg('');
    if (fileNameSetter) {
      fileNameSetter(file.name);
    } else {
      setUploadedFileName(file.name);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      targetSetter(text);
      setSuccessMsg(`Loaded file "${file.name}" (${(file.size / 1024).toFixed(1)} KB) successfully.`);
      if (autoProcessCallback) {
        autoProcessCallback(text);
      }
    };
    reader.onerror = () => {
      setErrorMsg(`Failed to read file "${file.name}". Please ensure it is a valid text/csv survey file.`);
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

  // --- Multi-Strategy Parser for AutoCAD text AND CSV/Tabular Coordinates ---
  const parseAutoCadOrCsv = (rawText) => {
    if (!rawText || !rawText.trim()) return [];

    const extracted = [];
    const fallbackZ = defaultElev || '0.000';
    let currentIndex = parseInt(startNum, 10) || 1;

    // Strategy 1: Multi-line Global Regex for explicit X= ... Y= ... (Z= ...) or Easting= ... Northing= ...
    const explicitPattern = /(?:X|EASTING|EAST|E)\s*=\s*(-?\d+(?:\.\d+)?)[,\s\t\r\n]+(?:Y|NORTHING|NORTH|N)\s*=\s*(-?\d+(?:\.\d+)?)(?:[,\s\t\r\n]+(?:Z|ELEV|ELEVATION)\s*=\s*(-?\d+(?:\.\d+)?))?/gi;
    let match;
    while ((match = explicitPattern.exec(rawText)) !== null) {
      extracted.push({
        id: `${prefix || 'TOSET'}${currentIndex++}`,
        code: code || 'COL',
        easting: parseFloat(match[1]).toFixed(3),
        northing: parseFloat(match[2]).toFixed(3),
        elevation: match[3] !== undefined ? parseFloat(match[3]).toFixed(3) : parseFloat(fallbackZ).toFixed(3)
      });
    }

    if (extracted.length > 0) {
      return extracted;
    }

    // Strategy 2: Line-by-line fallback supporting CSV, TSV, space-delimited, and AutoCAD listing
    const lines = rawText.split(/\r\n|\r|\n/);
    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (/^(?:handle|layer|space|model|constant\s+width|area|perimeter|closed|open|select\s+object|command:|lwpolyline|polyline|line|point\s+layer)/i.test(trimmed)) {
        return;
      }

      const parts = splitLine(trimmed).filter((p) => p !== '');
      if (parts.length < 2) return;

      // Skip header row
      if (lineIdx === 0 && isHeaderRow(parts)) return;

      // Check if line contains inline X= ... Y= ...
      if (/X\s*=/i.test(trimmed) && /Y\s*=/i.test(trimmed)) {
        const xMatch = trimmed.match(/X\s*=\s*(-?\d+(?:\.\d+)?)/i);
        const yMatch = trimmed.match(/Y\s*=\s*(-?\d+(?:\.\d+)?)/i);
        const zMatch = trimmed.match(/Z\s*=\s*(-?\d+(?:\.\d+)?)/i);
        if (xMatch && yMatch) {
          extracted.push({
            id: `${prefix || 'TOSET'}${currentIndex++}`,
            code: code || 'COL',
            easting: parseFloat(xMatch[1]).toFixed(3),
            northing: parseFloat(yMatch[1]).toFixed(3),
            elevation: zMatch ? parseFloat(zMatch[1]).toFixed(3) : parseFloat(fallbackZ).toFixed(3)
          });
          return;
        }
      }

      let ptId = null;
      let easting = null;
      let northing = null;
      let elev = fallbackZ;
      let ptCode = code || 'COL';

      // Check standard survey CSV columns
      if (parts.length >= 5) {
        // e.g. [PointID, Easting, Northing, Elevation, Code] OR [PointID, Code, Easting, Northing, Elevation]
        const p1IsNum = !isNaN(parseFloat(parts[1]));
        const p2IsNum = !isNaN(parseFloat(parts[2]));

        if (!p1IsNum && p2IsNum) {
          ptId = parts[0];
          ptCode = parts[1] || ptCode;
          easting = parts[2];
          northing = parts[3];
          elev = parts[4] || elev;
        } else {
          ptId = parts[0];
          easting = parts[1];
          northing = parts[2];
          elev = parts[3] || elev;
          ptCode = parts[4] || ptCode;
        }
      } else if (parts.length === 4) {
        // [PointID, Easting, Northing, Elevation] OR [Easting, Northing, Elevation, Code]
        const p0IsNum = !isNaN(parseFloat(parts[0]));
        const p1IsNum = !isNaN(parseFloat(parts[1]));
        const p2IsNum = !isNaN(parseFloat(parts[2]));
        const p3IsNum = !isNaN(parseFloat(parts[3]));

        if (!p0IsNum && p1IsNum && p2IsNum) {
          ptId = parts[0];
          easting = parts[1];
          northing = parts[2];
          elev = parts[3];
        } else if (p0IsNum && p1IsNum) {
          easting = parts[0];
          northing = parts[1];
          elev = p2IsNum ? parts[2] : fallbackZ;
          if (!p3IsNum) ptCode = parts[3];
        }
      } else if (parts.length === 3) {
        // [PointID, Easting, Northing] OR [Easting, Northing, Elevation]
        const p0Num = parseFloat(parts[0]);
        const p1Num = parseFloat(parts[1]);
        const p2Num = parseFloat(parts[2]);

        if (isNaN(p0Num) || (p1Num > 1000 && p2Num > 1000)) {
          ptId = parts[0];
          easting = parts[1];
          northing = parts[2];
        } else {
          easting = parts[0];
          northing = parts[1];
          elev = parts[2];
        }
      } else if (parts.length === 2) {
        if (!isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
          easting = parts[0];
          northing = parts[1];
        }
      }

      // Fallback: numeric regex if delimiters were irregular
      if (easting === null || northing === null || isNaN(parseFloat(easting)) || isNaN(parseFloat(northing))) {
        const cleanLine = trimmed
          .replace(/^(?:point|pt|id|pk)\s*\d+[:\s-]*/i, '')
          .replace(/^(?:at|from|to)\s+point\s*/i, '');
        const numbers = cleanLine.match(/-?\d+\.\d+|-?\d+/g);
        if (numbers && numbers.length >= 2) {
          easting = numbers[0];
          northing = numbers[1];
          if (numbers[2] !== undefined) elev = numbers[2];
        }
      }

      if (easting !== null && northing !== null && !isNaN(parseFloat(easting)) && !isNaN(parseFloat(northing))) {
        extracted.push({
          id: ptId || `${prefix || 'TOSET'}${currentIndex++}`,
          code: ptCode,
          easting: parseFloat(easting).toFixed(3),
          northing: parseFloat(northing).toFixed(3),
          elevation: !isNaN(parseFloat(elev)) ? parseFloat(elev).toFixed(3) : parseFloat(fallbackZ).toFixed(3)
        });
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

  // --- Parser logic for AutoCAD or CSV to DGPS CSV ---
  const handleGenerateCsv = (inputOverride) => {
    setErrorMsg('');
    const raw = typeof inputOverride === 'string' ? inputOverride : autoCadInput;
    if (!raw || !raw.trim()) {
      setCsvOutput('');
      setParsedCsvPoints([]);
      setErrorMsg('Please paste AutoCAD text, CSV coordinates, or upload a survey file first.');
      return;
    }

    const points = parseAutoCadOrCsv(raw);
    if (points.length === 0) {
      setErrorMsg('No valid coordinates found in input. Ensure coordinates contain "X=... Y=..." or numbers formatted as Easting and Northing.');
      return;
    }

    setParsedCsvPoints(points);
    setCsvOutput(buildCsvString(points));
    setSuccessMsg(`Successfully converted ${points.length} point${points.length > 1 ? 's' : ''} and plotted 2D geometry!`);
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

    const removed = parsedCsvPoints.length - cleaned.length;
    setParsedCsvPoints(cleaned);
    setCsvOutput(buildCsvString(cleaned));
    if (removed > 0) {
      setSuccessMsg(`Removed ${removed} duplicate coordinate point${removed > 1 ? 's' : ''}${keepLoopClosure ? ' (preserved boundary closure point)' : ''}.`);
    } else {
      setSuccessMsg('No redundant duplicate points found to remove.');
    }
  };

  // Swap Easting (X) and Northing (Y) coordinates for AutoCAD-to-CSV points
  const handleSwapCsvCoordinates = () => {
    if (parsedCsvPoints.length === 0) return;
    const swapped = swapPointCoordinates(parsedCsvPoints);
    setParsedCsvPoints(swapped);
    setCsvOutput(buildCsvString(swapped));
    setSuccessMsg(`Swapped Easting (X) and Northing (Y) for ${swapped.length} coordinate point${swapped.length > 1 ? 's' : ''}.`);
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
  const handleGenerateScript = (inputOverride) => {
    setErrorMsg('');
    const raw = typeof inputOverride === 'string' ? inputOverride : csvInput;
    if (!raw || !raw.trim()) {
      setScriptOutput('');
      setParsedScriptPoints([]);
      setErrorMsg('Please paste CSV survey points or upload a file first.');
      return;
    }

    const lines = raw.trim().split(/\r\n|\r|\n/);
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

    if (points.length === 0) {
      setErrorMsg('Could not parse any valid coordinate rows from your CSV input. Please check column mapping and verify rows have numeric coordinates.');
      return;
    }

    setParsedScriptPoints(points);
    setScriptOutput(buildScriptString(points));
    setSuccessMsg(`Successfully generated AutoCAD Script (.scr) with ${points.length} point${points.length > 1 ? 's' : ''}!`);
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

    const removed = parsedScriptPoints.length - cleaned.length;
    setParsedScriptPoints(cleaned);
    setScriptOutput(buildScriptString(cleaned));
    if (removed > 0) {
      setSuccessMsg(`Removed ${removed} duplicate coordinate point${removed > 1 ? 's' : ''}${keepLoopClosure ? ' (preserved boundary closure point)' : ''}.`);
    } else {
      setSuccessMsg('No redundant duplicate points found to remove.');
    }
  };

  // Swap Easting (X) and Northing (Y) coordinates for CSV-to-Script points
  const handleSwapScriptCoordinates = () => {
    if (parsedScriptPoints.length === 0) return;
    const swapped = swapPointCoordinates(parsedScriptPoints);
    setParsedScriptPoints(swapped);
    setScriptOutput(buildScriptString(swapped));
    setSuccessMsg(`Swapped Easting (X) and Northing (Y) for ${swapped.length} coordinate point${swapped.length > 1 ? 's' : ''}.`);
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
  const handleConvertDatum = (inputOverride) => {
    setErrorMsg('');
    const raw = typeof inputOverride === 'string' ? inputOverride : datumInput;
    if (!raw || !raw.trim()) {
      setDatumOutput('');
      setDatumConvertedPoints([]);
      setErrorMsg('Please enter or upload coordinates to transform.');
      return;
    }

    const lines = raw.trim().split(/\r\n|\r|\n/);
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

    if (converted.length === 0) {
      setErrorMsg('Could not transform any coordinates. Please check your coordinate format (PointID, Easting/Lat, Northing/Lon).');
      return;
    }

    setDatumConvertedPoints(converted);
    setDatumOutput(outText);
    setSuccessMsg(`Successfully transformed ${converted.length} coordinate point${converted.length > 1 ? 's' : ''}!`);
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
        <div className="flex justify-center mb-8 px-2 sm:px-0">
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 w-full max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            <button
              onClick={() => handleTabChange('toCsv')}
              className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'toCsv' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText weight={activeTab === 'toCsv' ? 'fill' : 'regular'} size={18} />
              <span>AutoCAD / CSV</span>
            </button>
            <button
              onClick={() => handleTabChange('toScript')}
              className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'toScript' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCode weight={activeTab === 'toScript' ? 'fill' : 'regular'} size={18} />
              <span>CSV to Script</span>
            </button>
            <button
              onClick={() => handleTabChange('datum')}
              className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'datum' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Globe weight={activeTab === 'datum' ? 'fill' : 'regular'} size={18} />
              <span>Minna ↔ WGS84</span>
            </button>
            <button
              onClick={() => handleTabChange('fieldTransfer')}
              className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer relative ${
                activeTab === 'fieldTransfer' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Broadcast weight={activeTab === 'fieldTransfer' ? 'fill' : 'regular'} size={18} />
              <span>Field Drop (1-Hr)</span>
              {activeTransfer && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute top-2 right-2 border-2 border-white shadow-xs" title="File Staged on Hub" />
              )}
            </button>
          </div>
        </div>

        {/* Responsive Feedback Alerts (Error / Success) */}
        {(errorMsg || successMsg) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto mb-6 px-2 sm:px-0"
          >
            {errorMsg && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <WarningCircle size={20} weight="fill" className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Input Error: </span>
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition shrink-0 cursor-pointer"
                  aria-label="Dismiss error"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle size={20} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Success: </span>
                    <span className="leading-relaxed">{successMsg}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMsg('')}
                  className="p-1 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded transition shrink-0 cursor-pointer"
                  aria-label="Dismiss message"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}

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
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">1</span>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">AutoCAD or CSV Points</h2>
                      <p className="text-[11px] text-slate-500">Paste text, drop, or tap to upload from phone or PC</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setAutoCadInput(SAMPLE_AUTOCAD_DATA);
                        setUploadedFileName('AutoCAD_Sample.txt');
                        handleGenerateCsv(SAMPLE_AUTOCAD_DATA);
                      }}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
                      title="Load realistic AutoCAD points"
                    >
                      AutoCAD Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoCadInput(SAMPLE_CSV_DATA);
                        setUploadedFileName('Pillar_Survey_Sample.csv');
                        handleGenerateCsv(SAMPLE_CSV_DATA);
                      }}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 cursor-pointer"
                      title="Load realistic CSV pillar survey data"
                    >
                      CSV Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoCadInput('');
                        setCsvOutput('');
                        setParsedCsvPoints([]);
                        setUploadedFileName('');
                      }}
                      className="text-xs font-semibold p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                      title="Clear input"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex-grow flex flex-col space-y-4">
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

                  {/* Mobile & Desktop File Upload Card */}
                  <MobileFileUploadCard
                    title="Upload Survey File (Mobile & Desktop)"
                    subtitle="Tap to browse phone files or drag & drop (.csv, .txt, .log, .scr)"
                    uploadedFileName={uploadedFileName}
                    onFileLoaded={(file) => handleFileUpload(file, setAutoCadInput, setUploadedFileName, (text) => handleGenerateCsv(text))}
                    onClearFile={() => {
                      setUploadedFileName('');
                      setAutoCadInput('');
                      setParsedCsvPoints([]);
                      setCsvOutput('');
                    }}
                    accept=".csv,.txt,.log,.scr,.xyz,.dat"
                  />

                  {/* Textarea for manual paste / edit */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0], setAutoCadInput, setUploadedFileName, (text) => handleGenerateCsv(text));
                      }
                    }}
                    className="relative flex-grow flex flex-col"
                  >
                    <label className="text-xs font-semibold text-slate-600 mb-1.5">
                      Or Paste AutoCAD Command Line / CSV Text:
                    </label>
                    <textarea
                      className="w-full flex-grow min-h-[220px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none text-slate-800 placeholder-slate-400 bg-white"
                      placeholder={`Paste coordinates from AutoCAD command line, LIST, or CSV file...\n\nExample 1 (AutoCAD):\n  at point  X= 905.4063  Y=1219.5800  Z=   0.0000\n  at point  X= 855.9905  Y=1282.4933  Z=   0.0000\n\nExample 2 (CSV):\n  Pillar1, 762517.017, 547764.142, 64.460, BM\n  Pillar2, 762636.060, 547651.161, 65.543, PILLAR`}
                      value={autoCadInput}
                      onChange={(e) => setAutoCadInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateCsv()}
                    className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
                  >
                    <Gear weight="bold" size={18} /> Convert to DGPS CSV & Preview 2D Plot
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
                      <button
                        type="button"
                        onClick={handleSwapCsvCoordinates}
                        className="px-2.5 py-1 rounded font-semibold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Swap Easting (X) and Northing (Y) coordinates"
                      >
                        <ArrowsLeftRight size={13} weight="bold" /> Swap X ⇄ Y
                      </button>
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
                  {/* Auto-Detect Inverted Coordinates Warning Banner */}
                  {csvInversion.isInvertedSuspected && (
                    <div className="mb-4 p-3.5 rounded-xl bg-orange-50/90 border border-orange-200 text-orange-950 text-xs shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <ArrowsLeftRight size={18} className="text-orange-600 shrink-0 mt-0.5" weight="bold" />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>Possible Inverted Coordinates Detected (X / Y Swapped)</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold border border-orange-200">
                                N,E Export Pattern
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                              {csvInversion.reason} Click below to immediately invert columns across all points and update the 2D plot.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSwapCsvCoordinates}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer self-end sm:self-center"
                        >
                          <ArrowsLeftRight size={14} weight="bold" /> Swap X ⇄ Y Now
                        </button>
                      </div>
                    </div>
                  )}

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

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(csvOutput, setCopiedCsv)}
                      disabled={!csvOutput}
                      className={`w-full sm:flex-1 min-h-[44px] font-semibold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 border text-xs sm:text-sm ${
                        !csvOutput
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-sm cursor-pointer'
                      }`}
                    >
                      {copiedCsv ? <CheckCircle className="text-emerald-600" weight="fill" size={18} /> : <Copy weight="bold" size={18} />}
                      {copiedCsv ? 'Copied CSV!' : 'Copy Text'}
                    </button>
                    <button
                      type="button"
                      onClick={downloadCsv}
                      disabled={!csvOutput}
                      className={`w-full sm:flex-1 min-h-[44px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        !csvOutput
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm cursor-pointer'
                      }`}
                    >
                      <Download weight="bold" size={18} /> Download .csv
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageFromOtherTab(csvOutput, parsedCsvPoints, uploadedFileName || 'AutoCAD_Survey_Points.csv')}
                      disabled={!csvOutput}
                      className={`w-full sm:flex-1 min-h-[44px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        !csvOutput
                          ? 'bg-purple-200 text-purple-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-sm cursor-pointer'
                      }`}
                      title="Stage to Field Hub with 1-hour auto-delete for your Data Collector"
                    >
                      <Broadcast weight="bold" size={18} /> Stage to PDA Hub
                    </button>
                    <button
                      type="button"
                      onClick={downloadDxfAutoCad}
                      disabled={parsedCsvPoints.length === 0}
                      className={`w-full sm:flex-1 min-h-[44px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        parsedCsvPoints.length === 0
                          ? 'bg-emerald-200 text-white cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm cursor-pointer'
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
              <ShapePlotViewer 
                points={parsedCsvPoints} 
                title="AutoCAD to DGPS Closed Plot" 
                onSwapCoordinates={handleSwapCsvCoordinates}
              />
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
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">1</span>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">Paste or Upload Survey CSV</h2>
                      <p className="text-[11px] text-slate-500">Paste text, drop, or tap to choose file from phone or PC</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setCsvInput(SAMPLE_CSV_DATA);
                        setUploadedFileNameScript('Survey_Points_Sample.csv');
                        handleGenerateScript(SAMPLE_CSV_DATA);
                      }}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
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
                        setUploadedFileNameScript('');
                      }}
                      className="text-xs font-semibold p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                      title="Clear input"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex-grow flex flex-col space-y-4">
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

                  {/* Mobile & Desktop File Upload Card */}
                  <MobileFileUploadCard
                    title="Upload CSV Points (Mobile & Desktop)"
                    subtitle="Tap to choose CSV from phone or computer (.csv, .txt, .dat, .xyz)"
                    uploadedFileName={uploadedFileNameScript}
                    onFileLoaded={(file) => handleFileUpload(file, setCsvInput, setUploadedFileNameScript, (text) => handleGenerateScript(text))}
                    onClearFile={() => {
                      setUploadedFileNameScript('');
                      setCsvInput('');
                      setParsedScriptPoints([]);
                      setScriptOutput('');
                    }}
                    accept=".csv,.txt,.dat,.xyz"
                  />

                  {/* Textarea for manual paste / edit */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0], setCsvInput, setUploadedFileNameScript, (text) => handleGenerateScript(text));
                      }
                    }}
                    className="relative flex-grow flex flex-col"
                  >
                    <label className="text-xs font-semibold text-slate-600 mb-1.5">
                      Or Paste CSV / Tabular Survey Points:
                    </label>
                    <textarea
                      className="w-full flex-grow min-h-[220px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none text-slate-800 placeholder-slate-400 bg-white"
                      placeholder={`Paste CSV, Excel, or tabular points here...\nExample:\nPl1, 762636.060, 547651.161, 65.543\nPl2, 762486.991, 547443.525, 62.398\nPl3, 762517.073, 547764.076, 63.988\nPl4, 762530.132, 547759.957, 63.867`}
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateScript()}
                    className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
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
                      <button
                        type="button"
                        onClick={handleSwapScriptCoordinates}
                        className="px-2.5 py-1 rounded font-semibold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Swap Easting (X) and Northing (Y) coordinates"
                      >
                        <ArrowsLeftRight size={13} weight="bold" /> Swap X ⇄ Y
                      </button>
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
                  {/* Auto-Detect Inverted Coordinates Warning Banner */}
                  {scriptInversion.isInvertedSuspected && (
                    <div className="mb-4 p-3.5 rounded-xl bg-orange-50/90 border border-orange-200 text-orange-950 text-xs shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <ArrowsLeftRight size={18} className="text-orange-600 shrink-0 mt-0.5" weight="bold" />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>Possible Inverted Coordinates Detected (X / Y Swapped)</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold border border-orange-200">
                                N,E Export Pattern
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                              {scriptInversion.reason} Click below to immediately invert columns across all points and update the 2D plot.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSwapScriptCoordinates}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer self-end sm:self-center"
                        >
                          <ArrowsLeftRight size={14} weight="bold" /> Swap X ⇄ Y Now
                        </button>
                      </div>
                    </div>
                  )}

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

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(scriptOutput, setCopiedScript)}
                      disabled={!scriptOutput}
                      className={`w-full sm:flex-1 min-h-[44px] font-semibold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 border text-xs sm:text-sm ${
                        !scriptOutput
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-sm cursor-pointer'
                      }`}
                    >
                      {copiedScript ? <CheckCircle className="text-emerald-600" weight="fill" size={18} /> : <Copy weight="bold" size={18} />}
                      {copiedScript ? 'Copied!' : 'Copy Script'}
                    </button>
                    <button
                      type="button"
                      onClick={downloadScript}
                      disabled={!scriptOutput}
                      className={`w-full sm:flex-1 min-h-[44px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        !scriptOutput
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm cursor-pointer'
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
                      className={`w-full sm:flex-1 min-h-[44px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        parsedScriptPoints.length === 0
                          ? 'bg-emerald-200 text-white cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm cursor-pointer'
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
              <ShapePlotViewer 
                points={parsedScriptPoints} 
                title="Survey CSV Closed Plot" 
                onSwapCoordinates={handleSwapScriptCoordinates}
              />
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
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">1</span>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">Coordinates to Transform</h2>
                      <p className="text-[11px] text-slate-500">Paste or choose GPS/UTM survey coordinates file from device</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        let sampleText = '';
                        if (datumMode === 'minnaToWgs') {
                          sampleText = `Pl1, 762636.060, 547651.161, 65.543\nPl2, 762486.991, 547443.525, 62.398\nPl3, 762517.073, 547764.076, 63.988\nPl4, 762530.132, 547759.957, 63.867`;
                          setUploadedFileNameDatum('Minna_UTM_Sample.csv');
                        } else {
                          sampleText = `Pl1, 6.4524102, 3.3912044, 25.000\nPl2, 6.4518201, 3.3921005, 24.500\nPl3, 6.4531000, 3.3934000, 26.000\nPl4, 6.4539000, 3.3925000, 25.500`;
                          setUploadedFileNameDatum('WGS84_GPS_Sample.csv');
                        }
                        setDatumInput(sampleText);
                        handleConvertDatum(sampleText);
                      }}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
                    >
                      Load Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDatumInput('');
                        setDatumOutput('');
                        setDatumConvertedPoints([]);
                        setUploadedFileNameDatum('');
                      }}
                      className="text-xs font-semibold p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                      title="Clear input"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex-grow flex flex-col space-y-4">
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

                  {/* Mobile & Desktop File Upload Card */}
                  <MobileFileUploadCard
                    title="Upload Coordinates File (Mobile & Desktop)"
                    subtitle="Tap to choose Minna or WGS84 coordinates file (.csv, .txt)"
                    uploadedFileName={uploadedFileNameDatum}
                    onFileLoaded={(file) => handleFileUpload(file, setDatumInput, setUploadedFileNameDatum, (text) => handleConvertDatum(text))}
                    onClearFile={() => {
                      setUploadedFileNameDatum('');
                      setDatumInput('');
                      setDatumConvertedPoints([]);
                      setDatumOutput('');
                    }}
                    accept=".csv,.txt,.dat"
                  />

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0], setDatumInput, setUploadedFileNameDatum, (text) => handleConvertDatum(text));
                      }
                    }}
                    className="relative flex-grow flex flex-col"
                  >
                    <label className="text-xs font-semibold text-slate-600 mb-1">
                      {datumMode === 'minnaToWgs' ? 'Or Paste Minna Easting, Northing Coordinates:' : 'Or Paste WGS84 Latitude, Longitude Coordinates:'}
                    </label>
                    <textarea
                      className="w-full flex-grow min-h-[220px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none text-slate-800 placeholder-slate-400 bg-white"
                      placeholder={datumMode === 'minnaToWgs' ? `Format: PointID, Easting, Northing, Elevation\ne.g. Pillar1, 762636.060, 547651.161, 65.543` : `Format: PointID, Latitude, Longitude, Elevation\ne.g. Pillar1, 6.4524102, 3.3912044, 25.000`}
                      value={datumInput}
                      onChange={(e) => setDatumInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConvertDatum()}
                    className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
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

                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(datumOutput, setCopiedCsv)}
                      disabled={!datumOutput}
                      className={`w-full sm:flex-1 min-h-[44px] font-semibold py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 border text-xs sm:text-sm ${
                        !datumOutput
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-sm cursor-pointer'
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
                      className={`w-full sm:flex-1 min-h-[44px] font-bold py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        !datumOutput
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm cursor-pointer'
                      }`}
                    >
                      <Download weight="bold" size={18} /> Download CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!datumOutput) return;
                        handleStageFromOtherTab(datumOutput, datumConvertedPoints, `Datum_Transformed_Z${datumZone}.csv`);
                      }}
                      disabled={!datumOutput}
                      className={`w-full sm:flex-1 min-h-[44px] font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        !datumOutput
                          ? 'bg-purple-200 text-purple-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-sm cursor-pointer'
                      }`}
                      title="Stage transformed coordinates to Field Transfer Hub"
                    >
                      <Broadcast weight="bold" size={18} /> Stage to PDA Hub
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: FIELD DATA COLLECTOR TRANSFER HUB (1-HR AUTO-DESTRUCT)        */}
        {/* ==================================================================== */}
        {activeTab === 'fieldTransfer' && (
          <motion.div
            key="fieldTransfer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Critical Surveyor Safety Notice: Turn Off PDA Wi-Fi */}
            <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
              wifiOffAcknowledged
                ? 'bg-emerald-50/95 border-emerald-400 text-emerald-950 shadow-sm'
                : 'bg-amber-50/95 border-amber-400 text-amber-950 shadow-md'
            }`}>
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-xl shrink-0 shadow-xs ${
                  wifiOffAcknowledged ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {wifiOffAcknowledged ? <CheckCircle size={28} weight="fill" /> : <WifiSlash size={28} weight="bold" />}
                </div>
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2 text-slate-900">
                      <span>CRITICAL SURVEYOR NOTICE: TURN OFF PDA WI-FI NOW</span>
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                      wifiOffAcknowledged 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-200 text-amber-900 border-amber-300'
                    }`}>
                      {wifiOffAcknowledged ? 'Survey Safe • Ready' : 'Field Protocol'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Once coordinates are downloaded into your Data Collector (Hi-Target, CHCNAV, Trimble, South, FOIF, SurvX, LandStar, SurvCE, or FieldGenius), <strong>immediately TURN OFF WI-FI and Hotspot on your PDA controller</strong> before beginning your RTK setup or survey.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-white/90 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                      <span className="text-slate-700">
                        <strong>Prevents CORS Data Burn:</strong> Handheld controllers often attempt background CORS / NTRIP streaming when Wi-Fi is active, draining mobile data bundles unknowingly.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                      <span className="text-slate-700">
                        <strong>Prevents Radio Lock Drops:</strong> Disabling Wi-Fi ensures uninterrupted internal UHF radio link between Base and Rover without wireless socket conflicts.
                      </span>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-50 select-none shadow-2xs">
                    <input
                      type="checkbox"
                      checked={wifiOffAcknowledged}
                      onChange={(e) => setWifiOffAcknowledged(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>I have downloaded the CSV and confirmed PDA Wi-Fi / Hotspot is switched OFF</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sub-View Navigation: Upload vs Retrieve */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setTransferTabSubView('upload')}
                  className={`min-h-[42px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                    transferTabSubView === 'upload'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Broadcast size={18} weight={transferTabSubView === 'upload' ? 'fill' : 'regular'} />
                  <span>1. Stage / Upload from Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransferTabSubView('receive')}
                  className={`min-h-[42px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                    transferTabSubView === 'receive'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Radio size={18} weight={transferTabSubView === 'receive' ? 'fill' : 'regular'} />
                  <span>2. Receive on PDA (PIN)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-1">
                <ClockCountdown size={16} className="text-purple-600" />
                <span className="font-medium">1-Hour Auto-Purge Protocol</span>
              </div>
            </div>

            {/* Active Staged Transfer Hub Card (if a file is currently active) */}
            {activeTransfer && (
              <div className="bg-white rounded-2xl border border-purple-200 shadow-md overflow-hidden">
                <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Active Staged File Ready for Data Collector
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${
                      transferCountdown < 600
                        ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                        : 'bg-purple-100 text-purple-800 border-purple-200'
                    }`}>
                      <ClockCountdown size={14} weight="bold" />
                      Auto-Destructs in: {formatCountdown(transferCountdown)}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: PIN & QR Code */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-slate-50/80 rounded-2xl border border-slate-200 text-center">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Data Collector Transfer PIN
                    </span>
                    <div className="font-mono text-3xl sm:text-4xl font-black text-purple-700 tracking-wider my-2 bg-white px-5 py-2 rounded-xl border border-purple-200 shadow-2xs">
                      {activeTransfer.displayCode || activeTransfer.code}
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeTransfer.code, setCopiedPin)}
                      className="text-xs text-slate-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1.5 mb-4 cursor-pointer"
                    >
                      {copiedPin ? <CheckCircle className="text-emerald-600" weight="fill" size={14} /> : <Copy size={14} />}
                      {copiedPin ? 'PIN Copied!' : 'Copy 6-Digit PIN'}
                    </button>

                    {/* QR Code for fast PDA Camera scanning */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs mb-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${encodeURIComponent(
                          window.location.origin + window.location.pathname + '?transfer=' + activeTransfer.code
                        )}`}
                        alt="Data Collector QR Code"
                        className="w-32 h-32 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Scan with PDA Camera or Barcode Reader
                    </span>
                  </div>

                  {/* Right Column: File Details & Direct Download Action */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs text-slate-500 font-medium">File Name:</span>
                        <span className="text-xs sm:text-sm font-bold font-mono text-slate-800">{activeTransfer.filename}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Point Count:</span>
                        <span className="text-xs sm:text-sm font-bold font-mono text-emerald-700">{activeTransfer.pointCount} Survey Points</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs text-slate-500 font-medium">File Size:</span>
                        <span className="text-xs sm:text-sm font-mono text-slate-600">{(activeTransfer.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Auto-Delete Timer:</span>
                        <span className="text-xs font-semibold text-purple-700 font-mono">1 Hour (Self-Purging)</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadTransferredCsv}
                        className="w-full min-h-[50px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-3 px-5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base cursor-pointer"
                      >
                        <Download weight="bold" size={20} />
                        <span>Download CSV to Data Collector</span>
                      </button>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(activeTransfer.content, setCopiedCsv)}
                          className="flex-1 min-h-[42px] bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer shadow-2xs"
                        >
                          {copiedCsv ? <CheckCircle className="text-emerald-600" weight="fill" size={16} /> : <Copy size={16} />}
                          {copiedCsv ? 'Copied CSV!' : 'Copy Raw CSV Text'}
                        </button>
                        <button
                          type="button"
                          onClick={handlePurgeTransfer}
                          className="flex-1 min-h-[42px] bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 border border-red-200 font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer shadow-2xs"
                          title="Purge immediately from the hub without waiting for the 1-hour timer"
                        >
                          <Trash weight="bold" size={16} />
                          <span>Delete & Clear Hub Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2D Cadastral Geometry Preview for Staged Points */}
                {transferPoints.length > 0 && (
                  <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-900/95 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Eye size={18} className="text-purple-400" />
                        <h4 className="font-bold text-xs sm:text-sm text-slate-200">
                          2D Cadastral Geometry Preview ({transferPoints.length} Points)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Verify parcel before field stakeout
                      </span>
                    </div>
                    <ShapePlotViewer points={transferPoints} />
                  </div>
                )}
              </div>
            )}

            {/* Mode 1: Upload / Stage from Phone */}
            {transferTabSubView === 'upload' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs">
                      +
                    </span>
                    <h2 className="text-base font-bold text-slate-800">
                      Upload CSV from Phone or Computer
                    </h2>
                  </div>
                  <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 font-semibold px-2.5 py-1 rounded-full">
                    60-Minute Auto-Purge
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Native Mobile File Upload Card */}
                  <MobileFileUploadCard
                    onFileSelected={(file) => {
                      handleFileUpload(file, setTransferInput, setTransferFileName, (text) => {
                        const parsed = parseAutoCadOrCsv(text);
                        setTransferPoints(parsed);
                      });
                    }}
                    fileName={transferFileName}
                    onClear={() => {
                      setTransferFileName('');
                      setTransferInput('');
                      setTransferPoints([]);
                    }}
                    accept=".csv,.txt,.log,.dat"
                  />

                  {/* Manual Paste Textarea */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      Or Paste CSV Coordinates Directly:
                    </label>
                    <textarea
                      className="w-full min-h-[160px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-xs leading-relaxed resize-none text-slate-800 placeholder-slate-400 bg-white"
                      placeholder={`PointID, Easting, Northing, Elevation, Code\nPillar1, 542100.500, 715400.200, 45.200, BND\nPillar2, 542150.800, 715400.200, 45.300, BND\nPillar3, 542150.800, 715460.500, 45.100, BND\nPillar4, 542100.500, 715460.500, 45.000, BND`}
                      value={transferInput}
                      onChange={(e) => {
                        setTransferInput(e.target.value);
                        const parsed = parseAutoCadOrCsv(e.target.value);
                        setTransferPoints(parsed);
                      }}
                    />
                  </div>

                  {/* Job/Site Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">
                        Job / Site Name (Optional):
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. Mowe_Ofada_Boundary"
                        value={transferJobName}
                        onChange={(e) => setTransferJobName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">
                        File Retention / Auto-Delete:
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-100 text-slate-600 font-mono cursor-not-allowed"
                        value="1 Hour (60 Minutes) — Automatic Self-Destruct"
                      />
                    </div>
                  </div>

                  {/* Stage Button */}
                  <button
                    type="button"
                    onClick={() => handleCreateFieldTransfer()}
                    disabled={isStagingLoading || !transferInput.trim()}
                    className={`w-full min-h-[48px] font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm cursor-pointer ${
                      !transferInput.trim()
                        ? 'bg-purple-300 text-white cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white'
                    }`}
                  >
                    {isStagingLoading ? (
                      <span>Staging File to Hub...</span>
                    ) : (
                      <>
                        <Broadcast weight="bold" size={18} />
                        <span>Stage for Data Collector (1-Hour Auto-Delete)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Receive on PDA (Enter PIN) */}
            {transferTabSubView === 'receive' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs">
                      PIN
                    </span>
                    <h2 className="text-base font-bold text-slate-800">
                      Receive Staged File on Data Collector
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    Enter the 6-Digit PIN from your phone
                  </span>
                </div>

                <div className="p-6 sm:p-8 max-w-lg mx-auto text-center space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Type the 6-digit PIN displayed on your smartphone screen to download the coordinates directly into this Data Collector.
                  </p>

                  <div className="max-w-xs mx-auto">
                    <input
                      type="text"
                      maxLength={7}
                      value={lookupPin}
                      onChange={(e) => setLookupPin(e.target.value.toUpperCase())}
                      placeholder="e.g. 749-210"
                      className="w-full text-center tracking-widest font-mono text-2xl sm:text-3xl font-black p-3.5 border-2 border-purple-300 focus:border-purple-600 rounded-2xl focus:ring-4 focus:ring-purple-100 uppercase"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLookupTransferByPin()}
                    disabled={isFetchingPin || !lookupPin.trim()}
                    className={`w-full max-w-xs mx-auto min-h-[46px] font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer shadow-sm ${
                      !lookupPin.trim()
                        ? 'bg-purple-300 text-white cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white'
                    }`}
                  >
                    {isFetchingPin ? 'Searching Hub...' : 'Retrieve Staged Survey CSV'}
                  </button>
                </div>
              </div>
            )}
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
