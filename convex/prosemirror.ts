import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { components } from "./_generated/api";
import { getUser } from "./getShortTerm";
import { DataModel, Id } from "./_generated/dataModel";

const prosemirrorSync = new ProsemirrorSync<Id<"memoryPackets">>(components.prosemirrorSync);
export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi<DataModel>({
  checkRead: async (ctx, id) => {
    const user = await getUser(ctx.db, ctx.auth);
    const packet = await ctx.db.get(id);
    if (packet === null || packet.author !== user._id) {
      throw new Error("Unauthorized read");
    }
  },
  checkWrite: async (ctx, id) => {
    const user = await getUser(ctx.db, ctx.auth);
    const packet = await ctx.db.get(id);
    if (packet === null || packet.author !== user._id) {
      throw new Error("Unauthorized write");
    }
    /* if (packet.sealed) {
      throw new Error("Packet is sealed");
    } */
  },
});
