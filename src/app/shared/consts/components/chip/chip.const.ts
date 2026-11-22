/**
 * Contrato visual del chip de filtro (nodos `3:73` y `3:75` del frame `3:2` «WEB Home»).
 *
 * Forma de pildora de 12px (`rounded-chip`), padding 16/6 (`px-sm py-chip-y`) y etiqueta
 * de 12px en mayusculas ExtraBold con tracking 0.6px (`text-label-sm font-extrabold
 * uppercase tracking-label`). El color no entra aqui: lo aporta `CHIP_STATE_CLASSES`.
 */
export const CHIP_BASE_CLASSES =
  'inline-flex items-center justify-center rounded-chip px-sm py-chip-y font-sans text-label-sm font-extrabold uppercase tracking-label transition-colors duration-300';

/**
 * Los dos estados del chip. Seleccionado es el nodo `3:73` (fondo `#2c3528` con texto
 * blanco) y no seleccionado el `3:75` (fondo `#f3f5eb` con texto `#2c3528`).
 */
export const CHIP_STATE_CLASSES = {
  selected: 'bg-deep-moss text-on-primary',
  unselected: 'bg-surface-container-low text-deep-moss',
} as const;

/**
 * Lo que solo aplica al chip accionable. El anillo de foco es el mismo patron que
 * `ButtonComponent`, para que el indicador de foco del sitio sea uno y no dependa
 * solo del color.
 */
export const CHIP_INTERACTIVE_CLASSES =
  'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Teclas que activan el chip accionable, como lo haria un boton nativo. */
export const CHIP_ACTIVATION_KEYS = ['Enter', ' ', 'Spacebar'] as const;
