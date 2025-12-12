/**
 * Calcula el bounding box (área mínima) que contiene todos los trazos
 */
export function calculateBoundingBox(allStrokes, currentPoints, padding = 10) {
  const allPoints = [...allStrokes, currentPoints]
    .filter(Boolean)
    .flat()
    .filter(p => p && p.length >= 2);

  if (allPoints.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  allPoints.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2
  };
}
