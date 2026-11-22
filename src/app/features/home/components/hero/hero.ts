import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';

@Component({
  selector: 'app-hero',
  imports: [ButtonComponent, TranslocoPipe],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  shopCollections = output();
  ourStory = output();
}
