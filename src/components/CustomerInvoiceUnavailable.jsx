import React from 'react';

// Fail-closed customer route until the dedicated server-side token verification
// endpoint is implemented, security-reviewed and explicitly approved.
// Never display demo or real invoice data based solely on a URL path/token.
export default function CustomerInvoiceUnavailable(){
 return <main className="customer-invoice-page"><article className="customer-invoice-card">
  <header><img className="customer-invoice-logo" src="/zahn-original-logo.jpg" alt="ZAHN Luxury Perfumes — Essence of You" onError={e=>{e.currentTarget.hidden=true;e.currentTarget.nextElementSibling.hidden=false}}/><p className="customer-invoice-brand" hidden>ZAHN</p><h1>Invoice unavailable</h1></header>
  <p role="status">This invoice link cannot be opened at this time. Please contact ZAHN Luxury Perfumes for assistance.</p>
  <p className="customer-invoice-note">No invoice details or customer information are displayed.</p>
 </article></main>;
}
