import React, { useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { SignPad, useSignPad } from './src/index.js';
import './src/lib/SignPad.css';

/* ----------------------------- Demo con ref ----------------------------- */
function RefDemo() {
  const signPadRef = useRef(null);

  const [penColor, setPenColor] = useState('#0004a6');
  const [penSize, setPenSize] = useState(4);
  const [thinning, setThinning] = useState(0.5);
  const [smoothing, setSmoothing] = useState(0.5);
  const [streamline, setStreamline] = useState(0.5);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [format, setFormat] = useState('png');
  const [cursor, setCursor] = useState('proportional');
  const [lockLandscape, setLockLandscape] = useState(true);
  const [preview, setPreview] = useState(null);
  const [empty, setEmpty] = useState(true);
  const [fsActive, setFsActive] = useState(false);
  const [log, setLog] = useState('');

  const note = (msg) => setLog(`${new Date().toLocaleTimeString()} - ${msg}`);

  React.useEffect(() => {
    const onFs = () => setFsActive(document.fullscreenElement === signPadRef.current?.getSvg()?.parentElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const handleSave = useCallback(async () => {
    const url = await signPadRef.current?.save(format, 1.0);
    if (!url) { note('Nada que guardar (canvas vacío)'); return; }
    setPreview(url);
    note(`Guardado como ${format.toUpperCase()} (${Math.round(url.length / 1024)} KB)`);
  }, [format]);

  const handleClear = useCallback(() => {
    signPadRef.current?.clear();
    setPreview(null);
    setEmpty(true);
    note('Limpiado');
  }, []);

  const handleUndo = useCallback(() => {
    signPadRef.current?.undo();
    note('Deshacer');
  }, []);

  const handleChange = useCallback(() => {
    setEmpty(signPadRef.current?.isEmpty() ?? true);
  }, []);

  const slider = (label, value, setValue, min, max, step = 0.1) => (
    <label className="control">
      <span>{label}: <b>{value}</b></span>
      <input
        type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => setValue(parseFloat(e.target.value))}
      />
    </label>
  );

  return (
    <section className="card">
      <h2>Demo con <code>ref</code></h2>

      <div className="pad-wrap">
        <SignPad
          ref={signPadRef}
          height={300}
          penColor={penColor}
          penSize={penSize}
          thinning={thinning}
          smoothing={smoothing}
          streamline={streamline}
          backgroundColor={backgroundColor}
          cursor={cursor}
          lockLandscape={lockLandscape}
          onChange={handleChange}
          onSave={(url, fmt) => note(`onSave disparado (${fmt})`)}
          onClear={() => note('onClear disparado')}
        />
      </div>

      <div className="controls">
        <label className="control">
          <span>Color trazo</span>
          <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
        </label>
        <label className="control">
          <span>Fondo (JPG)</span>
          <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
        </label>
        {slider('penSize', penSize, setPenSize, 1, 20, 1)}
        {slider('thinning', thinning, setThinning, 0, 1)}
        {slider('smoothing', smoothing, setSmoothing, 0, 1)}
        {slider('streamline', streamline, setStreamline, 0, 1)}
        <label className="control">
          <span>Cursor</span>
          <select value={cursor} onChange={(e) => setCursor(e.target.value)}>
            <option value="proportional">Proporcional</option>
            <option value="crosshair">Crosshair</option>
            <option value="none">Ninguno</option>
          </select>
        </label>
        <label className="control">
          <span>Bloquear landscape</span>
          <input type="checkbox" checked={lockLandscape} onChange={(e) => setLockLandscape(e.target.checked)} />
        </label>
      </div>

      <div className="toolbar">
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="svg">SVG</option>
        </select>
        <button onClick={handleSave}>Guardar</button>
        <button onClick={() => signPadRef.current?.download('firma', format)}>Descargar</button>
        <button onClick={handleUndo}>Deshacer</button>
        <button onClick={handleClear}>Limpiar</button>
        <button onClick={() => signPadRef.current?.enterFullscreen()}>Fullscreen ▶</button>
        <button onClick={() => signPadRef.current?.exitFullscreen()}>Fullscreen ■</button>
        <button onClick={() => signPadRef.current?.toggleFullscreen()}>Toggle FS</button>
        <button onClick={async () => setEmpty(signPadRef.current?.isEmpty() ?? true)}>
          isEmpty: {empty ? 'true' : 'false'}
        </button>
        <button onClick={() => setFsActive(signPadRef.current?.isFullscreen() ?? false)}>
          isFullscreen: {fsActive ? 'true' : 'false'}
        </button>
        <button onClick={async () => {
          const blob = await signPadRef.current?.toBlob(format, 1.0);
          note(blob ? `toBlob: ${blob.size} bytes (${blob.type})` : 'toBlob: null');
        }}>toBlob</button>
      </div>

      {preview && (
        <div className="preview">
          <p>Vista previa ({format.toUpperCase()}):</p>
          <img src={preview} alt="Firma" />
        </div>
      )}

      {log && <p className="log">{log}</p>}
    </section>
  );
}

/* -------------------------- Demo con useSignPad -------------------------- */
function HookDemo() {
  const { signPadProps, clear, undo, save, download, isEmpty, toBlob, enterFullscreen, exitFullscreen, toggleFullscreen, isFullscreen } = useSignPad({
    onSave: (url, fmt) => console.log('Hook onSave', fmt),
    onClear: () => console.log('Hook onClear'),
  });

  const [preview, setPreview] = useState(null);

  const handleSave = async () => {
    const url = await save('png', 1.0);
    if (url) setPreview(url);
  };

  return (
    <section className="card">
      <h2>Demo con <code>useSignPad</code></h2>

      <div className="pad-wrap">
        <SignPad {...signPadProps} height={220} penColor="#e91e63" penSize={6} />
      </div>

      <div className="toolbar">
        <button onClick={handleSave}>Guardar</button>
        <button onClick={() => download('firma-hook', 'png')}>Descargar</button>
        <button onClick={undo}>Deshacer</button>
        <button onClick={clear}>Limpiar</button>
        <button disabled={isEmpty}>isEmpty: {isEmpty ? 'true' : 'false'}</button>
        <button onClick={toggleFullscreen}>Fullscreen {isFullscreen ? '■' : '▶'}</button>
        <button onClick={() => exitFullscreen()}>Salir FS</button>
        <button onClick={async () => {
          const blob = await toBlob('png', 1.0);
          if (blob) alert(`Blob: ${blob.size} bytes`);
        }}>toBlob</button>
      </div>

      {preview && (
        <div className="preview">
          <p>Vista previa (PNG):</p>
          <img src={preview} alt="Firma hook" />
        </div>
      )}
    </section>
  );
}

function App() {
  return (
    <div className="container">
      <h1>SignPad — Playground</h1>
      <p className="subtitle">
        Prueba la librería con distintos parámetros. Usa ratón, lápiz o touch.
      </p>
      <RefDemo />
      <HookDemo />
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
