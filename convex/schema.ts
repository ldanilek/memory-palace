import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    text: v.string(),
    author: v.id("users"),
  }).index('by_author', ['author']),
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  shortTerm: defineTable({
    author: v.id("users"),
    text: v.string(),
    version: v.number(),
  }).index('by_author', ['author', 'version']),
});