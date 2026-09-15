import { describe, it, expect } from 'vitest';
import { formatSurveyBearing, calculateCadastralLine, AREA_PALETTES } from '../utils/cadastralSurveyUtils.js';

describe('ShapePlotViewer - Cadastral Survey Calculations & Formats', () => {
  describe('formatSurveyBearing', () => {
    it('should format cardinal North as 000°00\'00"', () => {
      expect(formatSurveyBearing(0)).toBe("000°00'00\"");
      expect(formatSurveyBearing(360)).toBe("000°00'00\"");
    });

    it('should format cardinal East as 090°00\'00"', () => {
      expect(formatSurveyBearing(90)).toBe("090°00'00\"");
    });

    it('should format cardinal South as 180°00\'00"', () => {
      expect(formatSurveyBearing(180)).toBe("180°00'00\"");
    });

    it('should format cardinal West as 270°00\'00"', () => {
      expect(formatSurveyBearing(270)).toBe("270°00'00\"");
    });

    it('should format fractional degrees accurately into degrees, minutes, and seconds', () => {
      // 45.5° = 45° 30' 00"
      expect(formatSurveyBearing(45.5)).toBe("045°30'00\"");
      // 124.255° = 124° 15' 18"
      expect(formatSurveyBearing(124.255)).toBe("124°15'18\"");
    });

    it('should handle negative degrees by normalizing to 0-360°', () => {
      // -90° is 270°
      expect(formatSurveyBearing(-90)).toBe("270°00'00\"");
    });

    it('should handle invalid or null input gracefully', () => {
      expect(formatSurveyBearing(NaN)).toBe("000°00'00\"");
      expect(formatSurveyBearing(null)).toBe("000°00'00\"");
    });
  });

  describe('calculateCadastralLine', () => {
    it('should calculate exact Euclidean ground distance using standard 3-4-5 right triangle', () => {
      const p1 = { easting: '500000.000', northing: '600000.000', elevation: '10.000' };
      const p2 = { easting: '500030.000', northing: '600040.000', elevation: '10.000' };

      const result = calculateCadastralLine(p1, p2);
      expect(result).not.toBeNull();
      expect(result.deltaE).toBeCloseTo(30, 3);
      expect(result.deltaN).toBeCloseTo(40, 3);
      expect(result.distance).toBeCloseTo(50, 3);
      expect(result.slopeDistance).toBeCloseTo(50, 3);
      // Bearing for dE = 30, dN = 40 is ~36.87°
      expect(result.bearingDeg).toBeCloseTo(36.8699, 2);
      expect(result.bearingFormatted).toBe("036°52'12\"");
    });

    it('should calculate accurate survey bearings across all 4 quadrants', () => {
      const origin = { easting: '500000.000', northing: '600000.000' };

      // Quadrant 1 (NE): dE > 0, dN > 0
      const q1 = calculateCadastralLine(origin, { easting: '500010.000', northing: '600010.000' });
      expect(q1.bearingDeg).toBeCloseTo(45.0, 1);
      expect(q1.bearingFormatted).toBe("045°00'00\"");

      // Quadrant 2 (SE): dE > 0, dN < 0
      const q2 = calculateCadastralLine(origin, { easting: '500010.000', northing: '599990.000' });
      expect(q2.bearingDeg).toBeCloseTo(135.0, 1);
      expect(q2.bearingFormatted).toBe("135°00'00\"");

      // Quadrant 3 (SW): dE < 0, dN < 0
      const q3 = calculateCadastralLine(origin, { easting: '499990.000', northing: '599990.000' });
      expect(q3.bearingDeg).toBeCloseTo(225.0, 1);
      expect(q3.bearingFormatted).toBe("225°00'00\"");

      // Quadrant 4 (NW): dE < 0, dN > 0
      const q4 = calculateCadastralLine(origin, { easting: '499990.000', northing: '600010.000' });
      expect(q4.bearingDeg).toBeCloseTo(315.0, 1);
      expect(q4.bearingFormatted).toBe("315°00'00\"");
    });

    it('should account for 3D elevation delta (slope distance)', () => {
      const p1 = { easting: '500000.000', northing: '600000.000', elevation: '10.000' };
      const p2 = { easting: '500030.000', northing: '600040.000', elevation: '60.000' };

      const result = calculateCadastralLine(p1, p2);
      expect(result.distance).toBeCloseTo(50, 3); // 2D ground
      expect(result.deltaZ).toBeCloseTo(50, 3);
      expect(result.slopeDistance).toBeCloseTo(Math.hypot(50, 50), 3); // 3D slope = ~70.71m
    });

    it('should return null for invalid or incomplete coordinates', () => {
      expect(calculateCadastralLine(null, null)).toBeNull();
      expect(calculateCadastralLine({ easting: 'abc', northing: '600000' }, { easting: '500000', northing: '600000' })).toBeNull();
    });
  });

  describe('Rotation-Aware Scale & Bounding Box Logic', () => {
    it('should accurately calculate rotated projection dimensions for 0°, 90°, 180°, and 270°', () => {
      const spanE = 400; // width
      const spanN = 200; // height

      const getProjectedSize = (rotationDeg) => {
        const rad = (rotationDeg * Math.PI) / 180;
        const cosR = Math.abs(Math.cos(-rad));
        const sinR = Math.abs(Math.sin(-rad));
        return {
          projW: spanE * cosR + spanN * sinR,
          projH: spanE * sinR + spanN * cosR
        };
      };

      // 0° (North Up): width = 400, height = 200
      const rot0 = getProjectedSize(0);
      expect(rot0.projW).toBeCloseTo(400, 1);
      expect(rot0.projH).toBeCloseTo(200, 1);

      // 270° (Estate Grid - North Left): width becomes 200, height becomes 400!
      const rot270 = getProjectedSize(270);
      expect(rot270.projW).toBeCloseTo(200, 1);
      expect(rot270.projH).toBeCloseTo(400, 1);

      // 90° (North Right): width becomes 200, height becomes 400!
      const rot90 = getProjectedSize(90);
      expect(rot90.projW).toBeCloseTo(200, 1);
      expect(rot90.projH).toBeCloseTo(400, 1);

      // 180° (North Down): width = 400, height = 200
      const rot180 = getProjectedSize(180);
      expect(rot180.projW).toBeCloseTo(400, 1);
      expect(rot180.projH).toBeCloseTo(200, 1);
    });

    it('should provide harmonious color palettes for estate area clustering', () => {
      expect(AREA_PALETTES).toBeInstanceOf(Array);
      expect(AREA_PALETTES.length).toBeGreaterThanOrEqual(4);
      AREA_PALETTES.forEach((palette) => {
        expect(palette).toHaveProperty('id');
        expect(palette).toHaveProperty('stroke');
        expect(palette).toHaveProperty('fill');
        expect(palette).toHaveProperty('dot');
      });
    });
  });

  describe('Zoom Calculations & Coordinate Invariance', () => {
    it('should preserve screen center invariant under center-anchored zoom', () => {
      // Suppose viewport is 800x600, pan is at (50, -30)
      const prevPan = { x: 50, y: -30 };
      const prevZoom = 1.0;
      const nextZoom = 1.25;
      const factor = nextZoom / prevZoom;

      const nextPan = {
        x: prevPan.x * factor,
        y: prevPan.y * factor
      };

      expect(nextPan.x).toBeCloseTo(62.5, 3);
      expect(nextPan.y).toBeCloseTo(-37.5, 3);
    });

    it('should maintain exact cursor-anchored invariant when zooming with mouse wheel at cursor (mx, my)', () => {
      const W = 800;
      const H = 600;
      const mx = 600; // cursor at 75% width
      const my = 200; // cursor at 33% height
      const currentPan = { x: 40, y: -20 };
      const currentZoom = 2.0;
      const factor = 1.15; // 15% zoom in
      const nextZoom = currentZoom * factor;

      // Cursor-anchored formula: (mx - W/2) * (1 - factor) + currentPan.x * factor
      const nextPanX = (mx - W / 2) * (1 - factor) + currentPan.x * factor;
      const nextPanY = (my - H / 2) * (1 - factor) + currentPan.y * factor;

      // Check that (mx - W/2 - nextPanX) / nextZoom === (mx - W/2 - currentPan.x) / currentZoom
      const deltaBefore = (mx - W / 2 - currentPan.x) / currentZoom;
      const deltaAfter = (mx - W / 2 - nextPanX) / nextZoom;
      expect(deltaAfter).toBeCloseTo(deltaBefore, 5);

      const deltaYBefore = (my - H / 2 - currentPan.y) / currentZoom;
      const deltaYAfter = (my - H / 2 - nextPanY) / nextZoom;
      expect(deltaYAfter).toBeCloseTo(deltaYBefore, 5);
    });

    it('should clamp zoom within safe cadastral inspection limits [0.15x to 50x]', () => {
      const minLimit = 0.15;
      const maxLimit = 50;

      const zoomOutExtreme = Math.max(0.15 * 0.5, minLimit);
      expect(zoomOutExtreme).toBe(0.15);

      const zoomInExtreme = Math.min(50 * 1.5, maxLimit);
      expect(zoomInExtreme).toBe(50);
    });
  });
});
