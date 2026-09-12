// Test forward and inverse rotation math
const width = 800, height = 500;
const pan = { x: 50, y: -30 };
const zoom = 1.5;
const northRotation = 270;
const rotRad = (northRotation * Math.PI) / 180;

// Test point in screen coordinates before rotation:
const ptScr = { x: 350, y: 220 };

// Forward transform (where it ends up on actual canvas pixels):
// 1. translate(-w/2, -h/2)
let fx = ptScr.x - width / 2;
let fy = ptScr.y - height / 2;
// 2. scale(zoom)
fx *= zoom;
fy *= zoom;
// 3. rotate(-rotRad)
const cosNeg = Math.cos(-rotRad);
const sinNeg = Math.sin(-rotRad);
let rfx = fx * cosNeg - fy * sinNeg;
let rfy = fx * sinNeg + fy * cosNeg;
// 4. translate(w/2 + pan.x, h/2 + pan.y)
const actualCanvasX = rfx + (width / 2 + pan.x);
const actualCanvasY = rfy + (height / 2 + pan.y);

console.log('Original Pt:', ptScr);
console.log('Rendered Canvas Pos:', { x: actualCanvasX, y: actualCanvasY });

// Inverse transform from actualCanvasX, actualCanvasY:
// 1. translate relative to center + pan
const dx = actualCanvasX - (width / 2 + pan.x);
const dy = actualCanvasY - (height / 2 + pan.y);
// 2. rotate by +rotRad (opposite of -rotRad)
const cosPos = Math.cos(rotRad);
const sinPos = Math.sin(rotRad);
const rx = dx * cosPos - dy * sinPos;
const ry = dx * sinPos + dy * cosPos;
// 3. unscale
const ux = rx / zoom;
const uy = ry / zoom;
// 4. translate back +w/2, +h/2
const invX = ux + width / 2;
const invY = uy + height / 2;

console.log('Inverted Pt:', { x: invX, y: invY });
const error = Math.hypot(invX - ptScr.x, invY - ptScr.y);
console.log('Inversion Error:', error, error < 1e-6 ? 'SUCCESS!' : 'FAILED');
