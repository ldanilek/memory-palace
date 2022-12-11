import { PaginationOptions, PaginationResult } from 'convex/server';
import { getUser } from './getShortTerm';
import { query } from './_generated/server'

export default query(async ({ db, auth }, opts: PaginationOptions): Promise<PaginationResult<string>> => {
  const user = await getUser(db, auth);
  const memoryDocs = await db.query('memories')
    .withIndex("by_author", q => q.eq('author', user._id))
    .order('desc')
    .paginate(opts);
  const {page, ...rest} = memoryDocs;
  return {page: page.map((d) => d.text), ...rest};
});
