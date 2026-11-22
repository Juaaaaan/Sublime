# Proposal

## Why

Los 7 primitivos de UI (`src/app/shared/components/ui/*`) y la capa de tokens de `src/tailwind.css` no coinciden con el diseño aprobado en Figma, y arrastran clases de Tailwind **inexistentes** que no generan ningún CSS: `font-label-sm` (35 usos), `font-body-md` (8), `font-h3` (2), `shadow-soft` (2), `pb-base` (1), `mb-mb` (4). Dos tests afirman esas clases rotas (`radio-group.spec.ts:108`, `product-card.spec.ts:88`), por lo que están verdes sobre estilo que no se aplica. Todas las páginas del rediseño (changes 2-16) se construyen sobre estos primitivos: si no se arreglan primero, cada página hereda el desfase.

Además, la auditoría del Figma invalida una premisa de `docs/DESIGN.md`: **no hay ni un título serif en el archivo**. Los 14 frames usan **Nunito Sans** variable (`YTLC 500, wdth 100`), nunca Noto Serif ni Manrope. El archivo de Figma **no tiene variables** (`get_variable_defs` → `{}`), así que la única fuente de tokens es el código.

## What Changes

**Tokens (`src/tailwind.css`, `src/styles.scss`, `src/index.html`)**

- **BREAKING** Fuentes: `--font-sans` pasa a `'Nunito Sans', sans-serif`; `--font-serif` se **elimina** y con él la regla `h1,h2,h3 { font-family: var(--font-serif) }` de `styles.scss:9-12`. El `<link>` de Google Fonts en `index.html:11` carga Nunito Sans variable (incluida la itálica) en lugar de Noto Serif + Manrope.
- **BREAKING** Escala tipográfica realineada a las medidas de Figma (D3 resuelto: *Figma manda en tipografía*):
  - `--text-h1` 48px / lh 51.84px / `--tracking-h1` −1.2px, peso Bold
  - `--text-h2` 32px / lh 38.4px / `--tracking-h2` −0.64px, peso SemiBold
  - `--text-h3` 24px (sin cambio de tamaño)
  - nuevo `--text-lead` 24px / lh 31.2px (hero subtítulo, Light Italic)
  - `--text-label-sm` 12px / lh 16px, `--tracking-label` **0.6px** (antes 0.1em = 1.2px)
  - nuevo `--tracking-cta` 1.92px (botón primario) y `--tracking-eyebrow` 1.2px (antecabeza de sección)
  - `--text-body-md` mantiene 16px; nuevo `--text-body-sm` 14px (valor real de inputs y textarea en Figma)
- Nuevos tokens de forma, medidos en Figma (D3 resuelto: *formas de Figma, color de DESIGN.md*): `--radius-field` 2px (inputs, textarea, select, botones), `--radius-chip` 12px.
- Nuevo token de color `--color-outline-field` `#e2e8df` (borde real de los campos; `outline-variant` `#c5c7bf` se conserva para divisores) y `--color-placeholder` `rgba(140,156,130,0.7)`. El resto de la paleta MD3 de `docs/DESIGN.md` **no se toca**.
- Utilidades `@utility` para las composiciones tipográficas que hoy se invocan con clases inexistentes, de modo que `font-label-sm`, `font-body-md` y `font-h3` dejen de usarse: se sustituyen por `text-label-sm`/`text-body-md`/`text-h3` más los tokens de tracking.

**Primitivos (`src/app/shared/components/ui/*`)**

- `Button`: fondo `deep-moss`, `--radius-field`, padding 32/14, label 12px SemiBold uppercase `--tracking-cta`. Variantes `primary` / `secondary` (borde) / `ghost`.
- `Badge`: se elimina `font-label-sm` de su cadena base (`badge.ts:17`).
- Nuevo primitivo `Chip` (`app-chip`), que no existe en el código: píldora `--radius-chip`, 12px ExtraBold uppercase, estado activo `deep-moss`/blanco e inactivo `surface-container-low`/`deep-moss`. Lo exige el filtro de categorías del Home y de Joyería.
- `Input`, `TextArea`, `Select`: fondo blanco, borde 1px `outline-field`, `--radius-field`, padding 15/11, texto 14px, placeholder `--color-placeholder`; etiqueta 12px SemiBold uppercase encima del campo.
- `Select` y `TextArea` pasan a `ChangeDetectionStrategy.OnPush` (hoy no lo declaran, contra `CLAUDE.md`).
- `Badge`, `Modal` y `Select` cambian sus getters de cadena de clases por `computed()` (hoy son getters no reactivos bajo OnPush).
- `RadioGroup`: el `name` por defecto deja de generarse con `Math.random()` en la inicialización del campo (`radio-group.ts:21`), que produce markup distinto en servidor y en cliente; pasa a un contador determinista por instancia.
- `Modal`: el bloqueo de scroll deja de escribir `document.body.style` sin guarda (`modal.ts:32-37`); se protege con `isPlatformBrowser`. `MODAL_SIZES` deja de usar clases crudas de Tailwind y pasa a tokens.
- Nuevo primitivo `Callout` (`app-callout`): aviso con borde izquierdo de 4px e itálica, usado en el formulario de contacto (`3:1581`) y reutilizable en carrito y personalización.

