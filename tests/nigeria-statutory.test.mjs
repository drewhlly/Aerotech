import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {nigeriaPayroll} from '../src/lib/nigeria-payroll.ts';

const migration = readFileSync(new URL('../database/048_nigeria_payroll_rules.sql', import.meta.url), 'utf8');
const rules = JSON.parse(migration.match(/'(\{[\s\S]+?\})'/)[1]);
const base = {monthlyGross:100000,basic:50000,housing:20000,transport:10000,annualRentRelief:0,
  pensionEnabled:false,nhfEnabled:false,taxExempt:false,sanctions:0,otherDeductions:0};
const calculate = (overrides = {}) => nigeriaPayroll({...base, ...overrides}, rules);

test('NHF applies to monthly income when participation has been elected', () => {
  assert.equal(calculate().nhf, 0);
  const enabled = calculate({nhfEnabled:true});
  assert.equal(enabled.nhf, 2500);
  assert.equal(enabled.paye, 4625);
  assert.equal(enabled.net, 92875);
});

test('annual PAYE bands, including worked salaries and the top marginal band', () => {
  for (const [gross, annual, monthly] of [[100000,60000,5000],[250000,330000,27500],
    [300000,438000,36500],[500000,870000,72500],[5000000,12930000,1077500]]) {
    const result = calculate({monthlyGross:gross});
    assert.equal(result.statutoryBreakdown.annualTax, annual);
    assert.equal(result.paye, monthly);
  }
  assert.equal(calculate({monthlyGross:65000, basic:30000}).paye, 0);
});

test('pension, rent evidence, capped rent and invalid deductions', () => {
  const pension = calculate({pensionEnabled:true});
  assert.equal(pension.employeePension, 6400);
  assert.equal(pension.employerPension, 8000);
  assert.equal(calculate({annualRentRelief:9000000}).paye, 5000);
  const capped = calculate({monthlyGross:500000, annualRentRelief:9000000, rentEvidenceVerified:true});
  assert.equal(capped.statutoryBreakdown.reliefs.rent, 500000);
  assert.equal(capped.paye, 65000);
  assert.throws(() => calculate({otherDeductions:100001}));
});
