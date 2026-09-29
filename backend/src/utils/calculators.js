const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const round = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;

export function emi({ principal, annualRate, months }) {
  principal = Math.max(0, num(principal));
  annualRate = Math.max(0, num(annualRate));
  months = Math.max(0, Math.floor(num(months)));
  if (!principal || !months) return { emi: 0, totalPayment: 0, totalInterest: 0, monthlyInterestRate: 0 };
  const r = annualRate / 1200;
  const payment = r === 0 ? principal / months : principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  const totalPayment = payment * months;
  return { emi: round(payment), totalPayment: round(totalPayment), totalInterest: round(totalPayment - principal), monthlyInterestRate: r };
}

export function educationLoan({ principal, annualRate, studyMonths, graceMonths, tenureMonths }) {
  principal = Math.max(0, num(principal));
  const defer = Math.max(0, Math.floor(num(studyMonths) + num(graceMonths)));
  const tenure = Math.max(1, Math.floor(num(tenureMonths)));
  const result = emi({ principal, annualRate, months: tenure });
  return { ...result, deferredMonths: defer, firstEmiAfterMonths: defer, note: 'The planner treats the study + grace period as a payment-deferred period; lender-specific interest capitalization can differ.' };
}

export function goldLoan({ goldGrams, pricePerGram, ltv = 75 }) {
  const value = Math.max(0, num(goldGrams)) * Math.max(0, num(pricePerGram));
  const eligible = value * Math.min(100, Math.max(0, num(ltv))) / 100;
  return { goldValue: round(value), eligibleLoan: round(eligible), margin: round(value - eligible), ltv: num(ltv) };
}

export function loanComparison(loans) {
  return loans.map((loan, index) => {
    const result = emi(loan);
    return { id: loan.id || index + 1, name: loan.name || `Loan ${index + 1}`, principal: num(loan.principal), annualRate: num(loan.annualRate), months: Math.floor(num(loan.months)), ...result };
  }).sort((a, b) => a.totalInterest - b.totalInterest);
}

export function debtPayoff({ balance, annualRate, monthlyPayment }) {
  balance = Math.max(0, num(balance));
  annualRate = Math.max(0, num(annualRate));
  monthlyPayment = Math.max(0, num(monthlyPayment));
  if (!balance || !monthlyPayment) return { months: 0, totalPaid: 0, totalInterest: 0, impossible: false };
  const monthlyRate = annualRate / 1200;
  if (monthlyRate > 0 && monthlyPayment <= balance * monthlyRate) {
    return { months: null, totalPaid: null, totalInterest: null, impossible: true };
  }
  let months = 0, totalPaid = 0, interest = 0, remaining = balance;
  while (remaining > 0.005 && months < 1200) {
    const monthInterest = remaining * monthlyRate;
    const payment = Math.min(monthlyPayment, remaining + monthInterest);
    remaining = remaining + monthInterest - payment;
    interest += monthInterest;
    totalPaid += payment;
    months += 1;
  }
  return { months, totalPaid: round(totalPaid), totalInterest: round(interest), impossible: false };
}

export function insuranceAnalysis({ annualPremium, coverageAmount, years = 1 }) {
  annualPremium = Math.max(0, num(annualPremium));
  coverageAmount = Math.max(0, num(coverageAmount));
  years = Math.max(1, num(years));
  const totalPremium = annualPremium * years;
  const coverageToPremium = totalPremium ? coverageAmount / totalPremium : 0;
  return { annualPremium: round(annualPremium), totalPremium: round(totalPremium), coverageAmount: round(coverageAmount), coverageToPremium: round(coverageToPremium), premiumShareOfCoverage: coverageAmount ? round(totalPremium / coverageAmount * 100) : 0 };
}

export function compoundInterest({ principal, annualRate, years, monthlyContribution = 0 }) {
  principal = Math.max(0, num(principal));
  annualRate = Math.max(-99, num(annualRate));
  years = Math.max(0, num(years));
  monthlyContribution = Math.max(0, num(monthlyContribution));
  const n = years * 12;
  const monthlyRate = annualRate / 1200;
  let balance = principal;
  for (let i = 0; i < n; i += 1) balance = balance * (1 + monthlyRate) + monthlyContribution;
  const contributions = principal + monthlyContribution * n;
  return { futureValue: round(balance), contributions: round(contributions), interest: round(balance - contributions), months: n };
}

export function netWorth({ assets = [], liabilities = [] }) {
  const sum = (items) => items.reduce((t, x) => t + Math.max(0, num(x.amount)), 0);
  const totalAssets = sum(assets), totalLiabilities = sum(liabilities);
  return { totalAssets: round(totalAssets), totalLiabilities: round(totalLiabilities), netWorth: round(totalAssets - totalLiabilities) };
}
