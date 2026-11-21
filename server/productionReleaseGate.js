// Fail-closed production release checklist. This module never enables billing.
// Each item requires independent evidence; a successful build is insufficient.
export const REQUIRED_PRODUCTION_GATES=Object.freeze([
 'independent_backup_sha256_verified',
 'isolated_restore_verified',
 'vat_registration_and_invoice_treatment_verified',
 'staging_billing_stock_purchase_atomicity_verified',
 'admin_staff_authorization_verified',
 'offline_sync_conflict_recovery_verified',
 'branded_pdf_and_whatsapp_e2e_verified',
 'explicit_owner_release_approval'
]);
export function assessProductionReadiness(evidence={}){
 const missing=REQUIRED_PRODUCTION_GATES.filter(key=>evidence[key]!==true);
 return Object.freeze({ready:missing.length===0,missing,checked:REQUIRED_PRODUCTION_GATES.length});
}
