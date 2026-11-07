import React,{useEffect,useMemo,useState} from 'react';
import {supabase} from './lib/supabase';
import {pinKey,isPin,hashPin,getPin} from './lib/devicePin.js';
import Purchases from './components/Purchases.jsx';
import Reports from './components/Reports.jsx';
const pages=['Dashboard','Billing','Products & Stock','Purchases','Customers','Reports','Settings'];
const liveEnabled=import.meta.env.VITE_ENABLE_LIVE_BILLING==='true';
const money=n=>Number(n||0).toFixed(2);

export default function App(){
 const [pinMode,setPinMode]=useState('checking'),[pin,setPin]=useState(''),[pinAgain,setPinAgain]=useState(''),[pinError,setPinError]=useState(''),[pinTries,setPinTries]=useState(0),[pinBusy,setPinBusy]=useState(false);
 const [page,setPage]=useState('Dashboard'),[session,setSession]=useState(null),[staff,setStaff]=useState(null);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [products,setProducts]=useState([]),[loading,setLoading]=useState(false),[cart,setCart]=useState({});
 const [payment,setPayment]=useState('cash'),[customer,setCustomer]=useState(''),[phone,setPhone]=useState('');
 const [receipt,setReceipt]=useState(null),[pending,setPending]=useState(null),[search,setSearch]=useState('');
 const [recovery,setRecovery]=useState(false),[resetPassword,setResetPassword]=useState(''),[resetConfirm,setResetConfirm]=useState(''),[resetNotice,setResetNotice]=useState('');
 useEffect(()=>{if(!supabase)return;let active=true;
  if(window.location.hash.includes('type=recovery')||new URLSearchParams(window.location.search).get('type')==='recovery')setRecovery(true);
  supabase.auth.getSession().then(({data,error})=>{if(active){setSession(data?.session??null);if(error)setError(error.message);}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{if(active){setSession(s);if(event==='PASSWORD_RECOVERY')setRecovery(true);}});
  return()=>{active=false;subscription.unsubscribe();};
 },[]);
 useEffect(()=>{let active=true;setProducts([]);setStaff(null);setCart({});setReceipt(null);setPending(null);
  if(!supabase||!session?.user?.id||pinMode!=='unlocked')return;
  (async()=>{setLoading(true);const [a,b]=await Promise.all([
    supabase.from('staff_profiles').select('role,is_active,display_name').eq('user_id',session.user.id).maybeSingle(),
    supabase.from('products').select('id,name,brand,sku,size_ml,selling_price,stock_quantity,low_stock_threshold').order('name')]);
    if(active){setStaff(a.error?null:a.data?.is_active?a.data:null);setProducts(b.error?[]:b.data||[]);setError(a.error?.message||b.error?.message||'');setLoading(false);}
  })();return()=>{active=false};
 },[session?.user?.id,pinMode]);

 useEffect(()=>{
  setPin('');setPinAgain('');setPinTries(0);setPinError('');
  setPinMode(session?.user?.id&&getPin(session.user.id)?'locked':'unlocked');
 },[session?.user?.id]);
 // The PIN is a local convenience screen lock, not a server-side security boundary.
 const locked=!!session&&!recovery&&pinMode!=='unlocked';
 async function enrollPin(e){
  e.preventDefault();setPinError('');
  if(!isPin(pin)||pin!==pinAgain){setPinError('PINs must match and contain six digits.');return}
  setPinBusy(true);
  try{
   const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));
   const hash=await hashPin(pin,salt);
   localStorage.setItem(pinKey(session.user.id),JSON.stringify({salt,hash}));
   setPin('');setPinAgain('');setPinError('PIN quick unlock enabled for this browser.');
  }catch{setPinError('Unable to save PIN on this browser.')}
  finally{setPinBusy(false)}
 }
 async function unlockPin(e){
  e.preventDefault();if(pinBusy||!isPin(pin))return;
  setPinBusy(true);setPinError('');
  try{
   const record=getPin(session.user.id);
   if(record&&await hashPin(pin,record.salt)===record.hash){
    setPinMode('unlocked');setPin('');setPinTries(0);return;
   }
   const count=pinTries+1;setPinTries(count);setPin('');
   if(count>=5){
    localStorage.removeItem(pinKey(session.user.id));
    await supabase.auth.signOut();
    setPinError('Too many attempts. Sign in with email and password.');
   }else setPinError('Incorrect PIN. '+(5-count)+' attempts left.');
  }catch{setPinError('PIN unlock unavailable. Use email and password.')}
  finally{setPinBusy(false)}
 }
 const authorized=!!staff&&!locked, cartItems=useMemo(()=>products.filter(p=>cart[p.id]>0).map(p=>({...p,quantity:cart[p.id]})),[products,cart]);
 const total=cartItems.reduce((sum,p)=>sum+p.quantity*Number(p.selling_price),0),taxable=Math.round(total/1.15*100)/100,vat=total-taxable;
 const filtered=products.filter(p=>(p.name+' '+(p.sku||'')+' '+(p.brand||'')).toLowerCase().includes(search.toLowerCase()));
 function changeQty(p,delta){if(pending)return;setCart(c=>({...c,[p.id]:Math.max(0,Math.min(p.stock_quantity,(c[p.id]||0)+delta))}));}
 async function login(e){e.preventDefault();setBusy(true);setError('');try{const{error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message)}catch{setError('Connection failed')}finally{setBusy(false);setPassword('')}}
 async function requestReset(){setBusy(true);setError('');setResetNotice('');try{const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/'});if(error)throw error;setResetNotice('If this email has an account, a password reset link has been sent. Open the latest email.')}catch(e){setError(e.message||'Unable to send reset email')}finally{setBusy(false)}}
 async function completeReset(e){e.preventDefault();setError('');if(resetPassword.length<8){setError('Use a password with at least 8 characters.');return}if(resetPassword!==resetConfirm){setError('Passwords do not match.');return}setBusy(true);try{const {error}=await supabase.auth.updateUser({password:resetPassword});if(error)throw error;setResetPassword('');setResetConfirm('');setRecovery(false);setResetNotice('Password updated. You can now sign in.');await supabase.auth.signOut();window.history.replaceState({},'',window.location.pathname);}catch(e){setError(e.message||'Password reset failed. Request a new link.')}finally{setBusy(false)}}
 async function refresh(){if(!supabase)return;const{data,error}=await supabase.from('products').select('id,name,brand,sku,size_ml,selling_price,stock_quantity,low_stock_threshold').order('name');if(error)setError(error.message);else setProducts(data||[])}
 async function saveBill(){
  if(!liveEnabled||!authorized||!cartItems.length||busy||receipt)return;
  const payload=pending||{p_client_request_id:crypto.randomUUID(),p_payment_method:payment,p_customer_name:customer.trim()||null,p_customer_phone:phone.trim()||null,p_items:cartItems.map(p=>({product_id:p.id,quantity:p.quantity,discount_amount:0}))};
  setPending(payload);setBusy(true);setError('');
  try{const{data,error}=await supabase.rpc('save_pos_bill',payload);if(error)throw error;
   setReceipt({...data,items:cartItems,customer:payload.p_customer_name,phone:payload.p_customer_phone,payment:payload.p_payment_method,printed_at:new Date().toISOString()});setPending(null);setCart({});await refresh();
  }catch(e){setError('Bill not confirmed: '+(e.message||'Network error')+'. Retry uses the same request ID; do not create a new bill.');}
  finally{setBusy(false)}
 }
 return <div className="layout"><aside><div className="logo">ZAHN<small>LUXURY PERFUMES</small></div><nav>{!locked&&pages.map(p=><button key={p} className={p===page?'selected':''} onClick={()=>setPage(p)}>{p}</button>)}</nav><footer>ESSENCE OF YOU</footer></aside><main><div className="eyebrow">ZAHN / POINT OF SALE</div><h1>{page}</h1><div className="warning" role="status">{liveEnabled?'Live billing configured — verify staff, stock and payment before saving.':'SAFE PREVIEW — live billing is disabled; no transactions can be saved.'}</div>
 {!supabase?<section className="panel"><h2>Cloud connection not configured</h2><p>Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in deployment settings. Never use a secret key.</p><button type="button" onClick={()=>setReceipt({invoice_number:"DEMO-0001",printed_at:new Date().toISOString(),customer:"Demo customer",phone:null,payment:"cash",items:[{id:"demo-item",name:"Sample Perfume — DEMO ONLY",size_ml:100,quantity:1,selling_price:115}],taxable_amount:115,vat_amount:0,grand_total:115})}>Preview sample receipt (no sale saved)</button></section>:recovery?<section className="panel"><h2>Set new password</h2><p>Enter a new password for your ZAHN POS account.</p><form className="signin" onSubmit={completeReset}><label>New password<input type="password" autoComplete="new-password" minLength={8} required value={resetPassword} onChange={e=>setResetPassword(e.target.value)}/></label><label>Confirm password<input type="password" autoComplete="new-password" minLength={8} required value={resetConfirm} onChange={e=>setResetConfirm(e.target.value)}/></label><button className="submit" disabled={busy||!session}>Update password</button></form>{!session&&<p>Waiting for a valid reset link. Please open the latest reset email.</p>}</section>:!session?<section className="panel"><h2>Staff sign in</h2><form onSubmit={login} className="signin"><label>Email<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="submit" disabled={busy}>Sign in</button><button type="button" disabled={busy||!email.trim()} onClick={requestReset}>Forgot password? Send reset email</button></form></section>:locked?<section className="panel"><h2>Quick PIN unlock</h2><p>Unlock this trusted browser while your Supabase session is valid. This is a convenience lock, not a replacement for account authentication.</p><form className="signin" onSubmit={unlockPin}><label>6-digit PIN<input type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,6))} required/></label><button className="submit" disabled={pinBusy||!isPin(pin)}>Unlock</button><button type="button" onClick={async()=>{localStorage.removeItem(pinKey(session.user.id));await supabase.auth.signOut()}}>Use email/password instead</button></form>{pinError&&<p role="alert">{pinError}</p>}</section>:!authorized?<section className="panel"><h2>Staff access required</h2><p>This account does not have a verified active POS staff profile. Transactions and product details are unavailable.</p><button className="submit" onClick={()=>supabase.auth.signOut()}>Sign out</button></section>:<section className="panel"><p>Signed in: {staff.display_name||session.user.email} ({staff.role}) <button type="button" onClick={()=>setPage('Settings')}>PIN settings</button> <button className="submit" onClick={()=>supabase.auth.signOut()}>Sign out</button></p></section>}
 {authorized&&page==='Settings'&&<section className="panel"><h2>Data safety & receipt preview</h2><p>Database backups are not verified. GitHub code history is not a database backup. Do not start live sales until an independent, restorable backup is confirmed.</p><p>Preview a sample receipt safely on your iPhone. This creates no sale, stock change, or payment.</p><button type="button" onClick={()=>setReceipt({invoice_number:"DEMO-0001",printed_at:new Date().toISOString(),customer:"Demo customer",phone:null,payment:"cash",items:[{id:"demo-item",name:"Sample Perfume — DEMO ONLY",size_ml:100,quantity:1,selling_price:115}],taxable_amount:115,vat_amount:0,grand_total:115})}>Preview sample receipt (no sale saved)</button></section>}
 {authorized&&page==='Settings'&&<section className="panel"><h2>Device PIN quick unlock</h2><p>PIN is stored as a salted password hash on this browser only. This screen lock does not replace Supabase authentication or server permissions. Do not use on shared or untrusted devices.</p>{getPin(session.user.id)?<><p>PIN is enabled on this browser.</p><button className="submit" onClick={()=>{setPinMode('locked');setPin('');setPinError('')}}>Lock screen</button><button onClick={()=>{localStorage.removeItem(pinKey(session.user.id));setPinError('Device PIN disabled.')}}>Disable PIN</button></>:<form className="signin" onSubmit={enrollPin}><label>New six-digit PIN<input type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{6}" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,6))} required/></label><label>Confirm PIN<input type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{6}" maxLength={6} value={pinAgain} onChange={e=>setPinAgain(e.target.value.replace(/\D/g,'').slice(0,6))} required/></label><button className="submit" disabled={pinBusy||!isPin(pin)||pin!==pinAgain}>Enable PIN</button></form>}{pinError&&<p role="status">{pinError}</p>}</section>}
 {resetNotice&&<div className="panel" role="status">{resetNotice}</div>}{error&&<div className="warning" role="alert">{error}</div>}
 {locked?null:page==='Billing'&&authorized?<div className="billing"><section className="panel"><h2>Products</h2><input placeholder="Search product or SKU" aria-label="Search products" value={search} onChange={e=>setSearch(e.target.value)}/>{loading?<p>Loading…</p>:filtered.length===0?<p>No products available. Add products through a separately approved inventory workflow.</p>:filtered.map(p=><div className="product" key={p.id}><div><strong>{p.name}</strong><small>{p.size_ml} ml · {p.sku} · Stock {p.stock_quantity} · SAR {money(p.selling_price)}</small></div><button disabled={p.stock_quantity===0||!!pending} onClick={()=>changeQty(p,1)}>Add</button></div>)}</section><section className="panel"><h2>Cart</h2>{cartItems.length===0?<p>Cart is empty.</p>:cartItems.map(p=><div className="product" key={p.id}><div><strong>{p.name}</strong><small>{p.quantity} × SAR {money(p.selling_price)}</small></div><div className="qty"><button disabled={!!pending} onClick={()=>changeQty(p,-1)}>−</button><b>{p.quantity}</b><button disabled={!!pending} onClick={()=>changeQty(p,1)}>+</button></div></div>)}<p>VAT-inclusive total: <strong>SAR {money(total)}</strong></p><p>Taxable: SAR {money(taxable)} · VAT 15%: SAR {money(vat)}</p><label>Customer<input value={customer} disabled={!!pending} onChange={e=>setCustomer(e.target.value)} maxLength={200}/></label><label>Phone<input value={phone} disabled={!!pending} onChange={e=>setPhone(e.target.value)} maxLength={40}/></label><label>Payment<select value={payment} disabled={!!pending} onChange={e=>setPayment(e.target.value)}><option value="cash">Cash</option><option value="mada">Mada</option><option value="bank_transfer">Bank transfer</option></select></label><button className="submit" disabled={!liveEnabled||!cartItems.length||busy||!!receipt} onClick={saveBill}>{busy?'Saving…':pending?'Retry same bill':'Save bill'}</button>{!liveEnabled&&<p>Billing is intentionally locked in preview mode.</p>}{pending&&<p>Pending request retained. Do not change the cart until the outcome is confirmed.</p>}</section></div>:page==='Reports'&&authorized?<Reports authorized={authorized}/>:page==='Purchases'&&authorized?<Purchases products={products} authorized={authorized} onPosted={refresh}/>:page==='Products & Stock'&&authorized?<section className="panel"><h2>Product catalogue ({products.length})</h2>{products.map(p=><div className="product" key={p.id}><strong>{p.name} · {p.size_ml} ml</strong><small>{p.sku} · Stock {p.stock_quantity} · SAR {money(p.selling_price)}</small></div>)}{products.length===0&&<p>No products entered yet.</p>}</section>:<><section className="hero"><div className="eyebrow">WELCOME TO ZAHN</div><h2>Luxury retail, beautifully managed.</h2><p>Responsive POS workspace for Android tablets and laptops.</p></section><div className="stats">{['Sales Today','Orders','Products in Stock'].map(x=><article key={x}><span>{x}</span><strong>—</strong><small>Not yet connected to reporting</small></article>)}</div><section className="panel"><h2>{page} workspace</h2><p>Under development. No legacy data will be imported. Purchase and report workflows are not yet active.</p></section></>}
 {!locked&&receipt&&<section className="panel receipt-panel" aria-live="polite"><div className="receipt-paper" id="zahn-receipt"><header><h2>ZAHN LUXURY PERFUMES</h2><p>ESSENCE OF YOU</p><p>{receipt.invoice_number.startsWith("DEMO-")?"SAMPLE INVOICE — NOT A SALE":"INVOICE — DRAFT FORMAT"}</p></header><p><strong>Invoice:</strong> {receipt.invoice_number}</p><p><strong>Date:</strong> {new Date(receipt.printed_at).toLocaleString('en-SA',{timeZone:'Asia/Riyadh'})}</p>{receipt.customer&&<p><strong>Customer:</strong> {receipt.customer}</p>}{receipt.phone&&<p><strong>Phone:</strong> {receipt.phone}</p>}<p><strong>Payment:</strong> {receipt.payment.replace('_',' ')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Price (SAR)</th></tr></thead><tbody>{receipt.items.map(p=><tr key={p.id}><td>{p.name} ({p.size_ml} ml)</td><td>{p.quantity}</td><td>{money(Number(p.selling_price)*p.quantity)}</td></tr>)}</tbody></table><p>Taxable amount: SAR {money(receipt.taxable_amount)}</p><p>{receipt.invoice_number.startsWith("DEMO-")?"VAT not charged (demo): SAR ":"VAT (registration review required): SAR "}{money(receipt.vat_amount)}</p><h3>Total: SAR {money(receipt.grand_total)}</h3><small>{receipt.invoice_number.startsWith("DEMO-")?"DEMO ONLY — NOT A VALID INVOICE. No VAT charged. No sale or payment was recorded.":"Invoice format and VAT treatment require registration and compliance verification before live use."}</small></div><div className="receipt-actions"><button className="submit" onClick={()=>window.print()}>Print receipt</button><button className="submit" onClick={()=>{setReceipt(null);setCustomer('');setPhone('')}}>New bill</button></div></section>}
 </main></div>;
}
