import { useEffect, useState } from 'react';
import { api, messageFromError } from '../api';
import Panel from '../components/Panel';
import { money, pct, currentMonth } from '../utils/format';

const cats=['Rent','Food','Transport','Utilities','Shopping','Health','Education','Entertainment','Travel','Debt','Other'];
export default function Budgets(){
  const [month,setMonth]=useState(currentMonth()),[items,setItems]=useState([]),[category,setCategory]=useState('Food'),[amount,setAmount]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function load(){try{const {data}=await api.get(`/budgets?month=${month}`);setItems(data.budgets)}catch(err){setError(messageFromError(err))}}
  useEffect(()=>{load()},[month]);
  async function save(e){e.preventDefault();setBusy(true);setError('');try{await api.post('/budgets',{month,category,amount});setAmount('');await load()}catch(err){setError(messageFromError(err))}finally{setBusy(false)}}
  async function del(id){try{await api.delete(`/budgets/${id}`);await load()}catch(err){setError(messageFromError(err))}}
  return <div className="page-stack"><div className="page-heading"><div><div className="eyebrow">PLAN YOUR SPEND</div><h1>Budgeting</h1><p>Set category limits and watch actual spending against them.</p></div><label className="compact-field">Month<input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label></div>
    <div className="content-grid two-third"><Panel title="Add or update a budget" subtitle="Saving the same category again updates its limit."><form className="inline-form" onSubmit={save}><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{cats.map(x=><option key={x}>{x}</option>)}</select></label><label>Monthly limit<input required min="0" type="number" step="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 7000"/></label><button className="btn primary" disabled={busy}>{busy?'Saving…':'Save budget'}</button></form>{error&&<div className="alert error">{error}</div>}</Panel>
    <Panel title="Budget health" subtitle={`${month} · ${items.length} categories`}><div className="budget-list">{items.map(b=><div className="budget-card" key={b.id}><div className="row-between"><div><strong>{b.category}</strong><div className="muted small">Spent {money(b.spent)}</div></div><div className="right-text"><strong>{money(b.amount)}</strong><button className="icon-btn danger" onClick={()=>del(b.id)}>Remove</button></div></div><div className="progress-track big"><div className={`progress-fill ${b.spent>b.amount?'over':''}`} style={{width:`${Math.min(100,b.progress)}%`}}/></div><div className="row-between small"><span>{b.remaining>=0?`${money(b.remaining)} remaining`:`${money(Math.abs(b.remaining))} over budget`}</span><span>{pct(b.progress)}</span></div></div>)}{!items.length&&<div className="empty-state">No budgets for this month yet.</div>}</div></Panel></div>
  </div>
}
