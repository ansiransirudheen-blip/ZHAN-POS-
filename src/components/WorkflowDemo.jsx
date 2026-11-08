import React,{useMemo,useState} from 'react';

// Fully isolated, in-memory workflow for mobile testing. No Supabase calls,
// browser storage, production sales, payments, customer messages or persistence.
const sar=n=>'SAR '+Number(n).toFixed(2);
export default function WorkflowDemo(){
 const [products,setProducts]=useState([]);
 const [name,setName]=useState('');
 const [size,setSize]=useState('50');
 const [price,setPrice]=useState('');
 const [qty,setQty]=useState('1');
 const [cart,setCart]=useState({});
 const [receipt,setReceipt]=useState(null);
 const [notice,setNotice]=useState('');
 const [discount,setDiscount]=useState('0');
 const total=useMemo(()=>products.reduce((s,p)=>s+(cart[p.id]||0)*p.price,0),[products,cart]);
 const discountValue=Number(discount);
 const validDiscount=Number.isFinite(discountValue)&&discountValue>=0&&discountValue<=total&&/^\d+(?:\.\d{1,2})?$/.test(discount);
 const payable=validDiscount?Math.round((total-discountValue)*100)/100:total;
 const field={padding:12,fontSize:16,border:'1px solid #c6b68e',borderRadius:8,width:'100%',boxSizing:'border-box'};
 const button={padding:'12px 16px',background:'#b99550',color:'#181511',border:0,borderRadius:8,fontWeight:700,minHeight:44};
 const panel={padding:18,border:'1px solid #b99550',borderRadius:12,marginBottom:18,background:'#211f1b'};
 function addProduct(e){
  e.preventDefault();const p=Number(price),q=Number(qty);
  if(!name.trim()||!Number.isFinite(p)||p<=0||!Number.isSafeInteger(q)||q<0){setNotice('Enter valid product, price and stock.');return}
  setProducts(old=>[...old,{id:crypto.randomUUID(),name:name.trim(),size:Number(size),price:p,stock:q}]);
  setName('');setPrice('');setQty('1');setNotice('Demo product created in temporary memory.');
 }
 function addStock(id){
  setProducts(old=>old.map(p=>p.id===id?{...p,stock:p.stock+1}:p));
  setNotice('Demo purchase: stock increased by one.');
 }
 function addCart(p){
  if(receipt)return;
  setCart(c=>({...c,[p.id]:Math.min(p.stock,(c[p.id]||0)+1)}));
 }
 function checkout(){
  const items=products.filter(p=>cart[p.id]>0).map(p=>({...p,quantity:cart[p.id]}));
  if(!items.length||!validDiscount){setNotice('Check cart and discount.');return}
  if(items.some(p=>p.quantity>p.stock)){setNotice('Insufficient demo stock.');return}
  setProducts(old=>old.map(p=>({...p,stock:p.stock-(cart[p.id]||0)})));
  setReceipt({number:'DEMO-'+Date.now(),items,subtotal:total,discount:discountValue,total:payable,created:new Date().toLocaleString()});
  setCart({});setDiscount('0');setNotice('Demo invoice created. No real sale was saved.');
 }
 function reset(){setProducts([]);setCart({});setReceipt(null);setDiscount('0');setNotice('Demo reset. All temporary data cleared.')}
 return <div style={{minHeight:'100vh',background:'#11110f',color:'#f4e8c7',padding:'20px 14px',fontFamily:'system-ui,sans-serif'}}>
  <div style={{maxWidth:680,margin:'auto'}}>
   <header style={{textAlign:'center',paddingBottom:20}}><h1 style={{color:'#d7b56c',marginBottom:4}}>ZAHN</h1><div>ESSENCE OF YOU</div><h2>POS Workflow Demo</h2><p style={{color:'#f1cf7b'}}>TEST ONLY · No cloud connection · No VAT or tax invoice</p></header>
   <section style={panel}><h3>1. Create demo product</h3><form onSubmit={addProduct} style={{display:'grid',gap:12}}>
    <label>Perfume name<input style={field} value={name} onChange={e=>setName(e.target.value)} placeholder="Sample Oud" required/></label>
    <label>Size (ml)<select style={field} value={size} onChange={e=>setSize(e.target.value)}>{[10,20,30,50,80,100].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Price (SAR)<input style={field} type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required/></label>
    <label>Opening stock<input style={field} type="number" min="0" step="1" value={qty} onChange={e=>setQty(e.target.value)} required/></label>
    <button style={button}>Add demo product</button></form></section>
   <section style={panel}><h3>2. Demo purchase & stock</h3>{products.length===0?<p>Add a product first.</p>:products.map(p=><div key={p.id} style={{padding:'12px 0',borderBottom:'1px solid #50452e'}}><strong>{p.name} · {p.size} ml</strong><div>{sar(p.price)} · Stock: {p.stock}</div><button style={{...button,marginTop:8}} onClick={()=>addStock(p.id)}>+1 demo stock</button></div>)}</section>
   <section style={panel}><h3>3. Demo billing</h3>{products.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,padding:'10px 0'}}><span>{p.name} · Available {p.stock} · Cart {cart[p.id]||0}</span><button style={button} disabled={!!receipt||p.stock<=(cart[p.id]||0)} onClick={()=>addCart(p)}>Add</button></div>)}<p><strong>Total: {sar(total)}</strong></p><p style={{fontSize:13}}>Preview amount only. VAT treatment has not been verified.</p><button style={button} disabled={!total||!!receipt||!validDiscount} onClick={checkout}>Create demo invoice</button></section>
   {receipt&&<section id="demo-print-receipt" style={{...panel,background:'#fff',color:'#222'}}><h3>ZAHN · DEMO INVOICE</h3><p>{receipt.number} · {receipt.created}</p>{receipt.items.map(p=><p key={p.id}>{p.name} {p.size}ml × {p.quantity} — {sar(p.price*p.quantity)}</p>)}<hr/><p>Subtotal: {sar(receipt.subtotal)} · Discount: {sar(receipt.discount)}</p><strong>Total: {sar(receipt.total)}</strong><p>TEST ONLY — Not a tax invoice or proof of purchase.</p><div className="demo-print-hide" style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12}}><button style={button} onClick={()=>window.print()}>Print / Save PDF</button><button style={button} onClick={()=>{const msg=['ZAHN POS — DEMO ONLY','Not a valid invoice or proof of purchase',receipt.number,...receipt.items.map(p=>p.name+' '+p.size+'ml x '+p.quantity+' — '+sar(p.price*p.quantity)),'Discount: '+sar(receipt.discount),'Demo total: '+sar(receipt.total)].join('\n');window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer')}}>WhatsApp demo text</button><button style={button} onClick={()=>setReceipt(null)}>Close preview</button></div></section>}
   <style>{'@media print {body{background:white!important}body *{visibility:hidden!important}#demo-print-receipt,#demo-print-receipt *{visibility:visible!important}#demo-print-receipt{position:absolute!important;left:0;top:0;width:100%!important;border:0!important;box-sizing:border-box!important}.demo-print-hide,.demo-print-hide *{display:none!important}}'}</style>
   <p role="status" aria-live="polite">{notice}</p><button style={{...button,background:'#49413a',color:'white'}} onClick={reset}>Reset all demo data</button>
   <p style={{fontSize:12,opacity:.75}}>All data disappears when this page reloads. Nothing is saved to Supabase, localStorage or a real invoice.</p>
  </div></div>;
}
