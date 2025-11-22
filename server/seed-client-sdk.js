
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { randomUUID } from 'crypto';

const firebaseConfig = {
    apiKey: "AIzaSyCx-I8sP91gCg9zKxK8VOE5kTsO-VWSwC0",
    authDomain: "spicera-premium-8bc0a.firebaseapp.com",
    projectId: "spicera-premium-8bc0a",
    storageBucket: "spicera-premium-8bc0a.firebasestorage.app",
    messagingSenderId: "332656634702",
    appId: "1:332656634702:web:b7349d54b22d2603f18c1f",
    measurementId: "G-ZFH4JJM4RV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

async function seed() {
    try {
        console.log("Starting seed process...");

        // 1. Authenticate as Admin (or create if not exists)
        const email = "admin@spicecraft.com";
        const password = "admin123";
        let userCredential;

        try {
            console.log("Attempting to sign in...");
            userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Signed in as admin.");
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                console.log("User not found, creating admin user...");
                try {
                    userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    console.log("Admin user created.");
                } catch (createError) {
                    // If create fails, it might be because email already exists but password was wrong in sign in?
                    // Or maybe email-enumeration protection.
                    console.error("Error creating user:", createError);
                    throw createError;
                }
            } else {
                console.error("Sign in error:", error);
                throw error;
            }
        }

        const uid = userCredential.user.uid;

        // 2. Create Admin User Document
        console.log("Updating admin user document...");
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, {
            id: uid,
            email,
            name: "Admin User",
            role: "admin",
            phone: null,
            address: null,
            isActive: true,
            authUid: uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("Admin user document updated.");

        // 3. Seed Products
        console.log("Seeding products...");
        const productsCollection = collection(db, "products");

        // Note: Client SDK doesn't support 'where' queries easily without index if we want to check existence by name efficiently
        // But we can just add them. To avoid duplicates, we might want to check if we can list them.
        // For simplicity, I'll just add them. If we want to be idempotent, we'd need to query first.
        // Since I can't easily query by name without setup, I will just add them.
        // Actually, let's try to use a deterministic ID based on name if possible, or just add.
        // The previous script used randomUUID.

        for (const product of productsData) {
            // We will just create new documents. 
            // Ideally we should check for duplicates.
            // Let's assume for now we just want to add them.
            const newDocRef = doc(productsCollection); // Auto-ID
            const id = newDocRef.id;

            await setDoc(newDocRef, {
                id: id,
                ...product,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`Added product: ${product.name}`);
        }

        console.log("Seeding completed successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
