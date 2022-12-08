import { PaginationOptions, PaginationResult } from 'convex/server';
import { query } from './_generated/server'

export default query(async ({ db, auth }, opts: PaginationOptions): Promise<PaginationResult<string>> => {
  const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to sendMessage");
    }
    const user = await db
      .query("users")
      .withIndex("by_token", q =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  const memoryDocs = await db.query('memories')
    .withIndex("by_author", q => q.eq('author', user._id))
    .order('desc')
    .paginate(opts);
  const {page, ...rest} = memoryDocs;
  return {page: page.map((d) => d.text), ...rest};
});
