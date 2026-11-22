# Design

## Context

Motivación en `proposal.md` → *Why*. Estado actual relevante, verificado en el código:

- `src/tailwind.css` (133 líneas) ya declara **todos** los tokens que nombra `docs/DESIGN.md`: paleta MD3 completa (líneas 7-75), `--font-serif`/`--font-sans` (79-80), escala `--text-*` con interlineado emparejado (83-98), `--tracking-*` (101-104), radios (108-113), espaciado (117-124), `--container-content` (128) y `--shadow-ambient` (132). No falta ningún token de la lista de DESIGN.md.
- El problema es el inverso: hay **52 usos de clases que no existen** repartidos en 20 ficheros — `font-label-sm` (35), `font-body-md` (8), `font-h3` (2), `shadow-soft` (2), `mb-mb` (4, typo), `pb-base` (1). Tailwind v4 no falla con una utilidad desconocida: simplemente no emite CSS, así que el desfase es silencioso.
- Los 7 primitivos existen en `src/app/shared/components/ui/*`, todos con `.spec.ts`, y todos sus `.scss` están **vacíos** (0 bytes): el estilo es 100% utilidades Tailwind en plantilla o en cadenas construidas en TS.
- `src/styles.scss` (13 líneas) fija la familia del `body` desde `--font-sans` (3-7) y fuerza serif en `h1,h2,h3` (9-12).
- Angular 21 **zoneless**: un getter que devuelve una cadena de clases no se reevalúa de forma fiable bajo `OnPush`. Hoy lo hacen `badge.ts:15`, `modal.ts:57` y `select.ts:28`.
- Prerender de todas las rutas (`app.routes.server.ts`, `RenderMode.Prerender`), por lo que cualquier acceso a `document` sin guarda rompe el build, no solo el runtime. `modal.ts:32-37` escribe `document.body.style.overflow` dentro de un `effect()`.
- Cobertura exigida al 80% **por fichero** (`karma.config.js:14-26`, `check.each`), con `src/tailwind.css` incluido en los estilos del target de test (`angular.json`), así que las clases con token sí resuelven en los tests.
- El archivo de Figma **no publica variables** (`get_variable_defs` sobre `3:2` → `{}`). Los valores se han leído del contexto de diseño de los nodos; no hay sincronización automática posible.

## Goals / Non-Goals

**Goals:**

- Dejar la capa de tokens como única fuente de verdad del estilo, sin clases huérfanas.
- Alinear tipografía y forma con lo medido en Figma, manteniendo la paleta MD3 del proyecto.
- Dejar los 9 primitivos reactivos, `OnPush` y seguros en prerender, con API estable para los changes 2-16.
- Hacer el desfase detectable de forma automática, para que no vuelva a aparecer en los 16 changes siguientes.

**Non-Goals (de diseño, los de alcance están en el proposal):**

- No se introduce una capa de componentes de terceros (Angular Material, Spartan, etc.): el estilo es demasiado específico y la dependencia no se justifica para 9 primitivos.
- No se crea un sistema de variantes con CVA o similar; las cadenas de clases se mantienen en `computed()` dentro de cada componente.
- No se autogeneran tokens desde Figma: sin variables publicadas no hay nada que sincronizar.
- No se cambia la API pública de los primitivos salvo donde el spec lo exige, para no romper los consumidores actuales.

## Decisions

### D-1. Nunito Sans sustituye a las dos familias, y `--font-serif` se elimina

Figma usa Nunito Sans en los 3 nodos auditados de 3 frames distintos (`3:15` y `3:2941` en los dos Home, `3:71` en secciones, `3:1549`/`3:1552` en formularios), con pesos Light/Regular/SemiBold/Bold/ExtraBold y una itálica. No aparece ni un nodo serif.

Se elimina el token `--font-serif` en lugar de dejarlo apuntando a Nunito Sans. Un alias serif que no es serif es exactamente el tipo de trampa que ha causado este change: quien escriba `font-serif` en el change 5 creerá que está pidiendo un serif. Al borrar el token, `font-serif` pasa a ser una clase inexistente y la comprobación automática del punto D-6 la caza.

Consecuencia: los 18 usos actuales de `font-serif` y la regla `h1,h2,h3` de `styles.scss:9-12` desaparecen; los títulos heredan la familia del `body`.

