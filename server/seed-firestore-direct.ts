import 'dotenv/config';
import { initFirebaseAdmin, getFirestore, getAuth } from "./firebase-admin";
import { randomUUID } from 'crypto';

const productsData = [
  {
    name: 'Biryani Masala',
    description: 'Authentic blend of aromatic spices specially crafted for perfect biryani. Contains cardamom, cinnamon, bay leaves, and secret spices for that traditional flavor.',
    price: '100.00',
    image: '/src/assets/images/spices/biryani-masala.jpg',
    category: 'Masala Blends',
    stock: 50,
    featured: true
  },
  {
    name: 'Korma Masala',
    description: 'Rich and creamy korma spice blend with cashews, almonds, and mild spices. Perfect for creating restaurant-style korma dishes at home.',
    price: '100.00',
    image: '/src/assets/images/spices/korma-masala.jpg',
    category: 'Masala Blends',
    stock: 45,
    featured: true
  },
  {
    name: 'Garam Masala',
    description: 'Classic whole spice blend with black pepper, cinnamon, black cardamom, and cloves. Essential for Indian cooking and adds warmth to any dish.',
    price: '100.00',
    image: '/src/assets/images/spices/GARAM-MASALA.jpeg',
    category: 'Masala Blends',
    stock: 60,
    featured: true
  },
  {
    name: 'Kitchen King Masala',
    description: 'Versatile all-purpose spice blend perfect for vegetables, dal, and everyday cooking. Contains coriander, cumin, red chili, and aromatic spices.',
    price: '100.00',
    image: '/src/assets/images/spices/KITCHEN-KING.jpeg',
    category: 'Masala Blends',
    stock: 55,
    featured: true
  }
];

async function createAdminInFirebase() {
  const auth = getAuth();
  const fs = getFirestore();
  const email = "admin@spicecraft.com";
  const password = "admin123";
  let userRecord;

  console.log(`Checking/Creating admin user: ${email}`);

  try {
    userRecord = await auth.getUserByEmail(email);
    console.log("Admin user already exists in Auth.");
  } catch {
    console.log("Creating new admin user in Auth...");
    userRecord = await auth.createUser({
      email,
      password,
      displayName: "Admin User",
      emailVerified: true,
      disabled: false
    });
    console.log("Admin user created.");
  }

  await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });
  console.log("Admin claims set.");

  const docRef = fs.collection("users").doc(userRecord.uid);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log("Creating admin user document in Firestore...");
    await docRef.set({
      id: userRecord.uid,
      email,
      name: "Admin User",
      role: "admin",
      phone: null,
      address: null,
      isActive: true,
      authUid: userRecord.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log("Admin user document created.");
  } else {
    console.log("Admin user document already exists in Firestore.");
  }
}

async function seedProducts() {
  const fs = getFirestore();
  const collection = fs.collection("products");
  
  console.log("Seeding products...");

  for (const product of productsData) {
    // Check if product with same name exists to avoid duplicates if run multiple times
    const snapshot = await collection.where('name', '==', product.name).get();
    
    if (snapshot.empty) {
      const id = randomUUID();
      const now = new Date().toISOString();
      await collection.doc(id).set({
        id: id,
        ...product,
        createdAt: now,
        updatedAt: now
      });
      console.log(`Created product: ${product.name}`);
    } else {
      console.log(`Product already exists: ${product.name}`);
    }
  }
}

async function seed() {
  try {
    initFirebaseAdmin();
    await createAdminInFirebase();
    await seedProducts();
    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
