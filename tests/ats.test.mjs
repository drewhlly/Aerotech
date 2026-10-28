import test from 'node:test';
import assert from 'node:assert/strict';
import {grade} from '../src/lib/ats.ts';
test('assessment grades exact answers and does not award points for missing answers',()=>{
 const questions=[{prompt:'A',options:['a','b','c','d'],correct:2},{prompt:'B',options:['a','b','c','d'],correct:0}];
 assert.equal(grade(questions,[2,0]),100);
 assert.equal(grade(questions,[2,1]),50);
 assert.equal(grade(questions,[1,1]),0);
 assert.equal(grade(questions,[]),0);
});
test('assessment scores round consistently across uneven question counts',()=>{
 const q=Array.from({length:3},()=>({prompt:'A',options:['a','b','c','d'],correct:0}));
 assert.equal(grade(q,[0,1,1]),33);
 assert.equal(grade(q,[0,0,1]),67);
});
