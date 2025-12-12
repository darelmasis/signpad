# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.2.0] - 2025-11-30

### ✨ Añadido
- **Exportación Inteligente**: Solo guarda los trazos sin fondo innecesario usando bounding box
- **Alta Calidad**: Exportación 3x con anti-aliasing para imágenes ultra-nítidas
- **Modo Fullscreen**: Pantalla completa optimizada para móviles con rotación automática
- **Rotación Landscape**: Fuerza orientación horizontal en móviles portrait
- **Hook `useSignPad`**: API alternativa basada en hooks con estado reactivo
- **Cursor Proporcional**: El cursor se ajusta dinámicamente al `penSize`
- **ViewBox Dinámico**: Escalado correcto en diferentes tamaños de pantalla
- **Callbacks `onChange`**: Notificación en tiempo real de cambios en el canvas
- **Método `isFullscreen()`**: Verifica el estado de pantalla completa
- **Métodos fullscreen**: `enterFullscreen()`, `exitFullscreen()`, `toggleFullscreen()`
- **Salida con ESC**: Tecla Escape para salir de fullscreen
- **Bloqueo de Scroll**: Previene scroll del body en fullscreen móvil

### 🎨 Mejorado
- **Calidad de Exportación**: PNG con fondo transparente, JPG con fondo blanco
- **Performance**: Memoización de cursor y opciones de trazo
- **Responsive**: 100% width por defecto con viewBox adaptativo
- **Touch**: Mejor manejo de eventos táctiles con coordenadas precisas
- **CSS Modular**: Estilos organizados con clases específicas
- **Accesibilidad**: ARIA labels mejorados

### 🐛 Corregido
- Dibujo se detenía al salir del área del pad
- Cursor no coincidía con el grosor real del trazo
- Callbacks de `useSignPad` no se ejecutaban correctamente
- Coordenadas incorrectas en viewBox rotado
- Exportación incluía todo el canvas en vez de solo trazos

### ⚠️ Breaking Changes
- **Eliminado**: Hook `useSignature` (usar `useSignPad` o `ref` directamente)
- **Eliminado**: Botones integrados (implementar botones custom)
- **Eliminado**: Prop `innerRef` (usar `ref` estándar de React)
- **Cambiado**: Color por defecto de `#000000` a `#0004a6` (azul)
- **Cambiado**: Exportación ahora solo guarda trazos (sin fondo completo)
- **Cambiado**: Calidad por defecto de `0.92` a `1.0` (máxima)

### 📦 Dependencias
- Agregado: `prop-types` para validación en desarrollo
- Actualizado: `perfect-freehand` a última versión

### 🏗️ Arquitectura
- **Modularización**: Código organizado en `utils/` (stroke, pointer, export, cursor, boundingBox)
- **Constantes**: Valores por defecto centralizados en `constants.js`
- **Hooks**: Hook personalizado en `hooks/useSignPad.js`
- **CSS**: Estilos separados con soporte para fullscreen y rotación

## [0.1.0] - 2025-11-29

### ✨ Añadido
- Lanzamiento inicial
- Componente `SignPad` básico con perfect-freehand
- Exportación a PNG, JPG y SVG
- Métodos `clear()`, `undo()`, `save()`, `download()`, `toBlob()`
- Props personalizables: `penSize`, `penColor`, `thinning`, etc.
- Soporte touch y mouse
- Callbacks `onSave` y `onClear`

---

## Tipos de Cambios

- `Añadido` para nuevas características
- `Mejorado` para cambios en funcionalidad existente
- `Obsoleto` para características que serán removidas
- `Eliminado` para características removidas
- `Corregido` para corrección de bugs
- `Seguridad` para vulnerabilidades
