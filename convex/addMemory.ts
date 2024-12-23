import { getUser } from './getShortTerm';
import { mutation } from './_generated/server'
import { components } from './_generated/api';
import { ProsemirrorSync } from '@convex-dev/prosemirror-sync';

export const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

export default mutation(
  async ({ db, auth }, {memoryText}: {memoryText: string}) => {
  const user = await getUser(db, auth);
    await db.insert('memories', {
      text: memoryText,
      author: user._id,
    });
  });

export const addMemoryFromProsemirror = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx.db, ctx.auth);
    const packet = await ctx.db.query('memoryPackets')
      .withIndex("by_author_sealed", q => q.eq('author', user._id).eq('sealed', false))
      .unique();
    if (packet === null) {
      throw new Error("No unsealed packet found");
    }
    // Seal the packet.
    await ctx.db.patch(packet._id, {sealed: true});
    // Save the packet as a memory.
    await ctx.db.insert('memories', {
      memoryPacket: packet._id,
      author: user._id,
    });
  }
});
