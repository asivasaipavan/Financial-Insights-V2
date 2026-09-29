import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, messageFromError } from '../api';
import { useAuth } from '../main';

export default function Login() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [form,setForm]=useState({email:'',password:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();setError('');setBusy(true);try{const {data}=await api.post('/auth/login',form);login(data);navigate('/')}catch(err){setError(messageFromError(err,'Unable to log in.'))}finally{setBusy(false)}}
  return <AuthLayout title="Welcome back" subtitle="Your money overview, goals and planning tools in one place.">
    <form className="auth-form" onSubmit={submit}>
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
      <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" /></label>
      {error && <div className="alert error">{error}</div>}
      <button className="btn primary wide" disabled={busy}>{busy?'Signing in…':'Sign in'}</button>
      <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthLayout>
}

export function AuthLayout({ title, subtitle, children }) { return <div className="auth-page"><div className="auth-visual"><div className="auth-brand">₹ Financial Insights</div><div className="auth-hero"><span>Plan clearly.</span><span>Spend intentionally.</span><span>Grow steadily.</span></div><p>Track daily money decisions, set goals and use transparent calculators — without paid financial APIs.</p><div className="auth-feature-grid"><div>◎ Budgets</div><div>↗ Goals</div><div>▦ Tools</div><div>◌ Insights</div></div></div><div className="auth-card"><div className="mobile-auth-brand">₹ Financial Insights</div><h1>{title}</h1><p className="muted">{subtitle}</p>{children}</div></div> }
