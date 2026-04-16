// src/components/layout/Navbar.tsx
export function Navbar() {
  return (
    <header className="border-b border-slate-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold tracking-tight">Codin</div>
        <a
          href="https://github.com/your-username/Codin"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-slate-300 hover:text-white"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}