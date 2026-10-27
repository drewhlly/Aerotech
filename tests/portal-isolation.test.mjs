import test from 'node:test';
import assert from 'node:assert/strict';
import {workspaceHomes,workspaceLink,linkAllowed,routeRole} from '../src/lib/portal-policy.ts';
test('portal links cannot escape the current role and legacy tool links are internalised',()=>{
 for(const role of Object.keys(workspaceHomes)){
  for(const target of ['/','/pricing','/auth/login','//evil.example','https://evil.example','/employee','/admin/vacancy-approvals','/dashboard/employer/employees']){
   const resolved=workspaceLink(role,target);assert.equal(routeRole(resolved.split('?')[0]),role);
  }
  assert.equal(linkAllowed(role,workspaceHomes[role]),true);
  for(const other of Object.keys(workspaceHomes).filter(r=>r!==role))assert.equal(linkAllowed(role,workspaceHomes[other]),false);
  assert.equal(linkAllowed(role,'//evil.example'),false);
  assert.equal(linkAllowed(role,'/pricing'),false);
 }
 assert.equal(workspaceLink('employer','/billing?plan=business'),'/dashboard/employer/billing/plans?plan=business');
 assert.equal(workspaceLink('employee','/meet/room'),'/employee/meet/room');
 assert.equal(workspaceLink('applicant','/careers/role'),'/applicant/opportunities/role');
 assert.equal(workspaceLink('employee','/careers'),'/employee');
});
