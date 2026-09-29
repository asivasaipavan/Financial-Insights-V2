import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, messageFromError } from '../api';
import { useAuth } from '../main';
import { AuthLayout } from './Login';

export default function Register(){
  const {login}=useAuth();const navigate=useNavigate();
  const [form,setForm]=useState({name:'',email:'',password:''});const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();setError('');if(form.password.length<8)return setError('Use at least 8 characters for your password.');setBusy(true);try{const {data}=await api.post('/auth/register',form);login(data);navigate('/')}catch(err){setError(messageFromError(err,'Unable to create the account.'))}finally{setBusy(false)}}
  return <AuthLayout title="Create your account" subtitle="Start building a clearer picture of your money."><form className="auth-form" onSubmit={submit}>
    <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" /></label>
    <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
    <label>Password<input type="password" required minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters" /></label>
    {error&&<div className="alert error">{error}</div>}<button className="btn primary wide" disabled={busy}>{busy?'Creating…':'Create account'}</button><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </form></AuthLayout>
}
