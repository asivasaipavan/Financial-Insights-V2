import assert from 'node:assert/strict';
import { emi, educationLoan, goldLoan, loanComparison, debtPayoff, insuranceAnalysis, compoundInterest, netWorth } from './calculators.js';

const e = emi({ principal: 100000, annualRate: 12, months: 12 });
assert(Math.abs(e.emi - 8884.88) < 0.1);
assert.equal(e.totalInterest > 0, true);
assert.equal(educationLoan({ principal: 100000, annualRate: 10, studyMonths: 24, graceMonths: 6, tenureMonths: 60 }).firstEmiAfterMonths, 30);
assert.deepEqual(goldLoan({ goldGrams: 10, pricePerGram: 5000, ltv: 75 }).eligibleLoan, 37500);
assert.equal(loanComparison([
  {name:'A',principal:100000,annualRate:10,months:12},
  {name:'B',principal:100000,annualRate:12,months:12}
]).length, 2);
assert.equal(debtPayoff({ balance: 10000, annualRate: 0, monthlyPayment: 1000 }).months, 10);
assert.equal(insuranceAnalysis({ annualPremium: 12000, coverageAmount: 1000000, years: 10 }).totalPremium, 120000);
assert.equal(compoundInterest({ principal: 1000, annualRate: 0, years: 1, monthlyContribution: 100 }).futureValue, 2200);
assert.equal(netWorth({assets:[{name:'Cash',amount:5000}],liabilities:[{name:'Loan',amount:1500}]}).netWorth, 3500);
console.log('Calculator tests passed.');
