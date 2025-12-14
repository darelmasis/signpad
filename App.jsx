import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SignPad } from './src/index.js';

function App() {
  const signPadRef = useRef(null);

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '15px'
      }}>
        <SignPad
          ref={signPadRef}
          height={300}
          penSize={5}

        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => signPadRef.current?.clear()}
          style={styles.button}
        >
          Limpiar
        </button>
        <button 
          onClick={() => signPadRef.current?.undo()}
          style={styles.button}
        >
          Deshacer
        </button>
        <button 
          onClick={async () => {
            const url = await signPadRef.current?.save('png');
            if (url) console.log('Guardado:', url);
          }}
          style={styles.button}
        >
          Guardar
        </button>
        <button 
          onClick={() => signPadRef.current?.download('firma', 'png')}
          style={styles.button}
        >
          Descargar
        </button>
      </div>
    </div>
  );
}

const styles = {
  button: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
