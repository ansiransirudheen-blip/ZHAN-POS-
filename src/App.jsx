import React,{useEffect,useMemo,useState} from 'react';
import {supabase} from './lib/supabase';
const pages=['Dashboard','Billing','Products & Stock','Purchases','Customers','Reports','Settings'];
const liveEnabled=import.meta.env.VITE_ENABLE_LIVE_BILLING==='true';
const money=n=>Number(n||0).toFixed(2);
export default function App(){
 const [page,setPage]=useState('Dashboard'),[session,setSession]=useState(null),[staff,setStaff]=useState(null);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [products,setProducts]=useState([]),[loading,setLoading]=useState(false),[cart,setCart]=useState({});
 const [payment,setPayment]=useState('cash'),[customer,setCustomer]=useState(''),[phone,setPhone]=useState('');
 const [receipt,setReceipt]=useState(null),[pending,setPending]=useState(null),[search,setSearch]=useState('');
 useEffect(()=>{if(!supabase)return;let active=true;
  supabase.auth.getSession().then(({data,error})=>{if(active){setSession(data?.session??null);if(error)setError(error.message);}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{if(active)setSession(s);});
  return()=>{active=false;subscription.unsubscribe();};
 },[]);
 useEffect(()=>{let active=true;setProducts([]);setStaff(null);setCart({});setReceipt(null);setPending(null);
  if(!supabase||!session?.user?.id)return;
  (async()=>{setLoading(true);const [a,b]=await Promise.all([
    supabase.from('staff_profiles').select('role,is_active,display_name').eq('user_id',session.user.id).maybeSingle(),
    supabase.from('products').select('id,name,brand,sku,size_ml,selling_price,stock_quantity,low_stock_threshold').order('name')]);
    if(active){setStaff(a.error?null:a.data?.is_active?a.data:null);setProducts(b.error?[]:b.data||[]);setError(a.error?.message||b.error?.message||'');setLoading(false);}
  })();return()=>{active=false};
 },[session?.user?.id]);
 const authorized=!!staff, cartItems=useMemo(()=>products.filter(p=>cart[p.id]>0).map(p=>({...p,quantity:cart[p.id]})),[products,cart]);
 const total=cartItems.reduce((sum,p)=>sum+p.quantity*Number(p.selling_price),0),taxable=Math.round(total/1.15*100)/100,vat=total-taxable;
 const filtered=products.filter(p=>(p.name+' '+(p.sku||'')+' '+(p.brand||'')).toLowerCase().includes(search.toLowerCase()));
 function changeQty(p,delta){if(pending)return;setCart(c=>({...c,[p.id]:Math.max(0,Math.min(p.stock_quantity,(c[p.id]||0)+delta))}));}
 async function login(e){e.preventDefault();setBusy(true);setError('');try{const{error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message)}catch{setError('Connection failed')}finally{setBusy(false);setPassword('')}}
 async function refresh(){if(!supabase)return;const{data,error}=await supabase.from('products').select('id,name,brand,sku,size_ml,selling_price,stock_quantity,low_stock_threshold').order('name');if(error)setError(error.message);else setProducts(data||[])}
 async function saveBill(){
  if(!liveEnabled||!authorized||!cartItems.length||busy||receipt)return;
  const payload=pending||{p_client_request_id:crypto.randomUUID(),p_payment_method:payment,p_customer_name:customer.trim()||null,p_customer_phone:phone.trim()||null,p_items:cartItems.map(p=>({product_id:p.id,quantity:p.quantity,discount_amount:0}))};
  setPending(payload);setBusy(true);setError('');
  try{const{data,error}=await supabase.rpc('save_pos_bill',payload);if(error)throw error;
   setReceipt({...data,items:cartItems,customer:payload.p_customer_name,payment:payload.p_payment_method});setPending(null);setCart({});await refresh();
  }catch(e){setError('Bill not confirmed: '+(e.message||'Network error')+'. Retry uses the same request ID; do not create a new bill.');}
  finally{setBusy(false)}
 }
 return <div className="layout"><aside><div className="logo">ZAHN<small>LUXURY PERFUMES</small></div><nav>{pages.map(p=><button key={p} className={p===page?'selected':''} onClick={()=>setPage(p)}>{p}</button>)}</nav><footer>ESSENCE OF YOU</footer></aside><main><div className="eyebrow">ZAHN / POINT OF SALE</div><h1>{page}</h1><div className="warning" role="status">{liveEnabled?'Live billing configured — verify staff, stock and payment before saving.':'SAFE PREVIEW — live billing is disabled; no transactions can be saved.'}</div>
 {!supabase?<section className="panel"><h2>Cloud connection not configured</h2><p>Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in deployment settings. Never use a secret key.</p></section>:!session?<section className="panel"><h2>Staff sign in</h2><form onSubmit={login} className="signin"><label>Email<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="submit" disabled={busy}>Sign in</button></form></section>:!authorized?<section className="panel"><h2>Staff access required</h2><p>This account does not have a verified active POS staff profile. Transactions and product details are unavailable.</p><button className="submit" onClick={()=>supabase.auth.signOut()}>Sign out</button></section>:<section className="panel"><p>Signed in: {staff.display_name||session.user.email} ({staff.role}) <button className="submit" onClick={()=>supabase.auth.signOut()}>Sign out</button></p></section>}
 {error&&<div className="warning" role="alert">{error}</div>}
 {page==='Billing'&&authorized?<div className="billing"><section className="panel"><h2>Products</h2><input placeholder="Search product or SKU" aria-label="Search products" value={search} onChange={e=>setSearch(e.target.value)}/>{loading?<p>Loading…</p>:filtered.length===0?<p>No products available. Add products through a separately approved inventory workflow.</p>:filtered.map(p=><div className="product" key={p.id}><div><strong>{p.name}</strong><small>{p.size_ml} ml · {p.sku} · Stock {p.stock_quantity} · SAR {money(p.selling_price)}</small></div><button disabled={p.stock_quantity===0||!!pending} onClick={()=>changeQty(p,1)}>Add</button></div>)}</section><section className="panel"><h2>Cart</h2>{cartItems.length===0?<p>Cart is empty.</p>:cartItems.map(p=><div className="product" key={p.id}><div><strong>{p.name}</strong><small>{p.quantity} × SAR {money(p.selling_price)}</small></div><div className="qty"><button disabled={!!pending} onClick={()=>changeQty(p,-1)}>−</button><b>{p.quantity}</b><button disabled={!!pending} onClick={()=>changeQty(p,1)}>+</button></div></div>)}<p>VAT-inclusive total: <strong>SAR {money(total)}</strong></p><p>Taxable: SAR {money(taxable)} · VAT 15%: SAR {money(vat)}</p><label>Customer<input value={customer} disabled={!!pending} onChange={e=>setCustomer(e.target.value)} maxLength={200}/></label><label>Phone<input value={phone} disabled={!!pending} onChange={e=>setPhone(e.target.value)} maxLength={40}/></label><label>Payment<select value={payment} disabled={!!pending} onChange={e=>setPayment(e.target.value)}><option value="cash">Cash</option><option value="mada">Mada</option><option value="bank_transfer">Bank transfer</option></select></label><button className="submit" disabled={!liveEnabled||!cartItems.length||busy||!!receipt} onClick={saveBill}>{busy?'Saving…':pending?'Retry same bill':'Save bill'}</button>{!liveEnabled&&<p>Billing is intentionally locked in preview mode.</p>}{pending&&<p>Pending request retained. Do not change the cart until the outcome is confirmed.</p>}</section></div>:page==='Products & Stock'&&authorized?<section className="panel"><h2>Product catalogue ({products.length})</h2>{products.map(p=><div className="product" key={p.id}><strong>{p.name} · {p.size_ml} ml</strong><small>{p.sku} · Stock {p.stock_quantity} · SAR {money(p.selling_price)}</small></div>)}{products.length===0&&<p>No products entered yet.</p>}</section>:<><section className="hero"><div className="eyebrow">WELCOME TO ZAHN</div><h2>Luxury retail, beautifully managed.</h2><p>Responsive POS workspace for Android tablets and laptops.</p></section><div className="stats">{['Sales Today','Orders','Products in Stock'].map(x=><article key={x}><span>{x}</span><strong>—</strong><small>Not yet connected to reporting</small></article>)}</div><section className="panel"><h2>{page} workspace</h2><p>Under development. No legacy data will be imported. Purchase and report workflows are not yet active.</p></section></>}
 {receipt&&<section className="panel" aria-live="polite"><h2>Bill saved: {receipt.invoice_number}</h2><p>Total SAR {money(receipt.grand_total)} · VAT SAR {money(receipt.vat_amount)}</p><p>Print-ready tax invoice formatting and compliance checks are still pending.</p><button className="submit" onClick={()=>{setReceipt(null);setCustomer('');setPhone('')}}>New bill</button></section>}
 </main></div>;
