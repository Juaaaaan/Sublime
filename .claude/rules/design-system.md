# Design System — Sublime Craft Art (Botanical Minimalism)

Sistema de diseño de **Sublime**. Todos los ficheros de UI deben respetar estas reglas.
Los tokens están definidos en `src/tailwind.css` vía `@theme`. Las fuentes se cargan en `src/index.html`.

---

## Personalidad de marca

Artesanía táctil + calma botánica. La UI es **gallery-like**: recede para dejar que la fotografía de producto domine. Todo debe sentirse deliberado y suave, mimando el acabado de la resina pulida.

Estilo: **Botanical Minimalism** — verdes salvia/musgo sobre marfil cálido. Fuente de verdad del diseño: `DESIGN.md` (documento del Project).

---

## Colores — Paleta MD3 Tonal

Usa **siempre los tokens Tailwind**, nunca valores hex en línea.

| Rol                   | Token Tailwind                | Hex       | Uso                                                             |
| --------------------- | ----------------------------- | --------- | --------------------------------------------------------------- |
| Fondo principal       | `bg-surface`                  | `#f8faf0` | Canvas de página, Ivory Surface                                 |
| Cards / highlights    | `bg-surface-container-lowest` | `#ffffff` | Cards de producto, blanco puro                                  |
| Fondo tenue           | `bg-surface-container-low`    | `#f3f5eb` | Secciones alternadas                                            |
| Fondo sección         | `bg-surface-container`        | `#edefe5` | Bloques de contenido                                            |
| Texto principal       | `text-on-surface`             | `#191d17` | Verde casi negro, máx. contraste                                |
| Texto secundario      | `text-on-surface-variant`     | `#444841` | Gris verdoso, cuerpo                                            |
| CTA / acción primaria | `bg-primary`                  | `#172014` | Verde muy oscuro                                                |
| Texto sobre primario  | `text-on-primary`             | `#ffffff` | Texto en botones primarios                                      |
| Bloque de contraste   | `bg-primary-container`        | `#2c3528` | Deep Moss (fondo OSCURO; usar con `text-on-primary-container`)  |
| Acento / chip claro   | `bg-secondary-container`      | `#d4e5c8` | Chips y badges claros                                           |
| Acento secundario     | `text-secondary`              | `#54634c` | Verde salvia oscuro, enlaces                                    |
| Bordes / divisores    | `border-outline-variant`      | `#c5c7bf` | Decorativo, 1px (contraste 1.6:1, no usar para texto/controles) |
| Bordes fuertes        | `border-outline`              | `#757871` | Bordes de controles, con contraste                              |
| Error                 | `text-error`                  | `#ba1a1a` | Mensajes de error                                               |

Tokens de marca (aliases): `bg-ivory-surface` `#f8faf0`, `bg-forest-mist` `#d2dcd0`, `bg-deep-moss` `#2c3528`, `sage-leaf` `#8c9c82`.
⚠️ `sage-leaf` es **solo decorativo** (líneas, iconos grandes, fondos): como texto sobre `surface` da 2.77:1 y no cumple WCAG AA.

**Regla de oro:** Evita sombras pesadas. Define límites con `border border-outline-variant` (1px). Para elevación (modals, carrito flotante): `shadow-ambient` (`0 12px 32px rgba(44,53,40,0.04)`).

---

## Tipografía

Fuente única: **Nunito Sans** variable, con itálica. **No hay familia serif**: `--font-serif` y `--font-mono` están cerradas con `initial` en `@theme`, así que `font-serif` y `font-mono` no emiten CSS y `npm run lint:tokens` las rechaza. Tampoco hace falta escribir `font-sans`: es la familia del `body`.

| Escala   | Clase Tailwind                                          | Tamaño y peso       | Uso                      |
| -------- | ------------------------------------------------------- | ------------------- | ------------------------ |
| h1       | `text-h1 tracking-h1`                                       | 48px, Bold 700      | Hero headlines           |
| h2       | `text-h2 tracking-h2`                                       | 32px, SemiBold 600  | Títulos de sección       |
| h3       | `text-h3`                                                   | 24px, SemiBold 600  | Subsecciones             |
| lead     | `text-lead italic`                                          | 24px, Light 300     | Subtítulo de hero        |
| body-lg  | `text-body-lg`                                              | 18px                | Párrafos lead            |
| body-md  | `text-body-md`                                              | 16px                | Cuerpo de texto          |
| body-sm  | `text-body-sm`                                              | 14px                | Campos, texto pequeño    |
| label-md | `text-label-md font-semibold tracking-label-md`             | 14px                | Navegación               |
| label-sm | `text-label-sm font-semibold tracking-label uppercase`      | 12px                | Etiquetas de campo, tags |
| eyebrow  | `text-label-sm font-semibold tracking-eyebrow uppercase`    | 12px                | Antecabezas de sección   |
| CTA      | `text-label-sm font-semibold tracking-cta uppercase`        | 12px                | Etiquetas de botón       |

El peso de h1-h3 y lead lo pone el propio token (`--text-h*--font-weight`): no añadas `font-bold`. Una clase `font-*` explícita sigue ganando si la quieres a propósito.

Variante móvil de h2: `text-h2-mobile` (28px). Úsala por debajo de `md:` y `md:text-h2` a partir de ahí.

