import { z } from "zod";

/** What a node can look like. The names, apart from the code that draws them. */
export const nodeShapeSchema = z.enum([
  "service",
  "database",
  "server",
  "queue",
  "client",
  "user",
  "cloud",
  "storage",
  "file",
  "controller",
  "router",
  "worker",
  "clock",
  "shield",
  "trigger",
  "agent",
  "model",
  "external",
  "phone",
  "notification",
  "key",
  "log",
]);

export type NodeShape = z.infer<typeof nodeShapeSchema>;
