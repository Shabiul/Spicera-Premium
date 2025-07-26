import { 
  contactSubmissions, 
  products,
  cartItems,
  orders,
  orderItems,
  type ContactSubmission, 
  type InsertContactSubmission,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Contact form operations
  getContactSubmission(id: string): Promise<ContactSubmission | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  
  // Cart operations
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(sessionId: string, productId: string, quantity: number): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(): Promise<Order[]>;
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

  // Cart operations
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    return await db.select({
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
    .where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(sessionId: string, productId: string, quantity: number): Promise<CartItem> {
    // Check if item already exists in cart
    const [existing] = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.sessionId, sessionId),
        eq(cartItems.productId, productId)
      ));

    if (existing) {
      // Update quantity
      return await this.updateCartItem(existing.id, existing.quantity + quantity);
    } else {
      // Add new item
      const [result] = await db.insert(cartItems).values({
        sessionId,
        productId,
        quantity,
      }).returning();
      return result;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [result] = await db.update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return result;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Add order items
    const orderItemsData = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsData);
    
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
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