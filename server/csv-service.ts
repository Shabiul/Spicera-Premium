import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { z } from 'zod';
import { db } from './db';
import { products, type Product, type InsertProduct } from '@shared/schema';
import { eq } from 'drizzle-orm';

// CSV product schema for validation
const csvProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().transform(val => parseFloat(val)),
  category: z.string().min(1),
  stock: z.string().transform(val => parseInt(val)),
  featured: z.string().optional().transform(val => val === 'true' || val === '1'),
  image: z.string().optional().default('/uploads/default-product.jpg')
});

export class CSVService {
  // Export products to CSV format
  static async exportProducts(): Promise<string> {
    try {
      const allProducts = await db.select().from(products);
      
      const csvData = allProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        featured: product.featured,
        image: product.image,
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString()
      }));

      return stringify(csvData, {
        header: true,
        columns: [
          'id', 'name', 'description', 'price', 'category', 
          'stock', 'featured', 'image', 'createdAt', 'updatedAt'
        ]
      });
    } catch (error) {
      console.error('Error exporting products:', error);
      throw new Error('Failed to export products');
    }
  }

  // Import products from CSV
  static async importProducts(csvContent: string): Promise<{
    success: number;
    errors: Array<{ row: number; error: string; data?: any }>;
    created: number;
    updated: number;
  }> {
    const results = {
      success: 0,
      errors: [] as Array<{ row: number; error: string; data?: any }>,
      created: 0,
      updated: 0
    };

    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      for (let i = 0; i < records.length; i++) {
        const row = i + 2; // +2 because CSV is 1-indexed and has header
        const record = records[i];

        try {
          // Validate the record
          const validatedProduct = csvProductSchema.parse(record);
          
          // Check if product exists (by name for simplicity)
          const existingProduct = await db.select()
            .from(products)
            .where(eq(products.name, validatedProduct.name))
            .limit(1);

          if (existingProduct.length > 0) {
            // Update existing product
            await db.update(products)
              .set({
                description: validatedProduct.description,
                price: validatedProduct.price.toString(),
                category: validatedProduct.category,
                stock: validatedProduct.stock,
                featured: validatedProduct.featured,
                image: validatedProduct.image,
                updatedAt: new Date()
              })
              .where(eq(products.id, existingProduct[0].id));
            
            results.updated++;
          } else {
            // Create new product
            await db.insert(products).values({
              name: validatedProduct.name,
              description: validatedProduct.description,
              price: validatedProduct.price.toString(),
              category: validatedProduct.category,
              stock: validatedProduct.stock,
              featured: validatedProduct.featured,
              image: validatedProduct.image
            });
            
            results.created++;
          }
          
          results.success++;
        } catch (error) {
          results.errors.push({
            row,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: record
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  // Generate CSV template for product import
  static generateTemplate(): string {
    const templateData = [{
      name: 'Sample Spice',
      description: 'A delicious sample spice for your kitchen',
      price: '9.99',
      category: 'Spices',
      stock: '100',
      featured: 'false',
      image: '/uploads/sample-spice.jpg'
    }];

    return stringify(templateData, {
      header: true,
      columns: ['name', 'description', 'price', 'category', 'stock', 'featured', 'image']
    });
  }
}