**Limpieza transversal**

- Se corrigen los 52 usos de clases sin token en los 20 ficheros afectados (incluidos `pb-base` y el typo `mb-mb`).
- Los 2 tests que afirman clases rotas se reescriben contra las clases reales.
- `docs/DESIGN.md` se actualiza para reflejar Nunito Sans, los radios de Figma y los tokens nuevos; deja de prometer Noto Serif/Manrope.

## Capabilities

### New Capabilities

- `ui-primitives`: contrato de los primitivos compartidos (Button, Chip, Badge, Input, Select, TextArea, RadioGroup, Modal, Callout) y de la capa de tokens que consumen: tipografía, forma, color de campo, estados (hover, foco, deshabilitado, error), accesibilidad y comportamiento seguro en SSR.

### Modified Capabilities

Ninguna. Se revisaron los 4 specs existentes (`cart-drawer`, `product-card`, `scroll-reveal-directive`, `stock-page`): ninguno fija clases de Tailwind ni tipografía, así que la limpieza de clases sin token no altera ningún requisito publicado. Lo que sí hay que reescribir son dos **tests** que afirman clases sin CSS (`radio-group.spec.ts:108`, `product-card.spec.ts:88`), y eso es implementación, no spec.

## Non-goals

- No se rediseña ninguna página. Navbar, footer, home, joyería, carrito, etc. llegan en los changes 2-16 del roadmap; aquí solo se arreglan las clases sin token que aparecen en sus plantillas actuales.
- No se toca el responsive móvil (change 15) ni el pase de SEO/accesibilidad global (change 16).
- No se cambia el esquema de Supabase, ni los servicios de `core`, ni el enrutado.
- No se actualizan dependencias (Angular 22 es el change 17). Nunito Sans se carga por `<link>` de Google Fonts, como las fuentes actuales; no se añade ningún paquete npm.
- No se añaden textos nuevos de UI: los primitivos reciben sus cadenas por `input()` desde las páginas. **Excepción surgida al verificar (tarea 7.1):** `select.ts` traía `'Selecciona una opción'` como valor por defecto y `contact.html` no pasaba placeholder, así que ese texto se saltaba Transloco por completo y salía en español también en inglés. Como el requisito «los primitivos no llevan texto de UI propio» es de este mismo change, se corrige aquí: el defecto pasa a cadena vacía y se añade la clave `contact.subjectPlaceholder` en `es.json` y `en.json` (una línea por fichero), con el texto del nodo `3:1574`. Es el único cambio de i18n del change.
- No se crea un Storybook ni una página de catálogo de componentes.

## Decisiones pendientes

- **D3 — resuelto en esta sesión** (consta aquí porque el roadmap lo marcaba abierto): la tipografía la manda Figma → Nunito Sans en toda la UI, cero serif. En forma y espaciado manda Figma; en color manda la paleta MD3 de `docs/DESIGN.md`.
- **D2 — bilingüe o solo español (no bloquea este change).** Sigue abierta y afecta a los changes 2+. Hoy Transloco tiene `defaultLang: 'en'` mientras el Figma está casi todo en español. Los primitivos no llevan texto propio, así que se pueden implementar sin cerrarla; conviene cerrarla antes del change 2 (`layout-navbar-footer`).
- **D8 — logo y fotos reales.** No bloquea: ningún primitivo de este change lleva imagen.

## Impact

- **Tokens y estilos globales**: `src/tailwind.css` (líneas 79-132: fuentes, escala de texto, tracking, radios, nuevos colores de campo), `src/styles.scss:9-12` (se elimina la regla serif), `src/index.html:11` (`<link>` de fuentes).
- **Primitivos**: los 7 componentes de `src/app/shared/components/ui/*` con sus `.html`, `.ts`, `.const.ts` y `.spec.ts`, más 2 primitivos nuevos (`chip`, `callout`).
- **Consumidores afectados por la limpieza de clases** (20 ficheros): `shared/components/product-card`, `shared/components/layout/{navbar,footer}`, `shared/components/cart-drawer` y las plantillas de `features/{home,contact,collections,health-care}`.
- **Tests**: `radio-group.spec.ts:108` y `product-card.spec.ts:88` afirman clases sin CSS y deben reescribirse. Cobertura exigida: 80% por fichero (`karma.config.js:14-26`, `check.each`).
- **Riesgo visual**: el cambio de familia tipográfica altera el aspecto de **todas** las páginas existentes a la vez. Es intencional (alinea con Figma) y es la razón de que este change vaya primero y en serie, sin paralelo.
- **Documentación**: `docs/DESIGN.md` (bloque `typography`, `rounded` y la sección "Typography"/"Components").
- **Frames de Figma consultados**: `3:2` «WEB Home - Sublime Craft Art (Edición Original + En el Taller)» (nodos `3:13` H1/lead, `3:68` antecabeza + H2 + píldoras de filtro), `3:1536` «WEB Contacto» (nodo `3:1545`, formulario completo: etiquetas, input, select, textarea, callout, botón), `3:2905` «Home - Sublime Craft Art (Nueva Propuesta)» (nodo `3:2940`, H1, confirma la tipografía en la variante alternativa).
