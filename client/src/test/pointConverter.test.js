import { describe, it, expect } from 'vitest';
import {
  detectCoordinateInversion,
  swapPointCoordinates,
  utmToLatLon,
  latLonToUtm,
  minnaUtmToWgs84,
  wgs84ToMinnaUtm,
  MINNA_A,
  MINNA_F,
  WGS84_A,
  WGS84_F
} from '../utils/cadastralSurveyUtils.js';

const METRES_PER_DEG_LAT = 110574;

const latLonDistM = (a, b) =>
  Math.hypot(
    (a.lat - b.lat) * METRES_PER_DEG_LAT,
    (a.lon - b.lon) * METRES_PER_DEG_LAT * Math.cos((a.lat * Math.PI) / 180)
  );

describe('PointConverter - Coordinate Inversion & Swap Engine', () => {
  it('should treat normal Lagos/Ogun UTM coordinates (E < N) as not inverted', () => {
    const normalPoints = [
      { id: 'P1', easting: '547651.161', northing: '762636.060', elevation: '65.543' },
      { id: 'P2', easting: '547443.525', northing: '762486.991', elevation: '62.398' },
      { id: 'P3', easting: '547764.076', northing: '762517.073', elevation: '63.988' }
    ];

    const result = detectCoordinateInversion(normalPoints);
    expect(result.isInvertedSuspected).toBe(false);
  });

  it('must NOT flag valid data where Easting exceeds Northing (estate grid / eastern Zone 31N convention)', () => {
    // Real site convention (MOWE OFADA / 2G exports): first coordinate column
    // 712k-762k, second 547k-564k. Both readings are plausible UTM magnitudes,
    // so the converter must keep quiet and leave the choice to the manual swap.
    const eastingGreaterThanNorthing = [
      { id: 'P1', easting: '762636.060', northing: '547651.161', elevation: '65.543' },
      { id: 'P2', easting: '762486.991', northing: '547443.525', elevation: '62.398' },
      { id: 'P3', easting: '762517.073', northing: '547764.076', elevation: '63.988' }
    ];
    expect(detectCoordinateInversion(eastingGreaterThanNorthing).isInvertedSuspected).toBe(false);

    const gridData = [
      { id: 'TOSET1', easting: '712383.745', northing: '564669.792', elevation: '16.984' },
      { id: 'TOSET2', easting: '712387.227', northing: '564669.735', elevation: '16.984' },
      { id: 'TOSET3', easting: '712391.276', northing: '564669.668', elevation: '16.984' }
    ];
    const gridResult = detectCoordinateInversion(gridData);
    expect(gridResult.isInvertedSuspected).toBe(false);
    expect(gridResult.isVerifiedValid).toBe(false); // ambiguous, not asserted either way
  });

  it('should detect genuine inversion when Easting exceeds the UTM zone limit (northern Nigeria N,E export)', () => {
    // Kaduna-area site: true Northing ~1,161,000m cannot be a UTM Easting
    // (max ~834,000m); the swapped reading (E ~345k, N ~1,161k) is valid.
    const invertedPoints = [
      { id: 'P1', easting: '1161023.447', northing: '345552.183', elevation: '640.000' },
      { id: 'P2', easting: '1160998.201', northing: '345497.902', elevation: '641.500' },
      { id: 'P3', easting: '1161041.776', northing: '345581.441', elevation: '639.200' }
    ];

    const result = detectCoordinateInversion(invertedPoints);
    expect(result.isInvertedSuspected).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.reason).toContain('Easting');
  });

  it('should verify unambiguous correct mapping when the swapped order would be invalid', () => {
    // E ~547k is a valid Easting; as a Northing-replacement it would put
    // 1,200,000m into the Easting column which is impossible -> verified.
    const verifiedPoints = [
      { id: 'P1', easting: '547651.161', northing: '1200450.320', elevation: '640.000' },
      { id: 'P2', easting: '547704.884', northing: '1200398.117', elevation: '641.500' }
    ];

    const result = detectCoordinateInversion(verifiedPoints);
    expect(result.isInvertedSuspected).toBe(false);
    expect(result.isVerifiedValid).toBe(true);
  });

  it('should leave small local/AutoCAD site coordinates completely alone', () => {
    const localPoints = [
      { id: 'TOSET1', easting: '905.406', northing: '1219.580', elevation: '0.000' },
      { id: 'TOSET2', easting: '855.991', northing: '1282.493', elevation: '0.000' }
    ];
    const result = detectCoordinateInversion(localPoints);
    expect(result.isInvertedSuspected).toBe(false);
    expect(result.isVerifiedValid).toBe(false);
  });

  it('should detect inverted geographic coordinates (Latitude in Easting/X column)', () => {
    // Col 1 is Latitude (~6.45°N), Col 2 is Longitude (~3.39°E) -> inverted GIS order
    const invertedGeoPoints = [
      { id: 'P1', easting: '6.4524', northing: '3.3912', elevation: '10.0' },
      { id: 'P2', easting: '6.4518', northing: '3.3921', elevation: '11.0' }
    ];

    const result = detectCoordinateInversion(invertedGeoPoints);
    expect(result.isInvertedSuspected).toBe(true);
    expect(result.reason).toContain('Latitude');
  });

  it('should not flag ambiguous geographic pairs that fit both bands', () => {
    // X=6.5, Y=6.8 could be (lon, lat) in Kogi state or (lat, lon) elsewhere
    const ambiguousPoints = [
      { id: 'P1', easting: '6.5000', northing: '6.8000', elevation: '10.0' },
      { id: 'P2', easting: '6.5100', northing: '6.8100', elevation: '11.0' }
    ];
    expect(detectCoordinateInversion(ambiguousPoints).isInvertedSuspected).toBe(false);
  });

  it('should accurately swap Easting and Northing values while preserving metadata', () => {
    const points = [
      { id: 'BM1', name: 'BM1', code: 'BENCHMARK', easting: '762636.060', northing: '547651.161', elevation: '65.543' },
      { id: 'BM2', name: 'BM2', code: 'BOUNDARY', easting: '762486.991', northing: '547443.525', elevation: '62.398' }
    ];

    const swapped = swapPointCoordinates(points);
    expect(swapped).toHaveLength(2);
    expect(swapped[0].easting).toBe('547651.161');
    expect(swapped[0].northing).toBe('762636.060');
    expect(swapped[0].id).toBe('BM1');
    expect(swapped[0].code).toBe('BENCHMARK');
    expect(swapped[0].elevation).toBe('65.543');

    // Swapped points remain plausible survey coordinates (no nag either way)
    const reCheck = detectCoordinateInversion(swapped);
    expect(reCheck.isInvertedSuspected).toBe(false);
  });

  it('should handle empty or single point arrays safely', () => {
    expect(detectCoordinateInversion([])).toEqual({
      isInvertedSuspected: false,
      reason: '',
      avgEasting: 0,
      avgNorthing: 0,
      confidence: 0
    });
    expect(swapPointCoordinates([])).toEqual([]);
  });
});

