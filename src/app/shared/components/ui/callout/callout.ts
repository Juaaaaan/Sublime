import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

/**
 * Aviso de proceso (nodo `3:1581` del frame «WEB Contacto»): fondo tenue, borde izquierdo
 * de 4px en verde de marca, radio de 2px y texto de 14px en italica.
 *
 * Se extrae como primitivo porque el mismo aviso reaparece en carrito y personalizacion
 * (decision D-9 del change `ui-primitives-sublime`).
 *
 * No lleva texto propio: el mensaje llega por `<ng-content>`, y es contenido normal del
 * documento, sin `role` ni `aria-hidden`, para que se lea como parte del formulario.
 */
@Component({
  selector: 'app-callout',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class Callout {
  /**
   * `computed()` y no un getter ni una cadena cruda en la plantilla, por coherencia con
   * el resto de primitivos (decision D-5): si el aviso gana variantes, el punto de
   * extension ya esta donde debe.
   *
   * Padding: el nodo da 20/16/15/16 y no hay token de 20px ni de 15px. Se usan los
   * nombrados mas cercanos, `p-sm` (16px) con `pl-md` (24px) a la izquierda, en lugar de
   * inventar valores arbitrarios: +4px a la izquierda y +1px arriba frente al diseno.
   */
  readonly classes = computed(
    () =>
      'bg-surface-container-low border-l-4 border-deep-moss rounded-field p-sm pl-md font-sans text-body-sm italic text-deep-moss',
  );
}
