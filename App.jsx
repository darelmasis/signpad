import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SignPad } from './src/index.js';

function App() {
  const signPadRef = useRef(null);

  const handleSave = async () => {
    const dataUrl = await signPadRef.current?.save('png');
    if (dataUrl) {
      console.log('Firma guardada:', dataUrl);
    }
  };

  const handleClear = () => {
    signPadRef.current?.clear();
  };

  const handleUndo = () => {
    signPadRef.current?.undo();
  };

  const handleDownload = () => {
    signPadRef.current?.download('mi-firma', 'png');
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '2rem auto', 
      padding: '0 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* El SignPad */}
      <div style={{
        border: '2px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <SignPad
          ref={signPadRef}
          height={300}
          penSize={2.5}
          penColor="#0066cc"
        />
      </div>

      {/* Botones */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button onClick={handleClear} style={buttonStyle('#f44336')}>
          Limpiar
        </button>
        <button onClick={handleUndo} style={buttonStyle('#ff9800')}>
          Deshacer
        </button>
        <button onClick={handleSave} style={buttonStyle('#4caf50')}>
          Guardar
        </button>
        <button onClick={handleDownload} style={buttonStyle('#2196f3')}>
          Descargar
        </button>
      </div>
    </div>
  );
}

const buttonStyle = (color) => ({
  padding: '0.75rem 1.5rem',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500',
  fontSize: '1rem',
  transition: 'all 0.2s'
});

const root = createRoot(document.getElementById('root'));
root.render(<App />);
