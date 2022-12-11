import { getUser } from './getShortTerm';
import { mutation } from './_generated/server'

export default mutation(
  async ({ db, auth }, memoryText: string) => {
  const user = await getUser(db, auth);
    await db.insert('memories', {
      text: memoryText,
      author: user._id,
    });
  });
