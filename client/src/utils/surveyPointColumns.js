// Positional layouts only: no magnitude-based X/Y inference.
// Three numeric columns are XYZ. Four numeric columns are PointID,XYZ.
export function readXyzColumns(parts) {
  const numeric = value => typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value));
  if (parts.length === 3) {
    if (parts.every(numeric)) {
      return { easting: parts[0], northing: parts[1], elevation: parts[2] };
    }
    if (parts[0] && !numeric(parts[0]) && numeric(parts[1]) && numeric(parts[2])) {
      return { id: parts[0], easting: parts[1], northing: parts[2] };
    }
  }
  if (parts.length === 4) {
    if (parts[0] && parts.slice(1).every(numeric)) {
      return { id: parts[0], easting: parts[1], northing: parts[2], elevation: parts[3] };
    }
    if (parts.slice(0, 3).every(numeric) && parts[3] && !numeric(parts[3])) {
      return { easting: parts[0], northing: parts[1], elevation: parts[2], code: parts[3] };
    }
  }
  return null;
}
