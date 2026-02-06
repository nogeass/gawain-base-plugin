/**
 * BASE platform adapter
 * Converts BASE product data to Gawain format
 */

import type { ProductInput } from '../gawain/types.js';

/**
 * BASE product variation structure
 */
export interface BaseProductVariation {
  variation_id: number | string;
  variation: string;
  variation_stock?: number;
  variation_identifier?: string;
}

/**
 * BASE product structure
 * See: https://docs.thebase.in/docs/api/
 */
export interface BaseProduct {
  item_id: number | string;
  title: string;
  detail?: string;
  price: number;
  stock?: number;
  visible?: 0 | 1;
  list_order?: number;
  identifier?: string;
  // BASE supports up to 20 images (img1_origin through img20_origin)
  img1_origin?: string | null;
  img2_origin?: string | null;
  img3_origin?: string | null;
  img4_origin?: string | null;
  img5_origin?: string | null;
  img6_origin?: string | null;
  img7_origin?: string | null;
  img8_origin?: string | null;
  img9_origin?: string | null;
  img10_origin?: string | null;
  img11_origin?: string | null;
  img12_origin?: string | null;
  img13_origin?: string | null;
  img14_origin?: string | null;
  img15_origin?: string | null;
  img16_origin?: string | null;
  img17_origin?: string | null;
  img18_origin?: string | null;
  img19_origin?: string | null;
  img20_origin?: string | null;
  variations?: BaseProductVariation[];
}

/**
 * Extract images from BASE product
 * BASE uses img1_origin through img20_origin fields
 */
function extractImages(product: BaseProduct): string[] {
  const images: string[] = [];
  const imageFields = [
    'img1_origin',
    'img2_origin',
    'img3_origin',
    'img4_origin',
    'img5_origin',
    'img6_origin',
    'img7_origin',
    'img8_origin',
    'img9_origin',
    'img10_origin',
    'img11_origin',
    'img12_origin',
    'img13_origin',
    'img14_origin',
    'img15_origin',
    'img16_origin',
    'img17_origin',
    'img18_origin',
    'img19_origin',
    'img20_origin',
  ] as const;

  for (const field of imageFields) {
    const imageUrl = product[field];
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      images.push(imageUrl);
    }
  }

  return images;
}

/**
 * Convert BASE product to Gawain ProductInput
 */
export function convertBaseProduct(product: BaseProduct): ProductInput {
  // Extract images
  const images = extractImages(product);

  // Convert price to string (BASE uses integer yen)
  const price = {
    amount: String(product.price),
    currency: 'JPY',
  };

  // Convert variations
  const variants = product.variations?.map((v) => ({
    id: String(v.variation_id),
    title: v.variation,
    price: String(product.price), // BASE variations share the base price
  }));

  // Description is plain text in BASE (no HTML to strip)
  const description = product.detail?.trim() || undefined;

  return {
    id: String(product.item_id),
    title: product.title,
    description,
    images,
    price,
    variants,
    metadata: {
      source: 'base',
      itemId: String(product.item_id),
      identifier: product.identifier,
      stock: product.stock,
      visible: product.visible === 1,
    },
  };
}

/**
 * Validate BASE product has required fields
 */
export function validateBaseProduct(product: unknown): product is BaseProduct {
  if (!product || typeof product !== 'object') {
    return false;
  }

  const p = product as Record<string, unknown>;

  // Required fields
  if (typeof p.item_id !== 'string' && typeof p.item_id !== 'number') {
    return false;
  }
  if (typeof p.title !== 'string' || !p.title.trim()) {
    return false;
  }
  if (typeof p.price !== 'number' || p.price < 0) {
    return false;
  }

  // Check if at least one image exists
  const hasImage = [
    'img1_origin',
    'img2_origin',
    'img3_origin',
    'img4_origin',
    'img5_origin',
  ].some((field) => {
    const value = p[field];
    return typeof value === 'string' && value.trim();
  });

  if (!hasImage) {
    console.warn('Product has no images');
  }

  return true;
}
