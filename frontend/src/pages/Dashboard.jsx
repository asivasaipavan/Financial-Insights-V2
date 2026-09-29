import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api, messageFromError } from '../api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import { money, pct, shortDate } from '../utils/format';

const PIE_COLORS = ['#5ee7a8','#4f8cff','#b383ff','#ffb95e','#ff6b7a','#35d1dc','#91a4b7','#e6e9ef'];

export default function Dashboard(){
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  async function load(){setLoading(true);setError('');try{await api.post('/recurring-transactions/apply-due');const {data}=await api.get('/dashboard?months=6');setData(data)}catch(err){setError(messageFromError(err))}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  const categoryData=useMemo(()=>data?.categories?.map(x=>({name:x.category,value:Number(x.amount)}))||[],[data]);
  if(loading)return <Loader text="Building your dashboard…"/>;
  if(error)return <ErrorState message={error} retry={load}/>;
  return <div className="page-stack">
    <div className="page-heading"><div><div className="eyebrow">OVERVIEW</div><h1>Financial Dashboard</h1><p>See where your money is going and what you’re building toward this month.</p></div><button className="btn secondary" onClick={load}>Refresh data</button></div>
    <div className="stat-grid four"><StatCard label="This month income" value={data.summary.income} accent="green" note="Money in"/><StatCard label="This month expenses" value={data.summary.expenses} accent="rose" note="Money out"/><StatCard label="Monthly savings" value={data.summary.savings} accent={data.summary.savings>=0?'green':'rose'} note={`${pct(data.summary.savingsRate)} savings rate`}/><StatCard label="Net worth" value={data.summary.netWorth} accent="blue" note="Latest saved snapshot"/></div>
    <div className="dashboard-grid main-first">
      <Panel title="Cash flow" subtitle="Income, expenses and savings by month"><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5ee7a8" stopOpacity="0.35"/><stop offset="100%" stopColor="#5ee7a8" stopOpacity="0"/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b7a" stopOpacity="0.28"/><stop offset="100%" stopColor="#ff6b7a" stopOpacity="0"/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#253045"/><XAxis dataKey="label" stroke="#91a4b7"/><YAxis stroke="#91a4b7" tickFormatter={v=>`₹${Math.round(v/1000)}k`}/><Tooltip formatter={(v)=>money(v)} contentStyle={{background:'#121a27',border:'1px solid #263449',borderRadius:12,color:'#eef3fa'}}/><Area type="monotone" dataKey="income" stroke="#5ee7a8" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="expenses" stroke="#ff6b7a" strokeWidth={2.5} fill="url(#expenseFill)"/></AreaChart></ResponsiveContainer></div></Panel>
      <Panel title="Spending mix" subtitle="Top expense categories this month"><div className="chart-wrap medium"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius={88} innerRadius={52} paddingAngle={3}>{categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip formatter={v=>money(v)} contentStyle={{background:'#121a27',border:'1px solid #263449',borderRadius:12}}/><Legend verticalAlign="bottom" height={30}/></PieChart></ResponsiveContainer></div></Panel>
    </div>
    <div className="dashboard-grid equal"><Panel title="Budget health" subtitle="This month"><div className="budget-list">{data.budgets.length?data.budgets.map(b=><div className="progress-row" key={b.id}><div className="row-between"><span>{b.category}</span><strong>{money(b.spent)} / {money(b.amount)}</strong></div><div className="progress-track"><div className={`progress-fill ${b.spent>b.amount?'over':''}`} style={{width:`${Math.min(100,b.progress)}%`}} /></div><div className="row-between small"><span>{b.remaining>=0?`${money(b.remaining)} left`:`${money(Math.abs(b.remaining))} over`}</span><span>{pct(b.progress)}</span></div></div>):<Empty text="No budgets yet. Add a category budget to see progress here."/>}</div></Panel>
      <Panel title="Goals" subtitle="Your current savings targets"><div className="goal-list">{data.goals.length?data.goals.map(g=><div className="goal-item" key={g.id}><div className="goal-top"><div><strong>{g.name}</strong><div className="muted small">Target {money(g.targetAmount)}</div></div><strong>{pct(g.targetAmount?g.currentAmount/g.targetAmount*100:0)}</strong></div><div className="progress-track"><div className="progress-fill goal" style={{width:`${Math.min(100,g.targetAmount?g.currentAmount/g.targetAmount*100:0)}%`}}/></div><div className="row-between small"><span>{money(g.currentAmount)} saved</span><span>{g.targetDate?`Due ${shortDate(g.targetDate)}`:'No target date'}</span></div></div>):<Empty text="Create a goal for something you want to fund."/>}</div></Panel>
    </div>
    <Panel title="Recent transactions" subtitle="Latest activity"><div className="table-wrap"><table><thead><tr><th>Type</th><th>Category</th><th>Description</th><th>Date</th><th className="right">Amount</th></tr></thead><tbody>{data.recentTransactions.map(t=><tr key={t.id}><td><span className={`type-pill ${t.type}`}>{t.type}</span></td><td>{t.category}</td><td>{t.description||'—'}</td><td>{shortDate(t.transactionDate)}</td><td className={`right amount-${t.type}`}>{t.type==='income'?'+':'−'}{money(t.amount)}</td></tr>)}</tbody></table></div></Panel>
  </div>
}

function Loader({text}){return <div className="center-state"><div className="spinner"/><p>{text}</p></div>}
function ErrorState({message,retry}){return <div className="center-state"><div className="state-icon">!</div><h2>Couldn’t load this view</h2><p>{message}</p><button className="btn primary" onClick={retry}>Try again</button></div>}
function Empty({text}){return <div className="empty-state">{text}</div>}
