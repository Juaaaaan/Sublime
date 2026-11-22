import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CALLOUT_CLASSES } from '../../../consts/components/callout/callout.const';

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
    <div [class]="classes">
      <ng-content />
    </div>
  `,
})
export class Callout {
  /** Contrato visual del nodo. Constante: el aviso no tiene variantes (ver `callout.const.ts`). */
  readonly classes = CALLOUT_CLASSES;
}
