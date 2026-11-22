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
    secondary:
      'bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-low',
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

  readonly classes = computed(() => {
    const base =
      'inline-flex items-center cursor-pointer justify-center gap-xs rounded-field font-sans text-label-sm font-semibold uppercase tracking-cta transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:pointer-events-none';
    const width = this.fullWidth() ? 'w-full' : '';
    return `${base} ${this.variantClasses[this.variant()]} ${this.sizeClasses[this.size()]} ${width}`;
  });

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
