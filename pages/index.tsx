import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useQuery, useMutation } from '../convex/_generated/react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import { Id } from '../convex/_generated/dataModel'


function Logout() {
  const { logout, user } = useAuth0();
  // useEffect(() => logout());
  return (
    <div>
      {/* We know this component only renders if the user is logged in. */}
      {user!.name ? <p>{`YOU ARE ${user!.name}`}</p> : null }
      <button
        className="btn btn-primary"
        onClick={() => logout({ returnTo: window.location.origin })}
      >
        Log out
      </button>
    </div>
  );
}

const Memory = ({index, mem}: {index: number, mem: string}) => {
  const [isHover, setIsHover] = useState(false);

   const handleMouseEnter = () => {
      setIsHover(true);
   };
   const handleMouseLeave = () => {
      setIsHover(false);
   };
  let opacity = 100 / (5 * (index + 1));
  if (isHover) {
    opacity = 100;
  }
  const boxStyle = {
    opacity: opacity + '%',
  };

  return <div
    style={{border: '1px solid rgba(0, 0, 0, 0.1)', }}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    <p
      style={boxStyle}
    >{mem}</p>
    </div>;
}

const Home: NextPage = () => {
  const memories = useQuery('memories') ?? [];
  const addMemory = useMutation('addMemory');
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation("storeUser");
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
          And of course you can revisit them whenever you want.
        </h3>
        <Logout />
        <textarea style={{width: '75%', height: '8em'}} placeholder={
          "Each memory was, for an instant, the most important part of your life." +
          " And your life is important. Record them in Convex forever before " +
          "they are lost forever."} value={input} onChange={(e) => setInput(e.target.value)} />
        <button className={styles.button} onClick={() => {
          addMemory(input);
          setInput('');
        }}>Record</button>
        {
          memories.map((mem, i) => <Memory key={mem} mem={mem} index={i} />)
        }
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
}

export default Home
