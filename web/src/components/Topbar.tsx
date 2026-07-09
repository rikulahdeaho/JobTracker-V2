type TopbarProps = {
  title: string;
};

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="topbar-kicker">Frontend Foundation</p>
        <h2 className="topbar-title">{title}</h2>
      </div>
    </header>
  );
}
