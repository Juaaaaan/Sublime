/**
 * Contrato visual del aviso de proceso (nodo `3:1581` del frame «WEB Contacto»): fondo
 * tenue, borde izquierdo de 4px en verde de marca, radio de 2px y texto de 14px en
 * italica.
 *
 * Es una constante y no un `computed()`: el aviso no tiene variantes, asi que la senal no
 * tenia dependencias y devolvia siempre la misma cadena. Vive aqui, como las de `Chip` y
 * las de los campos de formulario, para que el dia que gane variantes el punto de
 * extension ya este donde debe.
 *
 * Padding: el nodo da 20/16/15/16 y no hay token de 20px ni de 15px. Se usan los
 * nombrados mas cercanos, `p-sm` (16px) con `pl-md` (24px) a la izquierda, en lugar de
 * inventar valores arbitrarios: +4px a la izquierda y +1px arriba frente al diseno.
 */
export const CALLOUT_CLASSES =
  'bg-surface-container-low border-l-4 border-deep-moss rounded-field p-sm pl-md font-sans text-body-sm italic text-deep-moss';
