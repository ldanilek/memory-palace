import { query } from './_generated/server'

export default query(async ({ db, auth }): Promise<string[]> => {
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
  const memoryDocs = await db.query('memories').withIndex("by_author", q => q.eq('author', user._id)).order('desc').collect();
  return memoryDocs.map((d) => d.text);
});
