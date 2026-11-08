import test from 'node:test';
import assert from 'node:assert/strict';
import {assessProductionReadiness,REQUIRED_PRODUCTION_GATES} from '../server/productionReleaseGate.js';
test('production remains blocked without independently verified evidence',()=>{
 const result=assessProductionReadiness();
 assert.equal(result.ready,false);
 assert.equal(result.missing.length,8);
});
test('partial or truthy string evidence cannot pass',()=>{
 const evidence=Object.fromEntries(REQUIRED_PRODUCTION_GATES.map(key=>[key,'yes']));
 assert.equal(assessProductionReadiness(evidence).ready,false);
 evidence[REQUIRED_PRODUCTION_GATES[0]]=true;
 assert.equal(assessProductionReadiness(evidence).missing.length,7);
});
test('all eight explicit verified gates are required',()=>{
 const evidence=Object.fromEntries(REQUIRED_PRODUCTION_GATES.map(key=>[key,true]));
 assert.equal(assessProductionReadiness(evidence).ready,true);
});
