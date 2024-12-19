import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import styles from '../styles/Home.module.css'

export const ShortTerm = () => {
  const shortTerm = useQuery(api.getShortTerm.default);
  const [recalledShortTerm, setRecalledShortTerm] = useState(false);
  const reviseShortTerm = useMutation(api.reviseShortTerm.default).withOptimisticUpdate((localQueryStore, {memoryText}) => {
    localQueryStore.setQuery(api.getShortTerm.default, {}, memoryText);
    // console.log(`optimistic for ${memoryText}`);
  });
  const [input, setInput] = useState('');
  const addMemory = useMutation(api.addMemory.default);

  useEffect(() => {
    if (typeof shortTerm !== 'string') {
      return;
    }
    if (recalledShortTerm) {
      return;
    }
    // don't do it again.
    setRecalledShortTerm(true);
    // If still no typing, let short term memory kick in.
    console.log('input', input);
    console.log('shortTerm', shortTerm);
    if (!input && shortTerm) {
      setInput(shortTerm);
    }
  }, [shortTerm]);

  return <div className={styles.container} style={{width: '100%'}} >
    <textarea style={{width: '95%', height: '8em'}} placeholder={
          "Each memory was, for an instant, the most important part of your life." +
          " And your life is important. Record them in Convex forever before " +
          "they are lost forever."} value={input} onChange={(e) => {
            setInput(e.target.value);
            reviseShortTerm({memoryText: e.target.value});
          }} />
        <button className={styles.button} onClick={async () => {
          if (input) {
            await addMemory({memoryText: input});
          }
          setInput('');
          reviseShortTerm({memoryText: ''});
        }}>Record</button>
        </div>
}
