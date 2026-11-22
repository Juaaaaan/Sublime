# Roadmap — Rediseño Sublime con OpenSpec

Fuente de diseño: Figma `kAEGwQ9NFWaPwyGqI0s8MT` (una sola página, `0:1`, frames de escritorio de 1280px, **sin versión móvil**).
Sistema de diseño: `docs/DESIGN.md`. Convenciones: `CLAUDE.md`.

## Cómo trabajar (para Claude Code)

1. **Un change de OpenSpec por fila del roadmap**, en el orden de abajo. Nunca un change gigante para toda la web.
2. Flujo de cada change: `/opsx:explore` (solo si hay dudas) → `/opsx:propose` → revisión del usuario → `/opsx:apply` (`developer`) → `qa` → `design-qa` (si hay UI) → `reviewer` → PR del usuario → `/opsx:archive`.
3. Antes de proponer un change, **leer su frame en Figma** (`get_design_context` + `get_screenshot`) y el código actual de la feature.
4. Subagentes:
   - `Explore`: para mapear el código o buscar usos antes de proponer (solo lectura).
   - `developer`: implementa las tareas de un change.
   - `qa`: verifica de forma independiente (lint, cobertura por fichero, build, SSR) y escribe los tests que falten.
   - `design-qa`: solo lectura; compara con Figma y `docs/DESIGN.md` y revisa accesibilidad y UX.
   - `data`: solo para changes que tocan Supabase (4, 7, 12); propone SQL y revisa RLS, no aplica nada.
   - `reviewer`: revisión final contra `tasks.md` y `CLAUDE.md` antes de dar la PR por lista.
   - Subagentes de propósito general con `isolation: worktree`: para changes **independientes entre sí** (ver columna "Paralelo"). Los cambios que tocan los mismos ficheros (`app.routes.ts`, `public/i18n/*.json`, `src/tailwind.css`) se hacen en serie.
5. Reglas de oro: ramas desde `develop`; PR a `develop` (nunca `main`); el push y la PR los hace el usuario; no actualizar dependencias; no aplicar cambios de Supabase sin confirmación (se propone el SQL en `design.md`).
6. Cada change termina con `npm run test:coverage`, `npm run lint` y `npm run build` en verde, y con textos en es/en por Transloco.
7. **Si un change depende de una decisión pendiente (tabla de abajo), preguntar al usuario antes de proponerlo.** No inventar contenido.

## Orden de los changes

| #   | Change (nombre)          | Qué incluye                                                                                                                           | Frames Figma                         | Paralelo     |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------ |
| 1   | `ui-primitives-sublime`  | Button, Badge, Input, Select, TextArea, RadioGroup, Modal alineados con DESIGN.md; arreglar `font-label-sm` (clase sin CSS, ~30 usos) | todos (referencia)                   | no           |
| 2   | `layout-navbar-footer`   | Navbar y footer nuevos; enlaces y rutas del menú                                                                                      | `3:2` (cabecera/pie)                 | no           |
| 3   | `home-redesign`          | Home: hero con cifras, series, "Latest Release", manifiesto                                                                           | `3:2` y/o `3:2905` (ver decisión D1) | sí (con 5-8) |
| 4   | `catalog-data-model`     | Revisar tablas `products`, `stock_items`, `product_images` frente al catálogo del diseño. Solo propuesta SQL                          | `3:750`, `3:3361`                    | no           |
| 5   | `jewelry-page`           | Página `/joyeria`: categorías (pendientes, colgantes, pulseras, earcuff, chokers)                                                     | `3:750`, `3:3361`                    | sí           |
| 6   | `stock-page-update`      | Stock disponible según el nuevo diseño                                                                                                | `3:2550`                             | sí           |
| 7   | `cart-whatsapp-checkout` | Página `/carrito`: cesta, envío 3,99 € (gratis desde 45 €), mensaje de WhatsApp, descuentos (D4)                                      | `3:2139`                             | no           |
| 8   | `customize-piece`        | Página `/personaliza`: cuestionario (tipo, colores, tamaño, resina, enganches, descripción)                                           | `3:1651`, `3:2749`, `4:2` (D1, D2)   | sí           |
| 9   | `care-times-update`      | Cuidados y tiempos (fabricación, secado, envío)                                                                                       | `3:356`                              | sí           |
| 10  | `contact-update`         | Contacto: teléfono obligatorio, aviso de que el encargo no se formaliza hasta hablar                                                  | `3:1536`                             | sí           |
| 11  | `collections-update`     | Colecciones                                                                                                                           | `3:3251`                             | sí           |
| 12  | `workshops-page`         | Página `/talleres`: 3 talleres, razones, formulario de reserva (D5)                                                                   | `3:1741`                             | sí           |
| 13  | `tote-bags-page`         | Página `/tote-bags` (D6: el frame solo tiene el título)                                                                               | `3:1335`                             | sí           |
| 14  | `policy-returns-page`    | Política de envíos y devoluciones (no hay frame; el texto sale del carrito y de Cuidados)                                             | `3:2139`, `3:356`                    | sí           |
| 15  | `mobile-responsive-pass` | Revisión móvil de todas las páginas (grid de 4 columnas, márgenes de 16 px). No hay frames móviles                                    | —                                    | no           |
| 16  | `seo-a11y-polish`        | Metadatos, accesibilidad (WCAG AA), rendimiento de imágenes                                                                           | —                                    | no           |
| 17  | `angular-22-migration`   | `ng update` a Angular 22 (quita las 19 vulnerabilidades moderadas de herramientas de desarrollo)                                      | —                                    | no           |

