// Pure preview calculations only. Never writes to Supabase or changes stock.
const valid=(n,label,zero=false)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<0||(!zero&&n===0))throw new RangeError(label+' must be positive');return n};
export function litersToMl(liters){return valid(liters,'Liters')*1000}
export function weightedCostPerMl(lots){
 if(!Array.isArray(lots)||lots.length===0)throw new RangeError('At least one oil lot required');
 let ml=0,cost=0;
 for(const lot of lots){const quantity=valid(lot.liters,'Oil liters');const amount=valid(lot.totalCost,'Lot cost',true);ml+=litersToMl(quantity);cost+=amount}
 return cost/ml;
}
export function recipeCost({oilMl,liquidMl,oilCostPerMl,liquidCostPerMl,bottleCost,packagingCost}){
 const values={oilMl,liquidMl,oilCostPerMl,liquidCostPerMl,bottleCost,packagingCost};
 for(const [name,value] of Object.entries(values))valid(value,name,true);
 if(oilMl+liquidMl<=0)throw new RangeError('Recipe must have volume');
 return Math.round((oilMl*oilCostPerMl+liquidMl*liquidCostPerMl+bottleCost+packagingCost)*100)/100;
}
// Model stock transitions without double deduction: made-to-order on sale;
// pre-made at production, then finished goods only on sale.
export function materialUsage({mode,event,quantity,oilMl,liquidMl}){
 if(!['made_to_order','pre_made'].includes(mode)||!['production','sale'].includes(event))throw new RangeError('Invalid mode or event');
 valid(quantity,'Quantity');valid(oilMl,'Oil mL',true);valid(liquidMl,'Liquid mL',true);
 const consume=(mode==='made_to_order'&&event==='sale')||(mode==='pre_made'&&event==='production');
 return {oilMl:consume?quantity*oilMl:0,liquidMl:consume?quantity*liquidMl:0,finishedUnits:mode==='pre_made'?(event==='production'?quantity:-quantity):0};
}
