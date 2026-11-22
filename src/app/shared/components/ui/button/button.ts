import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonSize, ButtonVariant } from '../../../consts/components/button/button.const';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  clicked = output<void>();

  /**
   * Nodo `3:1584` del frame «WEB Contacto»: fondo `deep-moss`, texto blanco y radio de 2px.
   * `secondary` y `ghost` conservan radio, tipografia y transicion de la primaria.
   */
  protected readonly variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-deep-moss text-on-primary hover:opacity-90',
    // Borde `deep-moss` y no `outline-variant`: #c5c7bf da 1.62:1 sobre el fondo de pagina,
    // por debajo del 3:1 que SC 1.4.11 exige al limite de un control. `docs/DESIGN.md`
    // describe este boton con borde Dark Green.
    secondary:
      'bg-transparent border border-deep-moss text-on-surface hover:bg-surface-container-low',
    ghost: 'bg-transparent text-on-surface hover:opacity-70',
  };

  /**
   * `md` es el tamano medido en Figma (32px horizontal / 14px vertical). 32px existe como
   * token nombrado (`margin-safe`); 14px no tiene token, se usa el nombrado mas cercano
   * (`sm`, 16px) en lugar de inventar un valor arbitrario. La escala mantiene la
   * proporcion 2:1 horizontal/vertical en los tres tamanos: 16/8, 32/16, 48/24.
   */
  protected readonly sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-sm py-xs',
    // 32/14 exactos del nodo 3:1584; py-sm (16px) daria 48px de alto frente a los 44 del diseno
    md: 'px-cta-x py-cta-y',
    lg: 'px-lg py-md',
  };

  /**
   * La etiqueta usa `text-cta` (12px con caja de 16px y peso 600 en el propio token) y no
   * `text-label-sm font-semibold`: `text-label-sm` tiene interlineado 1, asi que con el
   * padding vertical de 14px el boton `md` medía 40px en lugar de los 44 del nodo `3:1584`.
   */
  readonly classes = computed(() => {
    const base =
      'inline-flex items-center cursor-pointer justify-center gap-xs rounded-field font-sans text-cta uppercase tracking-cta transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:pointer-events-none';
    const width = this.fullWidth() ? 'w-full' : '';
    return `${base} ${this.variantClasses[this.variant()]} ${this.sizeClasses[this.size()]} ${width}`;
  });

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
