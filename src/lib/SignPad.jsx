import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { getStrokeOptions, renderStroke, getSvgPathFromStroke } from './utils/stroke.jsx';
import { getStroke } from 'perfect-freehand';
import { getPointerPosition } from './utils/pointer';
import { svgToBase64, svgToDataURL } from './utils/export';
import { calculateBoundingBox } from './utils/boundingBox';
import { DEFAULTS } from './constants';
import PropTypes from 'prop-types';
import './SignPad.css';

const SignPadComponent = (props, ref) => {
  const {
    width, height, penColor, penSize,
    thinning, smoothing, streamline,
    backgroundColor, onSave, onClear, onChange, disabled, className, ...rest
  } = { ...DEFAULTS, ...props };

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const viewBoxInitialized = useRef(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [allStrokes, setAllStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [viewBoxDimensions, setViewBoxDimensions] = useState(() => {
    // Inicializar con valores de las props o defaults
    const initWidth = typeof width === 'number' ? width : 800;
    const initHeight = height || 300;
    return { width: initWidth, height: initHeight };
  });
  
  // Callback ref para inicializar viewBox cuando el contenedor se monte
  const setContainerRef = useCallback((node) => {
    containerRef.current = node;
    if (node && !viewBoxInitialized.current) {
      const containerWidth = node.offsetWidth || (typeof width === 'number' ? width : 800);
      const containerHeight = height || 300;
      setViewBoxDimensions({ width: containerWidth, height: containerHeight });
      viewBoxInitialized.current = true;
    }
  }, [width, height]);
  
  // El viewBox se mantiene constante para que los trazos se escalen correctamente
  // Solo se inicializa una vez cuando el contenedor se monta
  
  // Dimensiones base del viewBox
  const baseWidth = viewBoxDimensions.width;
  const baseHeight = viewBoxDimensions.height;

  const strokeOptions = useMemo(() => getStrokeOptions({ penSize, thinning, smoothing, streamline }), [penSize, thinning, smoothing, streamline]);

  const handlePointerDown = useCallback(e => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointerPosition(e, svgRef.current);
    if (point) {
      setCurrentPoints([[point.x, point.y, point.pressure]]);
      // Notificar cambio: ahora no está vacío
      if (onChange && allStrokes.length === 0) {
        setTimeout(() => onChange(), 0);
      }
    }
  }, [disabled, onChange, allStrokes.length]);

  const handlePointerMove = useCallback(e => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const point = getPointerPosition(e, svgRef.current);
    if (point) setCurrentPoints(prev => [...prev, [point.x, point.y, point.pressure]]);
  }, [isDrawing, disabled]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 0) {
      setAllStrokes(prev => [...prev, currentPoints]);
      setCurrentPoints([]);
      // Notificar cambio de estado
      if (onChange) setTimeout(() => onChange(), 0);
    }
  }, [isDrawing, currentPoints, onChange]);

  // Event listeners globales para dibujo continuo fuera del pad
  useEffect(() => {
    if (!isDrawing) return;

    const handleGlobalMouseMove = (e) => handlePointerMove(e);
    const handleGlobalMouseUp = () => handlePointerUp();

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDrawing, handlePointerMove, handlePointerUp]);

  const clear = useCallback(() => { 
    setAllStrokes([]); 
    setCurrentPoints([]);
    if (onChange) onChange();
    if (onClear) onClear(); 
  }, [onClear, onChange]);

  const undo = useCallback(() => {
    setAllStrokes(prev => prev.slice(0, -1));
    if (onChange) setTimeout(() => onChange(), 0);
  }, [onChange]);
  const getSvg = useCallback(() => svgRef.current, []);

  const save = useCallback(async (format = 'png', quality = 1.0) => {
    try {
      // Verificar si está vacío antes de guardar
      const currentIsEmpty = allStrokes.length === 0 && currentPoints.length === 0;
      if (currentIsEmpty) return null;
      
      const svg = svgRef.current;
      if (!svg) return null;

      // Calcular el bounding box de los trazos (solo el área dibujada)
      const bbox = calculateBoundingBox(allStrokes, currentPoints, 20); // padding de 20px
      if (!bbox || bbox.width <= 0 || bbox.height <= 0) return null;

      // Crear un nuevo SVG solo con el área de los trazos
      // Usar transform para mover el contenido al origen
      const paths = [...allStrokes, currentPoints]
        .filter(Boolean)
        .map((points) => {
          const stroke = getStrokeOptions({ penSize, thinning, smoothing, streamline });
          const strokeData = getStroke(points, stroke);
          const pathData = getSvgPathFromStroke(strokeData);
          return `<path d="${pathData}" fill="${penColor}" stroke="none"/>`;
        })
        .join('');

      // Crear SVG recortado usando viewBox y transform para recortar
      // El viewBox define el área visible y el transform mueve el contenido
      const croppedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bbox.width}" height="${bbox.height}" viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${paths}</svg>`;
      
      // Para PNG: no pasar backgroundColor (será transparente)
      // Para JPG: pasar backgroundColor ya que JPG no soporta transparencia
      const bgColor = format === 'jpg' || format === 'jpeg' ? backgroundColor : null;
      
      // Usar calidad máxima (1.0) y escala 3x para mejor calidad
      const scale = 3; // Escala para mejor calidad
      const dataUrl = format === 'svg' 
        ? svgToBase64(croppedSvg) 
        : await svgToDataURL(croppedSvg, bbox.width * scale, bbox.height * scale, bgColor, format, quality, scale);
      
      if (onSave) onSave(dataUrl, format);
      return dataUrl;
    } catch (error) {
      console.error('SignPad: Error saving signature', error);
      return null;
    }
  }, [allStrokes, currentPoints, backgroundColor, onSave, penSize, thinning, smoothing, streamline, penColor]);

  const download = useCallback(async (filename = 'firma', format = 'png') => {
    try {
      const dataUrl = await save(format);
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}.${format}`;
      link.click();
    } catch (error) {
      console.error('SignPad: Error downloading signature', error);
    }
  }, [save]);

  const toBlob = useCallback(async (format = 'png', quality = 0.92) => {
    try {
      const dataUrl = await save(format, quality);
      if (!dataUrl) return null;
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('SignPad: Error converting to blob', error);
      return null;
    }
  }, [save]);



  React.useImperativeHandle(ref, () => ({ 
    clear, 
    undo, 
    save, 
    download, 
    toBlob,
    isEmpty: () => allStrokes.length === 0 && currentPoints.length === 0, 
    getSvg
  }), [clear, undo, save, download, toBlob, allStrokes, currentPoints, getSvg]);

  // Dimensiones del SVG
  const svgWidth = typeof width === 'string' ? '100%' : width;
  const svgHeight = height;
  
  // ViewBox se mantiene constante con las dimensiones iniciales
  // Esto permite que los trazos se escalen correctamente cuando cambia el tamaño del SVG
  const viewBox = `0 0 ${baseWidth} ${baseHeight}`;

  // Construir className
  const containerClassName = ['signpad-container', className].filter(Boolean).join(' ');

  return (
    <div 
      ref={setContainerRef}
      className={containerClassName}
      {...rest}
    >

      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className={`signpad-canvas ${disabled ? 'signpad-disabled' : ''}`}
        style={{ backgroundColor, touchAction: 'none', cursor: disabled ? 'not-allowed' : 'default' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        role="img"
        aria-label="Área de firma digital"
      >
        {[...allStrokes, currentPoints].filter(Boolean).map((points, i) => renderStroke(points, strokeOptions, penColor, i))}
      </svg>
    </div>
  );
};

// PropTypes para validación
SignPadComponent.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.number,
  penColor: PropTypes.string,
  penSize: PropTypes.number,
  thinning: PropTypes.number,
  smoothing: PropTypes.number,
  streamline: PropTypes.number,
  backgroundColor: PropTypes.string,
  onSave: PropTypes.func,
  onClear: PropTypes.func,
  onChange: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export const SignPad = React.forwardRef(SignPadComponent);
SignPad.displayName = 'SignPad';

