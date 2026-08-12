import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="min-w-0 flex-1">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
        Real-time coding workspace
      </p>
      <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
        Code, discuss, run, and sketch ideas in one shared room.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
        CodIn helps students, interview partners, and small teams work through problems together without juggling separate editor, chat, compiler, and whiteboard tabs.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link to="/signup" className="rounded bg-cyan-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-cyan-400">
          Start collaborating
        </Link>
        <Link to="/login" className="rounded border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-slate-900">
          Open dashboard
        </Link>
      </div>
      <dl className="mt-8 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
        <div className="rounded border border-slate-800 bg-slate-900/70 p-3">
          <dt className="font-semibold text-white">Live editor</dt>
          <dd className="mt-1 text-slate-400">Synchronized code in shared rooms</dd>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900/70 p-3">
          <dt className="font-semibold text-white">Run code</dt>
          <dd className="mt-1 text-slate-400">Structured stdout, errors, time, memory</dd>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900/70 p-3">
          <dt className="font-semibold text-white">Whiteboard</dt>
          <dd className="mt-1 text-slate-400">Sketch algorithms and ideas together</dd>
        </div>
      </dl>
    </section>
  );
}
