import { describe, it, expect } from 'vitest';
import { readXyzColumns } from '../utils/surveyPointColumns';

describe('survey XYZ import layouts', () => {
  it.each([
    ['547731.125', '762489.250', '64.460'],
    ['762489.250', '547731.125', '64.460'],
    ['1200.000', '2400.000', '3500.000'],
    ['-1200.000', '0.000', '-3.500'],
  ])('preserves X=%s, Y=%s, Z=%s regardless of magnitude', (x, y, z) => {
    expect(readXyzColumns([x, y, z])).toEqual({ easting: x, northing: y, elevation: z });
  });
  it.each(['1', '007', 'P1'])('keeps point ID %s separate from XYZ', id => {
    expect(readXyzColumns([id, '547731.125', '762489.250', '64.460']))
      .toEqual({ id, easting: '547731.125', northing: '762489.250', elevation: '64.460' });
  });
  it('supports XYZ plus a point description', () => {
    expect(readXyzColumns(['547731.125', '762489.250', '64.460', 'BM']))
      .toEqual({ easting: '547731.125', northing: '762489.250', elevation: '64.460', code: 'BM' });
  });
  it('rejects a missing Z in PointID,XYZ instead of shifting columns', () => {
    expect(readXyzColumns(['1', '547731', '762489', ''])).toBeNull();
  });
  it.each([
    ['547731', '', '64'], ['547731', '762489junk', '64'], ['547731', '762489', 'Infinity']
  ])('rejects incomplete or invalid coordinates: %j', (...values) => {
    expect(readXyzColumns(values)).toBeNull();
  });
});
