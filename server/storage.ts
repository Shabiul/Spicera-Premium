import { 
  contactSubmissions, 
  products,
  cartItems,
  orders,
  orderItems,
  users,
  auditLogs,
  type ContactSubmission, 
  type InsertContactSubmission,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type User,
  type InsertUser,
  type AuditLog,
  type InsertAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Contact form operations
  getContactSubmission(id: string): Promise<ContactSubmission | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Stack Auth profile operations
  getUserProfile(userId: string): Promise<{ role: string; phone?: string; address?: string } | null>;
  updateUserProfile(userId: string, profile: { role?: string; phone?: string; address?: string }): Promise<{ role: string; phone?: string; address?: string }>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  updateProductStock(id: string, stockChange: number): Promise<Product>;
  
  // Cart operations
  getCartItems(sessionId?: string, userId?: string): Promise<(CartItem & { product: Product })[]>;
  getCartItem(id: string): Promise<CartItem | undefined>;
  addToCart(sessionId: string | undefined, productId: string, quantity: number, userId?: string): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(sessionId?: string, userId?: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  
  // Admin operations
  getAdminMetrics(): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    recentOrders: Order[];
  }>;
  getAllUsers(): Promise<User[]>;
  deleteProduct(id: string): Promise<boolean>;
  promoteToAdmin(email: string): Promise<User>;
  
  // Audit logging methods
  createAuditLog(auditData: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number, offset?: number): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: string): Promise<AuditLog[]>;
  getAuditLogsByTable(tableName: string): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  // Helper method to create audit log entries
  private async logAudit({
    userId,
    userEmail,
    userRole,
    tableName,
    recordId,
    action,
    oldData,
    newData,
    ipAddress,
    userAgent
  }: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    tableName: string;
    recordId?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await this.createAuditLog({
        userId,
        userEmail,
        userRole,
        tableName,
        recordId,
        action,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
  // Contact form operations
  async getContactSubmission(id: string): Promise<ContactSubmission | undefined> {
    const [result] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
    return result;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [result] = await db.insert(contactSubmissions).values(submission).returning();
    return result;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [result] = await db.update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  // Stack Auth profile operations
  async getUserProfile(userId: string): Promise<{ role: string; phone?: string; address?: string } | null> {
    const user = await this.getUserById(userId);
    if (user) {
      return {
        role: user.role,
        phone: user.phone || undefined,
        address: user.address || undefined
      };
    }
    return null;
  }

  async updateUserProfile(userId: string, profile: { role?: string; phone?: string; address?: string }): Promise<{ role: string; phone?: string; address?: string }> {
    // Check if user exists, if not create a basic user record
    let user = await this.getUserById(userId);
    
    if (!user) {
      // Create a basic user record for Stack Auth users
      user = await this.createUser({
        id: userId,
        email: '', // Will be populated from Stack Auth token
        name: '', // Will be populated from Stack Auth token
        role: profile.role || 'customer',
        phone: profile.phone || null,
        address: profile.address || null
      });
    } else {
      // Update existing user
      user = await this.updateUser(userId, {
        role: profile.role || user.role,
        phone: profile.phone !== undefined ? profile.phone : user.phone,
        address: profile.address !== undefined ? profile.address : user.address
      });
    }
    
    return {
      role: user.role,
      phone: user.phone || undefined,
      address: user.address || undefined
    };
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [result] = await db.select().from(products).where(eq(products.id, id));
    return result;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await db.insert(products).values(product).returning();
    return result;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [result] = await db.update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result;
  }

  async updateProductStock(id: string, stockChange: number): Promise<Product> {
    // Get current stock first
    const [currentProduct] = await db.select().from(products).where(eq(products.id, id));
    if (!currentProduct) {
      throw new Error("Product not found");
    }
    
    const newStock = currentProduct.stock + stockChange;
    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }
    
    const [result] = await db.update(products)
      .set({ 
        stock: newStock,
        updatedAt: new Date() 
      })
      .where(eq(products.id, id))
      .returning();
    return result;
  }

  // Cart operations
  async getCartItems(sessionId?: string, userId?: string): Promise<(CartItem & { product: Product })[]> {
    const whereCondition = userId 
      ? eq(cartItems.userId, userId)
      : eq(cartItems.sessionId, sessionId!);
      
    return await db.select({
      id: cartItems.id,
      sessionId: cartItems.sessionId,
      userId: cartItems.userId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(whereCondition);
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    const [result] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return result;
  }

  async addToCart(sessionId: string | undefined, productId: string, quantity: number, userId?: string): Promise<CartItem> {
    // Check product stock availability
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if item already exists in cart
    const whereConditions = userId 
      ? and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
      : and(eq(cartItems.sessionId, sessionId!), eq(cartItems.productId, productId));
      
    const [existing] = await db.select().from(cartItems).where(whereConditions);

    const newQuantity = existing ? existing.quantity + quantity : quantity;
    
    // Check if requested quantity exceeds available stock
    if (newQuantity > product.stock) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    if (existing) {
      // Update quantity
      return await this.updateCartItem(existing.id, newQuantity);
    } else {
      // Add new item
      const [result] = await db.insert(cartItems).values({
        sessionId,
        userId,
        productId,
        quantity,
      }).returning();
      return result;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    // Get cart item with product info to check stock
    const [cartItem] = await db.select({
      id: cartItems.id,
      sessionId: cartItems.sessionId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.id, id));

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Check if requested quantity exceeds available stock
    if (quantity > cartItem.product.stock) {
      throw new Error(`Only ${cartItem.product.stock} items available in stock`);
    }

    const [result] = await db.update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return result;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId?: string, userId?: string): Promise<void> {
    const whereCondition = userId 
      ? eq(cartItems.userId, userId)
      : eq(cartItems.sessionId, sessionId!);
    await db.delete(cartItems).where(whereCondition);
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Start transaction to ensure stock updates and order creation are atomic
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Add order items and update stock
    const orderItemsData = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsData);
    
    // Update stock for each product
    for (const item of items) {
      // Get current stock
      const [currentProduct] = await db.select().from(products).where(eq(products.id, item.productId));
      if (!currentProduct) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const newStock = currentProduct.stock - item.quantity;
      if (newStock < 0) {
        throw new Error(`Insufficient stock for product ${currentProduct.name}`);
      }
      
      await db.update(products)
        .set({ 
          stock: newStock,
          updatedAt: new Date() 
        })
        .where(eq(products.id, item.productId));
    }
    
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          price: orderItems.unitPrice, // Add price field for frontend compatibility
          product: products,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      product: products,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));

    return { ...order, items };
  }

  // Admin operations
  async getAdminMetrics() {
    const [totalUsers] = await db.select({ count: sql`count(*)` }).from(users);
    const [totalOrders] = await db.select({ count: sql`count(*)` }).from(orders);
    const [totalProducts] = await db.select({ count: sql`count(*)` }).from(products);
    
    // Calculate total revenue
    const revenueResult = await db.select({ total: orders.totalAmount }).from(orders);
    const totalRevenue = revenueResult.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
    
    // Get recent orders (last 10)
    const recentOrders = await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);
    
    return {
      totalUsers: Number(totalUsers?.count) || 0,
      totalOrders: Number(totalOrders?.count) || 0,
      totalRevenue,
      totalProducts: Number(totalProducts?.count) || 0,
      recentOrders
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      phone: users.phone,
      address: users.address,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).orderBy(desc(users.createdAt));
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async promoteToAdmin(email: string): Promise<User> {
    const [result] = await db.update(users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning();
    return result;
  }

  // Audit logging methods
  async createAuditLog(auditData: InsertAuditLog): Promise<AuditLog> {
    const [result] = await db.insert(auditLogs).values(auditData).returning();
    return result;
  }

  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByTable(tableName: string): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(eq(auditLogs.tableName, tableName))
      .orderBy(desc(auditLogs.createdAt));
  }
}

export const storage = new DatabaseStorage();