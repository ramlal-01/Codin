import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthForm } from "../components/auth/AuthForm.jsx";
import { Navbar } from "../components/layout/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Start your workspace</p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl">Create rooms for interviews, debugging, and study sessions.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Create your account with your name, email address, and password. You will create or join rooms from the dashboard after this.</p>
        </section>
        <section>
          <AuthForm mode="signup" form={form} error={error} submitting={submitting} onChange={onChange} onSubmit={onSubmit} />
          <p className="mt-4 text-sm text-slate-400">
            Already have an account? <Link className="font-semibold text-cyan-300 hover:text-cyan-200" to="/login">Log in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default SignupPage;