El `<link>` de `index.html:11` pasa a una sola petición con rango de pesos e itálica:
`family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000`. Se conservan los `preconnect` (9-10).

*Alternativa descartada:* self-host de la fuente en `public/`. Mejora privacidad y elimina un dominio externo, pero es un cambio de infraestructura ajeno a este change y el proyecto ya carga Google Fonts.

*Alternativa descartada:* mantener Manrope para cuerpo. Rompe la fidelidad con el Figma sin ganancia, y obliga a cargar dos familias.

### D-2. `fontVariationSettings` de Figma se ignora

Todos los nodos traen `"YTLC" 500, "wdth" 100`. `wdth: 100` es el valor por defecto y `YTLC` (lowercase height) no es un eje de Nunito Sans: son residuos del exportador. No se añade `font-variation-settings` a ningún token.

### D-3. Qué valor gana cuando Figma y DESIGN.md discrepan

Regla acordada: **forma y tipografía de Figma; color de DESIGN.md.** Resultado:

| Propiedad | Hoy en `tailwind.css` | Figma | Decisión |
| --- | --- | --- | --- |
| Familia | `Noto Serif` + `Manrope` | Nunito Sans | Figma (D-1) |
| `--text-h1` / lh / tracking | 3rem / 1.2 / −0.02em | 48px / 51.84px / −1.2px | Figma: `3rem` / `1.08` / `-0.025em` |
| `--text-h2` / lh / tracking | 2rem / 1.3 / −0.01em | 32px / 38.4px / −0.64px | Figma: `2rem` / `1.2` / `-0.02em` |
| `--text-label-sm` tracking | 0.1em (= 1.2px) | 0.6px en labels, 1.2px en antecabezas | Se separan: `--tracking-label` `0.05em`, nuevo `--tracking-eyebrow` `0.1em` |
| Tracking de CTA | no existe | 1.92px sobre 12px | nuevo `--tracking-cta` `0.16em` |
| Radio de campo y botón | `--radius` 4px | 2px | nuevo `--radius-field` `0.125rem`; `--radius` se mantiene para el resto |
| Radio de chip | `--radius-full` | 12px | nuevo `--radius-chip` `0.75rem` |
| Borde de campo | `outline-variant` `#c5c7bf` | `#e2e8df` | nuevo `--color-outline-field`; `outline-variant` sigue siendo el divisor |
| Placeholder | no existe | `rgba(140,156,130,.7)` | nuevo `--color-placeholder`, derivado de `sage-leaf` |
| Fondo de botón primario | `on-surface` `#191d17` | `#2c3528` | Figma: `deep-moss`, que **ya existe** como token |
| Color de título | `on-surface` `#191d17` | `#2c3528` | Figma: `deep-moss`, token existente |
| Paleta restante | MD3 | hex sueltos | DESIGN.md, sin cambios |

Los tres valores de color que Figma aporta y la paleta no tenía (`#e2e8df`, el placeholder y nada más) entran como tokens nuevos; no se toca ningún color MD3 existente. Los tamaños se expresan en `rem` para no romper el zoom del navegador, y los tracking en `em` para que escalen con el tamaño de fuente, que es lo que Figma expresa en px absolutos.

Tokens nuevos añadidos: `--text-lead` (1.5rem / 1.3), `--text-body-sm` (0.875rem / 1.43), `--tracking-cta`, `--tracking-eyebrow`, `--radius-field`, `--radius-chip`, `--color-outline-field`, `--color-placeholder`.

### D-4. Las clases inexistentes se sustituyen una a una, sin crear alias

Hay dos caminos: declarar `@utility font-label-sm { … }` para que las 35 llamadas actuales funcionen, o reemplazar cada uso por las clases con token.

Se elige reemplazar. `font-*` en Tailwind significa familia o peso; usar ese prefijo para una composición de tamaño + tracking + mayúsculas perpetúa la confusión que generó el bug, y el change 15 (móvil) tendría que lidiar con dos vocabularios. La sustitución es mecánica y está acotada:

