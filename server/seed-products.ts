import { storage } from "./storage";
import { fileURLToPath } from 'url';

const sampleProducts = [
  {
    name: "Classic Garam Masala",
    description: "Our signature blend of warm spices including cardamom, cinnamon, cloves, and black pepper. Perfect for traditional Indian dishes and adding depth to any recipe.",
    price: "24.99",
    image: "/src/assets/images/spices/biryani-masala.jpg",
    category: "Traditional Blends",
    stock: 50,
    featured: true
  },
  {
    name: "Premium Saffron Threads",
    description: "Hand-picked saffron threads from Kashmir. The most luxurious spice for rice dishes, desserts, and teas. A little goes a long way with this precious golden spice.",
    price: "89.99",
    image: "/src/assets/images/spices/korma-masala.jpg",
    category: "Premium Spices",
    stock: 25,
    featured: true
  },
  {
    name: "Smoky Chipotle Blend",
    description: "A perfect balance of heat and smoke with chipotle peppers, cumin, and paprika. Great for BBQ, grilling, and adding a southwestern kick to your dishes.",
    price: "19.99",
    image: "/src/assets/images/spices/GARAM-MASALA.jpeg",
    category: "Modern Blends",
    stock: 40,
    featured: true
  },
  {
    name: "Mediterranean Herb Mix",
    description: "A fragrant blend of rosemary, thyme, oregano, and basil. Perfect for pasta, pizza, roasted vegetables, and bringing the flavors of the Mediterranean to your kitchen.",
    price: "16.99",
    image: "/src/assets/images/spices/KITCHEN-KING.jpeg",
    category: "International Blends",
    stock: 60,
    featured: false
  },
  {
    name: "Five Spice Powder",
    description: "Traditional Chinese five-spice with star anise, cloves, Chinese cinnamon, Sichuan pepper, and fennel seeds. Essential for Asian cooking and marinades.",
    price: "21.99",
    image: "/src/assets/images/spices/biryani-masala.jpg",
    category: "Traditional Blends",
    stock: 35,
    featured: false
  },
  {
    name: "Himalayan Pink Salt",
    description: "Pure, unrefined pink salt from the Himalayan mountains. Rich in minerals and perfect for finishing dishes, seasoning, and adding a subtle flavor enhancement.",
    price: "12.99",
    image: "/src/assets/images/spices/korma-masala.jpg",
    category: "Premium Salts", 
    stock: 80,
    featured: true
  },
  {
    name: "Harissa Spice Blend",
    description: "North African spice blend with chilies, garlic, and aromatic spices. Perfect for adding heat and complex flavors to tagines, couscous, and roasted meats.",
    price: "18.99",
    image: "/src/assets/images/spices/GARAM-MASALA.jpeg",
    category: "International Blends",
    stock: 45,
    featured: false
  },
  {
    name: "Everything Bagel Seasoning",
    description: "Popular blend of sesame seeds, poppy seeds, dried garlic, dried onion, and salt. Great on bagels, avocado toast, salads, and roasted vegetables.",
    price: "14.99",
    image: "/src/assets/images/spices/KITCHEN-KING.jpeg",
    category: "Modern Blends",
    stock: 70,
    featured: false
  }
];

export async function seedProducts() {
  console.log("Seeding products...");
  try {
    for (const product of sampleProducts) {
      await storage.createProduct(product);
      console.log(`Created product: ${product.name}`);
    }
    console.log("Product seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

// Run seeding if this file is executed directly
if (process.argv[1] === import.meta.url.substring(7)) {
  seedProducts();
}

// Alternative way to check if file is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedProducts();
}