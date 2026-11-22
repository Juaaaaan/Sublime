export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

/**
 * Contrato visual compartido por los tres campos de formulario (nodos `3:1550`, `3:1570`
 * y `3:1578` del frame «WEB Contacto»): fondo blanco, borde de 1px del color de campo,
 * radio de 2px, padding 15/11, texto de 14px y marcador con el color de placeholder.
 *
 * Vive aqui, junto al primitivo mas basico de los tres, para que `Select` y `TextArea`
 * reutilicen la misma cadena en lugar de mantener tres copias que se desincronizan.
 *
 * El color del texto no entra aqui: el desplegable lo alterna segun tenga valor o no,
 * y dos utilidades de color en la misma cadena no tienen un ganador predecible.
 */
export const FIELD_BASE_CLASSES =
  'w-full bg-surface-container-lowest rounded-field border px-field-x py-field-y font-sans text-body-sm placeholder:text-placeholder outline-none transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none';

/** Borde del campo segun su estado de validez. El error tambien tiñe el borde. */
export const FIELD_BORDER_CLASSES = {
  default: 'border-outline-field focus:border-primary',
  error: 'border-error focus:border-error',
} as const;
