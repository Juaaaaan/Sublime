import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  CHIP_BASE_CLASSES,
  CHIP_INTERACTIVE_CLASSES,
  CHIP_STATE_CLASSES,
} from '../../../consts/components/chip/chip.const';

/**
 * Chip de filtro con estado (nodos `3:73` y `3:75` del frame `3:2` «WEB Home»).
 *
 * No es una variante de `Badge`: `Badge` es un indicador no interactivo, con otra forma
 * y otro peso tipografico. Meter aqui el estado seleccionado y el rol de boton mezclaria
 * dos responsabilidades (decision D-9 del change `ui-primitives-sublime`).
 *
 * No lleva texto propio: la etiqueta llega por `<ng-content>` desde quien lo usa.
 */
@Component({
  selector: 'app-chip',
  imports: [NgTemplateOutlet],
  templateUrl: './chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {
  /** Estado visual del chip. Se expone a tecnologias de asistencia con `aria-pressed`. */
  selected = input<boolean>(false);

  /** `true` renderiza un `<button>` accionable; `false`, un `<span>` no enfocable. */
  interactive = input<boolean>(false);

  /**
   * Emite el estado al que pasa el chip al activarse, de modo que `[(selected)]`
   * funcione como enlace de dos vias para quien lo use.
   */
  selectedChange = output<boolean>();

  /**
   * `computed()` y no un getter: bajo zoneless + `OnPush` un getter solo se reevalua si
   * algo mas dispara la deteccion en este componente, asi que un cambio de `selected` o
   * de `interactive` podia no llegar al marcado (decision D-5).
   */
  readonly classes = computed(() => {
    const state = this.selected() ? CHIP_STATE_CLASSES.selected : CHIP_STATE_CLASSES.unselected;
    const interactive = this.interactive() ? CHIP_INTERACTIVE_CLASSES : '';

    return `${CHIP_BASE_CLASSES} ${state} ${interactive}`.trim();
  });

  /**
   * Activacion del chip. El `<button>` nativo ya sintetiza el click con Enter y con
   * Espacio, asi que no hace falta manejar el teclado aparte. El chip estatico no llega
   * aqui: no renderiza el boton.
   */
  onActivate(): void {
    this.selectedChange.emit(!this.selected());
  }
}
