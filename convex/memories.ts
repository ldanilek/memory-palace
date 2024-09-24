import { PaginationOptions, PaginationResult } from 'convex/server';
import { getUser } from './getShortTerm';
import { query } from './_generated/server'
import { internalMutation } from "./_generated/server";
import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";
import { Aggregate } from "@convex-dev/aggregate";
import { DataModel, Id } from './_generated/dataModel';
import { MutationBuilder } from '../node_modules/convex/dist/cjs-types/server/index';

const aggregate = new Aggregate<string, Id<"memories">>(components.aggregate);

export default query(async ({ db, auth }, {paginationOpts}: {paginationOpts: PaginationOptions}): Promise<PaginationResult<string>> => {
  const user = await getUser(db, auth);
  const memoryDocs = await db.query('memories')
    .withIndex("by_author", q => q.eq('author', user._id))
    .order('desc')
    .paginate(paginationOpts);
  const {page, ...rest} = memoryDocs;
  return {page: page.map((d) => d.text), ...rest};
});

export const count = query(async (ctx) => {
  const user = await getUser(ctx.db, ctx.auth);
  return await aggregate.count(ctx, {
    lower: { key: user._id, inclusive: true },
    upper: { key: user._id, inclusive: true },
  });
});

export const migrations = new Migrations<DataModel>(components.migrations, {
  internalMutation: internalMutation as any as MutationBuilder<DataModel, "internal">,
});

export const aggregateMemories = migrations.define({
  table: "memories",
  migrateOne: async (ctx, doc) => {
    console.log("aggregating memory", doc._id);
    aggregate.insertIfDoesNotExist(ctx, doc.author, doc._id);
  },
});

export const run = migrations.runFromCLI();

