import { MutationBuilder, PaginationOptions, PaginationResult } from 'convex/server';
import { getUser } from './getShortTerm';
import { internalMutation, query } from './_generated/server'
import { components } from "./_generated/api";
import { Aggregate } from "@convex-dev/aggregate";

import { DataModel, Doc, Id } from './_generated/dataModel';
import { BetterOmit, DocumentByName } from 'convex/server';
import * as cjsServer from "../node_modules/convex/dist/cjs-types/server/index";
import { Migrations } from '@convex-dev/migrations';

/*
export type BetterOmit2<T, K extends keyof T> = {
  [Property in keyof T as Property extends K ? never : Property]: T[Property];
};
export type BetterOmit3<T, K extends keyof T> = {
  [Property in keyof T as Property extends K ? never : Property]: T[Property];
};
function foo<TableName extends 'users'>() {
  // this is the minimal part of internalMutation that fails to typecheck (within the argument to `db.insert`):
  // ERROR:
  const _b: BetterOmit2<Doc<TableName>, '_id'> = null as any as BetterOmit3<Doc<TableName>, '_id'>;
}
// with fixed table name 'users' works:
// NO ERROR:
const _y: cjsServer.BetterOmit<Doc<'users'>, '_id'> = null as any as BetterOmit<Doc<'users'>, '_id'>;
*/

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

/*
export const aggregateMemories = migrations.define({
  table: "memories",
  migrateOne: async (ctx, doc) => {
    console.log("aggregating memory", doc._id);
    aggregate.insertIfDoesNotExist(ctx, doc.author, doc._id);
  },
});

export const run = migrations.runFromCLI();

*/
