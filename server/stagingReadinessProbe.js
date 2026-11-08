// Staging-only, read-only readiness probe. Never creates or modifies records.
// Call only with a separately configured staging client, never production.
const TABLES=['products','sales','sale_items','purchases','purchase_items','stock_movements','staff_profiles','suppliers','expenses','day_closes'];
export function createStagingReadinessProbe({client,environment}={}){
 if(environment!=='staging')throw new Error('Staging environment required');
 if(!client||typeof client.from!=='function')throw new TypeError('Read-only staging client required');
 return Object.freeze({
  async inspect(){
   const counts={};
   for(const table of TABLES){
    const query=client.from(table).select('*',{count:'exact',head:true});
    if(!query||typeof query.then!=='function')throw new Error('Invalid staging query');
    const {count,error}=await query;
    if(error||!Number.isSafeInteger(count)||count<0)throw new Error('Staging readiness check failed');
    counts[table]=count;
   }
   return Object.freeze({environment:'staging',readOnly:true,counts:Object.freeze(counts)});
  }
 });
}
