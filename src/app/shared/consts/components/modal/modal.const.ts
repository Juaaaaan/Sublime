export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

/**
 * Ancho maximo del panel por tamano.
 *
 * Los tres primeros usan los contenedores propios `--container-modal-sm/md/lg`
 * (24rem / 32rem / 42rem). **No** se puede usar `max-w-sm`, `max-w-lg` ni `max-w-2xl`:
 * Tailwind v4 resuelve `max-w-*` contra `--spacing-*` ANTES que contra `--container-*`,
 * y este tema declara `--spacing-sm/md/lg`, asi que `max-w-lg` compilaba a
 * `max-width: var(--spacing-lg)` = 48px y el panel medio medía 48px de ancho.
 *
 * `full` pasa a `max-w-content` (`--container-content`, 1200px), el ancho de contenido del
 * sistema: es el tope real que puede tener un panel en el sitio. Antes era
 * `max-w-full mx-sm`, que ademas duplicaba el margen horizontal del panel, que ya lleva
 * `mx-margin-safe` en su clase base.
 */
export const MODAL_SIZES: Record<ModalSize, string> = {
  sm: 'max-w-modal-sm',
  md: 'max-w-modal-md',
  lg: 'max-w-modal-lg',
  full: 'max-w-content',
};
