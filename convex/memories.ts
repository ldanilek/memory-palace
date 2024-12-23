import { PaginationOptions, paginationOptsValidator, PaginationResult } from 'convex/server';
import { getUser } from './getShortTerm';
import { mutation, query } from './_generated/server'
import { internalMutation } from "./_generated/server";
import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";
import { Aggregate } from "@convex-dev/aggregate";
import { DataModel, Doc, Id } from './_generated/dataModel';
import { MutationBuilder } from '../node_modules/convex/dist/cjs-types/server/index';

const aggregate = new Aggregate<string, Id<"memories">>(components.aggregate);

export type MemoryContent = {
  kind: "text",
  text: string,
} | {
  kind: "packet",
  id: Id<"memoryPackets">,
};

function memoryContent(doc: Doc<"memories">): MemoryContent {
  if (doc.text !== undefined) {
    return { kind: "text", text: doc.text };
  }
  if (doc.memoryPacket !== undefined) {
    return { kind: "packet", id: doc.memoryPacket! };
  }
  throw new Error("Memory has no content");
}

export default query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, {paginationOpts}): Promise<PaginationResult<MemoryContent>> => {
    const user = await getUser(ctx.db, ctx.auth);
    const memoryDocs = await ctx.db.query('memories')
      .withIndex("by_author", q => q.eq('author', user._id))
      .order('desc')
      .paginate(paginationOpts);
    const {page, ...rest} = memoryDocs;
    return {page: page.map(memoryContent), ...rest};
  },
});

export const count = query(async (ctx) => {
  const user = await getUser(ctx.db, ctx.auth);
  return await aggregate.count(ctx, {
    bounds: {
      lower: { key: user._id, inclusive: true },
      upper: { key: user._id, inclusive: true },
    },
  });
});

export const unsealedPacket = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx.db, ctx.auth);
    const packet = await ctx.db.query('memoryPackets')
      .withIndex("by_author_sealed", q => q.eq('author', user._id).eq('sealed', false))
      .order('desc')
      .unique();
    return packet?._id;
  },
});

export const createUnsealedPacket = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx.db, ctx.auth);
    const existingPacket = await ctx.db.query('memoryPackets')
      .withIndex("by_author_sealed", q => q.eq('author', user._id).eq('sealed', false))
      .unique();
    if (existingPacket !== null) {
      // Already have an unsealed packet.
      return;
    }
    await ctx.db.insert('memoryPackets', {author: user._id, sealed: false});
  },
});

/*
export const migrations = new Migrations<DataModel>(components.migrations, {
  internalMutation: internalMutation as any as MutationBuilder<DataModel, "internal">,
});

export const aggregateMemories = migrations.define({
  table: "memories",
  migrateOne: async (ctx, doc) => {
    aggregate.insertIfDoesNotExist(ctx, doc.author, doc._id);
  },
});

export const run = migrations.runFromCLI();

*/