// Read-only product catalog adapter for isolated staging.
// Do not pass a privileged service-role client to the browser.
const COLUMNS='id,name,brand,size_ml,sku,selling_price,stock_quantity,low_stock_threshold';
const SIZES=new Set([10,20,30,50,80,100]);
export function createStagingProductReadAdapter({client}={}){
 if(!client||typeof client.from!=='function')throw new TypeError('Trusted staging client required');
 return Object.freeze({
  async listProducts(){
   const query=client.from('products').select(COLUMNS);
   if(!query||typeof query.order!=='function')throw new Error('Invalid staging query');
   const {data,error}=await query.order('name',{ascending:true});
   if(error||!Array.isArray(data))throw new Error('Product catalog unavailable');
   return data.map(row=>{
    if(!row||typeof row.id!=='string'||!row.id||typeof row.name!=='string'||!row.name.trim()||
       typeof row.sku!=='string'||!row.sku||!SIZES.has(row.size_ml)||
       !Number.isSafeInteger(row.stock_quantity)||row.stock_quantity<0||
       !Number.isSafeInteger(row.low_stock_threshold)||row.low_stock_threshold<0||
       !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(String(row.selling_price)))
      throw new Error('Invalid staging product record');
    return Object.freeze({id:row.id,name:row.name,brand:typeof row.brand==='string'?row.brand:null,
     size_ml:row.size_ml,sku:row.sku,selling_price:String(row.selling_price),
     stock_quantity:row.stock_quantity,low_stock_threshold:row.low_stock_threshold});
   });
  }
 });
}
