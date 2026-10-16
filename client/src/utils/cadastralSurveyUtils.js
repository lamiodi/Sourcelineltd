/**
 * Cadastral & Survey Mathematical Utility Engine
 * Provides pure coordinate transforms, bearing calculations, inversion detection,
 * duplicate beacon detection, and DXF CAD generation.
 */

// Standard Cadastral Area & Polygon Color Palettes
export const AREA_PALETTES = [
  { id: 'cyan', stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.18)', dot: '#38bdf8', halo: 'rgba(56, 189, 248, 0.35)', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', labelBg: 'rgba(8, 47, 73, 0.92)' },
  { id: 'amber', stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.18)', dot: '#fbbf24', halo: 'rgba(245, 158, 11, 0.35)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', labelBg: 'rgba(69, 26, 3, 0.92)' },
  { id: 'emerald', stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.18)', dot: '#34d399', halo: 'rgba(16, 185, 129, 0.35)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', labelBg: 'rgba(6, 78, 59, 0.92)' },
  { id: 'purple', stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.18)', dot: '#c084fc', halo: 'rgba(168, 85, 247, 0.35)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', labelBg: 'rgba(59, 7, 100, 0.92)' },
  { id: 'rose', stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.18)', dot: '#fb7185', halo: 'rgba(244, 63, 94, 0.35)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', labelBg: 'rgba(76, 5, 25, 0.92)' },
  { id: 'teal', stroke: '#14b8a6', fill: 'rgba(20, 184, 166, 0.18)', dot: '#2dd4bf', halo: 'rgba(20, 184, 166, 0.35)', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40', labelBg: 'rgba(4, 47, 46, 0.92)' },
];

// Format decimal degrees into standard Nigerian cadastral survey bearing: DDD°MM'SS"
export const formatSurveyBearing = (degrees) => {
  if (isNaN(degrees) || degrees === null) return "000°00'00\"";
  const norm = ((degrees % 360) + 360) % 360;
  const d = Math.floor(norm);
  const minFloat = (norm - d) * 60;
  let m = Math.floor(minFloat);
  let s = Math.round((minFloat - m) * 60);

  if (s === 60) {
    s = 0;
    m += 1;
  }
  let deg = d;
  if (m === 60) {
    m = 0;
    deg = (deg + 1) % 360;
  }

  const pad = (v) => String(v).padStart(2, '0');
  return `${String(deg).padStart(3, '0')}°${pad(m)}'${pad(s)}"`;
};

// Calculate cadastral 2D ground line, distance, bearing, and coordinate diffs
export const calculateCadastralLine = (p1, p2) => {
  if (!p1 || !p2) return null;
  const e1 = parseFloat(p1.easting);
  const n1 = parseFloat(p1.northing);
  const e2 = parseFloat(p2.easting);
  const n2 = parseFloat(p2.northing);
  if (isNaN(e1) || isNaN(n1) || isNaN(e2) || isNaN(n2)) return null;

  const dE = e2 - e1;
  const dN = n2 - n1;
  const dist = Math.hypot(dE, dN);
  const rawBearing = ((Math.atan2(dE, dN) * 180) / Math.PI + 360) % 360;

  const z1 = parseFloat(p1.elevation);
  const z2 = parseFloat(p2.elevation);
  const hasZ = !isNaN(z1) && !isNaN(z2);
  const dZ = hasZ ? z2 - z1 : 0;
  const slopeDist = hasZ ? Math.hypot(dist, dZ) : dist;

  return {
    deltaE: dE,
    deltaN: dN,
    deltaZ: dZ,
    distance: dist,
    slopeDistance: slopeDist,
    bearingDeg: rawBearing,
    bearingFormatted: formatSurveyBearing(rawBearing)
  };
};

// Auto-detect duplicate coordinates within survey tolerance (SURCON 5mm default)
export const detectDuplicateCoordinates = (points, tolerance = 0.005) => {
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
// GEODETIC DATUM TRANSFORMATION ENGINE (MINNA <-> WGS84)
// ============================================================================
// Nigerian Minna Datum (Clarke 1880 modified): a = 6,378,249.145 m, 1/f = 293.465
// WGS84: a = 6,378,137.0 m, 1/f = 298.257223563
// Geocentric translation (EPSG:1358 Minna -> WGS84, 3-parameter):
// dX = -92 m, dY = -93 m, dZ = +122 m (negated for the inverse direction)
export const MINNA_A = 6378249.145;
export const MINNA_F = 1 / 293.465;
export const WGS84_A = 6378137.0;
export const WGS84_F = 1 / 298.257223563;
export const MINNA_WGS84_SHIFT = { dx: -92, dy: -93, dz: 122 };

export function utmToLatLon(easting, northing, zone = 31, a = WGS84_A, f = WGS84_F) {
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

export function latLonToUtm(lat, lon, zone = 31, a = WGS84_A, f = WGS84_F) {
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

// Geodetic (lat/lon/height) -> geocentric Earth-Centred Earth-Fixed (ECEF)
function geodeticToEcef(latDeg, lonDeg, h, a, f) {
  const e2 = 2 * f - f * f;
  const phi = (latDeg * Math.PI) / 180;
  const lam = (lonDeg * Math.PI) / 180;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const n = a / Math.sqrt(1 - e2 * sinPhi * sinPhi);

  return {
    x: (n + h) * cosPhi * Math.cos(lam),
    y: (n + h) * cosPhi * Math.sin(lam),
    z: (n * (1 - e2) + h) * sinPhi
  };
}

// ECEF -> geodetic using Bowring's closed-form method (sub-millimetre accuracy)
function ecefToGeodetic(x, y, z, a, f) {
  const e2 = 2 * f - f * f;
  const b = a * (1 - f);
  const ep2 = (a * a - b * b) / (b * b);
  const p = Math.hypot(x, y);
  const lon = Math.atan2(y, x);

  const theta = Math.atan2(a * z, p * b);
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const lat = Math.atan2(
    z + ep2 * b * sinTheta * sinTheta * sinTheta,
    p - e2 * a * cosTheta * cosTheta * cosTheta
  );

  const sinLat = Math.sin(lat);
  const n = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const height = p / Math.cos(lat) - n;

  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
    height
  };
}

// Minna Datum UTM (Clarke 1880) -> WGS84 Lat/Lon via exact geocentric 3-parameter
// transformation (EPSG:1358). Height assumed 0 m since survey exports carry no
// ellipsoidal height; the error from this is well under a metre in Nigeria.
export function minnaUtmToWgs84(easting, northing, zone = 31) {
  const minnaGeo = utmToLatLon(easting, northing, zone, MINNA_A, MINNA_F);
  const ecef = geodeticToEcef(minnaGeo.lat, minnaGeo.lon, 0, MINNA_A, MINNA_F);
  const shifted = ecefToGeodetic(
    ecef.x + MINNA_WGS84_SHIFT.dx,
    ecef.y + MINNA_WGS84_SHIFT.dy,
    ecef.z + MINNA_WGS84_SHIFT.dz,
    WGS84_A,
    WGS84_F
  );
  return { lat: shifted.lat, lon: shifted.lon };
}

// WGS84 Lat/Lon -> Minna Datum UTM (inverse of the above, shift signs negated)
export function wgs84ToMinnaUtm(lat, lon, zone = 31) {
  const ecef = geodeticToEcef(lat, lon, 0, WGS84_A, WGS84_F);
  const minnaGeo = ecefToGeodetic(
    ecef.x - MINNA_WGS84_SHIFT.dx,
    ecef.y - MINNA_WGS84_SHIFT.dy,
    ecef.z - MINNA_WGS84_SHIFT.dz,
    MINNA_A,
    MINNA_F
  );
  return latLonToUtm(minnaGeo.lat, minnaGeo.lon, zone, MINNA_A, MINNA_F);
}

// ============================================================================
// COORDINATE INVERSION DETECTION (X/Y or Lat/Lon swap)
// ============================================================================
// Valid magnitude windows for Nigerian projected survey coordinates. UTM zones
// 31N/32N (and the Minna Traverse Mercator belts, which share the 500,000 m
// false easting) mathematically confine Easting to ~166,021–833,979 m in any
// zone; a small tolerance is applied. Mainland Nigeria spans ~3.6°–14.4°N,
// i.e. Northing ~400,000–1,600,000 m. Easting is NOT required to be smaller
// than Northing — in eastern Zone 31N and much of Zone 32N a statutory Easting
// legitimately exceeds the Northing — so inversion is only reported when the
// current column mapping is impossible as projected coordinates AND the
// swapped mapping is valid.
const UTM_E_MIN = 150000;
const UTM_E_MAX = 850000;
const UTM_N_MIN = 400000;
const UTM_N_MAX = 1600000;

const isPlausibleEasting = (v) => v >= UTM_E_MIN && v <= UTM_E_MAX;
const isPlausibleNorthing = (v) => v >= UTM_N_MIN && v <= UTM_N_MAX;

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

  // Case 1: Geographic coordinates (Lat/Lon in decimal degrees)
  // Nigeria: Latitude ~4°N–14°N, Longitude ~2.7°E–14.7°E. Only flagged when the
  // swapped reading is unambiguous (values that fit both bands are left alone).
  if (Math.abs(avgE) <= 180 && Math.abs(avgN) <= 180) {
    const xInLatBand = avgE >= 4 && avgE <= 14;
    const yInLonBand = avgN >= 2 && avgN <= 15;
    const xInLonBand = avgE >= 2 && avgE <= 15;
    const yInLatBand = avgN >= 4 && avgN <= 14;

    if (xInLatBand && yInLonBand && !(xInLonBand && yInLatBand)) {
      return {
        isInvertedSuspected: true,
        reason: `Column 1 (${avgE.toFixed(4)}°) resembles Nigeria's Latitude band (4–14°N) and Column 2 (${avgN.toFixed(4)}°) the Longitude band (2–15°E). Standard GIS order is Longitude (X) first, Latitude (Y) second.`,
        zone: 'Geographic (WGS84 Degrees)',
        diffMeters: avgE - avgN,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.9,
        isVerifiedValid: false
      };
    }
    if (xInLonBand && yInLatBand && !(xInLatBand && yInLonBand)) {
      return {
        isInvertedSuspected: false,
        reason: `Verified geographic coordinates: Longitude (${avgE.toFixed(4)}°E), Latitude (${avgN.toFixed(4)}°N).`,
        zone: 'Geographic WGS84 (Verified Long/Lat)',
        diffMeters: avgE - avgN,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.95,
        isVerifiedValid: true
      };
    }
  }

  // Case 2: Projected / UTM-scale coordinates. Judge ONLY by geometric
  // plausibility of the magnitude windows — never by "Easting vs Northing"
  // ordering, which varies legitimately across Nigeria.
  const isUtmRange = avgE > 100000 || avgN > 100000;
  if (isUtmRange) {
    const currentPlausible = isPlausibleEasting(avgE) && isPlausibleNorthing(avgN);
    const swappedPlausible = isPlausibleEasting(avgN) && isPlausibleNorthing(avgE);

    if (!currentPlausible && swappedPlausible) {
      return {
        isInvertedSuspected: true,
        reason: `Easting column averages ${avgE.toFixed(0)}m, which cannot be a valid UTM/Minna Easting (must fall between ${UTM_E_MIN.toLocaleString()}m and ${UTM_E_MAX.toLocaleString()}m), while the swapped reading (Easting ~${avgN.toFixed(0)}m, Northing ~${avgE.toFixed(0)}m) is fully valid. Files that list Northing before Easting — common in Total Station P,N,E exports — produce exactly this pattern.`,
        zone: 'Nigerian UTM / Minna Belt Grid',
        diffMeters: avgE - avgN,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.9,
        isVerifiedValid: false
      };
    }

    if (currentPlausible && !swappedPlausible) {
      return {
        isInvertedSuspected: false,
        reason: `Easting (X ~${avgE.toFixed(0)}m) and Northing (Y ~${avgN.toFixed(0)}m) both fall within valid Nigerian survey grid ranges; the swapped order would place an invalid value in one column.`,
        zone: 'Nigerian UTM / Minna Belt Grid (Verified)',
        diffMeters: avgN - avgE,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.95,
        isVerifiedValid: true
      };
    }
  }

  // Both readings plausible (order genuinely ambiguous) or a local/site grid:
  // no automatic verdict — the manual Swap X ⇄ Y control remains available.
  return {
    isInvertedSuspected: false,
    reason: '',
    zone: 'Projected Survey Grid / Local Grid (order not assessed)',
    diffMeters: Math.abs(avgE - avgN),
    avgEasting: avgE,
    avgNorthing: avgN,
    confidence: 0,
    isVerifiedValid: false
  };
};

// Swap Easting and Northing coordinates across an array of survey points
export const swapPointCoordinates = (points) => {
  if (!points || points.length === 0) return [];
  return points.map((pt) => ({
    ...pt,
    easting: pt.northing,
    northing: pt.easting
  }));
};

// Generate standard AutoCAD DXF R12 / ASCII format with points, labels, and closed boundary
export function generateDxfFile(points, options = { closeLoop: true, textHeight: 2.5 }) {
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
