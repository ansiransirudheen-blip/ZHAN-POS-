import test from 'node:test';
import assert from 'node:assert/strict';
import {litersToMl,weightedCostPerMl,recipeCost,materialUsage} from '../src/lib/perfumeInventory.js';

test('oil liters convert to milliliters',()=>assert.equal(litersToMl(1),1000));
test('weighted oil cost respects different lot prices',()=>{
 assert.equal(weightedCostPerMl([{liters:1,totalCost:100},{liters:2,totalCost:500}]),0.2);
});
test('recipe preview includes liquid bottle and packaging',()=>{
 assert.equal(recipeCost({oilMl:5,liquidMl:5,oilCostPerMl:0.2,liquidCostPerMl:0.1,bottleCost:2,packagingCost:1}),4.5);
});
test('made-to-order deducts materials on sale only',()=>{
 assert.deepEqual(materialUsage({mode:'made_to_order',event:'sale',quantity:2,oilMl:5,liquidMl:5}),{oilMl:10,liquidMl:10,finishedUnits:0});
 assert.deepEqual(materialUsage({mode:'made_to_order',event:'production',quantity:2,oilMl:5,liquidMl:5}),{oilMl:0,liquidMl:0,finishedUnits:0});
});
test('pre-made deducts materials at production and finished units on sale',()=>{
 assert.deepEqual(materialUsage({mode:'pre_made',event:'production',quantity:2,oilMl:5,liquidMl:5}),{oilMl:10,liquidMl:10,finishedUnits:2});
 assert.deepEqual(materialUsage({mode:'pre_made',event:'sale',quantity:2,oilMl:5,liquidMl:5}),{oilMl:0,liquidMl:0,finishedUnits:-2});
});
test('rejects invalid values',()=>{
 assert.throws(()=>litersToMl(-1));
 assert.throws(()=>weightedCostPerMl([]));
 assert.throws(()=>recipeCost({oilMl:0,liquidMl:0,oilCostPerMl:0,liquidCostPerMl:0,bottleCost:0,packagingCost:0}));
});
