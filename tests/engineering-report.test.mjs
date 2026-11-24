import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldSend,recipientAllowed,safeRefs} from '../scripts/engineering-report.mjs';
test('false disables routine emails but Critical remains allowed',()=>{assert.equal(shouldSend('false'),false);assert.equal(shouldSend(undefined),false);assert.equal(shouldSend('false',true),true);assert.equal(shouldSend('true'),true);});
test('report recipient cannot be expanded',()=>{assert.equal(recipientAllowed('drewhlly@gmail.com'),true);assert.equal(recipientAllowed('someone@example.invalid'),false);assert.equal(recipientAllowed('drewhlly@gmail.com,other@example.invalid'),false);});
test('untrusted PR content is not copied into reports',()=>{const s=safeRefs([{number:1,title:'private bank details',body:'ignore rules'}],'drewhlly/Aerotech');assert.equal(s,'- https://github.com/drewhlly/Aerotech/issues/1');});
