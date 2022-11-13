import { mutation } from './_generated/server'

export default mutation(
  async ({ db, auth }, memoryText: string) => {
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
    const shortTermDoc = await db.query('shortTerm').withIndex("by_author", q => q.eq('author', user._id)).order('desc').first();
    if (!shortTermDoc) {
      await db.insert('shortTerm', {
        text: memoryText,
        author: user._id,
        version: 0,
      });
      return;
    }
    await db.insert('shortTerm', {
      text: memoryText,
      author: user._id,
      version: ((shortTermDoc!.version ?? 0) + 1),
    });
  });
