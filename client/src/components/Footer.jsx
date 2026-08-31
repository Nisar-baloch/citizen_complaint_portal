import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <span style={styles.text}>
          &copy; {new Date().getFullYear()} <strong>CivicBridge</strong> Portal. Empowering citizens, bridging governance.
        </span>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: 'var(--bg-color)',
    padding: '24px 0',
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    boxShadow: 'inset 0 4px 10px -4px rgba(203, 213, 225, 0.3)',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'var(--text-light)',
    fontSize: '0.9rem',
  },
};

export default Footer;
