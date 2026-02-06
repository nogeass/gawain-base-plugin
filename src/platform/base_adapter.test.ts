import { describe, it, expect } from 'vitest';
import {
  convertBaseProduct,
  validateBaseProduct,
  type BaseProduct,
} from './base_adapter.js';

describe('base_adapter', () => {
  const sampleProduct: BaseProduct = {
    item_id: 123,
    title: 'Test Product',
    detail: 'This is a test product description.',
    price: 1000,
    stock: 50,
    visible: 1,
    identifier: 'TEST-001',
    img1_origin: 'https://example.com/img1.jpg',
    img2_origin: 'https://example.com/img2.jpg',
    img3_origin: null,
    variations: [
      { variation_id: 101, variation: 'Red', variation_stock: 20 },
      { variation_id: 102, variation: 'Blue', variation_stock: 30 },
    ],
  };

  describe('convertBaseProduct', () => {
    it('should convert basic product fields', () => {
      const result = convertBaseProduct(sampleProduct);
      expect(result.id).toBe('123');
      expect(result.title).toBe('Test Product');
    });

    it('should include description', () => {
      const result = convertBaseProduct(sampleProduct);
      expect(result.description).toBe('This is a test product description.');
    });

    it('should extract images from img1_origin through img20_origin', () => {
      const result = convertBaseProduct(sampleProduct);
      expect(result.images).toEqual([
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
      ]);
    });

    it('should convert price to JPY format', () => {
      const result = convertBaseProduct(sampleProduct);
      expect(result.price).toEqual({ amount: '1000', currency: 'JPY' });
    });

    it('should convert variations', () => {
      const result = convertBaseProduct(sampleProduct);
      expect(result.variants).toHaveLength(2);
      expect(result.variants?.[0]).toEqual({ id: '101', title: 'Red', price: '1000' });
      expect(result.variants?.[1]).toEqual({ id: '102', title: 'Blue', price: '1000' });
    });

    it('should include metadata', () => {
      const result = convertBaseProduct(sampleProduct);
      expect(result.metadata).toEqual({
        source: 'base',
        itemId: '123',
        identifier: 'TEST-001',
        stock: 50,
        visible: true,
      });
    });

    it('should handle product without variations', () => {
      const productWithoutVariations = { ...sampleProduct, variations: undefined };
      const result = convertBaseProduct(productWithoutVariations);
      expect(result.variants).toBeUndefined();
    });

    it('should handle product with many images', () => {
      const productWithManyImages: BaseProduct = {
        item_id: 456,
        title: 'Multi-image Product',
        price: 2000,
        img1_origin: 'https://example.com/img1.jpg',
        img2_origin: 'https://example.com/img2.jpg',
        img3_origin: 'https://example.com/img3.jpg',
        img4_origin: 'https://example.com/img4.jpg',
        img5_origin: 'https://example.com/img5.jpg',
      };
      const result = convertBaseProduct(productWithManyImages);
      expect(result.images).toHaveLength(5);
    });
  });

  describe('validateBaseProduct', () => {
    it('should return true for valid product', () => {
      expect(validateBaseProduct(sampleProduct)).toBe(true);
    });

    it('should return false for null', () => {
      expect(validateBaseProduct(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(validateBaseProduct('string')).toBe(false);
    });

    it('should return false for missing item_id', () => {
      const invalid = { title: 'Test', price: 1000 };
      expect(validateBaseProduct(invalid)).toBe(false);
    });

    it('should return false for missing title', () => {
      const invalid = { item_id: 123, price: 1000 };
      expect(validateBaseProduct(invalid)).toBe(false);
    });

    it('should return false for empty title', () => {
      const invalid = { item_id: 123, title: '   ', price: 1000 };
      expect(validateBaseProduct(invalid)).toBe(false);
    });

    it('should return false for missing price', () => {
      const invalid = { item_id: 123, title: 'Test' };
      expect(validateBaseProduct(invalid)).toBe(false);
    });

    it('should return false for negative price', () => {
      const invalid = { item_id: 123, title: 'Test', price: -100 };
      expect(validateBaseProduct(invalid)).toBe(false);
    });

    it('should accept string item_id', () => {
      const product = { ...sampleProduct, item_id: '123' };
      expect(validateBaseProduct(product)).toBe(true);
    });

    it('should accept zero price', () => {
      const product = { ...sampleProduct, price: 0 };
      expect(validateBaseProduct(product)).toBe(true);
    });
  });
});
