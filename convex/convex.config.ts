import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import migrations from "@convex-dev/migrations/convex.config";
import prosemirrorSync from "@convex-dev/prosemirror-sync/convex.config";

const app = defineApp();
app.use(aggregate);
app.use(migrations);
app.use(prosemirrorSync);
export default app;
