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

test('unpaid employer retains help, scoped support and privacy without unlocking modules',()=>{
  for(const path of ['/help','/support','/support/tickets','/dashboard/employer/support',
    '/dashboard/employer/support-access','/dashboard/employer/privacy']){
    assert.equal(employerMustCompleteBilling(path,false),false,path);
  }
  for(const path of ['/dashboard/employer/support-access/other','/dashboard/employer/privacy-extra',
    '/employee/support','/applicant/privacy','/dashboard/employer/recruitment']){
    assert.equal(employerMustCompleteBilling(path,false),true,path);
  }
});
