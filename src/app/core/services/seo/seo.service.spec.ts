import { Component, DOCUMENT, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';

import { SeoService } from './seo.service';
import { environment } from '../../../../environments/environment';
import { TRANSLOCO_CONST_CONFIG } from '../../../shared/consts/translations/transloco.const';
import es from '../../../../../public/i18n/es.json';
import en from '../../../../../public/i18n/en.json';

@Component({ template: '' })
class Page {}

describe('SeoService', () => {
  let router: Router;
  let document: Document;

  const canonical = () =>
    document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot(TRANSLOCO_CONST_CONFIG)],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'contacto', component: Page, data: { seo: 'contact' } },
          { path: 'stock', component: Page, data: { seo: 'stock' } },
          { path: 'sin-seo', component: Page },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
    TestBed.inject(TranslocoService).setActiveLang('es');
    TestBed.inject(SeoService).init();
  });

  afterEach(() => document.head.querySelector('link[rel="canonical"]')?.remove());

  it('should set title, description and canonical for the current route', async () => {
    await router.navigateByUrl('/contacto?utm=x');

    expect(TestBed.inject(Title).getTitle()).toBe(es.seo.contact.title);
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe(
      es.seo.contact.description,
    );
    expect(canonical()).toBe(`${environment.appUrl}/contacto`);
  });

  it('should keep a single canonical link and update it on navigation', async () => {
    await router.navigateByUrl('/contacto');
    await router.navigateByUrl('/stock');

    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(canonical()).toBe(`${environment.appUrl}/stock`);
  });

  it('should translate the metadata and document language when the language changes', async () => {
    await router.navigateByUrl('/stock');

    TestBed.inject(TranslocoService).setActiveLang('en');

    expect(TestBed.inject(Title).getTitle()).toBe(en.seo.stock.title);
    expect(document.documentElement.lang).toBe('en');
  });

  it('should leave the metadata untouched on a route without SEO data', async () => {
    await router.navigateByUrl('/contacto');
    await router.navigateByUrl('/sin-seo');

    expect(canonical()).toBe(`${environment.appUrl}/contacto`);
  });

  it('should fall back to the Spanish locale for a language without one', async () => {
    const transloco = TestBed.inject(TranslocoService);
    spyOn(transloco, 'getActiveLang').and.returnValue('fr');

    await router.navigateByUrl('/stock');

    expect(TestBed.inject(Meta).getTag('property="og:locale"')?.content).toBe('es_ES');
  });
});
