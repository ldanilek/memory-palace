import { getUser } from './getShortTerm';
import { mutation } from './_generated/server'

export default mutation(
  async ({ db, auth }, memoryText: string) => {
    const user = await getUser(db, auth);
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
