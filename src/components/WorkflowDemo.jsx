import React,{useMemo,useState} from 'react';

// Fully isolated, in-memory workflow for mobile testing. No Supabase calls,
// browser storage, production sales, payments, customer messages or persistence.
const sar=n=>'SAR '+Number(n).toFixed(2);
// Demo Saudi phone normalization: local 05xxxxxxxx or +9665xxxxxxxx.
const whatsappNumber=value=>{const digits=String(value||'').replace(/[^0-9]/g,'');if(/^05\d{8}$/.test(digits))return '966'+digits.slice(1);if(/^9665\d{8}$/.test(digits))return digits;if(/^5\d{8}$/.test(digits))return '966'+digits;return null};
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
 const [history,setHistory]=useState([]);
 const [view,setView]=useState('Staff');
 const [stockHistory,setStockHistory]=useState([]);
 const [supplier,setSupplier]=useState('');
 const [purchaseQty,setPurchaseQty]=useState('1');
 const [purchaseCost,setPurchaseCost]=useState('');
 const [editPrices,setEditPrices]=useState({});
 const [customerName,setCustomerName]=useState('');
 const [customerPhone,setCustomerPhone]=useState('');
 const [paymentMethod,setPaymentMethod]=useState('Cash');
 const demoRevenue=history.reduce((sum,b)=>sum+b.total,0);
 const demoDiscounts=history.reduce((sum,b)=>sum+b.discount,0);
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
  const product={id:crypto.randomUUID(),name:name.trim(),size:Number(size),price:p,stock:q};
  setProducts(old=>[...old,product]);
  if(q>0)setStockHistory(old=>[...old,{id:crypto.randomUUID(),product:product.name,kind:'Opening stock',quantity:q,at:new Date().toLocaleString()}]);
  setName('');setPrice('');setQty('1');setNotice('Demo product created in temporary memory.');
 }
 function addStock(id){
  const q=Number(purchaseQty),cost=Number(purchaseCost);
  if(!Number.isSafeInteger(q)||q<=0||q>100000||!Number.isFinite(cost)||cost<0||!/^\d+(?:\.\d{1,2})?$/.test(purchaseCost)){
   setNotice('Enter valid purchase quantity and cost per unit.');return;
  }
  const product=products.find(p=>p.id===id);
  if(!product||product.stock+q>1000000){setNotice('Invalid stock update.');return}
  setProducts(old=>old.map(p=>p.id===id?{...p,stock:p.stock+q}:p));
  setStockHistory(old=>[...old,{id:crypto.randomUUID(),product:product.name,kind:'Purchase',quantity:q,cost, supplier:supplier.trim()||'Not specified',at:new Date().toLocaleString()}]);
  setNotice('Demo purchase posted to temporary stock history.');
 }
 function updatePrice(p){
  const value=editPrices[p.id];
  if(typeof value!=='string'||!/^\d+(?:\.\d{1,2})?$/.test(value)||Number(value)<=0||Number(value)>1000000){setNotice('Enter a valid price in SAR.');return}
  setProducts(old=>old.map(x=>x.id===p.id?{...x,price:Number(value)}:x));
  setNotice('Demo price updated. Previous invoices remain unchanged.');
 }
 function addCart(p){
  if(receipt)return;
  setCart(c=>({...c,[p.id]:Math.min(p.stock,(c[p.id]||0)+1)}));
 }
 function checkout(){
  const items=products.filter(p=>cart[p.id]>0).map(p=>({...p,quantity:cart[p.id]}));
  if(!items.length||!validDiscount){setNotice('Check cart and discount.');return}
  if(customerName.length>100||customerPhone.length>20||customerPhone.trim()&&!whatsappNumber(customerPhone)){setNotice('Enter a valid Saudi WhatsApp number (05xxxxxxxx or +9665xxxxxxxx), or leave blank.');return}
  if(items.some(p=>p.quantity>p.stock)){setNotice('Insufficient demo stock.');return}
  setProducts(old=>old.map(p=>({...p,stock:p.stock-(cart[p.id]||0)})));
  setStockHistory(old=>[...old,...items.map(p=>({id:crypto.randomUUID(),product:p.name,kind:'Sale',quantity:-p.quantity,at:new Date().toLocaleString()}))]);
  const bill={number:'DEMO-'+Date.now(),items,subtotal:total,discount:discountValue,total:payable,created:new Date().toLocaleString(),day:new Date().toLocaleDateString('en-CA'),customerName:customerName.trim(),customerPhone:customerPhone.trim(),paymentMethod};
  setReceipt(bill);setHistory(old=>[...old,bill]);
  setCart({});setDiscount('0');setNotice('Demo invoice created. No real sale was saved.');
 }
 function reset(){setProducts([]);setCart({});setReceipt(null);setDiscount('0');setHistory([]);setStockHistory([]);setSupplier('');setPurchaseQty('1');setPurchaseCost('');setCustomerName('');setCustomerPhone('');setPaymentMethod('Cash');setEditPrices({});setView('Staff');setNotice('Demo reset. All temporary data cleared.')}
 return <div style={{minHeight:'100vh',background:'#11110f',color:'#f4e8c7',padding:'20px 14px',fontFamily:'system-ui,sans-serif'}}>
  <div style={{maxWidth:680,margin:'auto'}}>
   <header style={{textAlign:'center',paddingBottom:20}}><img src="/zahn-original-logo.jpg" alt="Original ZAHN — Essence of You logo" style={{width:220,maxWidth:'75%',height:'auto',objectFit:'contain',borderRadius:6}}/><h2>POS Workflow Demo</h2><p style={{color:'#f1cf7b'}}>TEST ONLY · No cloud connection · No VAT or tax invoice</p></header>
   <section style={panel}><h3>Dashboard · Demo {view} View</h3><p>Products: {products.length} · Stock units: {products.reduce((n,p)=>n+p.stock,0)}</p><p>Demo bills: {history.length} · Demo sales: {sar(demoRevenue)}</p><p style={{fontSize:13}}>These views simulate roles for UI testing only. No login, permissions or production access is granted.</p><button style={button} onClick={()=>setView(v=>v==='Staff'?'Admin':'Staff')}>Switch to demo {view==='Staff'?'Admin':'Staff'} view</button></section>
   <section style={panel}><h3>1. Create demo product</h3><form onSubmit={addProduct} style={{display:'grid',gap:12}}>
    <label>Perfume name<input style={field} value={name} onChange={e=>setName(e.target.value)} placeholder="Sample Oud" required/></label>
    <label>Size (ml)<select style={field} value={size} onChange={e=>setSize(e.target.value)}>{[10,20,30,50,80,100].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Price (SAR)<input style={field} type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required/></label>
    <label>Opening stock<input style={field} type="number" min="0" step="1" value={qty} onChange={e=>setQty(e.target.value)} required/></label>
    <button style={button}>Add demo product</button></form></section>
   {view==='Admin'&&<section style={panel}><h3>Demo Product Price Management</h3>{products.map(p=><div key={p.id} style={{padding:'10px 0'}}><strong>{p.name} · {p.size} ml · {sar(p.price)}</strong><div style={{display:'flex',gap:8,marginTop:6}}><input aria-label={'New price for '+p.name} style={field} type="number" min="0.01" step="0.01" value={editPrices[p.id]??''} onChange={e=>setEditPrices(old=>({...old,[p.id]:e.target.value}))} placeholder="New price"/><button style={button} onClick={()=>updatePrice(p)}>Update</button></div></div>)}</section>}
   <section style={panel}><h3>2. Demo purchase & stock</h3>
    <div style={{display:'grid',gap:10}}>
     <label>Supplier (optional)<input style={field} value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="Demo supplier"/></label>
     <label>Purchase quantity<input style={field} type="number" min="1" step="1" value={purchaseQty} onChange={e=>setPurchaseQty(e.target.value)}/></label>
     <label>Unit purchase cost (SAR)<input style={field} type="number" min="0" step="0.01" value={purchaseCost} onChange={e=>setPurchaseCost(e.target.value)} placeholder="0.00"/></label>
    </div>
    {products.length===0?<p>Add a product first.</p>:products.map(p=><div key={p.id} style={{padding:'12px 0',borderBottom:'1px solid #50452e'}}>
     <strong>{p.name} · {p.size} ml</strong><div>{sar(p.price)} · Stock: {p.stock} {p.stock<=3?'⚠️ Low stock':''}</div>
     <button style={{...button,marginTop:8}} onClick={()=>addStock(p.id)}>Post demo purchase</button>
    </div>)}
   </section>
   <section style={panel}><h3>3. Demo billing</h3>{products.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,padding:'10px 0'}}><span>{p.name} · Available {p.stock} · Cart {cart[p.id]||0}</span><button style={button} disabled={!!receipt||p.stock<=(cart[p.id]||0)} onClick={()=>addCart(p)}>Add</button></div>)}<div style={{display:'grid',gap:10,margin:'12px 0'}}><label>Customer name (optional)<input style={field} maxLength={100} value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Customer"/></label><label>Customer phone (optional)<input style={field} type="tel" maxLength={20} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="+966..." /></label><label>Payment method<select style={field} value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>{['Cash','Mada','Bank Transfer'].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Discount (SAR)<input style={field} type="number" min="0" max={total} step="0.01" value={discount} onChange={e=>setDiscount(e.target.value)}/></label><p>Subtotal: {sar(total)} · Discount: {validDiscount?sar(discountValue):'Invalid'}</p><p><strong>Payable: {sar(payable)}</strong></p><p style={{fontSize:13}}>Preview amount only. VAT treatment has not been verified.</p><button style={button} disabled={!total||!!receipt||!validDiscount} onClick={checkout}>Create demo invoice</button></section>
   {receipt&&<section id="demo-print-receipt" style={{...panel,background:'#fff',color:'#222'}}><div style={{textAlign:'center'}}><img src="/zahn-original-logo.jpg" alt="ZAHN original logo" style={{width:160,maxWidth:'65%',height:'auto'}}/><h3 style={{marginBottom:4}}>DEMO INVOICE</h3><p style={{fontSize:12}}>Riyadh, Saudi Arabia · TEST ONLY</p></div><hr/><p><strong>Invoice:</strong> {receipt.number}<br/>Date: {receipt.created}<br/>Customer: {receipt.customerName||'Walk-in customer'}<br/>Payment: {receipt.paymentMethod}</p>{receipt.items.map(p=><p key={p.id}>{p.name} {p.size}ml × {p.quantity} — {sar(p.price*p.quantity)}</p>)}<hr/><p>Subtotal: {sar(receipt.subtotal)} · Discount: {sar(receipt.discount)}</p><strong>Total: {sar(receipt.total)}</strong><p style={{fontSize:12}}>TEST ONLY — Not a tax invoice or proof of purchase. VAT not calculated or verified. No customer phone printed. WhatsApp opens a prefilled chat; you must tap Send.</p><div className="demo-print-hide" style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12}}><button style={button} onClick={()=>window.print()}>Print / Save PDF</button><button style={button} onClick={()=>{const msg=['ZAHN POS — DEMO ONLY','Not a valid invoice or proof of purchase',receipt.number,'Customer: '+(receipt.customerName||'Walk-in customer'),'Payment: '+receipt.paymentMethod,...receipt.items.map(p=>p.name+' '+p.size+'ml x '+p.quantity+' — '+sar(p.price*p.quantity)),'Discount: '+sar(receipt.discount),'Demo total: '+sar(receipt.total)].join('\n');window.open('https://wa.me/'+(whatsappNumber(receipt.customerPhone)||'')+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer')}}>{whatsappNumber(receipt.customerPhone)?'Open customer WhatsApp chat':'WhatsApp demo (choose contact)'}</button><button style={button} onClick={()=>setReceipt(null)}>Close preview</button></div></section>}
   {view==='Admin'&&<section style={panel}><h3>4. Demo Sales Report</h3><p>Bills: {history.length} · Gross: {sar(history.reduce((n,b)=>n+b.subtotal,0))}</p><p>Discounts: {sar(demoDiscounts)} · Net sales: {sar(demoRevenue)}</p>{history.length===0?<p>No demo bills yet.</p>:history.map(b=><p key={b.number}>{b.number} · {b.created} · {sar(b.total)}</p>)}<p style={{fontSize:12}}>Temporary session-only report. No VAT, profit or real accounting figures.</p></section>}
   {view==='Admin'&&<section style={panel}><h3>Demo Daily Sales Summary</h3>{Object.entries(history.reduce((days,b)=>{const day=b.day;const current=days[day]||{count:0,total:0};days[day]={count:current.count+1,total:current.total+b.total};return days},{})).map(([day,report])=><p key={day}>{day} · {report.count} bills · {sar(report.total)}</p>)}{history.length===0&&<p>No demo sales yet.</p>}</section>}
   <section style={panel}><h3>5. Demo Stock History</h3>{stockHistory.length===0?<p>No stock movements yet.</p>:stockHistory.slice().reverse().map(m=><p key={m.id}>{m.at} · {m.product} · {m.kind} {m.quantity>0?'+':''}{m.quantity}{m.kind==='Purchase'?' · '+m.supplier+' · Cost '+sar(m.cost):''}</p>)}<p style={{fontSize:12}}>In-memory demonstration only. Not a real purchasing ledger.</p></section>
   <style>{'@media print {body{background:white!important}body *{visibility:hidden!important}#demo-print-receipt,#demo-print-receipt *{visibility:visible!important}#demo-print-receipt{position:absolute!important;left:0;top:0;width:100%!important;border:0!important;box-sizing:border-box!important}.demo-print-hide,.demo-print-hide *{display:none!important}}'}</style>
   <p role="status" aria-live="polite">{notice}</p><button style={{...button,background:'#49413a',color:'white'}} onClick={reset}>Reset all demo data</button>
   <p style={{fontSize:12,opacity:.75}}>All data disappears when this page reloads. Nothing is saved to Supabase, localStorage or a real invoice.</p>
  </div></div>;
}
