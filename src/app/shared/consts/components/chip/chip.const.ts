/**
 * Contrato visual del chip de filtro (nodos `3:73` y `3:75` del frame `3:2` «WEB Home»).
 *
 * Forma de pildora de 12px (`rounded-chip`), padding 16/6 (`px-sm py-chip-y`) y etiqueta
 * de 12px en mayusculas ExtraBold con tracking 0.6px (`text-label-sm font-extrabold
 * uppercase tracking-label`). El color no entra aqui: lo aporta `CHIP_STATE_CLASSES`.
 *
 * Lleva `border` de 1px en los dos estados, y `h-6` fija la altura del nodo (24px): con
 * `box-sizing: border-box` el borde cabe dentro de esos 24px, asi que anadir el limite
 * visible que exige SC 1.4.11 no engorda el chip a 26px ni lo hace saltar al seleccionarlo.
 */
export const CHIP_BASE_CLASSES =
  'inline-flex h-6 items-center justify-center rounded-chip border px-sm py-chip-y font-sans text-label-sm font-extrabold uppercase tracking-label transition-colors duration-300';

/**
 * Los dos estados del chip. Seleccionado es el nodo `3:73` (fondo `#2c3528` con texto
 * blanco) y no seleccionado el `3:75` (fondo `#f3f5eb` con texto `#2c3528`).
 *
 * El no seleccionado anade `border-outline` (`#757871`, 4.49:1 sobre la pagina): su fondo
 * `#f3f5eb` sobre `#f8faf0` da 1.04:1, asi que sin borde el control era invisible. El
 * seleccionado repite su propio fondo como color de borde, para conservar el aspecto del
 * nodo sin cambiar de tamano entre estados.
 */
export const CHIP_STATE_CLASSES = {
  selected: 'bg-deep-moss text-on-primary border-deep-moss',
  unselected: 'bg-surface-container-low text-deep-moss border-outline',
} as const;

/**
 * Lo que solo aplica al chip accionable. El anillo de foco es el mismo patron que
 * `ButtonComponent`, para que el indicador de foco del sitio sea uno y no dependa
 * solo del color.
 */
export const CHIP_INTERACTIVE_CLASSES =
  'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
