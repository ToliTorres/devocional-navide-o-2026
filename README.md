# Devocional Navideño 2026 · El amor que nos une

Invitación digital en forma de libro. Sitio estático para GitHub Pages (no requiere servidor).

- **Celular:** una página por vista. Se pasa la hoja deslizando, tocando la página o con los botones ‹ ›.
- **Escritorio (≥ 860 px):** libro abierto a doble página; clic en la página derecha avanza y en la izquierda regresa. También funcionan las flechas del teclado.

Páginas: Portada → Bienvenida → Programa → Te esperamos (mapa y calendario) → Contraportada.

## Publicación
1. Sube el contenido de esta carpeta al repositorio (`index.html` en la raíz).
2. En GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Estructura
Los estilos y el código van dentro de `index.html`. **Borra del repositorio** los archivos viejos `styles.css`, `script.js` y `assets/fondo-original.png`: ya no se usan.

- `index.html`
- `assets/logo.png`
- `assets/arbol-arcoiris.webp` (y `arbol-arcoiris.png` como respaldo)
- `assets/fondo-burbujas.svg` (fondo de burbujas recreado a partir del programa)

Los nombres y las mayúsculas/minúsculas deben conservarse exactamente.

## Ediciones rápidas
- Textos y horarios: en `index.html`, cada página es una `<section class="page">`.
- Enlace de calendario: en `index.html` busca `dates=20261212T180000/20261212T220000` para cambiar la hora de término.
