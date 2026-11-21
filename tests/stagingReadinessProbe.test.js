import test from 'node:test';
import assert from 'node:assert/strict';
import {createStagingReadinessProbe} from '../server/stagingReadinessProbe.js';
test('rejects missing staging environment and missing client',()=>{
 assert.throws(()=>createStagingReadinessProbe({environment:'production',client:{from(){}}}),/Staging/);
 assert.throws(()=>createStagingReadinessProbe({environment:'staging',projectRef:'nzbhvsbgpavvuwxpjrun'}),/client/);
});
test('inspects all ten staging tables with count-only queries',async()=>{
 const tables=[];
 const client={from(name){tables.push(name);return {select(columns,opts){
  assert.equal(columns,'*');assert.deepEqual(opts,{count:'exact',head:true});
  return Promise.resolve({count:0,error:null});
 }}}};
 const result=await createStagingReadinessProbe({environment:'staging',projectRef:'nzbhvsbgpavvuwxpjrun',client}).inspect();
 assert.equal(tables.length,10);
 assert.equal(result.readOnly,true);
 assert.equal(result.environment,'staging');
 assert.equal(Object.keys(result.counts).length,10);
});
test('fails closed on database error',async()=>{
 const client={from(){return {select(){return Promise.resolve({count:null,error:{message:'private'}})}}}};
 await assert.rejects(()=>createStagingReadinessProbe({environment:'staging',projectRef:'nzbhvsbgpavvuwxpjrun',client}).inspect(),/failed/);
});

test('rejects production project even when labeled staging',()=>{
 const client={from(){throw Error('should not query')}};
 assert.throws(()=>createStagingReadinessProbe({environment:'staging',projectRef:'shibmzlswdghjyuutjgx',client}),/Staging/);
});