## Mapa de frames de Figma

| Frame (id) | Nombre                                                   |
| ---------- | -------------------------------------------------------- |
| `3:2`      | WEB Home (Edición Original + En el Taller)               |
| `3:356`    | WEB Cuidados y Tiempos                                   |
| `3:750`    | WEB Joyería (Carrito Interactivo)                        |
| `3:1335`   | WEB Tote Bags                                            |
| `3:1536`   | WEB Contacto                                             |
| `3:1651`   | WEB Personalización (Redesign)                           |
| `3:1741`   | WEB Talleres                                             |
| `3:2139`   | WEB Carrito de Compra Interactivo                        |
| `3:2550`   | Stock Disponible                                         |
| `3:2749`   | Personaliza tu Pieza (Updated) — en inglés               |
| `3:2905`   | Home (Nueva Propuesta)                                   |
| `3:3251`   | Colecciones (Updated)                                    |
| `3:3361`   | Joyería                                                  |
| `4:2`      | Html → Body (formulario de personalización con WhatsApp) |

## Decisiones pendientes (preguntar al usuario)

| Id  | Decisión                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Hay 2 Home, 2 Joyería y 3 Personalización. ¿Cuál es la definitiva de cada una? (sospecha: las "Updated" en inglés son de una iteración anterior) |
| D2  | ¿Sitio bilingüe (es/en) o solo español? Hay títulos en inglés mezclados con cuerpo en español. Hoy Transloco tiene `defaultLang: 'en'`           |
| ~~D3~~ | **RESUELTA 2026-11-22.** Comprobado en Figma (nodos `3:15`, `3:71`, `3:1549`, `3:2941`): no hay ni un título serif, todo el archivo usa **Nunito Sans** variable, y el archivo no publica variables. Decisión: **tipografía y forma las manda Figma; el color lo manda `docs/DESIGN.md`** (paleta MD3 intacta). `--font-serif` se elimina. Se aplica en el change 1 `ui-primitives-sublime` |
| D4  | Reglas de descuentos del carrito (qué tipos, cuándo aplican) y si el precio con descuento se calcula en cliente o en Supabase                    |
| D5  | Talleres: precios, fechas, aforo y qué hace el formulario (¿email con Resend, WhatsApp o ambos?)                                                 |
| D6  | Tote bags: catálogo, precios y fotos                                                                                                             |
| D7  | Pagos: el diseño ofrece Bizum, Revolut y transferencia tras hablar con la clienta. ¿Se elimina Stripe del proyecto?                              |
| D8  | Logo y fotos reales: pendientes. Hasta entonces, usar marcadores de posición con `NgOptimizedImage`                                              |
| D9  | Móvil: nadie lo ha revisado. Se hace en el change 15 a partir de DESIGN.md                                                                       |

## Definición de terminado (cada change)

- Todas las tareas de `tasks.md` marcadas con prueba.
- `npm run test:coverage` (80% por fichero), `npm run lint`, `npm run build` en verde.
- Textos en es y en; sin colores hex ni valores arbitrarios.
- Revisión del agente `reviewer` sin hallazgos bloqueantes.
- Change archivado con `/opsx:archive`.
