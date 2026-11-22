export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

/**
 * Contrato visual compartido por los tres campos de formulario (nodos `3:1550`, `3:1570`
 * y `3:1578` del frame «WEB Contacto»): fondo blanco, borde de 1px, radio de 2px,
 * padding 15/11, texto de 14px y marcador con el color de placeholder.
 *
 * Vive aqui, junto al primitivo mas basico de los tres, para que `Select` y `TextArea`
 * reutilicen la misma cadena en lugar de mantener tres copias que se desincronizan.
 *
 * El color del texto no entra aqui: el desplegable lo alterna segun tenga valor o no,
 * y dos utilidades de color en la misma cadena no tienen un ganador predecible.
 *
 * El foco lleva el mismo anillo que `Button` y `Chip`
 * (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`):
 * antes el unico indicador era `focus:border-primary`, es decir un cambio de color en un
 * borde de 1px, que no cumple SC 1.4.11 ni el requisito de no depender solo del color.
 * Por eso tampoco se usa `outline-none`.
 */
export const FIELD_BASE_CLASSES =
  'w-full bg-surface-container-lowest rounded-field border px-field-x py-field-y font-sans text-body-sm placeholder:text-placeholder transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:pointer-events-none';

/**
 * Borde del campo segun su estado de validez. El error tambien tiñe el borde.
 *
 * `border-outline` (`#757871`, 4.49:1 sobre el fondo blanco del campo) y no el `#e2e8df`
 * del nodo de Figma, que daba 1.25:1: SC 1.4.11 exige 3:1 para el limite de un control,
 * asi que los campos eran practicamente invisibles. Desviacion consciente del diseno.
 */
export const FIELD_BORDER_CLASSES = {
  default: 'border-outline focus:border-primary',
  error: 'border-error focus:border-error',
} as const;