describe('PointConverter - Geodetic Datum Engine (Minna <-> WGS84)', () => {
  it('should round-trip UTM <-> Lat/Lon on both ellipsoids to sub-millimetre accuracy', () => {
    const cases = [
      { lat: 6.4524102, lon: 3.3912044, zone: 31 },
      { lat: 9.076479, lon: 7.398574, zone: 32 },
      { lat: 11.85, lon: 13.15, zone: 33 }
    ];
    for (const c of cases) {
      for (const [a, f] of [[WGS84_A, WGS84_F], [MINNA_A, MINNA_F]]) {
        const utm = latLonToUtm(c.lat, c.lon, c.zone, a, f);
        const back = utmToLatLon(utm.easting, utm.northing, c.zone, a, f);
        expect(latLonDistM(back, c)).toBeLessThan(0.001);
      }
    }
  });

  it('should confine generated eastings to valid UTM zone bounds', () => {
    const utm = latLonToUtm(6.4524102, 3.3912044, 31, MINNA_A, MINNA_F);
    expect(utm.easting).toBeGreaterThan(150000);
    expect(utm.easting).toBeLessThan(850000);
    expect(utm.northing).toBeGreaterThan(400000);
    expect(utm.northing).toBeLessThan(1600000);
  });

  it('should round-trip Minna UTM -> WGS84 -> Minna UTM to sub-millimetre accuracy', () => {
    const minnaPts = [
      { e: 762636.06, n: 547651.161, z: 31 },
      { e: 547651.161, n: 762636.06, z: 31 },
      { e: 665320.412, n: 1120478.93, z: 32 }
    ];
    for (const p of minnaPts) {
      const wgs = minnaUtmToWgs84(p.e, p.n, p.z);
      const back = wgs84ToMinnaUtm(wgs.lat, wgs.lon, p.z);
      expect(Math.hypot(back.easting - p.e, back.northing - p.n)).toBeLessThan(0.001);
    }
  });

  it('should apply the EPSG:1358 datum shift with a plausible magnitude (not identity, not wild)', () => {
    // Unshifted Minna projection vs shifted WGS84 result: tens-to-hundreds of
    // metres apart for Nigeria, mostly driven by the -92/-93/+122 geocentric shift.
    const e = 547651.161;
    const n = 762636.06;
    const unshifted = utmToLatLon(e, n, 31, MINNA_A, MINNA_F);
    const shifted = minnaUtmToWgs84(e, n, 31);
    const dist = latLonDistM(unshifted, shifted);
    expect(dist).toBeGreaterThan(10);
    expect(dist).toBeLessThan(1000);

    // Result must land inside Nigeria for a genuine Nigerian coordinate
    expect(shifted.lat).toBeGreaterThan(3.5);
    expect(shifted.lat).toBeLessThan(14.5);
    expect(shifted.lon).toBeGreaterThan(2.5);
    expect(shifted.lon).toBeLessThan(15);
  });

  it('should transform the Mowe/Ofada pillar to the correct geographic location', () => {
    // True UTM reading of the site (E ~547k, N ~762k) sits at approximately
    // 6.90N, 3.43E in Ogun State. Guard against gross datum errors (old
    // implementation drifted > 80 m in latitude).
    const wgs = minnaUtmToWgs84(547651.161, 762636.06, 31);
    expect(Math.abs(wgs.lat - 6.9004)).toBeLessThan(0.002); // ~220 m tolerance
    expect(Math.abs(wgs.lon - 3.4305)).toBeLessThan(0.002);
  });
});
