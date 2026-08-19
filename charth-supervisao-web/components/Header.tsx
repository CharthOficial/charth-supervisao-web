export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div className="brand-title">CHARTH</div>
      <div className="brand-subtitle">Supervisão de Varejo</div>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {subtitle && <div className="small-muted">{subtitle}</div>}
    </div>
  );
}
