import { db } from './db';
import { 
  customerSegments, 
  customerSegmentMemberships, 
  users, 
  orders, 
  orderItems,
  products,
  type CustomerSegment, 
  type InsertCustomerSegment,
  type CustomerSegmentMembership,
  type User
} from '@shared/schema';
import { eq, and, gte, lte, sql, count, sum, desc, inArray } from 'drizzle-orm';

export interface SegmentCriteria {
  totalOrdersMin?: number;
  totalOrdersMax?: number;
  totalSpentMin?: number;
  totalSpentMax?: number;
  lastOrderDaysAgo?: number;
  favoriteCategories?: string[];
  registeredAfter?: string;
  registeredBefore?: string;
  isActive?: boolean;
  hasOrders?: boolean;
}

export interface CustomerWithStats {
  id: string;
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
  favoriteCategory: string | null;
  registeredAt: Date;
  isActive: boolean;
}

export class SegmentationService {
  // Create a new customer segment
  static async createSegment(segmentData: InsertCustomerSegment): Promise<CustomerSegment> {
    try {
      const result = await db.insert(customerSegments)
        .values(segmentData)
        .returning();

      // Automatically populate the segment with matching customers
      await this.updateSegmentMemberships(result[0].id);

      return result[0];
    } catch (error) {
      console.error('Error creating segment:', error);
      throw new Error('Failed to create customer segment');
    }
  }

  // Update segment memberships based on criteria
  static async updateSegmentMemberships(segmentId: string): Promise<void> {
    try {
      const segment = await db.select()
        .from(customerSegments)
        .where(eq(customerSegments.id, segmentId))
        .limit(1);

      if (segment.length === 0) {
        throw new Error('Segment not found');
      }

      const criteria: SegmentCriteria = JSON.parse(segment[0].criteria);
      const matchingCustomers = await this.getCustomersMatchingCriteria(criteria);

      // Clear existing memberships
      await db.delete(customerSegmentMemberships)
        .where(eq(customerSegmentMemberships.segmentId, segmentId));

      // Add new memberships
      if (matchingCustomers.length > 0) {
        const memberships = matchingCustomers.map(customer => ({
          segmentId: segmentId,
          userId: customer.id
        }));

        await db.insert(customerSegmentMemberships)
          .values(memberships);
      }
    } catch (error) {
      console.error('Error updating segment memberships:', error);
      throw new Error('Failed to update segment memberships');
    }
  }

  // Get customers matching specific criteria
  static async getCustomersMatchingCriteria(criteria: SegmentCriteria): Promise<CustomerWithStats[]> {
    try {
      // Build the base query with customer stats
      let query = db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        registeredAt: users.createdAt,
        isActive: users.isActive,
        totalOrders: sql<number>`COALESCE(COUNT(DISTINCT ${orders.id}), 0)`,
        totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        lastOrderDate: sql<Date | null>`MAX(${orders.createdAt})`,
        favoriteCategory: sql<string | null>`(
          SELECT ${products.category}
          FROM ${orderItems}
          JOIN ${products} ON ${orderItems.productId} = ${products.id}
          JOIN ${orders} AS o ON ${orderItems.orderId} = o.id
          WHERE o.userId = ${users.id}
          GROUP BY ${products.category}
          ORDER BY COUNT(*) DESC
          LIMIT 1
        )`
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.userId))
      .groupBy(users.id, users.email, users.name, users.createdAt, users.isActive);

      const results = await query;
      