| Clase inexistente | Sustitución |
| --- | --- |
| `font-label-sm` (35) | `text-label-sm font-semibold tracking-label uppercase` |
| `font-body-md` (8) | `text-body-md` |
| `font-h3` (2) | `text-h3` |
| `shadow-soft` (2) | `shadow-ambient` |
| `pb-base` (1) | `pb-sm` |
| `mb-mb` (4) | `mb-md` |

`pb-base` → `pb-sm` y `mb-mb` → `mb-md` son los valores que el layout pide a ojo en el frame correspondiente; al no haber generado nunca CSS, no hay apariencia previa que preservar.

### D-5. Clases en `computed()`, nunca en getters

Bajo zoneless + `OnPush`, un getter solo se reevalúa si algo más dispara la detección en ese componente. `Button`, `Input` y `TextArea` ya usan `computed()`; `Badge` (`badge.ts:15`), `Modal` (`modal.ts:57`) y `Select` (`select.ts:28`) pasan a `computed()`. Es un cambio interno: la plantilla sigue leyendo `classes()`/`panelClasses()` como una llamada.

`Select` y `TextArea` añaden `changeDetection: ChangeDetectionStrategy.OnPush`, que hoy no declaran.

### D-6. Una comprobación automática impide que vuelvan las clases huérfanas

Sin esto, los 15 changes siguientes reintroducen el bug. Se añade un test unitario de la capa de tokens (`src/app/shared/tokens.spec.ts`) que:

1. lee `src/tailwind.css` y extrae los nombres de token de `@theme`;
2. recorre las plantillas y las cadenas de clases de `src/app/**`;
3. falla listando cualquier clase `text-*`, `tracking-*`, `font-*`, `shadow-*`, `rounded-*`, `max-w-*` o de espaciado cuyo sufijo no corresponda a un token ni a una utilidad nativa de Tailwind.

Va como test y no como regla de ESLint porque la lista de utilidades válidas depende del contenido de `tailwind.css`, que ESLint no resuelve; y porque así entra en la misma puerta (`npm test`) que ya bloquea el pre-commit vía Husky. La lista de utilidades nativas permitidas se mantiene explícita en el propio test.

*Alternativa descartada:* `eslint-plugin-tailwindcss`. A fecha de hoy no soporta la detección de tokens de `@theme` de Tailwind v4, que es justo lo que hace falta.

### D-7. `RadioGroup`: contador de módulo en lugar de `Math.random()`

`radio-group.ts:21` inicializa el `name` con `Math.random()` en la declaración del campo, así que servidor y cliente generan valores distintos y el markup hidratado no coincide. Se sustituye por un contador incremental a nivel de módulo (`radio-group-${++counter}`): el orden de instanciación durante el prerender y durante la hidratación es el mismo, luego el valor coincide.

*Alternativa descartada:* `inject(APP_ID)` + índice. Más indirecto y no aporta nada sobre el contador.

### D-8. `Modal`: guarda de plataforma y restauración del valor previo

El `effect()` de `modal.ts:32-37` pasa a comprobar `isPlatformBrowser(inject(PLATFORM_ID))` antes de tocar el documento, y guarda el `overflow` previo del `body` para restaurarlo al cerrar, en lugar de fijarlo a vacío. `MODAL_SIZES` deja de mapear a `max-w-sm|max-w-lg|max-w-2xl|max-w-full mx-sm` y pasa a usar `--container-*` y espaciado con token. Se mantiene `A11yModule` del CDK para el focus trap: ya es dependencia y cubre el requisito de foco del spec.

### D-9. Dos primitivos nuevos, no variantes de los existentes

- **`Chip`**: el diseño lo usa como filtro con estado (`3:73`-`3:84`) con radio 12px y peso ExtraBold. `Badge` es un indicador no interactivo con otra forma y otro peso; meter el estado seleccionado y el rol de botón dentro de `Badge` mezclaría dos responsabilidades. Se crea `app-chip` aparte, con una entrada `interactive` que decide si renderiza `<button>` o `<span>`.
- **`Callout`**: el aviso de `3:1581` reaparece en carrito y personalización. Se extrae ahora para que los changes 7 y 8 lo reutilicen en vez de duplicar el markup.

Ambos siguen la estructura de carpetas existente (`ui/<name>/` con `.ts`, `.html`, `.spec.ts` y constantes en `shared/consts/components/<name>/`), y su plantilla es inline solo si cabe en ~10 líneas, según `CLAUDE.md`.

