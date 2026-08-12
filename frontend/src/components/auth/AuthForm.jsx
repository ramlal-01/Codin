export function AuthForm({ mode, form, error, submitting, onChange, onSubmit }) {
  const isSignup = mode === "signup";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
      {isSignup && (
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Your name</span>
          <input
            name="name"
            placeholder="Example: Riya Sharma"
            value={form.name}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            required
          />
        </label>
      )}
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">Email address</span>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">Password</span>
        <input
          type="password"
          name="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={onChange}
          minLength={6}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          required
        />
      </label>
      {error && <p className="rounded border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
      <button
        disabled={submitting}
        className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-700 disabled:text-slate-300"
      >
        {submitting ? "Please wait..." : isSignup ? "Create account" : "Log in"}
      </button>
    </form>
  );
}
