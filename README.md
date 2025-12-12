# SignPad

> Librería React headless para captura de firmas digitales con trazos realistas usando perfect-freehand.

[![npm version](https://img.shields.io/npm/v/@darelmasis/signpad.svg)](https://www.npmjs.com/package/@darelmasis/signpad)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@darelmasis/signpad)](https://bundlephobia.com/package/@darelmasis/signpad)

## Características

- **Trazos Realistas** - Powered by `perfect-freehand`
- **Headless** - Sin UI predefinida, 100% personalizable
- **Responsive** - Width 100% por defecto, adaptable
- **Exportación Inteligente** - Solo guarda trazos, sin márgenes innecesarios
- **Alta Calidad** - Exportación 3x con anti-aliasing
- **Touch Optimizado** - Soporte completo táctil con presión
- **Ultra Ligero** - Solo 2 kB gzipped
- **Accesible** - ARIA labels incluidos
- **API Simple** - Métodos vía ref

## Instalación

```bash
npm install @darelmasis/signpad
```

## Uso Básico

```jsx
import React, { useRef } from 'react';
import { SignPad } from '@darelmasis/signpad';
import '@darelmasis/signpad/signpad.css';

function App() {
  const signPadRef = useRef(null);

  const handleSave = async () => {
    const dataUrl = await signPadRef.current?.save('png');
    console.log('Firma guardada:', dataUrl);
  };

  return (
    <div>
      <SignPad ref={signPadRef} height={300} />
      
      {/* Tus botones personalizados */}
      <button onClick={() => signPadRef.current?.clear()}>
        Limpiar
      </button>
      <button onClick={handleSave}>
        Guardar
      </button>
    </div>
  );
}
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `width` | `string\|number` | `'100%'` | Ancho del canvas |
| `height` | `number` | `300` | Alto en píxeles |
| `penColor` | `string` | `'#0004a6'` | Color del trazo |
| `penSize` | `number` | `2` | Tamaño base del trazo (1-20) |
| `thinning` | `number` | `0.5` | Adelgazamiento por velocidad (0-1) |
| `smoothing` | `number` | `0.5` | Suavizado de curvas (0-1) |
| `streamline` | `number` | `0.5` | Estabilización del trazo (0-1) |
| `backgroundColor` | `string` | `'#ffffff'` | Color de fondo (solo para JPG) |
| `onSave` | `function` | - | Callback: `(dataUrl, format) => void` |
| `onClear` | `function` | - | Callback: `() => void` |
| `onChange` | `function` | - | Callback al dibujar/borrar |
| `disabled` | `boolean` | `false` | Deshabilita interacción |
| `className` | `string` | `''` | Clases CSS adicionales |

## Métodos (via ref)

### `clear()`
Limpia completamente el canvas.
```jsx
signPadRef.current?.clear();
```

### `undo()`
Deshace el último trazo dibujado.
```jsx
signPadRef.current?.undo();
```

### `save(format, quality)`
Guarda la firma y retorna un DataURL.
- **Parámetros:**
  - `format`: `'png'` | `'jpg'` | `'svg'` (default: `'png'`)
  - `quality`: `0-1` (default: `1.0`)
- **Retorna:** `Promise<string | null>`

```jsx
const dataUrl = await signPadRef.current?.save('png', 1.0);
```

### `download(filename, format)`
Descarga la firma automáticamente.
```jsx
signPadRef.current?.download('mi-firma', 'png');
```

### `toBlob(format, quality)`
Convierte la firma a Blob (útil para uploads).
```jsx
const blob = await signPadRef.current?.toBlob('png');
```

### `isEmpty()`
Verifica si el canvas está vacío.
```jsx
if (signPadRef.current?.isEmpty()) {
  alert('Por favor dibuja una firma');
}
```

### `getSvg()`
Obtiene el elemento SVG del DOM.
```jsx
const svgElement = signPadRef.current?.getSvg();
```

## Ejemplos

### Con Hook `useSignPad` (Opcional)

```jsx
import { SignPad, useSignPad } from '@darelmasis/signpad';

function App() {
  const { signPadProps, clear, save, isEmpty } = useSignPad({
    onSave: (dataUrl) => console.log('Guardado:', dataUrl),
    onClear: () => console.log('Limpiado')
  });

  return (
    <div>
      <SignPad {...signPadProps} height={300} />
      <button onClick={clear} disabled={isEmpty}>Limpiar</button>
      <button onClick={() => save('png')} disabled={isEmpty}>Guardar</button>
    </div>
  );
}
```

### En un Formulario

```jsx
function SignatureForm() {
  const signPadRef = useRef(null);
  const [signature, setSignature] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (signPadRef.current?.isEmpty()) {
      alert('Por favor firma el documento');
      return;
    }

    const dataUrl = await signPadRef.current?.save('png');
    setSignature(dataUrl);
    // Enviar formulario...
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Firma:</label>
      <SignPad ref={signPadRef} height={200} />
      
      <button type="button" onClick={() => signPadRef.current?.clear()}>
        Limpiar
      </button>
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### En un Modal Personalizado

```jsx
import Modal from 'tu-libreria-modal'; // Usa tu modal favorito

function SignatureModal({ isOpen, onClose }) {
  const signPadRef = useRef(null);

  const handleSave = async () => {
    const dataUrl = await signPadRef.current?.save('png');
    // Hacer algo con la firma
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Firma Digital</h2>
      <SignPad ref={signPadRef} height={300} />
      
      <button onClick={handleSave}>Guardar</button>
      <button onClick={onClose}>Cancelar</button>
    </Modal>
  );
}
```

### Upload a Servidor

```jsx
const handleUpload = async () => {
  const blob = await signPadRef.current?.toBlob('png');
  
  const formData = new FormData();
  formData.append('signature', blob, 'signature.png');
  
  await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
};
```

## Personalización

### Colores y Grosor

```jsx
<SignPad 
  penColor="#2196f3"
  penSize={3}
  backgroundColor="#f5f5f5"
  thinning={0.7}
  smoothing={0.8}
  streamline={0.6}
/>
```

### Estilos CSS Personalizados

```jsx
<SignPad className="mi-firma-custom" height={250} />
```

```css
.mi-firma-custom .signpad-canvas {
  border: 2px solid #2196f3;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### Exportación en Diferentes Formatos

```jsx
// PNG transparente (recomendado)
const pngUrl = await save('png', 1.0);

// JPG con fondo blanco
const jpgUrl = await save('jpg', 0.95);

// SVG vectorial (escalable infinitamente)
const svgUrl = await save('svg');
```

## Filosofía Headless

SignPad es una librería **headless** - proporciona la funcionalidad sin imponer diseños.

**Tú controlas:**
- 🎨 Diseño de botones
- 📦 Contenedores y modales
- ✅ Validaciones
- 🎯 Flujo de usuario
- 🌈 Branding completo

**La librería proporciona:**
- Canvas SVG con trazos realistas
- Métodos para control programático
- Exportación en alta calidad
- Estilos CSS mínimos

## Bundle Size

- **ES Module:** 44.50 kB
- **Gzipped:** 2.01 kB (0.72 kB gzip)
- **CSS:** 2.01 kB

Ultra ligero y optimizado para producción.

## Contribuir

Las contribuciones son bienvenidas:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## Licencia

MIT © [Darel Masis](https://github.com/darelmasis)

## Créditos

- [perfect-freehand](https://github.com/steveruizok/perfect-freehand) - Trazos realistas
- [React](https://react.dev) - Framework base

---

**¿Problemas o sugerencias?** [Abre un issue](https://github.com/darelmasis/signpad/issues)
