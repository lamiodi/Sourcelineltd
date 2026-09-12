import { describe, it, expect } from 'vitest';
import { detectCoordinateInversion, swapPointCoordinates } from '../pages/PointConverter';

describe('PointConverter - Coordinate Inversion & Swap Engine', () => {
  it('should detect normal Nigerian UTM coordinates as not inverted', () => {
    // Normal: Easting ~547,000m, Northing ~762,000m
    const normalPoints = [
      { id: 'P1', easting: '547651.161', northing: '762636.060', elevation: '65.543' },
      { id: 'P2', easting: '547443.525', northing: '762486.991', elevation: '62.398' },
      { id: 'P3', easting: '547764.076', northing: '762517.073', elevation: '63.988' },
    ];

    const result = detectCoordinateInversion(normalPoints);
    expect(result.isInvertedSuspected).toBe(false);
  });

  it('should detect inverted Nigerian UTM coordinates (Northing in Easting column)', () => {
    // Inverted: Easting column has ~762,000m, Northing column has ~547,000m (N, E export)
    const invertedPoints = [
      { id: 'P1', easting: '762636.060', northing: '547651.161', elevation: '65.543' },
      { id: 'P2', easting: '762486.991', northing: '547443.525', elevation: '62.398' },
      { id: 'P3', easting: '762517.073', northing: '547764.076', elevation: '63.988' },
    ];

    const result = detectCoordinateInversion(invertedPoints);
    expect(result.isInvertedSuspected).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.reason).toContain('Easting');
  });

  it('should detect inverted geographic coordinates (Latitude in Easting/X column)', () => {
    // Col 1 is Latitude (~6.45°), Col 2 is Longitude (~3.39°) -> Inverted GIS order
    const invertedGeoPoints = [
      { id: 'P1', easting: '6.4524', northing: '3.3912', elevation: '10.0' },
      { id: 'P2', easting: '6.4518', northing: '3.3921', elevation: '11.0' },
    ];

    const result = detectCoordinateInversion(invertedGeoPoints);
    expect(result.isInvertedSuspected).toBe(true);
    expect(result.reason).toContain('Latitude');
  });

  it('should accurately swap Easting and Northing values while preserving metadata', () => {
    const points = [
      { id: 'BM1', name: 'BM1', code: 'BENCHMARK', easting: '762636.060', northing: '547651.161', elevation: '65.543' },
      { id: 'BM2', name: 'BM2', code: 'BOUNDARY', easting: '762486.991', northing: '547443.525', elevation: '62.398' },
    ];

    const swapped = swapPointCoordinates(points);
    expect(swapped).toHaveLength(2);
    expect(swapped[0].easting).toBe('547651.161');
    expect(swapped[0].northing).toBe('762636.060');
    expect(swapped[0].id).toBe('BM1');
    expect(swapped[0].code).toBe('BENCHMARK');
    expect(swapped[0].elevation).toBe('65.543');

    // Re-checking inverted check on the swapped points should now be normal
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
