import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  memories: defineTable({
    text: s.string(),
    author: s.id("users"),
  }).index('by_author', ['author']),
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }).index("by_token", ["tokenIdentifier"]),
  shortTerm: defineTable({
    author: s.id("users"),
    text: s.string(),
  }).index('by_author', ['author']),
});