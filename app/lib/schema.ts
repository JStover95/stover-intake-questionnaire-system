import { boolean, integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["IN_PROGRESS", "COMPLETE"])

export const joinQuestionnaireQuestion = pgTable("JoinQuestionnaireQuestion", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  questionId: integer("question_id").references(() => question.id).notNull(),
  questionnaireId: integer("questionnaire_id").references(() => questionnaire.id).notNull(),
  priority: text("priority").notNull(),
});

export const joinUserQuestionnaire = pgTable("JoinUserQuestionnaire", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  userId: integer("user_id").references(() => user.id).notNull(),
  questionnaireId: integer("questionnaire_id").references(() => questionnaire.id).notNull(),
  status: statusEnum("status").notNull().default("IN_PROGRESS"),
});

export const question = pgTable("Question", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  options: text("options").array(),
});

export const questionnaire = pgTable("Questionnaire", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  name: text("name").notNull(),
});

export const user = pgTable("User", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const userResponse = pgTable("UserResponse", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  userId: integer("user_id").references(() => user.id).notNull(),
  questionId: integer("question_id").references(() => question.id).notNull(),
  responses: text("responses").notNull(),
});
