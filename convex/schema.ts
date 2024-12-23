import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    text: v.optional(v.string()),
    memoryPacket: v.optional(v.id("memoryPackets")),
    author: v.id("users"),
  }).index('by_author', ['author']),
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  // Id<"memoryPackets"> is primary key for prosemirror sync
  memoryPackets: defineTable({
    author: v.id("users"),
    sealed: v.boolean(),
  }).index('by_author_sealed', ['author', 'sealed']),
  shortTerm: defineTable({
    author: v.id("users"),
    text: v.string(),
    version: v.number(),
  }).index('by_author', ['author', 'version']),
});