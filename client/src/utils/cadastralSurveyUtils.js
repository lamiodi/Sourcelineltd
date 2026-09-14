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

// Auto-detect coordinate inversion (X/Y or Lat/Long swap)
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
  const isUtmRange = (avgE > 100000 || avgN > 100000);
  if (isUtmRange) {
    if (avgE > 650000 && avgN < 620000) {
      const diff = avgE - avgN;
      return {
        isInvertedSuspected: true,
        reason: `Values in the Easting column exceed Northing by ${diff.toFixed(0)}m. In Nigerian UTM Zone 31N (Lagos/Ogun/Oyo), true Northing is ~700,000–900,000m and Easting is ~500,000–650,000m. Your columns match a Total Station (Point, Northing, Easting) export.`,
        zone: 'Nigerian UTM Zone 31N (Lagos / South-West)',
        diffMeters: diff,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.95,
        isVerifiedValid: false
      };
    }
    if (avgE > avgN && (avgE - avgN > 40000)) {
      const diff = avgE - avgN;
      return {
        isInvertedSuspected: true,
        reason: `Values in the Easting column exceed Northing by ${diff.toFixed(0)}m. Cadastral records in this zone typically have Northing > Easting. Click below to invert columns across all points and update the 2D plot.`,
        zone: 'Projected Survey Grid (Northing > Easting expected)',
        diffMeters: diff,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.85,
        isVerifiedValid: false
      };
    }
    // Verified valid UTM coordinates: Northing > Easting
    if (avgN > avgE && (avgN - avgE > 40000)) {
      return {
        isInvertedSuspected: false,
        reason: `Verified coordinate alignment: Easting (X: ~${avgE.toFixed(0)}m), Northing (Y: ~${avgN.toFixed(0)}m). Northing > Easting matches statutory cadastral records.`,
        zone: avgN > 650000 && avgE < 650000 ? 'Nigerian UTM Zone 31N (Verified)' : 'Projected Survey Grid (Verified)',
        diffMeters: avgN - avgE,
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.95,
        isVerifiedValid: true
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
        zone: 'Geographic (WGS84 Degrees)',
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.9,
        isVerifiedValid: false
      };
    }
    if (avgE >= 2 && avgE <= 15 && avgN >= 4 && avgN <= 14) {
      return {
        isInvertedSuspected: false,
        reason: `Verified geographic coordinates: Longitude (${avgE.toFixed(4)}°E), Latitude (${avgN.toFixed(4)}°N).`,
        zone: 'Geographic WGS84 (Verified Long/Lat)',
        avgEasting: avgE,
        avgNorthing: avgN,
        confidence: 0.95,
        isVerifiedValid: true
      };
    }
  }

  return {
    isInvertedSuspected: false,
    reason: '',
    zone: 'Custom / Local Coordinate System',
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
