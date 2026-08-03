/**
 * Spatial Polygon Coordinate Normalization & Validation Engine (Sprint 11 Zone Module)
 * Ensures 100% compatibility between Frontend Drawing UI and Python AI Inference Workers.
 */

export type Point2D = [number, number];

/** Normalize pixel coordinates (x, y) to 0.0 - 1.0 floating point scale */
export function normalizePoint(point: Point2D, containerWidth: number, containerHeight: number): Point2D {
  if (containerWidth <= 0 || containerHeight <= 0) return [0, 0];
  const normX = Math.max(0, Math.min(1, point[0] / containerWidth));
  const normY = Math.max(0, Math.min(1, point[1] / containerHeight));
  return [Number(normX.toFixed(4)), Number(normY.toFixed(4))];
}

/** Denormalize 0.0 - 1.0 floating point values to screen pixel coordinates */
export function denormalizePoint(point: Point2D, containerWidth: number, containerHeight: number): Point2D {
  return [Math.round(point[0] * containerWidth), Math.round(point[1] * containerHeight)];
}

/** Normalize an entire polygon array */
export function normalizePolygon(polygon: Point2D[], width: number, height: number): Point2D[] {
  return polygon.map((pt) => normalizePoint(pt, width, height));
}

/** Denormalize an entire polygon array */
export function denormalizePolygon(polygon: Point2D[], width: number, height: number): Point2D[] {
  return polygon.map((pt) => denormalizePoint(pt, width, height));
}

/** Check if 2 line segments (p1-p2 and p3-p4) intersect */
function doSegmentsIntersect(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): boolean {
  const ccw = (a: Point2D, b: Point2D, c: Point2D) => {
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  };
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
    ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

/** Auto-normalize points if they are in 0-100 percentage or pixel scale */
export function autoNormalizePolygon(polygon: Point2D[]): Point2D[] {
  if (!Array.isArray(polygon)) return [];

  // Check max values
  let maxX = 0;
  let maxY = 0;
  for (const [x, y] of polygon) {
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  // If already 0.0 to 1.0, return formatted
  if (maxX <= 1.0 && maxY <= 1.0) {
    return polygon.map(([x, y]) => [
      Number(Math.max(0, Math.min(1, x)).toFixed(4)),
      Number(Math.max(0, Math.min(1, y)).toFixed(4)),
    ]);
  }

  // If in 0-100 percentage scale
  const scaleX = maxX > 1.0 && maxX <= 100 ? 100 : maxX;
  const scaleY = maxY > 1.0 && maxY <= 100 ? 100 : maxY;

  return polygon.map(([x, y]) => [
    Number(Math.max(0, Math.min(1, x / scaleX)).toFixed(4)),
    Number(Math.max(0, Math.min(1, y / scaleY)).toFixed(4)),
  ]);
}

/** Validate spatial polygon bounds and topology */
export function validatePolygon(rawPolygon: Point2D[]): { valid: boolean; normalizedPoints?: Point2D[]; reason?: string } {
  if (!Array.isArray(rawPolygon) || rawPolygon.length < 3) {
    return { valid: false, reason: 'Spatial polygon requires at least 3 vertices.' };
  }

  const polygon = autoNormalizePolygon(rawPolygon);

  // Boundary check
  for (const pt of polygon) {
    if (pt[0] < 0 || pt[0] > 1 || pt[1] < 0 || pt[1] > 1) {
      return { valid: false, reason: 'Polygon points must lie within frame boundary (0.0 to 1.0).' };
    }
  }

  // Self-intersection check
  const len = polygon.length;
  for (let i = 0; i < len; i++) {
    const a1 = polygon[i];
    const a2 = polygon[(i + 1) % len];

    for (let j = i + 2; j < len; j++) {
      if (i === 0 && j === len - 1) continue; // Skip adjacent first and last segments
      const b1 = polygon[j];
      const b2 = polygon[(j + 1) % len];

      if (doSegmentsIntersect(a1, a2, b1, b2)) {
        return { valid: false, reason: 'Polygon segments cannot self-intersect.' };
      }
    }
  }

  return { valid: true, normalizedPoints: polygon };
}
