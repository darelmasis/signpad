// Entry point for signpad library

// Componente principal (headless - sin UI predefinida)
export { SignPad } from './lib/SignPad.jsx';

// Hook opcional (para quienes prefieren hooks sobre refs)
export { useSignPad } from './lib/hooks/useSignPad';

// Exportar solo estilos esenciales del SignPad
import './lib/SignPad.css';