export default function Card({ title, value, icon, accent = "default", subtitle }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-body">
        <p className="stat-title">{title}</p>
        <h2 className="stat-value">{value}</h2>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
