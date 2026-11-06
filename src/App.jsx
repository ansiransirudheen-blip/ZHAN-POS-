import React,{useEffect,useState} from 'react';
import {supabase} from './lib/supabase';
const pages=['Dashboard','Billing','Products & Stock','Purchases','Customers','Reports','Settings'];
export default function App(){
 const [page,setPage]=useState('Dashboard');
 const [session,setSession]=useState(null);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
  if(!supabase)return;
  let active=true;
  supabase.auth.getSession().then(({data,error})=>{if(active){setSession(data?.session??null);if(error)setError(error.message);}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,newSession)=>{if(active)setSession(newSession);});
  return ()=>{active=false;subscription.unsubscribe();};
 },[]);
 async function signIn(event){
  event.preventDefault();if(!supabase)return;
  setBusy(true);setError('');
  try{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);}
  catch{setError('Could not connect. Please try again.');}
  finally{setPassword('');setBusy(false);}
 }
 return <div className="layout"><aside><div className="logo">ZAHN<small>LUXURY PERFUMES</small></div><nav>{pages.map(p=><button key={p} className={p===page?'selected':''} onClick={()=>setPage(p)}>{p}</button>)}</nav><footer>ESSENCE OF YOU</footer></aside><main><div className="eyebrow">ZAHN / POINT OF SALE</div><h1>{page}</h1><div className="warning" role="status">Development preview only — bills, purchases and stock changes are disabled.</div>
 {!supabase?<section className="panel"><h2>Cloud connection not configured</h2><p>Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment. Never enter a secret or service-role key here.</p></section>:!session?<section className="panel"><h2>Staff sign in</h2><form onSubmit={signIn} className="signin"><label>Email<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button type="submit" className="submit" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form>{error&&<p role="alert">{error}</p>}</section>:<section className="panel"><p>Signed in as {session.user.email}. Transactions remain disabled until verification.</p><button className="submit" onClick={()=>supabase.auth.signOut()}>Sign out</button></section>}
 <section className="hero"><div className="eyebrow">WELCOME TO ZAHN</div><h2>Luxury retail, beautifully managed.</h2><p>New POS workspace for Android tablets and laptops.</p></section><div className="stats">{['Sales Today','Orders','Products in Stock'].map(x=><article key={x}><span>{x}</span><strong>—</strong><small>Awaiting verified cloud integration</small></article>)}</div><section className="panel"><h2>{page} workspace</h2><p>This module is under development. Existing secured Supabase billing and purchase functions will be integrated after verification. No legacy backups or browser data will be imported.</p></section></main></div>;
}