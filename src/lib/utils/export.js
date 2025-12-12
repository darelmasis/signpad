/**
 * Convierte un SVG a base64
 */
export function svgToBase64(svg) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

/**
 * Convierte un SVG a Blob
 */
export async function svgToBlob(svg) {
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Exporta SVG a PNG/JPG base64 usando canvas
 * Solo guarda los trazos, sin el fondo del pad
 * @param {string} svg - SVG string
 * @param {number} width - Ancho del canvas
 * @param {number} height - Alto del canvas
 * @param {string} backgroundColor - Color de fondo (solo para JPG)
 * @param {string} format - Formato: 'png' o 'jpg'
 * @param {number} quality - Calidad 0-1 (default 1.0 para máxima calidad)
 * @param {number} scale - Factor de escala para mejor calidad (default 3)
 */
export async function svgToDataURL(svg, width, height, backgroundColor = '#fff', format = 'png', quality = 1.0, scale = 3) {
  const blob = await svgToBlob(svg);
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Usar escala para mejor calidad
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      
      // Mejorar la calidad de renderizado
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Para PNG: fondo transparente (solo trazos)
      // Para JPG: fondo blanco (JPG no soporta transparencia)
      if (format === 'jpg' || format === 'jpeg') {
        ctx.fillStyle = backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, scaledWidth, scaledHeight);
      }
      // Para PNG no dibujamos fondo, dejamos transparente
      
      // Dibujar la imagen escalada
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      URL.revokeObjectURL(url);

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      // Usar calidad máxima
      resolve(canvas.toDataURL(mimeType, quality));
    };
    img.onerror = () => reject(new Error('Failed to load SVG'));
    img.src = url;
  });
}
