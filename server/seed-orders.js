
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
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

async function seedOrders() {
    try {
        console.log("Starting order seed process...");

        // 1. Create/Get Test Customer
        const email = "customer@example.com";
        const password = "password123";
        let userCredential;
        let userId;

        try {
            console.log("Attempting to sign in as customer...");
            userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Signed in as customer.");
            userId = userCredential.user.uid;
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                console.log("Customer not found, creating...");
                try {
                    userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    userId = userCredential.user.uid;

                    // Create User Document
                    await setDoc(doc(db, "users", userId), {
                        id: userId,
                        email,
                        name: "Test Customer",
                        role: "customer",
                        phone: "1234567890",
                        address: "123 Spice Street, Flavor Town",
                        isActive: true,
                        authUid: userId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    console.log("Customer created.");
                } catch (createError) {
                    console.error("Error creating customer:", createError);
                    throw createError;
                }
            } else {
                throw error;
            }
        }

        // 2. Fetch Products to use in orders
        console.log("Fetching products...");
        const productsSnapshot = await getDocs(collection(db, "products"));
        const products = productsSnapshot.docs.map(doc => doc.data());

        if (products.length === 0) {
            throw new Error("No products found. Please seed products first.");
        }

        // 3. Create Orders
        console.log("Creating orders...");

        // Order 1: Pending, 2 items
        const order1Id = randomUUID();
        const order1Total = (parseFloat(products[0].price) * 2) + parseFloat(products[1].price);

        await setDoc(doc(db, "orders", order1Id), {
            id: order1Id,
            userId: userId,
            customerName: "Test Customer",
            customerEmail: email,
            customerPhone: "1234567890",
            shippingAddress: "123 Spice Street, Flavor Town",
            totalAmount: order1Total.toFixed(2),
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Order 1 Items
        await setDoc(doc(db, "order_items", randomUUID()), {
            id: randomUUID(),
            orderId: order1Id,
            productId: products[0].id,
            quantity: 2,
            unitPrice: products[0].price,
            totalPrice: (parseFloat(products[0].price) * 2).toFixed(2)
        });

        await setDoc(doc(db, "order_items", randomUUID()), {
            id: randomUUID(),
            orderId: order1Id,
            productId: products[1].id,
            quantity: 1,
            unitPrice: products[1].price,
            totalPrice: products[1].price
        });

        console.log(`Created Order 1: ${order1Id}`);

        // Order 2: Delivered, 1 item
        const order2Id = randomUUID();
        const order2Total = parseFloat(products[2].price);

        await setDoc(doc(db, "orders", order2Id), {
            id: order2Id,
            userId: userId,
            customerName: "Test Customer",
            customerEmail: email,
            customerPhone: "1234567890",
            shippingAddress: "123 Spice Street, Flavor Town",
            totalAmount: order2Total.toFixed(2),
            status: "delivered",
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            updatedAt: new Date().toISOString()
        });

        // Order 2 Items
        await setDoc(doc(db, "order_items", randomUUID()), {
            id: randomUUID(),
            orderId: order2Id,
            productId: products[2].id,
            quantity: 1,
            unitPrice: products[2].price,
            totalPrice: products[2].price
        });

        console.log(`Created Order 2: ${order2Id}`);

        console.log("Order seeding completed successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Order seeding failed:", error);
        process.exit(1);
    }
}

seedOrders();
