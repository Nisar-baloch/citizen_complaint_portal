import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, FileText, PlusCircle, LayoutDashboard, LogOut, CheckCircle, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContainer}>
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoIcon}>
            <Shield size={24} color="var(--primary)" />
          </div>
          <span style={styles.logoText}>CivicBridge</span>
        </Link>

        <div style={styles.navLinks}>
          <Link to="/complaints" className="neo-button" style={styles.navItem}>
            <Search size={18} />
            <span>Browse</span>
          </Link>

          {user ? (
            <>
              {user.role === 'citizen' ? (
                <>
                  <Link to="/dashboard" className="neo-button" style={styles.navItem}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/complaints/mine" className="neo-button" style={styles.navItem}>
                    <FileText size={18} />
                    <span>My Complaints</span>
                  </Link>
                  <Link to="/complaints/new" className="neo-button neo-button-primary" style={styles.navItem}>
                    <PlusCircle size={18} />
                    <span>Report Issue</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/officer/dashboard" className="neo-button neo-button-primary" style={styles.navItem}>
                    <LayoutDashboard size={18} />
                    <span>Officer Dash</span>
                  </Link>
                </>
              )}

              <div style={styles.userSection}>
                <span style={styles.username}>
                  Hello, <strong>{user.name}</strong> 
                  <span style={styles.roleTag}>({user.role})</span>
                </span>
                <button onClick={handleLogout} className="neo-button" style={styles.logoutBtn}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" className="neo-button" style={styles.loginBtn}>
                Login
              </Link>
              <Link to="/signup" className="neo-button neo-button-primary" style={styles.signupBtn}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'var(--bg-color)',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 16px -8px rgba(203, 213, 225, 0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'var(--text-color)',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'var(--bg-color)',
    boxShadow: 'var(--shadow-out-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.8)',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  navItem: {
    textDecoration: 'none',
    padding: '10px 16px',
    fontSize: '0.9rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingLeft: '12px',
    borderLeft: '1px solid #cbd5e1',
    marginLeft: '8px',
  },
  username: {
    fontSize: '0.9rem',
    color: 'var(--text-color)',
  },
  roleTag: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    marginLeft: '4px',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    padding: '8px 12px',
    fontSize: '0.85rem',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loginBtn: {
    textDecoration: 'none',
    padding: '10px 18px',
  },
  signupBtn: {
    textDecoration: 'none',
    padding: '10px 18px',
  },
};

export default Navbar;
