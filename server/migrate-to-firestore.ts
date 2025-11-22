import 'dotenv/config';
import { db } from "./db";
import {
  contactSubmissions,
  users,
  products,
  cartItems,
  orders,
  orderItems,
  auditLogs,
  coupons,
  couponUsages,
  customerSegments,
  customerSegmentMemberships,
} from "@shared/schema";
import { initFirebaseAdmin, getFirestore, getAuth } from "./firebase-admin";

async function createAdminInFirebase() {
  const auth = getAuth();
  const fs = getFirestore();
  const email = "admin@spicecraft.com";
  const password = "admin123";
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch {
    userRecord = await auth.createUser({ email, password, displayName: "Admin User", emailVerified: true, disabled: false });
  }
  await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });
  const existingDbAdmin = await db.select().from(users).where(users.email.eq(email));
  if (existingDbAdmin.length > 0) {
    const dbAdmin = existingDbAdmin[0];
    const docRef = fs.collection("users").doc(dbAdmin.id);
    try {
      await docRef.create({ id: dbAdmin.id, email: dbAdmin.email, name: dbAdmin.name, role: dbAdmin.role, phone: dbAdmin.phone || null, address: dbAdmin.address || null, isActive: dbAdmin.isActive ?? true, authUid: userRecord.uid, createdAt: (dbAdmin.createdAt as Date)?.toISOString?.() || new Date().toISOString(), updatedAt: (dbAdmin.updatedAt as Date)?.toISOString?.() || new Date().toISOString() });
    } catch {}
  } else {
    const docRef = fs.collection("users").doc(userRecord.uid);
    try {
      await docRef.create({ id: userRecord.uid, email, name: "Admin User", role: "admin", phone: null, address: null, isActive: true, authUid: userRecord.uid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    } catch {}
  }
}

async function migrateTable<T>(name: string, rows: T[], map: (row: any) => any) {
  const fs = getFirestore();
  const col = fs.collection(name);
  let created = 0;
  for (const row of rows) {
    const id = String((row as any).id);
    const data = map(row);
    try {
      await col.doc(id).create(data);
      created++;
    } catch {}
  }
  return created;
}

function iso(d: any) {
  return (d as Date)?.toISOString?.() || new Date().toISOString();
}

async function migrate() {
  initFirebaseAdmin();
  const safe = async (fn: () => Promise<any[]>) => { try { return await fn(); } catch { return []; } };
  const cs = await safe(() => db.select().from(contactSubmissions));
  const us = await safe(() => db.select().from(users));
  const ps = await safe(() => db.select().from(products));
  const ci = await safe(() => db.select().from(cartItems));
  const os = await safe(() => db.select().from(orders));
  const oi = await safe(() => db.select().from(orderItems));
  const al = await safe(() => db.select().from(auditLogs));
  const cps = await safe(() => db.select().from(coupons));
  const cu = await safe(() => db.select().from(couponUsages));
  const seg = await safe(() => db.select().from(customerSegments));
  const segm = await safe(() => db.select().from(customerSegmentMemberships));
  await createAdminInFirebase();
  await migrateTable("contact_submissions", cs, (r) => ({ id: r.id, name: r.name, email: r.email, subject: r.subject, message: r.message, createdAt: iso(r.createdAt) }));
  await migrateTable("users", us, (r) => ({ id: r.id, email: r.email, name: r.name, role: r.role, phone: r.phone || null, address: r.address || null, isActive: r.isActive ?? true, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) }));
  await migrateTable("products", ps, (r) => ({ id: r.id, name: r.name, description: r.description, price: String(r.price), image: r.image, category: r.category, stock: Number(r.stock), featured: !!r.featured, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) }));
  await migrateTable("cart_items", ci, (r) => ({ id: r.id, sessionId: r.sessionId || null, userId: r.userId || null, productId: r.productId, quantity: Number(r.quantity), createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) }));
  await migrateTable("orders", os, (r) => ({ id: r.id, userId: r.userId || null, customerName: r.customerName, customerEmail: r.customerEmail, customerPhone: r.customerPhone || null, shippingAddress: r.shippingAddress, totalAmount: String(r.totalAmount), status: r.status, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) }));
  await migrateTable("order_items", oi, (r) => ({ id: r.id, orderId: r.orderId, productId: r.productId, quantity: Number(r.quantity), unitPrice: String(r.unitPrice), totalPrice: String(r.totalPrice) }));
  await migrateTable("audit_logs", al, (r) => ({ id: r.id, userId: r.userId || null, userEmail: r.userEmail || null, userRole: r.userRole || null, tableName: r.tableName, recordId: r.recordId || null, action: r.action, oldData: r.oldData || null, newData: r.newData || null, ipAddress: r.ipAddress || null, userAgent: r.userAgent || null, createdAt: iso(r.createdAt) }));
  await migrateTable("coupons", cps, (r) => ({ id: r.id, code: r.code, name: r.name, description: r.description || null, discountType: r.discountType, discountValue: String(r.discountValue), minimumOrderAmount: r.minimumOrderAmount ? String(r.minimumOrderAmount) : null, maximumDiscountAmount: r.maximumDiscountAmount ? String(r.maximumDiscountAmount) : null, usageLimit: r.usageLimit ? Number(r.usageLimit) : null, usageCount: r.usageCount ? Number(r.usageCount) : 0, userUsageLimit: Number(r.userUsageLimit), isActive: !!r.isActive, validFrom: iso(r.validFrom), validUntil: iso(r.validUntil), applicableCategories: r.applicableCategories || null, applicableProducts: r.applicableProducts || null, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) }));
  await migrateTable("coupon_usages", cu, (r) => ({ id: r.id, couponId: r.couponId, userId: r.userId || null, orderId: r.orderId || null, discountAmount: String(r.discountAmount), usedAt: iso(r.usedAt) }));
  await migrateTable("customer_segments", seg, (r) => ({ id: r.id, name: r.name, description: r.description || null, criteria: r.criteria, isActive: !!r.isActive, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) }));
  await migrateTable("customer_segment_memberships", segm, (r) => ({ id: r.id, segmentId: r.segmentId, userId: r.userId, addedAt: iso(r.addedAt), lastUpdated: iso(r.lastUpdated) }));
}

migrate().then(() => {
  console.log("migration completed");
  process.exit(0);
}).catch((e) => {
  console.error("migration failed", e);
  process.exit(1);
});
