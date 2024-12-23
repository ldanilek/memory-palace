import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useQuery, useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { ForwardedRef, forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import { Id } from '../convex/_generated/dataModel'
import { AuthLoading, Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import ShortTerm from './ShortTerm';
import { MemoryContent } from '../convex/memories'
import { useTiptapSync } from '@convex-dev/prosemirror-sync/tiptap'
import { EditorContent, EditorProvider } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'


export function Login() {
  const { isLoading, loginWithRedirect } = useAuth0();
  if (isLoading) {
    return <button className="btn btn-primary">Loading...</button>;
  }
  return (
    <main className="py-4">
      <h1 className="text-center">Memory Palace</h1>
      <div className="text-center">
        <span>
          <button className="btn btn-primary" onClick={() => loginWithRedirect()}>
            Log in
          </button>
        </span>
      </div>
    </main>
  );
}


function Logout() {
  const { logout, user } = useAuth0();
  // useEffect(() => logout());
  return (
    <div className={styles.container}>
      {/* We know this component only renders if the user is logged in. */}
      {user?.name ? <p style={{fontFamily:"Marker Felt"}}>{`YOU ARE ${user!.name}`}</p> : null }
      <button
        className="btn btn-primary"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      >
        Log out
      </button>
    </div>
  );
}

const Memory = forwardRef(({
  index, 
  mem,
  onClick,
  reminiscing,
}: {index: number, mem: MemoryContent, onClick: (e: React.MouseEvent<HTMLDivElement>) => void, reminiscing: boolean}, ref: ForwardedRef<HTMLDivElement>) => {
  const [isHover, setIsHover] = useState(false);

   const handleMouseEnter = () => {
      setIsHover(true);
   };
   const handleMouseLeave = () => {
      setIsHover(false);
   };
  let opacity = 100 / (5 * (index + 1));
  if (isHover || reminiscing) {
    opacity = 100;
  }
  const boxStyle = {
    opacity: opacity + '%',
  };

  return <div
    className={styles.memoryBox}
    style={{border: '1px solid rgba(0, 0, 0, 0.1)', }}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    onClick={onClick}
  >
    <p
      style={boxStyle}
    >{mem.kind === "text" ? mem.text : <MemoryWithPacket key={mem.id} packetId={mem.id} />}</p>
    </div>;
});

function MemoryWithPacket({packetId}: {packetId: Id<"memoryPackets">}) {
  const sync = useTiptapSync(api.prosemirror, packetId);
  return (sync.isLoading || sync.initialContent === null ? <p>Loading...</p> :
    <EditorProvider
      immediatelyRender={false}
      content={sync.initialContent}
      extensions={[StarterKit, sync.extension]}
      editable={false}
      editorProps={{
        attributes: {
          class: "ProseMirror",
        },
      }}
    >
      <EditorContent editor={null} />
    </EditorProvider>
  );
}

const Memories = () => {
  const {results: memories, status, loadMore} = usePaginatedQuery(api.memories.default, {}, {initialNumItems: 10});
  const [reminiscing, setReminiscing] = useState(false);
  const loader = useRef(null);
  /// When the third to last memory is on screen, load more.
  const loaderIndex = memories.length - 3;
  const handleObserver = (entries: any) => {
    const target = entries[0];
    console.log("handle observer triggered", target.isIntersecting, status);
    if (target.isIntersecting && status == 'CanLoadMore') {
      loadMore(5);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver);
    if (loader.current) {
      observer.observe(loader.current);
      console.log("intersection observer created at index", loaderIndex);
    }
    return () => observer.disconnect();
  }, [loader, loaderIndex]);

  return <div className={styles.container}>{
          memories.map((mem, i) => <Memory
            key={JSON.stringify(mem)}
            mem={mem} 
            index={i} 
            reminiscing={reminiscing}
            onClick={(e) => setReminiscing(!reminiscing)}
            ref={i === loaderIndex ? loader : null}
          />)
        }
        </div>
}

const LoggedIn = () => {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation(api.storeUser.default);
  // Call the `storeUser` mutation function to store
  // the current user in the `users` table and return the `Id` value.
  useEffect(() => {
    // Store the user in the database.
    // Recall that `storeUser` gets the user information via the `auth`
    // object on the server. You don't need to pass anything manually here.
    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }
    createUser().catch(console.error);
    return () => setUserId(null);
  }, [storeUser]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Mind Palace</title>
        <meta name="description" content="Memory Palace: storage in Convex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>
          Welcome to your Memory Palace
        </h1>
        <h3 style={{opacity: '20%'}}>
          A place to put memories that might otherwise by lost forever by leaky compression in our metaphorical mental machinery.
          Don't despair. As the memories fade on screen they are just getting started in their long immortal lives on Convex servers.
          And of course you can revisit them whenever you want. This is your personal space. Only you can see this.
        </h3>
        <Logout />
        { userId ? <ShortTerm /> : null }
        { userId ? <Memories /> : null }
      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.convex.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/convex.svg" alt="Convex Logo" width={90} height={18} />
          </span>
        </a>
      </footer>
    </div>
  )
};

const Home: NextPage = () => {
  return (<div>
    <Authenticated><LoggedIn /></Authenticated>
    <Unauthenticated><Login /></Unauthenticated>
    <AuthLoading>Logging in...</AuthLoading>
  </div>);
}

export default Home
