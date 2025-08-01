import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  type InsertOrderItem 
} from "@shared/schema";
import { sendOrderConfirmationEmail } from './email-service';
import { z } from "zod";

function getSessionId(req: any): string {
  if (!req.session.id) {
    req.session.id = Math.random().toString(36).substring(2, 15);
  }
  return req.session.id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'spicera-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json({ success: true, id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid form data", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to submit contact form" 
        });
      }
    }
  });

  // Get all contact submissions (for admin purposes)
  app.get("/api/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve contact submissions" 
      });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error: any) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const cartItem = await storage.addToCart(sessionId, productId, quantity);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Valid quantity is required" });
      }

      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to clear cart" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const { customerName, customerEmail, customerPhone, shippingAddress } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate total
      const totalAmount = cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.product.price) * item.quantity), 0
      );

      // Create order
      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        totalAmount: totalAmount.toString(),
      };

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: (parseFloat(item.product.price) * item.quantity).toString(),
      })) as Omit<InsertOrderItem, 'id'>[];

      const order = await storage.createOrder(orderData, orderItems);
      
      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail({
          order,
          cartItems
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue with order creation even if email fails
      }
      
      // Clear cart after successful order
      await storage.clearCart(sessionId);
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