      // Filter results based on criteria
      return results.filter(customer => {
        // Check total orders
        if (criteria.totalOrdersMin !== undefined && customer.totalOrders < criteria.totalOrdersMin) {
          return false;
        }
        if (criteria.totalOrdersMax !== undefined && customer.totalOrders > criteria.totalOrdersMax) {
          return false;
        }

        // Check total spent
        if (criteria.totalSpentMin !== undefined && customer.totalSpent < criteria.totalSpentMin) {
          return false;
        }
        if (criteria.totalSpentMax !== undefined && customer.totalSpent > criteria.totalSpentMax) {
          return false;
        }

        // Check last order date
        if (criteria.lastOrderDaysAgo !== undefined) {
          if (!customer.lastOrderDate) {
            return false;
          }
          const daysSinceLastOrder = Math.floor(
            (Date.now() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastOrder > criteria.lastOrderDaysAgo) {
            return false;
          }
        }

        // Check favorite categories
        if (criteria.favoriteCategories && criteria.favoriteCategories.length > 0) {
          if (!customer.favoriteCategory || !criteria.favoriteCategories.includes(customer.favoriteCategory)) {
            return false;
          }
        }

        // Check registration date
        if (criteria.registeredAfter) {
          const afterDate = new Date(criteria.registeredAfter);
          if (customer.registeredAt < afterDate) {
            return false;
          }
        }
        if (criteria.registeredBefore) {
          const beforeDate = new Date(criteria.registeredBefore);
          if (customer.registeredAt > beforeDate) {
            return false;
          }
        }

        // Check active status
        if (criteria.isActive !== undefined && customer.isActive !== criteria.isActive) {
          return false;
        }

        // Check has orders
        if (criteria.hasOrders !== undefined) {
          const hasOrders = customer.totalOrders > 0;
          if (hasOrders !== criteria.hasOrders) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Error getting customers matching criteria:', error);
      throw new Error('Failed to get matching customers');
    }
  }

  // Get all segments with member counts
  static async getAllSegments(): Promise<Array<CustomerSegment & { memberCount: number }>> {
    try {
      const result = await db.select({
        ...customerSegments,
        memberCount: sql<number>`COALESCE(COUNT(${customerSegmentMemberships.id}), 0)`
      })
      .from(customerSegments)
      .leftJoin(customerSegmentMemberships, eq(customerSegments.id, customerSegmentMemberships.segmentId))
      .groupBy(customerSegments.id)
      .orderBy(customerSegments.createdAt);

      return result;
    } catch (error) {
      console.error('Error fetching segments:', error);
      throw new Error('Failed to fetch customer segments');
    }
  }

  // Get segment members
  static async getSegmentMembers(segmentId: string): Promise<CustomerWithStats[]> {
    try {
      const members = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        registeredAt: users.createdAt,
        isActive: users.isActive,
        totalOrders: sql<number>`COALESCE(COUNT(DISTINCT ${orders.id}), 0)`,
        totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        lastOrderDate: sql<Date | null>`MAX(${orders.createdAt})`,
        favoriteCategory: sql<string | null>`(
          SELECT ${products.category}
          FROM ${orderItems}
          JOIN ${products} ON ${orderItems.productId} = ${products.id}
          JOIN ${orders} AS o ON ${orderItems.orderId} = o.id
          WHERE o.userId = ${users.id}
          GROUP BY ${products.category}
          ORDER BY COUNT(*) DESC
          LIMIT 1
        )`
      })
      .from(customerSegmentMemberships)
      .innerJoin(users, eq(customerSegmentMemberships.userId, users.id))
      .leftJoin(orders, eq(users.id, orders.userId))
      .where(eq(customerSegmentMemberships.segmentId, segmentId))
      .groupBy(users.id, users.email, users.name, users.createdAt, users.isActive);

      return members;
    } catch (error) {
      console.error('Error fetching segment members:', error);
      throw new Error('Failed to fetch segment members');
    }
  }

  // Update segment
  static async updateSegment(id: string, updates: Partial<InsertCustomerSegment>): Promise<CustomerSegment> {
    try {
      const result = await db.update(customerSegments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(customerSegments.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Segment not found');
      }

      // Update memberships if criteria changed
      if (updates.criteria) {
        await this.updateSegmentMemberships(id);
      }

      return result[0];
    } catch (error) {
      console.error('Error updating segment:', error);
      throw new Error('Failed to update segment');
    }
  }

  // Delete segment
  static async deleteSegment(id: string): Promise<void> {
    try {
      const result = await db.delete(customerSegments)
        .where(eq(customerSegments.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Segment not found');
      }
    } catch (error) {
      console.error('Error deleting segment:', error);
      throw new Error('Failed to delete segment');
    }
  }

  // Get customer segments for a specific user
  static async getCustomerSegments(userId: string): Promise<CustomerSegment[]> {
    try {
      const segments = await db.select(customerSegments)
        .from(customerSegmentMemberships)
        .innerJoin(customerSegments, eq(customerSegmentMemberships.segmentId, customerSegments.id))
        .where(eq(customerSegmentMemberships.userId, userId));

      return segments;
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      throw new Error('Failed to fetch customer segments');
    }
  }

  // Refresh all segment memberships
  static async refreshAllSegments(): Promise<void> {
    try {
      const segments = await db.select().from(customerSegments).where(eq(customerSegments.isActive, true));
      
      for (const segment of segments) {
        await this.updateSegmentMemberships(segment.id);
      }
    } catch (error) {
      console.error('Error refreshing all segments:', error);
      throw new Error('Failed to refresh segments');
    }
  }

  // Get segment analytics
  static async getSegmentAnalytics(segmentId: string): Promise<{
    memberCount: number;
    averageOrderValue: number;
    totalRevenue: number;
    averageOrdersPerCustomer: number;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    try {
      const members = await this.getSegmentMembers(segmentId);
      
      const memberCount = members.length;
      const totalRevenue = members.reduce((sum, member) => sum + member.totalSpent, 0);
      const totalOrders = members.reduce((sum, member) => sum + member.totalOrders, 0);
      
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const averageOrdersPerCustomer = memberCount > 0 ? totalOrders / memberCount : 0;
      
      // Get top categories
      const categoryCount: { [key: string]: number } = {};
      members.forEach(member => {
        if (member.favoriteCategory) {
          categoryCount[member.favoriteCategory] = (categoryCount[member.favoriteCategory] || 0) + 1;
        }
      });
      
      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        memberCount,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrdersPerCustomer: Math.round(averageOrdersPerCustomer * 100) / 100,
        topCategories
      };
    } catch (error) {
      console.error('Error getting segment analytics:', error);
      throw new Error('Failed to get segment analytics');
    }
  }
}