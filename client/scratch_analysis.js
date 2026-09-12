const fs = require('fs');

const rawData = `CLEARWATERRD1,CWD,730533.615,601830.295,12
CLEARWATERRD2,CWD,730533.615,601830.295,12
CLEARWATERRD3,CWD,730513.939,601820.376,12
CLEARWATERRD4,CWD,730513.767,601810.557,12
CLEARWATERRD5,CWD,730511.983,601805.61,12
CLEARWATERRD6,CWD,730510.189,601798.58,12
CLEARWATERRD7,CWD,730501.832,601788.888,12
CLEARWATERRD8,CWD,730461.17,601758.015,12
CLEARWATERRD9,CWD,730466.008,601751.644,12
CLEARWATERRD10,CWD,730529.014,601799.482,12
CLEARWATERRD11,CWD,730535.235,601800.817,12
CLEARWATERRD12,CWD,730541.195,601795.009,12
CLEARWATERRD13,CWD,730552.608,601827.969,12
CLEARWATERRD14,CWD,730532.122,601810.645,12
CLEARWATERRD15,CWD,730532.369,601819.587,12
CLEARWATERRD16,CWD,730528.248,601821.226,12
CLEARWATERRD17,CWD,730523.154,601818.396,12
CLEARWATERRD18,CWD,730523.708,601811.303,12
CLEARWATERRD19,CWD,730528.248,601809.226,12
CLEARWATERRD20,CWD,730528.248,601815.226,12
CLEARWATERRD21,CWD,730532.672,601823.424,12
CLEARWATERRD22,CWD,730393.113,601976.259,12
TOSET23,NEARACCESSRD,730372.191,601974.021,12
TOSET24,NEARACCESSRD,730368.764,601981.415,12
TOSET25,NEARACCESSRD,730367.789,601980.963,12
TOSET26,NEARACCESSRD,730363.9,601989.356,12
TOSET27,NEARACCESSRD,730364.875,601989.808,12
TOSET28,NEARACCESSRD,730363.067,601993.71,12
TOSET29,NEARACCESSRD,730362.092,601993.258,12
TOSET30,NEARACCESSRD,730360.515,601996.66,12
TOSET31,NEARACCESSRD,730361.491,601997.112,12
TOSET32,NEARACCESSRD,730357.938,602004.779,12
TOSET33,NEARACCESSRD,730351.383,602001.741,12
TOSET34,NEARACCESSRD,730365.635,601970.983,12
LAGOONLODGE1,LAGLDG,730408.32,601791.943,12
LAGOONLODGE2,LAGLDG,730392.135,601779.463,12
LAGOONLODGE3,LAGLDG,730429.224,601731.365,12
LAGOONLODGE4,LAGLDG,730420.275,601724.465,12
LAGOONLODGE5,LAGLDG,730441.403,601697.065,12
LAGOONLODGE6,LAGLDG,730450.342,601703.957,12
LAGOONLODGE7,LAGLDG,730487.426,601655.865,12
LAGOONLODGE8,LAGLDG,730503.621,601668.352,12
LAGOONLODGE9,LAGLDG,730461.859,601722.511,12
LAGOONLODGE10,LAGLDG,730466.056,601725.747,12
LAGOONLODGE11,LAGLDG,730454.301,601740.991,12
LAGOONLODGE12,LAGLDG,730450.104,601737.755,12`;

const lines = rawData.trim().split('\n');
const points = lines.map((l, idx) => {
  const [name, code, easting, northing, elevation] = l.trim().split(',');
  return {
    id: name,
    code,
    easting: parseFloat(easting),
    northing: parseFloat(northing),
    elevation: parseFloat(elevation),
    rawIndex: idx
  };
});

console.log(`Total points: ${points.length}`);

// Group by code
const groups = {};
points.forEach(p => {
  const c = p.code || 'DEFAULT';
  if (!groups[c]) groups[c] = [];
  groups[c].push(p);
});

console.log("\nGroups detected:");
for (const [code, pts] of Object.entries(groups)) {
  const minE = Math.min(...pts.map(p => p.easting));
  const maxE = Math.max(...pts.map(p => p.easting));
  const minN = Math.min(...pts.map(p => p.northing));
  const maxN = Math.max(...pts.map(p => p.northing));
  console.log(`- ${code} (${pts.length} pts): E[${minE.toFixed(3)} - ${maxE.toFixed(3)}], N[${minN.toFixed(3)} - ${maxN.toFixed(3)}]`);
}

// Check duplicates
console.log("\nDuplicate Coordinate Check:");
for (let i = 0; i < points.length; i++) {
  for (let j = i + 1; j < points.length; j++) {
    const d = Math.hypot(points[i].easting - points[j].easting, points[i].northing - points[j].northing);
    if (d < 0.01) {
      console.log(`- DUPLICATE FOUND: ${points[i].id} and ${points[j].id} at E:${points[i].easting}, N:${points[i].northing} (dist: ${d.toFixed(4)}m)`);
    }
  }
}

// Check distances between consecutive points in groups
console.log("\nConsecutive Distances in Groups:");
for (const [code, pts] of Object.entries(groups)) {
  console.log(`\nGroup ${code}:`);
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i+1].easting - pts[i].easting, pts[i+1].northing - pts[i].northing);
    const dE = pts[i+1].easting - pts[i].easting;
    const dN = pts[i+1].northing - pts[i].northing;
    let brg = (Math.atan2(dE, dN) * 180 / Math.PI + 360) % 360;
    if (d > 50) {
      console.log(`  * LARGE JUMP: ${pts[i].id} -> ${pts[i+1].id}: Dist = ${d.toFixed(2)}m (Bearing: ${brg.toFixed(1)}°)`);
    }
  }
}
