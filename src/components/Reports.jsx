import React,{useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';
export default function Reports({authorized}){
 const [sales,setSales]=useState([]),[purchases,setPurchases]=useState([]),[error,setError]=useState('');
 useEffect(()=>{if(!authorized||!supabase)return;let active=true;
 Promise.all([supabase.from('sales').select('id,invoice_number,sale_date,grand_total,vat_amount,status').order('sale_date',{ascending:false}).limit(100),supabase.from('purchases').select('id,invoice_number,purchase_date,total_amount,status').order('purchase_date',{ascending:false}).limit(100)]).then(([a,b])=>{if(active){setSales(a.data||[]);setPurchases(b.data||[]);setError(a.error?.message||b.error?.message||'')}});
 return()=>{active=false}},[authorized]);
 const completed=sales.filter(s=>s.status==='completed'),sum=(rows,key)=>rows.reduce((n,r)=>n+Number(r[key]||0),0).toFixed(2);
 return <section className="panel"><h2>Reports — recent records</h2><p>Read-only. Up to 100 recent records per category; totals are not full historical totals.</p>{error&&<p role="alert">{error}</p>}<div className="stats"><article><span>Completed sales loaded</span><strong>{completed.length}</strong></article><article><span>Sales total (SAR)</span><strong>{sum(completed,'grand_total')}</strong></article><article><span>VAT (SAR)</span><strong>{sum(completed,'vat_amount')}</strong></article></div><h3>Recent sales</h3>{sales.map(s=><div className="product" key={s.id}><span>{s.invoice_number} · {s.status}</span><strong>SAR {Number(s.grand_total).toFixed(2)}</strong></div>)}<h3>Recent purchases</h3>{purchases.map(p=><div className="product" key={p.id}><span>{p.invoice_number} · {p.status}</span><strong>SAR {Number(p.total_amount).toFixed(2)}</strong></div>)}</section>
}
