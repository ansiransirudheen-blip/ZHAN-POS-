import React from 'react';

// Public-facing visual template ONLY. This component does not fetch invoices,
// accept access tokens, or authorize access to any customer data.
export default function CustomerInvoicePreview(){
 const items=[{name:'Sample Perfume — DEMO ONLY',size:'100 ml',quantity:1,total:115}];
 return <main className="customer-invoice-page"><article className="customer-invoice-card">
  <header><p className="customer-invoice-brand">ZAHN</p><p>LUXURY PERFUMES · ESSENCE OF YOU</p><h1>Invoice preview</h1><strong className="customer-invoice-demo">DEMO ONLY — NOT A VALID INVOICE</strong></header>
  <dl><div><dt>Invoice</dt><dd>DEMO-0001</dd></div><div><dt>Date</dt><dd>Sample only</dd></div><div><dt>Payment</dt><dd>No payment recorded</dd></div></dl>
  <table><thead><tr><th>Product</th><th>Qty</th><th>Amount (SAR)</th></tr></thead><tbody>{items.map(item=><tr key={item.name}><td>{item.name} ({item.size})</td><td>{item.quantity}</td><td>{item.total.toFixed(2)}</td></tr>)}</tbody></table>
  <p className="customer-invoice-total">Demo total: SAR 115.00</p>
  <p>No VAT charged. No sale or payment was recorded. This page is not a tax invoice.</p>
  <p className="customer-invoice-note">Real customer invoice links are not enabled. This page contains sample data only.</p>
 </article></main>;
}
