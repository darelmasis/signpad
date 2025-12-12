import { getStroke } from 'perfect-freehand';

/**
 * Genera un path SVG desde los puntos de perfect-freehand
 */
export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}

/**
 * Opciones default para perfect-freehand
 */

export function getStrokeOptions({ penSize = 2, thinning = 0.5, smoothing = 0.5, streamline = 0.5 } = {}) {
  return {
    size: penSize,
    thinning,
    smoothing,
    streamline,
    easing: t => t,
    start: { taper: 0, easing: t => t, cap: true },
    end: { taper: 0, easing: t => t, cap: true }
  };
}

/**
 * Renderiza un stroke completo en SVG
 */
export function renderStroke(points, options, penColor, index) {
  const stroke = getStroke(points, options);
  const pathData = getSvgPathFromStroke(stroke);
  return <path key={index} d={pathData} fill={penColor} stroke="none" />;
}

