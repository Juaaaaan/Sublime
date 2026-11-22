import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BadgeSize, BadgeVariant } from '../../../consts/components/badge/badge.const';

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  variant = input<BadgeVariant>('default');
  size = input<BadgeSize>('md');

  protected readonly variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-surface-container text-on-surface-variant',
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-surface-variant',
    outline: 'border border-outline-variant text-on-surface-variant bg-transparent',
  };

  protected readonly sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-xs py-badge-y text-label-xs',
    md: 'px-sm py-xs',
  };

  /**
   * `computed()` y no un getter: bajo zoneless + `OnPush` un getter solo se reevalua si
   * algo mas dispara la deteccion en este componente, asi que un cambio de `variant` o
   * de `size` podia no llegar al marcado (decision D-5 del change `ui-primitives-sublime`).
   */
  readonly classes = computed(() => {
    const base =
      'inline-flex items-center text-label-sm font-semibold tracking-label uppercase rounded-full transition-colors duration-300';

    return `${base} ${this.variantClasses[this.variant()]} ${this.sizeClasses[this.size()]}`;
  });
}
