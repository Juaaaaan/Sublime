export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

/**
 * Ancho maximo del panel por tamano.
 *
 * Los tres primeros resuelven contra el namespace de contenedor de Tailwind v4
 * (`max-w-sm` → `var(--container-sm)`, 24rem; `max-w-lg` → 32rem; `max-w-2xl` → 42rem),
 * que es la escala de tokens de contenedor disponible: `@theme` solo declara
 * `--container-content` y este change no toca la capa de tokens.
 *
 * `full` pasa a `max-w-content` (`--container-content`, 1200px), el ancho de contenido del
 * sistema: es el tope real que puede tener un panel en el sitio. Antes era
 * `max-w-full mx-sm`, que ademas duplicaba el margen horizontal del panel, que ya lleva
 * `mx-margin-safe` en su clase base.
 */
export const MODAL_SIZES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-content',
};