### D-10. Orden de ejecución: tokens primero, limpieza después

El orden importa porque la fase intermedia es visualmente inconsistente: si se tocan antes los primitivos, quedan apuntando a tokens que aún no existen. Secuencia: (1) tokens + fuente + `styles.scss` + `index.html`; (2) sustitución de las clases huérfanas en los 20 ficheros y, **al final de ese mismo grupo**, el test de la capa de tokens, que entra ya en verde; (3) primitivos uno a uno, cada uno con su spec; (4) `Chip` y `Callout`; (5) `docs/DESIGN.md`.

El test de la capa de tokens se añade **después** de la limpieza, no antes. Añadirlo antes lo dejaría fallando a propósito durante todo el grupo de sustituciones, y el pre-commit de Husky ejecuta lint y cobertura completos en cada commit: habría commits en rojo o tentación de `--no-verify`. La enumeración de clases huérfanas que iba a dar ese test ya está hecha (52 usos, con fichero y línea, en el propio `tasks.md`), así que no se pierde nada usándolo como red de seguridad a posteriori en lugar de como guía.

## Risks / Trade-offs

- **El cambio de familia altera a la vez el aspecto de todas las páginas existentes.** → Es el objetivo, no un efecto colateral, y es la razón por la que el roadmap marca este change como no paralelo. Se verifica contra los screenshots de los frames `3:2` y `3:1536` antes de cerrar.
- **Nunito Sans tiene métricas distintas a Noto Serif/Manrope: cambian los saltos de línea y algún bloque puede desbordar.** → El pase de verificación revisa Home, Contacto y Stock, que son las páginas con más texto hoy. Los desbordes de layout que no provengan del cambio de fuente se anotan y se dejan para el change de la página correspondiente, no se arreglan aquí.
- **Los valores de Figma se han leído de 3 frames, no de los 14.** → Los tres nodos coinciden entre sí y cubren título, antecabeza, lead, etiqueta, campo, select, textarea, aviso, botón y chip. Si un change posterior encuentra un valor distinto en su frame, se trata como excepción de esa página y, si se repite, se promueve a token entonces.
- **Borrar `--font-serif` rompe los 18 usos de `font-serif` de golpe.** → Entran en la misma lista de sustitución del paso 3 y el test de D-6 garantiza que no quede ninguno.
- **Los dos tests que afirman clases sin CSS se reescriben, lo que reduce momentáneamente la red de seguridad.** → Se reescriben para afirmar la clase con token equivalente en el mismo elemento, no se borran.
- **El test de D-6 puede dar falsos positivos con utilidades nativas poco comunes** (`text-center`, `text-balance`, `font-light`). → Su lista de permitidas es explícita y está en el propio fichero; añadir una utilidad legítima es una línea.
- **Deuda conocida que no se aborda:** `footer.ts:8` declara `standalone: true` (redundante en Angular 21) y `footer.ts`, `select.ts`, `text-area.ts` e `intro-page-section.ts` no son `OnPush`. De esos, este change solo arregla `select` y `text-area`, que son primitivos. `footer` e `intro-page-section` caen en el change 2 y en el de su página.

## Migration Plan

No hay migración de datos, de API ni de esquema: el cambio es de capa de presentación y se despliega con el propio build.

- **Verificación antes de cerrar**: `npm run test:coverage` (80% por fichero), `npm run lint`, `npm run build`; prerender de todas las rutas sin error; y comparación visual de Home, Contacto y Stock contra sus frames.
- **Rollback**: revertir el merge del change. No queda estado persistido, ni migración de Supabase, ni fichero de i18n tocado, así que el revert es completo. El único efecto externo es la petición de fuente a Google Fonts, que vuelve a la anterior con el mismo revert.
- **Orden respecto al roadmap**: este change debe estar en `develop` antes de empezar el change 2; los changes 3-14 asumen estos primitivos y estos tokens.

## Open Questions

- Ninguna que bloquee. **D2** (sitio bilingüe o solo español) sigue abierta pero no afecta aquí: los primitivos no llevan texto propio y este change no toca `public/i18n/*.json`. Conviene cerrarla antes del change 2.
