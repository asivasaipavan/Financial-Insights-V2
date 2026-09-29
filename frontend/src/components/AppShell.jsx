import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../main';

const links = [
  ['/', 'Dashboard', 'D'],
  ['/transactions', 'Transactions', 'T'],
  ['/budgets', 'Budgeting', 'B'],
  ['/goals', 'Goals', 'G'],
  ['/recurring', 'Recurring', 'R'],
  ['/tools', 'Financial Tools', 'F'],
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark">₹</span><span>Financial Insights</span></div>
      <div className="brand-sub">V2 • Personal finance</div>
      <nav className="nav-menu">
        {links.map(([to,label,icon]) => <NavLink key={to} to={to} end={to==='/' } onClick={()=>setOpen(false)} className={({isActive})=>`nav-item ${isActive?'active':''}`}><span className="nav-icon">{icon}</span>{label}</NavLink>)}
      </nav>
      <div className="sidebar-footer">
        <div className="security-chip"><span className="dot" /> Your data is private to your account</div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>
    </aside>
    {open && <button aria-label="Close navigation" className="mobile-overlay" onClick={()=>setOpen(false)} />}
    <main className="main-content">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open navigation">☰</button>
        <div><div className="eyebrow">PERSONAL FINANCE</div><div className="topbar-title">Good to see you, {user?.name?.split(' ')[0] || 'there'}.</div></div>
        <div className="avatar">{(user?.name || 'U').slice(0,1).toUpperCase()}</div>
      </header>
      <div className="page-content"><Outlet /></div>
      <footer className="app-footer">Financial Insights V2 · Educational planning tools, not financial advice.</footer>
    </main>
  </div>;
}
