/**
 * Cursor SVG proporcional al tamaño del pen para el SignPad
 */
export function getCursorStyle(penSize, thinning, disabled) {
  if (disabled) return 'not-allowed';

  // El cursor debe ser proporcional al penSize
  // Usamos el penSize como diámetro base, con un mínimo de 8px y máximo de 100px para el cursor
  const cursorSize = Math.max(8, Math.min(100, penSize));
  const radius = cursorSize / 2;
  const center = cursorSize / 2;

  // El stroke del círculo debe ser visible pero no demasiado grueso
  const strokeWidth = Math.max(1, Math.min(3, cursorSize / 15));

  // Crear el SVG del cursor con tamaño proporcional
  // Codificar el SVG para usarlo en data URI
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}"><circle cx="${center}" cy="${center}" r="${radius - strokeWidth}" stroke="rgb(255,255,255)" stroke-width="${strokeWidth}" fill="rgba(0,0,0,1)"/></svg>`;
  const encodedSvg = encodeURIComponent(svgContent);
  const cursorSvg = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

  return `url('${cursorSvg}') ${center} ${center}, crosshair`;
}
