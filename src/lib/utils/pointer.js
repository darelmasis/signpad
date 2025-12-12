/**
 * Obtiene coordenadas relativas dentro del SVG, convertidas al espacio del viewBox
 * Considera rotaciones CSS aplicadas al contenedor
 */
export function getPointerPosition(e, svg) {
  if (!svg) return null;
  
  // Obtener el contenedor padre para verificar si tiene rotación
  const container = svg.closest('.signpad-container');
  const isRotated = container?.classList.contains('signpad-rotated');
  
  const rect = svg.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Coordenadas relativas al centro del rect (después de la rotación CSS)
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Coordenadas relativas al centro
  let dx = clientX - centerX;
  let dy = clientY - centerY;
  
  if (isRotated) {
    // El contenedor está rotado 90 grados, pero el SVG dentro NO está rotado
    // Necesitamos desrotar las coordenadas del touch para que coincidan con el SVG
    // Rotación inversa de 90 grados: (x', y') = (y, -x) relativo al centro
    
    // Desrotar las coordenadas
    const tempDx = dx;
    dx = dy;      // x' = y
    dy = -tempDx; // y' = -x
    
    // Las dimensiones visuales del SVG (intercambiadas por la rotación del contenedor)
    const visualWidth = rect.height;  // width visual = height del rect
    const visualHeight = rect.width;  // height visual = width del rect
    
    // Convertir a coordenadas absolutas del SVG
    let x = dx + visualWidth / 2;
    let y = dy + visualHeight / 2;
    
    // Asegurar que estén dentro de los límites
    x = Math.max(0, Math.min(visualWidth, x));
    y = Math.max(0, Math.min(visualHeight, y));
    
    // Si el SVG tiene viewBox, convertir al espacio del viewBox
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
      
      // Con preserveAspectRatio="xMidYMid meet", calcular área efectiva
      const viewBoxAspect = vbWidth / vbHeight;
      const visualAspect = visualWidth / visualHeight;
      
      let effectiveWidth = visualWidth;
      let effectiveHeight = visualHeight;
      let offsetX = 0;
      let offsetY = 0;
      
      if (viewBoxAspect > visualAspect) {
        effectiveHeight = visualWidth / viewBoxAspect;
        offsetY = (visualHeight - effectiveHeight) / 2;
      } else {
        effectiveWidth = visualHeight * viewBoxAspect;
        offsetX = (visualWidth - effectiveWidth) / 2;
      }
      
      // Ajustar coordenadas
      const adjustedX = x - offsetX;
      const adjustedY = y - offsetY;
      
      // Escalar al viewBox
      const scaleX = vbWidth / effectiveWidth;
      const scaleY = vbHeight / effectiveHeight;
      const viewBoxX = vbX + (adjustedX * scaleX);
      const viewBoxY = vbY + (adjustedY * scaleY);
      return { x: viewBoxX, y: viewBoxY, pressure: e.pressure || 0.5 };
    }
    
    return { x, y, pressure: e.pressure || 0.5 };
  }
  
  // Si no está rotado, usar el cálculo normal
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  // Si el SVG tiene viewBox, convertir al espacio del viewBox
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    
    // Usar las dimensiones reales del rect renderizado
    const svgWidth = rect.width;
    const svgHeight = rect.height;
    
    // preserveAspectRatio="xMidYMid meet" - mantener proporciones correctas
    // Calcular la escala real considerando el aspect ratio preservado
    const viewBoxAspect = vbWidth / vbHeight;
    const svgAspect = svgWidth / svgHeight;
    
    let effectiveWidth = svgWidth;
    let effectiveHeight = svgHeight;
    let offsetX = 0;
    let offsetY = 0;
    
    // Ajustar según el aspect ratio
    if (viewBoxAspect > svgAspect) {
      // viewBox es más ancho - ajustar altura
      effectiveHeight = svgWidth / viewBoxAspect;
      offsetY = (svgHeight - effectiveHeight) / 2;
    } else {
      // viewBox es más alto - ajustar ancho
      effectiveWidth = svgHeight * viewBoxAspect;
      offsetX = (svgWidth - effectiveWidth) / 2;
    }
    
    // Ajustar coordenadas por el offset
    const adjustedX = x - offsetX;
    const adjustedY = y - offsetY;
    
    // Escalar al espacio del viewBox
    const scaleX = vbWidth / effectiveWidth;
    const scaleY = vbHeight / effectiveHeight;
    const viewBoxX = vbX + (adjustedX * scaleX);
    const viewBoxY = vbY + (adjustedY * scaleY);
    return { x: viewBoxX, y: viewBoxY, pressure: e.pressure || 0.5 };
  }
  
  // Si no hay viewBox, usar coordenadas directas
  return { x, y, pressure: e.pressure || 0.5 };
}
