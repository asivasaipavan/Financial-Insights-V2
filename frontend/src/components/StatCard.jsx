import { money } from '../utils/format';
export default function StatCard({ label, value, accent='neutral', note }) {
  return <div className={`stat-card accent-${accent}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{money(value)}</div>
    {note && <div className="stat-note">{note}</div>}
  </div>;
}
