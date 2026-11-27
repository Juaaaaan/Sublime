# Dominio, contacto y SEO básico

## Objetivo
Dejar la web lista para `https://www.sublimecraftart.es`.

## Problema
- Contacto publicado con datos de relleno y un formulario que simula el envío.
- El build de producción usa `environment.ts` (falta `fileReplacements`); `appUrl` es un marcador.
- "Personaliza" enlaza a una ruta que no existe.
- Sin descripción, canónica, Open Graph, `robots.txt` ni sitemap.

## Alcance
Incluido: los cuatro puntos anteriores.
Fuera: página "Personaliza", envío real por Resend, foto y dirección del estudio en contacto.

## Restricciones
Reglas de `CLAUDE.md`, tokens del design system, i18n con Transloco (es/en).

## Tareas
- [x] 1. Contacto: datos reales y sin formulario simulado. Aceptación: enlaces `wa.me/34690071950` y `mailto:hola@sublimecraftart.es` visibles; no hay `<form>`.
- [x] 2. Entornos: `fileReplacements` y `appUrl`. Aceptación: el bundle de producción usa `appUrl` del dominio.
- [x] 3. Ocultar enlaces a "Personaliza" (menú y pie). Aceptación: ningún `href="/personaliza"`.
- [x] 4. SEO: título, descripción, canónica y Open Graph por ruta, `robots.txt`, `sitemap.xml`, idioma. Aceptación: presentes en el HTML prerenderizado.

## Verificación
- `npm run test:coverage`: 401 tests correctos y umbrales cumplidos. `npm run lint` y `lint:tokens` correctos.
- `ng build` en una copia temporal con el incrustado de fuentes desactivado (el entorno bloquea Google Fonts): 5 rutas prerenderizadas, con contacto y etiquetas SEO correctos; sin `localhost:4200` ni datos de relleno.
- `npm run test:ssr` correcto sobre esa copia (textos esperados actualizados al español).
- Pendiente: comprobar el despliegue de Vercel con la compilación sin modificar.

## Decisión
El HTML prerenderizado pasa de inglés a español (idioma principal de la tienda). El navegador sigue cambiando al idioma del visitante.

## Siguiente paso
Revisar la PR a `develop` y publicar `develop` en `main`.
