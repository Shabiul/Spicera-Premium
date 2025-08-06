import express, { type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { storage } from "./storage";
import { authService } from "./auth-service";
import { authenticateToken, optionalAuth, requireAdmin, requireCustomer } from "./auth-middleware";
import { 
  insertContactSubmissionSchema, 
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  loginSchema,
  registerSchema,
  type InsertOrderItem 
} from "@shared/schema";
import { sendOrderConfirmationEmail } from './email-service';
import { AuditLogger } from './audit';

import { z } from "zod";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // File upload endpoint
  app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        message: 'File uploaded successfully',
        filename: req.file.filename,
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'File upload failed' });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { user, token } = await authService.register(validatedData);
      
      // Log user registration
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logUserChange(
        auditContext,
        'CREATE',
        user.id,
        null,
        { email: user.email, name: user.name, role: user.role }
      );
      
      res.json({ success: true, user, token });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid registration data", 
          details: error.errors 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: error.message || "Registration failed" 
        });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { user, token } = await authService.login(validatedData);
      res.json({ success: true, user, token });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid login data", 
          details: error.errors 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          error: error.message || "Login failed" 
        });
      }
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await authService.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        phone: user.phone,
        address: user.address 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user profile" });
    }
  });

  app.put("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const { name, phone, address } = req.body;
      
      // Get old user data for audit log
      const oldUser = await storage.getUserById(req.user!.id);
      
      const updatedUser = await authService.updateUser(req.user!.id, {
        name,
        phone,
        address
      });
      
      // Log profile update
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logUserChange(
        auditContext,
        'UPDATE',
        updatedUser.id,
        { name: oldUser?.name, phone: oldUser?.phone, address: oldUser?.address },
        { name: updatedUser.name, phone: updatedUser.phone, address: updatedUser.address }
      );
      
      res.json({ 
        success: true, 
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

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
  app.get("/api/cart", optionalAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = userId ? undefined : getSessionId(req);
      const cartItems = await storage.getCartItems(sessionId, userId);
      res.json(cartItems);
    } catch (error: any) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", optionalAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = userId ? undefined : getSessionId(req);
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const cartItem = await storage.addToCart(sessionId, productId, quantity, userId);
      
      // Log cart addition
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logCartChange(
        auditContext,
        'CREATE',
        cartItem.id,
        null,
        { productId, quantity, sessionId, userId }
      );
      
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", optionalAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Valid quantity is required" });
      }

      // Get old cart item data for audit log
      const oldCartItem = await storage.getCartItem(req.params.id);
      
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      
      // Log cart update
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logCartChange(
        auditContext,
        'UPDATE',
        cartItem.id,
        { quantity: oldCartItem?.quantity },
        { quantity: cartItem.quantity }
      );
      
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", optionalAuth, async (req, res) => {
    try {
      // Get cart item data for audit log
      const cartItem = await storage.getCartItem(req.params.id);
      
      await storage.removeFromCart(req.params.id);
      
      // Log cart item deletion
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logCartChange(
        auditContext,
        'DELETE',
        req.params.id,
        { productId: cartItem?.productId, quantity: cartItem?.quantity },
        null
      );
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", optionalAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = userId ? undefined : getSessionId(req);
      await storage.clearCart(sessionId, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to clear cart" });
    }
  });



  // Order routes
  app.post("/api/orders", optionalAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = userId ? undefined : getSessionId(req);
      const { customerName, customerEmail, customerPhone, shippingAddress } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(sessionId, userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Validate stock availability for all items
      for (const item of cartItems) {
        if (item.quantity > item.product.stock) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} items available.` 
          });
        }
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
        userId,
      };

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: (parseFloat(item.product.price) * item.quantity).toString(),
      })) as Omit<InsertOrderItem, 'id'>[];

      const order = await storage.createOrder(orderData, orderItems);
      
      // Log order creation
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logOrderChange(
        auditContext,
        'CREATE',
        order.id,
        null,
        { 
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          itemCount: orderItems.length
        }
      );
      
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
      await storage.clearCart(sessionId, userId);
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create order" });
    }
  });

  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/my", authenticateToken, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.user!.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch user orders" });
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

  // Admin routes for metrics and management
  app.get("/api/admin/metrics", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const metrics = await storage.getAdminMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Audit log routes
  app.get("/api/admin/audit-logs", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { limit = 100, offset = 0, table, user } = req.query;
      let auditLogs;
      
      if (table) {
        auditLogs = await storage.getAuditLogsByTable(table as string);
      } else if (user) {
        auditLogs = await storage.getAuditLogsByUser(user as string);
      } else {
        auditLogs = await storage.getAuditLogs(Number(limit), Number(offset));
      }
      
      res.json(auditLogs);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/products", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid product data", details: result.error.issues });
      }

      const product = await storage.createProduct(result.data);
      
      // Log product creation
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logProductChange(
        auditContext,
        'CREATE',
        product.id,
        null,
        { name: product.name, price: product.price, stock: product.stock }
      );
      
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = insertProductSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid product data", details: result.error.issues });
      }

      // Get old product data for audit log
      const oldProduct = await storage.getProduct(req.params.id);
      
      const product = await storage.updateProduct(req.params.id, result.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Log product update
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logProductChange(
        auditContext,
        'UPDATE',
        product.id,
        { name: oldProduct?.name, price: oldProduct?.price, stock: oldProduct?.stock },
        { name: product.name, price: product.price, stock: product.stock }
      );
      
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      // Get product data for audit log before deletion
      const product = await storage.getProduct(req.params.id);
      
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Log product deletion
      const auditContext = AuditLogger.extractContext(req);
      await AuditLogger.logProductChange(
        auditContext,
        'DELETE',
        req.params.id,
        { name: product?.name, price: product?.price, stock: product?.stock },
        null
      );
      
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
