import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { MODAL_SIZES, ModalSize } from '../../../consts/components/modal/modal.const';
import { isPlatformBrowser } from '@angular/common';

import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-modal',
  imports: [A11yModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  private platformId = inject(PLATFORM_ID);

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
   */
  closeLabel = input<string>('');

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

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
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
