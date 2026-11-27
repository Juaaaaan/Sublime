import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { UiIdService } from '../../../../core/services/ui-id/ui-id.service';
import { SelectOption } from '../../../models/ui/select.model';
import {
  FIELD_BASE_CLASSES,
  FIELD_BORDER_CLASSES,
} from '../../../consts/components/input/input.const';

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

  /** Id de respaldo, generado por el inyector para que sea identico en servidor y en cliente (D-7). */
  private readonly autoId = inject(UiIdService).next('app-select');

  readonly fieldId = computed(() => this.id() || this.autoId);

  readonly messageId = computed(() => `${this.fieldId()}-message`);

  readonly describedBy = computed(() => (this.error() || this.hint() ? this.messageId() : null));

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }

  /**
   * Nodo `3:1570`: mismo contrato visual que el campo de texto, con hueco a la derecha
   * para el chevron (`pr-lg`).
   *
   * El estado sin valor usa `text-placeholder`, el mismo token que el marcador del campo
   * de texto y del area de texto: `placeholder:text-placeholder` es inerte en un
   * `<select>`, porque no existe el pseudoelemento `::placeholder`, asi que el color se
   * aplica al propio control (escenario «Placeholder styling» del spec).
   *
   * Es un `computed()` y no un getter (D-5): bajo zoneless + `OnPush` un getter solo se
   * reevalua si algo mas dispara la deteccion en este componente.
   */
  readonly selectClasses = computed(() => {
    const border = FIELD_BORDER_CLASSES[this.error() ? 'error' : 'default'];
    const textColor = this.value() ? 'text-on-surface' : 'text-placeholder';
    return `${FIELD_BASE_CLASSES} pr-lg cursor-pointer appearance-none ${border} ${textColor}`;
  });
}
