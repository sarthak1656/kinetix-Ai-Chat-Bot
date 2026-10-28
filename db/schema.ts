import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  agentCredits: integer("agentCredits").default(3),
  usageCredits: integer("usageCredits").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tools = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),

  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),

  category: varchar("category", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),

  icon: text("icon"),
  status: varchar("status", { length: 50 }).default("active"),

  requiresAuth: boolean("requires_auth").default(false),
  authType: varchar("auth_type", { length: 50 }),
  authProvider: varchar("auth_provider", { length: 100 }),

  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  useCases: jsonb("use_cases").$type<string[]>().default([]),

  permissions: jsonb("permissions").$type<string[]>().default([]),

  approvalRules: jsonb("approval_rules").$type<Record<string, boolean>>(),

  config: jsonb("config").$type<Record<string, any>>(),

  riskLevel: varchar("risk_level", { length: 30 }).default("low"),

  canRead: boolean("can_read").default(false),
  canWrite: boolean("can_write").default(false),
  canDelete: boolean("can_delete").default(false),
  canExecute: boolean("can_execute").default(true),

  enabled: boolean("enabled").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const AgentConfig = pgTable("agentConfig", {
  id: serial("id").primaryKey(),
  userEmail: text("email").references(() => users.email),
  agentId: varchar("agentId", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  agentImage: varchar("agentImage"),
  description: text("description"),
  instructions: text("instructions"),
  objective: text("objective"),
  model: varchar("model", { length: 100 }),
  tools: jsonb("tools"),
  skills: jsonb("skills"),
  schedule: jsonb("schedule"),
  outputFormat: text("outputFormat"),
  status: varchar("status").default("active"),
  composioSessionId: varchar("composioSessionId"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
