import test from 'node:test';
import assert from 'node:assert/strict';
import {createStagingProductReadAdapter} from '../server/stagingProductReadAdapter.js';
test('staging catalog uses a restricted projection and excludes private cost',async()=>{
 let columns,sort;
 const client={from(table){assert.equal(table,'products');return {select(value){columns=value;return {async order(field,options){sort=[field,options];return {data:[{id:'p1',name:'Oud',brand:'ZAHN',size_ml:50,sku:'OUD50',selling_price:'120.00',stock_quantity:3,low_stock_threshold:2,cost_price:'10',secret:'hidden'}],error:null}}}}}}};
 const products=await createStagingProductReadAdapter({client}).listProducts();
 assert.equal(columns,'id,name,brand,size_ml,sku,selling_price,stock_quantity,low_stock_threshold');
 assert.deepEqual(sort,['name',{ascending:true}]);
 assert.equal(products[0].cost_price,undefined);
 assert.equal(products[0].secret,undefined);
 assert.equal(products[0].selling_price,'120.00');
});
test('invalid records and database failures fail closed',async()=>{
 const makeClient=(data,error=null)=>({from(){return {select(){return {async order(){return {data,error}}}}}}});
 await assert.rejects(()=>createStagingProductReadAdapter({client:makeClient([{id:'p',name:'X',size_ml:40,sku:'X',selling_price:'5',stock_quantity:1,low_stock_threshold:1}])}).listProducts());
 await assert.rejects(()=>createStagingProductReadAdapter({client:makeClient(null,{message:'private'})}).listProducts(),/unavailable/);
});
