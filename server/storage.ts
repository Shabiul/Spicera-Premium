import { 
  contactSubmissions, 
  products,
  cartItems,
  orders,
  orderItems,
  users,
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
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  updateProductStock(id: string, stockChange: number): Promise<Product>;
  
  // Cart operations
  getCartItems(sessionId?: string, userId?: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(sessionId: string | undefined, productId: string, quantity: number, userId?: string): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(sessionId?: string, userId?: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
}

export class DatabaseStorage implements IStorage {
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

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
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
}

export const storage = new DatabaseStorage();