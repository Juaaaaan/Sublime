import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  ElementRef,
  input,
  output,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { MODAL_SIZES, ModalSize } from '../../../consts/components/modal/modal.const';
import { isPlatformBrowser } from '@angular/common';

import { A11yModule } from '@angular/cdk/a11y';
import { UiIdService } from '../../../../core/services/ui-id/ui-id.service';

@Component({
  selector: 'app-modal',
  imports: [A11yModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  private platformId = inject(PLATFORM_ID);

  /** Id base del dialogo, generado por el inyector: identico en servidor y en cliente (D-7). */
  private readonly uid = inject(UiIdService).next('modal');

  /** Id del titulo, para nombrar el dialogo con `aria-labelledby` cuando hay titulo. */
  readonly titleId = `${this.uid}-title`;

  /** El fondo oscuro, el elemento que recibe los clics de la zona exterior al panel. */
  private readonly backdrop = viewChild<ElementRef<HTMLElement>>('backdrop');

  /** `overflow` que tenia el `body` antes de bloquear el scroll; `null` si no esta bloqueado. */
  private previousBodyOverflow: string | null = null;

  isOpen = input<boolean>(false);
  size = input<ModalSize>('md');
  title = input<string>('');
  closeable = input<boolean>(true);
  /**
   * Etiqueta accesible del boton de cierre. La aporta quien usa el modal, ya traducida por
   * Transloco: un primitivo no lleva texto de UI propio, y el boton es solo icono, asi que
   * sin etiqueta queda anunciado como "button" a secas.
   *
   * Es `required`: con un valor por defecto vacio, olvidarla producia en silencio un
   * boton de solo icono sin nombre accesible, justo lo contrario del escenario
   * «Icon-only controls are labelled».
   */
  closeLabel = input.required<string>();

  closed = output<void>();

  constructor() {
    /**
     * Bloqueo de scroll solo en navegador: todas las rutas se prerenderizan
     * (`RenderMode.Prerender`), asi que un acceso a `document` sin guarda rompe la build.
     * Al cerrar se restaura el valor previo en lugar de fijarlo a vacio, para no pisar un
     * bloqueo de scroll de otro componente (decision D-8).
     */
    effect(() => {
      const open = this.isOpen();
      if (!isPlatformBrowser(this.platformId)) return;

      if (open) {
        if (this.previousBodyOverflow === null) {
          this.previousBodyOverflow = document.body.style.overflow;
        }
        document.body.style.overflow = 'hidden';
        return;
      }

      if (this.previousBodyOverflow !== null) {
        document.body.style.overflow = this.previousBodyOverflow;
        this.previousBodyOverflow = null;
      }
    });
  }

  close(): void {
    if (this.closeable()) {
      this.closed.emit();
    }
  }

  /**
   * Cierra al pulsar fuera del panel. Compara contra el elemento del backdrop y no solo
   * contra `currentTarget`: el backdrop es un hijo `absolute inset-0` que cubre todo el
   * overlay, asi que cualquier clic de una persona en la zona oscura impacta en el hijo
   * y la comparacion anterior nunca se cumplia.
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.backdrop()?.nativeElement || event.target === event.currentTarget) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  /** `computed()` y no un getter: bajo zoneless + `OnPush` un getter no se reevalua de forma fiable (D-5). */
  readonly panelClasses = computed(() => {
    const base =
      'relative bg-surface w-full mx-margin-safe flex flex-col shadow-ambient rounded-lg max-h-[90vh]';

    return `${base} ${MODAL_SIZES[this.size()]}`;
  });
}
