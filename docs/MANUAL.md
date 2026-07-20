# Manual de SignPad

Librería React **headless** para captura de firmas digitales con trazos realistas
(powered by [`perfect-freehand`](https://github.com/steveruizok/perfect-freehand)).

- Sin UI impuesta: tú pones los botones, contenedores y estilos.
- Exporta a **PNG** (transparente), **JPG** (fondo) y **SVG** (vectorial).
- Optimizada para **ratón, lápiz y touch**, con captura de puntero continua.
- **Modo pantalla completa** con bloqueo de orientación landscape en móviles.
- Cursor **proporcional** al grosor del trazo.
- Tamaño: ~6.4 kB gzipped (ESM).

---

## 1. Instalación

```bash
npm install @darelmasis/signpad
```

`react` y `react-dom` (^18 || ^19) son *peer dependencies*; debes tenerlos en tu proyecto.

---

## 2. Importación

```jsx
import React, { useRef } from 'react';
import { SignPad, useSignPad } from '@darelmasis/signpad';
import '@darelmasis/signpad/signpad.css'; // estilos mínimos (opcional pero recomendado)
```

La librería expone exactamente tres cosas:

| Export | Tipo | Descripción |
|--------|------|-------------|
| `SignPad` | Componente (`forwardRef`) | El pad de firma. |
| `useSignPad` | Hook | API alternativa basada en hooks con estado reactivo. |
| `signpad.css` | Hoja de estilos | Clases base (`signpad-container`, `signpad-canvas`, `signpad-disabled` y `:fullscreen`). |

---

## 3. Uso rápido (vía `ref`)

```jsx
function App() {
  const ref = useRef(null);

  const handleSave = async () => {
    const dataUrl = await ref.current?.save('png');
    console.log(dataUrl); // data:image/png;base64,...
  };

  return (
    <>
      <SignPad ref={ref} height={300} />
      <button onClick={() => ref.current?.clear()}>Limpiar</button>
      <button onClick={handleSave}>Guardar</button>
    </>
  );
}
```

---

## 4. Uso con el hook `useSignPad`

```jsx
function App() {
  const { signPadProps, clear, save, isEmpty, isFullscreen, toggleFullscreen } = useSignPad({
    onSave: (url, fmt) => console.log('Guardado', fmt),
  });

  return (
    <>
      <SignPad {...signPadProps} height={300} />
      <button onClick={clear} disabled={isEmpty}>Limpiar</button>
      <button onClick={() => save('png')} disabled={isEmpty}>Guardar</button>
      <button onClick={toggleFullscreen}>
        {isFullscreen ? 'Salir' : 'Pantalla completa'}
      </button>
    </>
  );
}
```

---

## 5. Props de `<SignPad />`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `width` | `string \| number` | `'100%'` | Ancho del pad. Como porcentaje o píxeles. |
| `height` | `number` | `300` | Alto en píxeles. |
| `penColor` | `string` | `'#0004a6'` | Color del trazo. |
| `penSize` | `number` | `4` | Grosor base del trazo (1–20 aprox). |
| `thinning` | `number` | `0.5` | Adelgazamiento por velocidad (0–1). |
| `smoothing` | `number` | `0.5` | Suavizado de curvas (0–1). |
| `streamline` | `number` | `0.5` | Estabilización del trazo (0–1). |
| `backgroundColor` | `string` | `'#ffffff'` | Color de fondo (solo se usa al exportar **JPG**). |
| `start` | `object` | `{ taper: 0, cap: true, easing: t=>t }` | Opciones de la punta inicial del trazo. |
| `end` | `object` | `{ taper: 0, cap: true, easing: t=>t }` | Opciones de la punta final del trazo. |
| `easing` | `(t:number)=>number` | `t => t` | Función de easing aplicada a todo el trazo y sus puntas. |
| `cursor` | `'proportional' \| 'crosshair' \| 'none' \| string` | `'proportional'` | Cursor del área de dibujo (ver §10). |
| `lockLandscape` | `boolean` | `true` | En pantalla completa, fuerza orientación horizontal en móviles. |
| `onSave` | `(dataUrl, format) => void` | — | Se ejecuta tras `save()` con éxito. |
| `onClear` | `() => void` | — | Se ejecuta en `clear()`. |
| `onChange` | `() => void` | — | Se ejecuta al dibujar / deshacer / limpiar. |
| `disabled` | `boolean` | `false` | Deshabilita la interacción y pinta el pad atenuado. |
| `className` | `string` | `''` | Clases CSS extra para el contenedor. |

> Cualquier otra prop HTML válida (ej. `id`, `style`, `aria-*`, `data-*`) se reenvía al
> contenedor (`<div class="signpad-container">`).

### Opciones de trazo (perfect-freehand)

`penSize`, `thinning`, `smoothing`, `streamline`, `start`, `end` y `easing` se pasan
directamente a `perfect-freehand`. Consulta su
[documentación](https://github.com/steveruizok/perfect-freehand#options) para combinaciones
avanzadas (p. ej. `start: { taper: 40 }` para puntas en forma de gota).

---

## 6. Métodos (vía `ref`)

Obtenidos con `ref.current?.metodo()`. Todos son seguros si el ref aún no está montado
(`ref.current` puede ser `null`).

### `clear(): void`
Vacía el pad por completo. Dispara `onClear` y `onChange`.

```jsx
ref.current?.clear();
```

### `undo(): void`
Elimina el último trazo dibujado.

```jsx
ref.current?.undo();
```

### `save(format?, quality?): Promise<string | null>`
Renderiza **solo el área dibujada** (bounding box + padding) y devuelve un Data URL.

- `format` (por defecto `'png'`): `'png' | 'jpg' | 'jpeg' | 'svg'`.
- `quality` (por defecto `1.0`): `0–1` (solo afecta a PNG/JPG rasterizados).
- Devuelve `null` si el pad está vacío o hubo error.
- Dispara `onSave(dataUrl, format)`.

```jsx
const png  = await ref.current?.save('png', 1.0);   // transparente
const jpg  = await ref.current?.save('jpg', 0.95);  // fondo backgroundColor
const svg  = await ref.current?.save('svg');         // vectorial, calidad infinita
```

### `download(filename?, format?): Promise<void>`
Igual que `save()` pero dispara la descarga del navegador.

```jsx
await ref.current?.download('mi-firma', 'png'); // descarga mi-firma.png
```

### `toBlob(format?, quality?): Promise<Blob | null>`
Devuelve un `Blob`, ideal para subir a un servidor vía `FormData`.

```jsx
const blob = await ref.current?.toBlob('png');
const fd = new FormData();
fd.append('signature', blob, 'firma.png');
await fetch('/api/upload', { method: 'POST', body: fd });
```

### `isEmpty(): boolean`
`true` si no hay trazos.

```jsx
if (ref.current?.isEmpty()) alert('Firma primero');
```

### `getSvg(): SVGSVGElement | null`
Devuelve el elemento `<svg>` del DOM (útil para inspección o manipulación avanzada).

### `enterFullscreen(): Promise<void>`
Pone el pad en pantalla completa (Fullscreen API). En móvil, si `lockLandscape` está
activado, intenta bloquear la orientación a horizontal y se oculta el scroll del body.

### `exitFullscreen(): Promise<void>`
Sale de pantalla completa. Restaura scroll y desbloquea la orientación.

### `toggleFullscreen(): Promise<void>`
Alterna entre entrar y salir.

### `isFullscreen(): boolean`
Indica si el pad está actualmente en pantalla completa.

```jsx
<button onClick={() => ref.current?.toggleFullscreen()}>
  {ref.current?.isFullscreen() ? 'Salir' : 'Pantalla completa'}
</button>
```

> **Nota móvil:** la tecla `ESC` sale de pantalla completa de forma nativa. El bloqueo de
> orientación `landscape` funciona en Chrome/Android; **iOS Safari no soporta**
> `screen.orientation.lock`, por lo que en iPhone el pad entrará en fullscreen pero no
> forzará la rotación del sistema.

---

## 7. Hook `useSignPad(options)`

### Parámetros (`options`)

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `onSave` | `(dataUrl, format) => void` | Igual que la prop `onSave`. |
| `onClear` | `() => void` | Igual que la prop `onClear`. |
| `cursor` | `string` | Se reenvía a `<SignPad cursor=...>`. |
| `lockLandscape` | `boolean` | Se reenvía a `<SignPad lockLandscape=...>`. |

### Valor de retorno

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ref` | `Ref` | Pásalo a `<SignPad ref={ref} />`. |
| `signPadProps` | `object` | Props listas para esparcir: `{ ref, onSave, onClear, onChange, cursor?, lockLandscape? }`. |
| `clear` | `() => void` | Limpia y sincroniza `isEmpty`. |
| `undo` | `() => void` | Deshace. |
| `save(format?, quality?)` | `Promise<string \| null>` | Delega en el ref. |
| `download(filename?, format?)` | `Promise<void>` | Delega en el ref. |
| `toBlob(format?, quality?)` | `Promise<Blob \| null>` | Delega en el ref (quality por defecto `0.92`). |
| `getSvg()` | `() => SVGSVGElement \| null` | Delega en el ref. |
| `enterFullscreen` / `exitFullscreen` / `toggleFullscreen` | `() => Promise<void>` | Control de pantalla completa. |
| `isEmpty` | `boolean` (reactivo) | Estado vacío en tiempo real. |
| `isFullscreen` | `boolean` (reactivo) | Estado de pantalla completa en tiempo real. |

---

## 8. CSS y clases

**El CSS es opcional.** La librería aplica los estilos críticos **inline** en el
`<svg>`, así que funciona sin importar nada:

- `touch-action: none` → el dibujo táctil no hace scroll de la página.
- `backgroundColor` → el fondo se pinta aunque no importes el CSS.
- `cursor` proporcional → va inline según `penSize`.
- `width="100%"` por defecto → el SVG ocupa el contenedor.

La hoja `signpad.css` solo añade lo **cosmético** y el modo fullscreen:

| Clase / selector | Aplicado a | Uso típico |
|------------------|------------|-------------|
| `.signpad-container` | `<div>` raíz | `display:flex`, `user-select:none`, `touch-action:none`. |
| `.signpad-canvas` | `<svg>` | `border-radius:4px`, `background:#fff`, `display:block`. |
| `.signpad-disabled` | `<svg>` | Opacidad y `pointer-events:none` cuando `disabled`. |
| `.signpad-container:fullscreen` | contenedor en FS | Hace que el pad llene el viewport (100vw×100vh). |

```css
.mi-firma .signpad-canvas {
  border: 2px solid #2196f3;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
}
```

Si **no** importas el CSS y usas pantalla completa, añade tú lo mínimo:

```css
.signpad-container:fullscreen {
  width: 100vw; height: 100vh;
  background: #fff; display: flex;
  align-items: center; justify-content: center;
}
.signpad-container:fullscreen .signpad-canvas { width: 100%; height: 100%; }
```

---

## 9. Formatos de exportación

| Formato | Fondo | Escalado | Mejor para |
|---------|--------|-----------|------------|
| `png` | Transparente | 3× (alta calidad) | Firmas sobre documentos, PNG limpio. |
| `jpg` / `jpeg` | `backgroundColor` | 3× | Cuando necesitas JPG (menor peso, sin alpha). |
| `svg` | (vectorial) | Infinito | Escalar sin pérdida, edición vectorial. |

El recorte inteligente usa el *bounding box* de los trazos + 20 px de padding, por lo que
no se exporta el canvas completo sino **solo la firma**.

---

## 10. Cursor

La prop `cursor` controla el puntero sobre el área de dibujo:

- `'proportional'` (default): un círculo SVG del diámetro de `penSize` (acotado a 8–100 px).
  El usuario ve el grosor real del trazo antes de firmar.
- `'crosshair'`: cruz estándar.
- `'none'`: sin cursor (útil en pantalla completa táctil).
- `string` personalizado: cualquier valor CSS válido (`'grab'`, `url(...) 4 4, auto'`, etc.).

```jsx
<SignPad cursor="proportional" penSize={8} />  {/* círculo de 8px */}
<SignPad cursor="none" />                       {/* oculto en fullscreen táctil */}
```

---

## 11. Pantalla completa y orientación

```jsx
const { signPadProps, toggleFullscreen, isFullscreen } = useSignPad({
  lockLandscape: true, // fuerza horizontal en móvil (Chrome/Android)
});

<SignPad {...signPadProps} height={300} />
<button onClick={toggleFullscreen}>
  {isFullscreen ? 'Salir de pantalla completa' : 'Firmar a pantalla completa'}
</button>
```

Comportamiento:
1. `requestFullscreen()` sobre el contenedor.
2. Se añade `overflow:hidden` al `body` (evita scroll accidental).
3. Si `lockLandscape`, intenta `screen.orientation.lock('landscape')`.
4. Al salir (botón o `ESC`) se restauran scroll y orientación.

---

## 12. Ejemplos completos

### Formulario con validación

```jsx
function SignatureForm() {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ref.current?.isEmpty()) { alert('Firma requerida'); return; }
    const url = await ref.current.save('png');
    setSrc(url);
    // enviar url al backend...
  };

  return (
    <form onSubmit={handleSubmit}>
      <SignPad ref={ref} height={200} />
      <button type="button" onClick={() => ref.current?.clear()}>Limpiar</button>
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Subir al servidor

```jsx
const blob = await ref.current?.toBlob('png');
const fd = new FormData();
fd.append('signature', blob, 'firma.png');
await fetch('/api/upload', { method: 'POST', body: fd });
```

### En un modal

```jsx
function Modal({ onClose }) {
  const ref = useRef(null);
  const save = async () => {
    const url = await ref.current?.save('png');
    onClose(url);
  };
  return (
    <div className="overlay">
      <SignPad ref={ref} height={300} />
      <button onClick={save}>Guardar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
```

---

## 13. Accesibilidad

El `<svg>` tiene `role="img"` y `aria-label="Área de firma digital"`. El pad es un lienzo
no textual; si necesitas cumplimiento estricto (WCAG), añade instrucciones visibles y un
botón de "limpiar" con etiqueta, y considera un `<label>` asociado.

---

## 14. Rendimiento y bundle

- Depende solo de `perfect-freehand` (se incluye en el bundle; `react`, `react-dom` y
  `prop-types` son externos).
- Exportación rasterizada a 3× con anti-aliasing para nitidez; ajusta `quality` si
  necesitas menor peso.
- El `viewBox` se fija al montar, por lo que los trazos se reescalan sin pérdida al
  cambiar el tamaño del contenedor.

---

## 15. Migración / notas

- Esta versión usa **Pointer Events** + `setPointerCapture`: el trazo continúa aunque el
  puntero salga del área del pad, y cada movimiento registra **un único punto** (sin
  duplicados).
- Los tipos TypeScript se publican en `dist/index.d.ts`; no necesitas configuración extra.
