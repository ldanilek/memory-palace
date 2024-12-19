import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import { EditorContent, EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { api } from "../convex/_generated/api";
import { RegisteredQuery } from "convex/server";
import { RegisteredQuery as CjsRegisteredQuery } from "../node_modules/convex/dist/cjs-types/server";

import type * as prosemirror from "../convex/prosemirror";
export type IsRegisteredQuery<Export> = Export extends RegisteredQuery<any, any, any> ? string : never;
export type IsCjsRegisteredQuery<Export> = Export extends CjsRegisteredQuery<any, any, any> ? string : never;

const _x: IsRegisteredQuery<typeof prosemirror.getSnapshot> = "yes"; // errors
const _y: IsCjsRegisteredQuery<typeof prosemirror.getSnapshot> = "yes"; // works

export function ShortTerm() {
  const sync = useTiptapSync(api.prosemirror, "some-id");
  return sync.isLoading ? (
    <p>Loading...</p>
  ) : sync.initialContent !== null ? (
    <EditorProvider
      content={sync.initialContent}
      extensions={[StarterKit, sync.extension]}
    >
      <EditorContent editor={null} />
    </EditorProvider>
  ) : (
    <button onClick={() => sync.create({ type: "doc", content: [] })}>
      Create document
    </button>
  );
}
