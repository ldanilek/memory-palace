import { Auth } from 'convex/dist/types/server/server';
import { Document } from './_generated/dataModel';
import { DatabaseReader, query } from './_generated/server'

export const getUser = async (db: DatabaseReader, auth: Auth): Promise<Document<'users'>> => {
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
    return user!;
};

export default query(async ({ db, auth }) => {
  const user = await getUser(db, auth);
  const shortTermDoc = await db.query('shortTerm').withIndex("by_author", q => q.eq('author', user._id)).order('desc').first();
  return shortTermDoc ? shortTermDoc.text : null;
});
