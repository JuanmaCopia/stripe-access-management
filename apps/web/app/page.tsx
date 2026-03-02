const scaffoldModules = [
  "web",
  "worker",
  "core",
  "infrastructure",
  "database",
  "testing"
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Phase 1 Foundation</p>
        <h1>Stripe Access Management</h1>
        <p className="lede">
          The monorepo scaffold is in place. Later phases will layer the domain,
          billing, access control, and product flows on top of this shell.
        </p>
      </section>

      <section className="panel">
        <h2>Scaffolded Workspace Modules</h2>
        <ul className="moduleList">
          {scaffoldModules.map((moduleName) => (
            <li key={moduleName}>{moduleName}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
