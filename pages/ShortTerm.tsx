import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import { EditorContent, EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { api } from "../convex/_generated/api";
import styles from '../styles/Home.module.css'
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../convex/_generated/dataModel";

export default function ShortTerm() {
  const unsealedPacketId = useQuery(api.memories.unsealedPacket);
  const createUnsealedPacket = useMutation(api.memories.createUnsealedPacket);

  useEffect(() => {
    if (unsealedPacketId === null) {
      void createUnsealedPacket();
    }
  }, [unsealedPacketId]);

  return unsealedPacketId === null || unsealedPacketId === undefined ? (
    <Loading />
  ) : (
    <ShortTermWithPacket key={unsealedPacketId} packetId={unsealedPacketId} />
  );
}

export function ShortTermWithPacket({ packetId }: { packetId: Id<"memoryPackets"> }) {
  const sync = useTiptapSync(api.prosemirror, packetId);

  useEffect(() => {
    if (!sync.isLoading && sync.initialContent === null) {
      sync.create({ type: "doc", content: [] });
    }
  }, [sync.isLoading, sync.initialContent]);

  return sync.isLoading || sync.initialContent === null ? (
    <Loading />
  ) : (
    <EditorProvider
      content={sync.initialContent}
      extensions={[StarterKit, sync.extension]}
      editorProps={{
        attributes: {
          class: styles.ProseMirror,
        },
      }}
      editorContainerProps={{
        className: styles.container,
        style: {
          width: '100%',
          margin: '1em',
        },
      }}
    >
      <EditorContent editor={null} />
      <RecordButton />
    </EditorProvider>
  );
}

function Loading() {
  return <>
    <p className={styles.ProseMirror}>Loading...</p>
    <RecordButton />
  </>;
}

function RecordButton() {
  const sealMemory = useMutation(api.addMemory.addMemoryFromProsemirror);
  return <button className={styles.button} onClick={async () => {
    await sealMemory();
  }}>Record</button>;
}