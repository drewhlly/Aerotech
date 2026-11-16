import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPLOYER_BILLING_PATH,employerMustCompleteBilling} from '../src/lib/employer-payment-policy.ts';

test('unpaid employer can reach billing but not dashboard, staff or payroll',()=>{
  assert.equal(employerMustCompleteBilling(EMPLOYER_BILLING_PATH,false),false);
  for(const path of ['/', '/auth/signup/employer','/dashboard/employer','/dashboard/employer/employees','/dashboard/employer/payroll','/dashboard/employer/billing','/employee']){
    assert.equal(employerMustCompleteBilling(path,false),true,path);
  }
});

test('paid employer sessions can navigate normally',()=>{
  for(const path of [EMPLOYER_BILLING_PATH,'/dashboard/employer','/dashboard/employer/employees']){
    assert.equal(employerMustCompleteBilling(path,true),false,path);
  }
});
