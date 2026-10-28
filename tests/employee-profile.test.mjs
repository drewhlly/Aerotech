import test from 'node:test';import assert from 'node:assert/strict';
import {sanitizeProfile} from '../src/lib/employee-profile-fields.ts';
test('comprehensive employee records preserve national identifiers as text and expose only allowed fields',()=>{
 const p=sanitizeProfile({personal:{nin:'00000000001',middleName:'Test',residentialAddress:'Synthetic address'},banking:{bvn:'00000000002'},employment:{hireDate:'2026-10-25'}});
 assert.equal(p.personal.nin,'00000000001');assert.equal(p.banking.bvn,'00000000002');
 assert.throws(()=>sanitizeProfile({personal:{nin:'123'}}));assert.throws(()=>sanitizeProfile({banking:{bvn:'not-a-bvn'}}));assert.throws(()=>sanitizeProfile({personal:{admin:'true'}}));
});
