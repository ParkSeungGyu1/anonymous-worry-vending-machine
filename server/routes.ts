import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorrySchema, insertCheerSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/worries", async (_req, res) => {
    const worries = await storage.getWorries();
    res.json(worries);
  });

  app.get("/api/worries/random", async (_req, res) => {
    const worry = await storage.getRandomWorry();
    if (!worry) return res.status(404).json({ message: "No worries found" });
    res.json(worry);
  });

  app.get("/api/worries/:id", async (req, res) => {
    const worry = await storage.getWorry(parseInt(req.params.id));
    if (!worry) return res.status(404).json({ message: "Worry not found" });
    res.json(worry);
  });

  app.post("/api/worries", async (req, res) => {
    const result = insertWorrySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid worry data" });
    }
    const worry = await storage.createWorry(result.data);
    res.json(worry);
  });

  app.get("/api/worries/:id/cheers", async (req, res) => {
    const cheers = await storage.getCheers(parseInt(req.params.id));
    res.json(cheers);
  });

  app.post("/api/cheers", async (req, res) => {
    const result = insertCheerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid cheer data" });
    }
    const cheer = await storage.createCheer(result.data);
    res.json(cheer);
  });

  return httpServer;
}
