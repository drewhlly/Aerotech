import test from 'node:test';
import assert from 'node:assert/strict';
import {nigeriaPayroll} from '../src/lib/nigeria-payroll.ts';
const base={monthlyGross:100000,basic:50000,housing:20000,transport:10000,annualRentRelief:0,pensionEnabled:false,nhfEnabled:false,taxExempt:false,sanctions:0,otherDeductions:0};
test('NHF participation uses monthly income and is disabled when not selected',()=>{
 assert.equal(nigeriaPayroll(base).nhf,0);
 const enabled=nigeriaPayroll({...base,nhfEnabled:true});
 assert.equal(enabled.nhf,2500);assert.equal(enabled.paye,4625);assert.equal(enabled.net,92875);
});
test('Nigeria preview applies the tax-free band, pension rates and capped rent relief',()=>{
 assert.equal(nigeriaPayroll({...base,monthlyGross:70000,basic:30000}).paye,0);
 const pension=nigeriaPayroll({...base,pensionEnabled:true});assert.equal(pension.employeePension,6400);assert.equal(pension.employerPension,8000);
 assert.equal(nigeriaPayroll({...base,annualRentRelief:2500000}).paye,nigeriaPayroll({...base,annualRentRelief:9000000}).paye);
 assert.throws(()=>nigeriaPayroll({...base,otherDeductions:100001}));
});
