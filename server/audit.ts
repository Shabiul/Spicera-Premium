import { storage } from './storage';
import type { Request } from 'express';

export interface AuditContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async logChange({
    context,
    tableName,
    recordId,
    action,
    oldData,
    newData
  }: {
    context: AuditContext;
    tableName: string;
    recordId?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    oldData?: any;
    newData?: any;
  }): Promise<void> {
    try {
      await storage.createAuditLog({
        userId: context.userId,
        userEmail: context.userEmail,
        userRole: context.userRole,
        tableName,
        recordId,
        action,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static extractContext(req: Request): AuditContext {
    const user = (req as any).user; // From auth middleware
    return {
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
  }

  static async logProductChange(
    context: AuditContext,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    productId?: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    await this.logChange({
      context,
      tableName: 'products',
      recordId: productId,
      action,
      oldData,
      newData
    });
  }

  static async logUserChange(
    context: AuditContext,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    userId?: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    await this.logChange({
      context,
      tableName: 'users',
      recordId: userId,
      action,
      oldData,
      newData
    });
  }

  static async logOrderChange(
    context: AuditContext,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    orderId?: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    await this.logChange({
      context,
      tableName: 'orders',
      recordId: orderId,
      action,
      oldData,
      newData
    });
  }

  static async logCartChange(
    context: AuditContext,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    cartItemId?: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    await this.logChange({
      context,
      tableName: 'cart_items',
      recordId: cartItemId,
      action,
      oldData,
      newData
    });
  }
}