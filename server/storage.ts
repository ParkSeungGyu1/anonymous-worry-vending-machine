import { worries, cheers, type Worry, type InsertWorry, type Cheer, type InsertCheer } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getWorries(): Promise<Worry[]>;
  getWorry(id: number): Promise<Worry | undefined>;
  createWorry(worry: InsertWorry): Promise<Worry>;
  getCheers(worryId: number): Promise<Cheer[]>;
  createCheer(cheer: InsertCheer): Promise<Cheer>;
  getRandomWorry(): Promise<Worry | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getWorries(): Promise<Worry[]> {
    return await db.select().from(worries).orderBy(desc(worries.createdAt));
  }

  async getWorry(id: number): Promise<Worry | undefined> {
    const [worry] = await db.select().from(worries).where(eq(worries.id, id));
    return worry;
  }

  async createWorry(insertWorry: InsertWorry): Promise<Worry> {
    const [worry] = await db.insert(worries).values(insertWorry).returning();
    return worry;
  }

  async getCheers(worryId: number): Promise<Cheer[]> {
    return await db.select().from(cheers).where(eq(cheers.worryId, worryId)).orderBy(desc(cheers.createdAt));
  }

  async createCheer(insertCheer: InsertCheer): Promise<Cheer> {
    const [cheer] = await db.insert(cheers).values(insertCheer).returning();
    return cheer;
  }

  async getRandomWorry(): Promise<Worry | undefined> {
    const allWorries = await db.select().from(worries);
    if (allWorries.length === 0) return undefined;
    return allWorries[Math.floor(Math.random() * allWorries.length)];
  }
}

export const storage = new DatabaseStorage();
