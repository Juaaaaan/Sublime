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
- [ ] 2. Entornos: `fileReplacements` y `appUrl`. Aceptación: el bundle de producción usa `appUrl` del dominio.
- [ ] 3. Ocultar enlaces a "Personaliza" (menú y pie). Aceptación: ningún `href="/personaliza"`.
- [ ] 4. SEO: título, descripción, canónica y Open Graph por ruta, `robots.txt`, `sitemap.xml`, idioma. Aceptación: presentes en el HTML prerenderizado.

## Verificación
Línea base: 399 tests, lint y lint:tokens correctos.

## Siguiente paso
Tarea 2.
