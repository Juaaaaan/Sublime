import { Injectable } from '@angular/core';

/**
 * Generador de identificadores unicos para los primitivos de UI.
 *
 * Vive en el inyector y no en el modulo a proposito (decision D-7 del change
 * `ui-primitives-sublime`). Un contador de modulo (`let n = 0`) persiste entre
 * bootstraps del mismo proceso: al prerenderizar varias rutas seguidas, la segunda ruta
 * arranca en el valor que dejo la primera mientras el cliente arranca en 1, asi que el
 * `name` o el `id` generado no coincide entre servidor y cliente y la hidratacion avisa.
 *
 * El inyector raiz, en cambio, se recrea en cada bootstrap: el contador vuelve a 0 en el
 * servidor y en el cliente, y el orden de instanciacion de los componentes es el mismo en
 * los dos pasos, asi que el identificador resultante es identico.
 */
@Injectable({ providedIn: 'root' })
export class UiIdService {
  private readonly counters = new Map<string, number>();

  /**
   * Devuelve el siguiente identificador para un prefijo, de la forma `<prefijo>-<n>`
   * empezando en 1. Cada prefijo lleva su propia cuenta, para que anadir un primitivo
   * nuevo no desplace la numeracion de los demas.
   */
  next(prefix: string): string {
    const next = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, next);
    return `${prefix}-${next}`;
  }
}