```html
<!-- ✅ Correcto -->
<h1 class="text-h1 tracking-h1 text-on-surface">Bespoke Creations</h1>
<p class="text-body-md text-on-surface-variant">Descripción de producto</p>
<span
  class="text-label-sm font-semibold tracking-label uppercase bg-secondary-container text-on-secondary-container rounded-chip px-sm py-chip-y"
  >Organic Resin</span
>

<!-- ❌ Incorrecto -->
<h1 style="font-size: 48px; font-family: 'Nunito Sans';">...</h1>
<h1 class="text-h1 font-serif">...</h1>
<!-- font-serif no emite CSS: lint:tokens lo rechaza -->
<p class="text-gray-500 text-base">...</p>
```

---

## Espaciado

Tokens nombrados definidos en `@theme`. Favorecer gaps `lg` y `xl` entre secciones principales.

| Token         | Valor | Uso                          |
| ------------- | ----- | ---------------------------- |
| `xs`          | 8px   | Padding interno mínimo       |
| `sm`          | 16px  | Padding estándar             |
| `md`          | 24px  | Separación entre elementos   |
| `lg`          | 48px  | Gap entre secciones          |
| `xl`          | 80px  | Gap entre bloques hero       |
| `section-gap` | 80px  | Gap vertical entre secciones |
| `gutter`      | 24px  | Gutter de grid               |
| `margin-safe` | 32px  | Margen lateral seguro        |

```html
<!-- ✅ Separación aireada entre secciones -->
<section class="py-xl">...</section>
<div class="gap-lg grid">...</div>

<!-- ❌ Valores arbitrarios sin necesidad -->
<section class="py-[80px]">...</section>
```

---

## Componentes — Patrones

### Botones

```html
<!-- Primario: sólido dark, texto blanco, transición lenta -->
<button
  class="bg-deep-moss text-on-primary rounded-field px-cta-x py-cta-y text-label-sm font-semibold uppercase tracking-cta transition-all duration-300 hover:opacity-90"
>
  INITIATE COMMISSION
</button>
<!-- Mejor aun: usa el primitivo <app-button>, no repitas la cadena -->

<!-- Secundario: transparente, borde suave -->
<button
  class="border border-outline-variant rounded-field px-cta-x py-cta-y text-label-sm font-semibold uppercase tracking-cta transition-all duration-300 text-on-surface hover:bg-surface-container-low"
>
  VIEW SERIES
</button>
```

### Cards de producto

```html
<div class="bg-surface-container-lowest rounded-lg p-md">
  <!-- Sin borde. Separación por whitespace o fondo tenue -->
</div>
```

### Chips / Tags

```html
<span
  class="rounded-chip bg-surface-container-low text-deep-moss text-label-sm font-extrabold uppercase tracking-label px-sm py-chip-y"
>
  Gold Plated
</span>
<!-- Mejor aun: usa <app-chip>, que ya maneja seleccionado / no seleccionado y el rol accesible -->
```

### Campos de input

```html
<!-- Borde completo de 1px (nodo 3:1550). Mejor aun: usa <app-input> -->
<label class="text-label-sm font-semibold uppercase tracking-label text-deep-moss block mb-xs">
  Email
</label>
<input
  class="w-full bg-surface-container-lowest border border-outline-field rounded-field px-field-x py-field-y text-body-sm text-on-surface placeholder:text-placeholder outline-none focus:border-primary transition-colors duration-300"
/>
<!-- La ayuda y el error van en text-label-sm en caja normal, nunca en mayusculas -->
```

### Navegación

```html
<nav class="bg-surface/80 backdrop-blur-[10px] border-b border-outline-variant sticky top-0 z-50">
  <!-- Header centrado, persistente -->
</nav>
```

---

## Layout

- Grid de 12 columnas, max-width 1200px en desktop (`max-w-content`)
- Secciones de storytelling → centradas
- UI funcional de compra → alineada a la izquierda
- Padding interno generoso en cards y contenedores (mínimo `p-md`)

```html
<div class="max-w-content mx-auto px-gutter">
  <!-- contenido -->
</div>
```

---

## Shapes (radios de borde)

| Uso                | Clase           | Valor |
| ------------------ | --------------- | ----- |
| Botones y campos   | `rounded-field` | 2px   |
| Cards pequeñas     | `rounded-md`    | 6px   |
| Cards de producto  | `rounded-lg`    | 8px   |
| Chips / pills      | `rounded-chip`  | 12px  |

---

## Reglas prohibidas

- ❌ Valores hex en línea (`text-[#172014]`); la sombra de elevación es el token `shadow-ambient`
- ❌ Sombras pesadas (`shadow-lg`, `drop-shadow`)
- ❌ Colores Tailwind genéricos (`text-gray-500`, `bg-white`, `border-gray-200`)
- ❌ Transiciones rápidas (`duration-100`, `duration-150`) — mínimo `duration-300`
- ❌ Fuentes distintas a Nunito Sans; en particular `font-serif` y `font-mono`, que no emiten CSS
- ❌ Texto de UI dentro de un primitivo: todo llega por `input()` o `<ng-content>`, ya traducido por Transloco
- ❌ Tamaños de fuente fuera de la escala tipográfica definida
