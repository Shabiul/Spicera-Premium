import { db } from './server/db.js';
import { products } from './shared/schema.js';

async function checkProducts() {
  try {
    const allProducts = await db.select().from(products).limit(5);
    console.log('Products in database:');
    console.log(JSON.stringify(allProducts, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();