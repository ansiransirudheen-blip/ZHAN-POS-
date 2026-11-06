import React,{useEffect,useMemo,useState} from 'react';
import {supabase} from '../lib/supabase';
const enabled=import.meta.env.VITE_ENABLE_LIVE_PURCHASES==='true';
const money=n=>Number(n||0).toFixed(2);
export default function Purchases({products,authorized,onPosted}){
 const [suppliers,setSuppliers]=useState([]),[supplier,setSupplier]=useState(''),[invoice,setInvoice]=useState(''),[items,setItems]=useState({}),[costs,setCosts]=useState({}),[pending,setPending]=useState(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let active=true;if(!authorized||!supabase)return;
 supabase.from('suppliers').select('id,name').order('name').then(({data,error})=>{if(active){setSuppliers(data||[]);if(error)setError(error.message)}});return()=>{active=false}},[authorized]);
 const lines=useMemo(()=>products.filter(p=>Number(items[p.id])>0).map(p=>({product_id:p.id,name:p.name,quantity:Number(items[p.id]),unit_cost:Number(costs[p.id]||0)})),[products,items,costs]);
 const total=lines.reduce((a,x)=>a+x.quantity*x.unit_cost,0);
 async function post(){if(!enabled||!authorized||busy||!supplier||!invoice.trim()||!lines.length)return;
 const payload=pending||{p_client_request_id:crypto.randomUUID(),p_supplier_id:supplier,p_invoice_number:invoice.trim(),p_items:lines.map(({product_id,quantity,unit_cost})=>({product_id,quantity,unit_cost}))};
 setPending(payload);setBusy(true);setError('');setMessage('');
 try{const{data,error}=await supabase.rpc('post_pos_purchase',payload);if(error)throw error;setMessage('Purchase posted: '+data.invoice_number+' · SAR '+money(data.total_amount));setPending(null);setItems({});setCosts({});setInvoice('');await onPosted?.();}
 catch(e){setError('Purchase not confirmed: '+(e.message||'Connection error')+'. Retry the same request; do not create a duplicate purchase.')}
 finally{setBusy(false)}
 }
 return <section className="panel"><h2>Purchase & Stock In</h2><p>{enabled?'Live posting enabled — verify details carefully.':'Preview only — purchase posting is disabled.'}</p><label>Supplier<select value={supplier} disabled={!!pending} onChange={e=>setSupplier(e.target.value)}><option value="">Select supplier</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Supplier invoice number<input value={invoice} disabled={!!pending} maxLength={100} onChange={e=>setInvoice(e.target.value)}/></label>{products.map(p=><div className="product" key={p.id}><div><strong>{p.name}</strong><small>{p.sku} · Current stock {p.stock_quantity}</small></div><label>Qty<input aria-label={'Quantity for '+p.name} type="number" min="0" max="100000" step="1" disabled={!!pending} value={items[p.id]??''} onChange={e=>setItems(s=>({...s,[p.id]:e.target.value}))}/></label><label>Unit cost (SAR)<input aria-label={'Cost for '+p.name} type="number" min="0" max="9999999.99" step=".01" disabled={!!pending} value={costs[p.id]??''} onChange={e=>setCosts(s=>({...s,[p.id]:e.target.value}))}/></label></div>)}<p>Purchase total: <strong>SAR {money(total)}</strong></p><button className="submit" disabled={!enabled||!supplier||!invoice.trim()||!lines.length||busy||lines.some(x=>!Number.isInteger(x.quantity)||x.quantity>100000||!Number.isFinite(x.unit_cost)||x.unit_cost<0||x.unit_cost>9999999.99)} onClick={post}>{busy?'Posting…':pending?'Retry same purchase':'Post purchase'}</button>{pending&&<p>Pending request ID retained until the server confirms the result.</p>}{message&&<p role="status">{message}</p>}{error&&<p role="alert" className="warning">{error}</p>}{suppliers.length===0&&<p>No suppliers found. Supplier creation is not enabled in this preview.</p>}</section>;
}
