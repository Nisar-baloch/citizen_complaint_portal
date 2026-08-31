import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'citizen') {
      setEmail('citizen@civic.com');
      setPassword('password123');
    } else if (role === 'officer') {
      setEmail('officer@civic.com');
      setPassword('password123');
    }
  };

  return (
    <div style={styles.container}>
      <div className="neo-box" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <LogIn size={28} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to report or resolve civic complaints</p>
        </div>

        {errorMsg && (
          <div className="neo-badge badge-critical neo-badge-inset" style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} color="var(--text-light)" />
              <input
                type="email"
                className="neo-input"
                style={styles.inputWithIcon}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Key size={18} style={styles.inputIcon} color="var(--text-light)" />
              <input
                type="password"
                className="neo-input"
                style={styles.inputWithIcon}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="neo-button neo-button-primary"
            style={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying Account...' : 'Log In'}
          </button>
        </form>

        <div style={styles.quickLoginSection}>
          <p style={styles.quickLoginTitle}>Quick Demo Logins</p>
          <div style={styles.quickLoginBtns}>
            <button
              onClick={() => handleQuickLogin('citizen')}
              className="neo-button"
              style={styles.quickBtn}
              type="button"
            >
              Fill Citizen Profile
            </button>
            <button
              onClick={() => handleQuickLogin('officer')}
              className="neo-button"
              style={styles.quickBtn}
              type="button"
            >
              Fill Officer Profile
            </button>
          </div>
        </div>

        <div style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '0 16px',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'var(--bg-color)',
    boxShadow: 'var(--shadow-out-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    border: '1px solid rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    color: 'var(--text-color)',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    margin: 0,
  },
  errorAlert: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    boxShadow: 'inset 3px 3px 6px rgba(185, 28, 28, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-color)',
    paddingLeft: '4px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    pointerEvents: 'none',
  },
  inputWithIcon: {
    paddingLeft: '48px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    marginTop: '8px',
  },
  quickLoginSection: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #cbd5e1',
    textAlign: 'center',
  },
  quickLoginTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  quickLoginBtns: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  quickBtn: {
    padding: '8px 12px',
    fontSize: '0.8rem',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '0.9rem',
    color: 'var(--text-light)',
  },
  link: {
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;
