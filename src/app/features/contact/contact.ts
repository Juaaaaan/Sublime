import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { IntroPageSection } from '../../shared/components/intro-page-section/intro-page-section';

@Component({
  selector: 'app-contact',
  imports: [TranslocoDirective, NgOptimizedImage, IntroPageSection],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly contactInfo = environment.contact;
}
