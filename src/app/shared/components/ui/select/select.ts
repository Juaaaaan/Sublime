import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SelectOption } from '../../../models/ui/select.model';
import {
  FIELD_BASE_CLASSES,
  FIELD_BORDER_CLASSES,
} from '../../../consts/components/input/input.const';

/** Contador de modulo para el id de respaldo: estable entre servidor y cliente. */
let nextSelectId = 0;

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  id = input<string>('');
  label = input<string>('');
  /** Lo aporta quien usa el select, ya traducido: un primitivo no lleva texto de UI propio. */
  placeholder = input<string>('');
  options = input<SelectOption[]>([]);
  value = input<string>('');
  error = input<string>('');
  hint = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);

  valueChange = output<string>();

  private readonly autoId = `app-select-${++nextSelectId}`;

  readonly fieldId = computed(() => this.id() || this.autoId);

  readonly messageId = computed(() => `${this.fieldId()}-message`);

  readonly describedBy = computed(() => (this.error() || this.hint() ? this.messageId() : null));

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }

  /**
   * Nodo `3:1570`: mismo contrato visual que el campo de texto, con hueco a la derecha
   * para el chevron (`pr-lg`) y el texto del marcador en `deep-moss`, como en el diseno.
   *
   * Es un `computed()` y no un getter (D-5): bajo zoneless + `OnPush` un getter solo se
   * reevalua si algo mas dispara la deteccion en este componente.
   */
  readonly selectClasses = computed(() => {
    const border = FIELD_BORDER_CLASSES[this.error() ? 'error' : 'default'];
    const textColor = this.value() ? 'text-on-surface' : 'text-deep-moss';
    return `${FIELD_BASE_CLASSES} pr-lg cursor-pointer appearance-none ${border} ${textColor}`;
  });
}
