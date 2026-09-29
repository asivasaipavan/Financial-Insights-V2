import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { emi, educationLoan, goldLoan, loanComparison, debtPayoff, insuranceAnalysis, compoundInterest, netWorth } from '../utils/calculators.js';

const router = Router();
router.use(requireAuth);

const body = (shape) => z.object(shape).parse;
router.post('/emi', (req,res,next)=>{ try{res.json(emi(z.object({principal:z.coerce.number(),annualRate:z.coerce.number(),months:z.coerce.number()}).parse(req.body)))}catch(e){next(e)}});
router.post('/education-loan', (req,res,next)=>{ try{res.json(educationLoan(z.object({principal:z.coerce.number(),annualRate:z.coerce.number(),studyMonths:z.coerce.number(),graceMonths:z.coerce.number(),tenureMonths:z.coerce.number()}).parse(req.body)))}catch(e){next(e)}});
router.post('/gold-loan', (req,res,next)=>{ try{res.json(goldLoan(z.object({goldGrams:z.coerce.number(),pricePerGram:z.coerce.number(),ltv:z.coerce.number().optional()}).parse(req.body)))}catch(e){next(e)}});
router.post('/loan-comparison', (req,res,next)=>{ try{const v=z.object({loans:z.array(z.object({name:z.string(),principal:z.coerce.number(),annualRate:z.coerce.number(),months:z.coerce.number()})).min(2).max(5)}).parse(req.body);res.json({loans:loanComparison(v.loans)})}catch(e){next(e)}});
router.post('/debt-payoff', (req,res,next)=>{ try{res.json(debtPayoff(z.object({balance:z.coerce.number(),annualRate:z.coerce.number(),monthlyPayment:z.coerce.number()}).parse(req.body)))}catch(e){next(e)}});
router.post('/insurance', (req,res,next)=>{ try{res.json(insuranceAnalysis(z.object({annualPremium:z.coerce.number(),coverageAmount:z.coerce.number(),years:z.coerce.number().optional()}).parse(req.body)))}catch(e){next(e)}});
router.post('/compound-interest', (req,res,next)=>{ try{res.json(compoundInterest(z.object({principal:z.coerce.number(),annualRate:z.coerce.number(),years:z.coerce.number(),monthlyContribution:z.coerce.number().optional()}).parse(req.body)))}catch(e){next(e)}});
router.post('/net-worth', (req,res,next)=>{ try{res.json(netWorth(z.object({assets:z.array(z.object({name:z.string(),amount:z.coerce.number().nonnegative()})),liabilities:z.array(z.object({name:z.string(),amount:z.coerce.number().nonnegative()}))}).parse(req.body)))}catch(e){next(e)}});

export default router;
