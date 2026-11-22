import { TestBed } from '@angular/core/testing';

import { ProductsService } from './products.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Product, StockItem } from '../../../shared/models/products/products.model';

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

/**
 * Minimal chainable stub of the Supabase query builder: every builder method
 * returns the builder itself, and awaiting it resolves to the given result.
 */
function createMockClient(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;

  for (const method of ['select', 'eq', 'order', 'limit']) {
    builder[method] = jasmine.createSpy(method).and.callFake(chain);
  }
  builder['then'] = (resolve: (value: QueryResult) => unknown) =>
    Promise.resolve(result).then(resolve);

  return { from: jasmine.createSpy('from').and.callFake(chain) };
}

function createService(result: QueryResult): ProductsService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: SupabaseService, useValue: { client: createMockClient(result) } }],
  });
  return TestBed.inject(ProductsService);
}

const mockProduct: Product = {
  id: 'mock',
  name: 'mock',
  slug: 'mock',
  description: 'mock',
  price: 0,
  is_customizable: false,
  category: null,
  collection: null,
  images: [],
};

describe('ProductsService', () => {
  it('should be created', () => {
    expect(createService({ data: [], error: null })).toBeTruthy();
  });

  describe('getFeaturedProducts', () => {
    it('should return the products with their images sorted by sort_order', async () => {
      const service = createService({
        data: [
          {
            ...mockProduct,
            images: [
              { url: 'b.jpg', is_primary: false, sort_order: 2 },
              { url: 'a.jpg', is_primary: false, sort_order: 1 },
            ],
          },
        ],
        error: null,
      });

      const products = await service.getFeaturedProducts();

      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(1);
      expect(products[0].images.map((i) => i.url)).toEqual(['a.jpg', 'b.jpg']);
    });

    it('should return an empty array when supabase returns an error', async () => {
      const service = createService({ data: null, error: { message: 'test error' } });

      const products = await service.getFeaturedProducts();

      expect(products).toEqual([]);
    });
  });

  describe('getAvailableStock', () => {
    it('should return a list of available stock items', async () => {
      const stockItem: StockItem = { id: 'stock-1', status: 'available', product: mockProduct };
      const service = createService({ data: [stockItem], error: null });

      const stockItems = await service.getAvailableStock();

      expect(Array.isArray(stockItems)).toBe(true);
      expect(stockItems).toEqual([stockItem]);
    });

    it('should return an empty array when supabase returns an error', async () => {
      const service = createService({ data: null, error: { message: 'test error' } });

      const stockItems = await service.getAvailableStock();

      expect(stockItems).toEqual([]);
    });
  });

  describe('getPrimaryImage', () => {
    let service: ProductsService;

    beforeEach(() => {
      service = createService({ data: [], error: null });
    });

    it('should return the primary image URL of a product', () => {
      const product = {
        ...mockProduct,
        images: [
          { url: 'image1.jpg', is_primary: false, sort_order: 2 },
          { url: 'image2.jpg', is_primary: true, sort_order: 1 },
        ],
      };

      expect(service.getPrimaryImage(product)).toBe('image2.jpg');
    });

    it('should return the first image URL if no primary image is set', () => {
      const product = {
        ...mockProduct,
        images: [
          { url: 'image1.jpg', is_primary: false, sort_order: 2 },
          { url: 'image2.jpg', is_primary: false, sort_order: 1 },
        ],
      };

      expect(service.getPrimaryImage(product)).toBe('image1.jpg');
    });

    it('should strip the token query param from the image URL', () => {
      const product = {
        ...mockProduct,
        images: [{ url: 'image1.jpg?token=abc', is_primary: true, sort_order: 1 }],
      };

      expect(service.getPrimaryImage(product)).toBe('image1.jpg');
    });

    it('should return an empty string if there are no images', () => {
      expect(service.getPrimaryImage({ ...mockProduct, images: [] })).toBe('');
    });
  });
});
