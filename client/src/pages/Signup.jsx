import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const result = await signup(name, email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div className="neo-box" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <UserPlus size={28} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Join CivicBridge</h2>
          <p style={styles.subtitle}>Create an account to report and track local issues</p>
        </div>

        {errorMsg && (
          <div className="neo-badge badge-critical neo-badge-inset" style={styles.alert}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="neo-badge badge-low neo-badge-inset" style={styles.alert}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} color="var(--text-light)" />
              <input
                type="text"
                className="neo-input"
                style={styles.inputWithIcon}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} color="var(--text-light)" />
              <input
                type="email"
                className="neo-input"
                style={styles.inputWithIcon}
                placeholder="john@example.com"
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
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Role</label>
            <div style={styles.inputWrapper}>
              <ShieldCheck size={18} style={styles.inputIcon} color="var(--text-light)" />
              <select
                className="neo-input"
                style={{ ...styles.inputWithIcon, ...styles.select }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="citizen">Citizen (File & Upvote Complaints)</option>
                <option value="officer">Government Officer (Review & Resolve)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="neo-button neo-button-primary"
            style={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footerText}>
          Already registered?{' '}
          <Link to="/login" style={styles.link}>
            Login here
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
    minHeight: '75vh',
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
  alert: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
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
  select: {
    appearance: 'none',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    marginTop: '8px',
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

export default Signup;
