import { useState } from 'react';
import { signUp, logIn } from '../../services/firebase';

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await signUp(email, password);
      } else {
        await logIn(email, password);
      }
    } catch (err) {
      const msg = err.code?.replace('auth/', '').replace(/-/g, ' ') || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="logo"><img src="/terraview.png" alt="" className="logo-icon" />Terra<span>View</span></h1>
          <p className="tagline">History in Motion</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="section-label">
            {isRegister ? 'Create Account' : ''}
          </div>

          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <div className="auth-error">{error}</div>}

          <button
            className={`apply-btn${loading ? ' loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait…'
              : isRegister
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        <button
          className="auth-toggle"
          onClick={() => { setIsRegister((v) => !v); setError(''); }}
        >
          {isRegister
            ? 'Already have an account? Sign in'
            : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}
