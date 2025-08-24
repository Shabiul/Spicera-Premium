import { db } from './db';
import { 
  coupons, 
  couponUsages, 
  users, 
  products,
  type Coupon, 
  type InsertCoupon,
  type CouponUsage,
  type Product
} from '@shared/schema';
import { eq, and, gte, lte, sql, count } from 'drizzle-orm';

export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  discount?: {
    type: string;
    value: number;
    amount: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  category?: string;
}

export class CouponService {
  // Validate and calculate discount for a coupon
  static async validateCoupon(
    code: string, 
    userId: string | null, 
    cartItems: CartItem[], 
    subtotal: number
  ): Promise<CouponValidationResult> {
    try {
      // Find the coupon
      const coupon = await db.select()
        .from(coupons)
        .where(and(
          eq(coupons.code, code.toUpperCase()),
          eq(coupons.isActive, true)
        ))
        .limit(1);

      if (coupon.length === 0) {
        return { isValid: false, error: 'Invalid coupon code' };
      }

      const couponData = coupon[0];
      const now = new Date();

      // Check if coupon is within valid date range
      if (now < couponData.validFrom || now > couponData.validUntil) {
        return { isValid: false, error: 'Coupon has expired or is not yet valid' };
      }

      // Check usage limits
      if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
        return { isValid: false, error: 'Coupon usage limit exceeded' };
      }

      // Check user usage limit if user is logged in
      if (userId && couponData.userUsageLimit) {
        const userUsageCount = await db.select({ count: count() })
          .from(couponUsages)
          .where(and(
            eq(couponUsages.couponId, couponData.id),
            eq(couponUsages.userId, userId)
          ));

        if (userUsageCount[0].count >= couponData.userUsageLimit) {
          return { isValid: false, error: 'You have already used this coupon the maximum number of times' };
        }
      }

      // Check minimum order amount
      if (couponData.minimumOrderAmount && subtotal < parseFloat(couponData.minimumOrderAmount)) {
        return { 
          isValid: false, 
          error: `Minimum order amount of $${couponData.minimumOrderAmount} required` 
        };
      }

      // Check applicable categories and products
      const applicableItems = await this.getApplicableItems(couponData, cartItems);
      if (applicableItems.length === 0) {
        return { isValid: false, error: 'Coupon is not applicable to items in your cart' };
      }

      // Calculate discount
      const discount = this.calculateDiscount(couponData, applicableItems, subtotal);

      return {
        isValid: true,
        discount: {
          type: couponData.discountType,
          value: parseFloat(couponData.discountValue),
          amount: discount
        }
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { isValid: false, error: 'Error validating coupon' };
    }
  }

  // Get items that the coupon applies to
  private static async getApplicableItems(coupon: Coupon, cartItems: CartItem[]): Promise<CartItem[]> {
    // If no restrictions, apply to all items
    if (!coupon.applicableCategories && !coupon.applicableProducts) {
      return cartItems;
    }

    const applicableItems: CartItem[] = [];
    const applicableCategories = coupon.applicableCategories ? JSON.parse(coupon.applicableCategories) : [];
    const applicableProductIds = coupon.applicableProducts ? JSON.parse(coupon.applicableProducts) : [];

    for (const item of cartItems) {
      // Check if product ID is in applicable products
      if (applicableProductIds.includes(item.productId)) {
        applicableItems.push(item);
        continue;
      }

      // Check if product category is in applicable categories
      if (applicableCategories.length > 0) {
        const product = await db.select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product.length > 0 && applicableCategories.includes(product[0].category)) {
          applicableItems.push(item);
        }
      }
    }

    return applicableItems;
  }

  // Calculate discount amount
  private static calculateDiscount(coupon: Coupon, applicableItems: CartItem[], subtotal: number): number {
    const discountValue = parseFloat(coupon.discountValue);
    const applicableSubtotal = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discount = 0;

    switch (coupon.discountType) {
      case 'percentage':
        discount = (applicableSubtotal * discountValue) / 100;
        break;
      case 'fixed_amount':
        discount = Math.min(discountValue, applicableSubtotal);
        break;
      case 'free_shipping':
        // For free shipping, return a fixed amount (you can customize this)
        discount = 10; // Assuming $10 shipping cost
        break;
      default:
        discount = 0;
    }

    // Apply maximum discount limit if set
    if (coupon.maximumDiscountAmount) {
      discount = Math.min(discount, parseFloat(coupon.maximumDiscountAmount));
    }

    return Math.round(discount * 100) / 100; // Round to 2 decimal places
  }

  // Apply coupon and record usage
  static async applyCoupon(
    code: string,
    userId: string | null,
    orderId: string,
    discountAmount: number
  ): Promise<void> {
    try {
      const coupon = await db.select()
        .from(coupons)
        .where(eq(coupons.code, code.toUpperCase()))
        .limit(1);

      if (coupon.length === 0) {
        throw new Error('Coupon not found');
      }

      const couponData = coupon[0];

      // Record coupon usage
      await db.insert(couponUsages).values({
        couponId: couponData.id,
        userId: userId,
        orderId: orderId,
        discountAmount: discountAmount.toString()
      });

      // Increment usage count
      await db.update(coupons)
        .set({ 
          usageCount: sql`${coupons.usageCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(coupons.id, couponData.id));
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw new Error('Failed to apply coupon');
    }
  }

  // Create a new coupon
  static async createCoupon(couponData: InsertCoupon): Promise<Coupon> {
    try {
      // Ensure code is uppercase
      const normalizedData = {
        ...couponData,
        code: couponData.code.toUpperCase()
      };

      const result = await db.insert(coupons)
        .values(normalizedData)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw new Error('Failed to create coupon');
    }
  }

  // Get all coupons with usage statistics
  static async getAllCoupons(): Promise<Array<Coupon & { totalUsages: number }>> {
    try {
      const result = await db.select({
        ...coupons,
        totalUsages: sql<number>`COALESCE(${count(couponUsages.id)}, 0)`
      })
      .from(coupons)
      .leftJoin(couponUsages, eq(coupons.id, couponUsages.couponId))
      .groupBy(coupons.id)
      .orderBy(coupons.createdAt);

      return result;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw new Error('Failed to fetch coupons');
    }
  }

  // Update coupon
  static async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon> {
    try {
      const normalizedUpdates = updates.code ? 
        { ...updates, code: updates.code.toUpperCase(), updatedAt: new Date() } :
        { ...updates, updatedAt: new Date() };

      const result = await db.update(coupons)
        .set(normalizedUpdates)
        .where(eq(coupons.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Coupon not found');
      }

      return result[0];
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw new Error('Failed to update coupon');
    }
  }

  // Delete coupon
  static async deleteCoupon(id: string): Promise<void> {
    try {
      const result = await db.delete(coupons)
        .where(eq(coupons.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Coupon not found');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw new Error('Failed to delete coupon');
    }
  }
}