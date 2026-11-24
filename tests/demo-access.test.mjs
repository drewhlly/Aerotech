import test from 'node:test';
import assert from 'node:assert/strict';
import {isActiveDemoSubscription,demoMayAccessService} from '../src/lib/demo-access.ts';
const employer='9dc6d739-3327-4fd6-9f96-9cead1e48bbd';
const tomorrow=new Date(Date.now()+86400000).toISOString();
test('explicit demo is tenant-bound and remains available until revoked',()=>{
 assert.equal(isActiveDemoSubscription({status:'demo',reference:'private-demo-'+employer,paid_until:tomorrow},employer),true);
 assert.equal(isActiveDemoSubscription({status:'active',reference:'private-demo-'+employer,paid_until:tomorrow},employer),false);
 assert.equal(isActiveDemoSubscription({status:'demo',reference:'private-demo-other',paid_until:tomorrow},employer),false);
 assert.equal(isActiveDemoSubscription({status:'demo',reference:'private-demo-'+employer,paid_until:'2020-01-01'},employer),true);
});
test('demo permits workforce previews and blocks payout initiation',()=>{
 assert.equal(demoMayAccessService('/api/employees'),true);
 assert.equal(demoMayAccessService('/api/payroll/payments/prepare'),false);
 assert.equal(demoMayAccessService('/api/payroll/payments/release'),false);
 assert.equal(demoMayAccessService('/api/payroll/transfers'),false);
});
