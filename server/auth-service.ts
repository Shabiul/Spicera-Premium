import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from '@shared/schema';
import type { User, RegisterRequest, LoginRequest } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async register(userData: RegisterRequest): Promise<{ user: AuthUser; token: string }> {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email));
    if (existingUser.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user
    const [newUser] = await db.insert(users).values({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      role: 'customer',
    }).returning();

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    const token = this.generateToken(authUser);

    return { user: authUser, token };
  }

  async login(credentials: LoginRequest): Promise<{ user: AuthUser; token: string }> {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, credentials.email));
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = this.generateToken(authUser);

    return { user: authUser, token };
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async createAdminUser(email: string, password: string, name: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    const [adminUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    }).returning();
    return adminUser;
  }
}

export const authService = new AuthService();