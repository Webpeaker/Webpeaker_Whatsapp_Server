import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate('/');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-line bg-panel p-8 shadow-glow">
        <div className="mb-8">
          <div className="text-2xl font-semibold text-white">Webpeaker LeadBot CRM</div>
          <p className="mt-2 text-sm text-slate-400">Sign in to manage WhatsApp leads and appointments.</p>
        </div>
        {error ? <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</div> : null}
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="focus-ring w-full rounded-lg border border-line bg-ink px-3 py-2 text-white"
          />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="focus-ring w-full rounded-lg border border-line bg-ink px-3 py-2 text-white"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-ink hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
