import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { PlusCircle, FileText, Search, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaintStats, setComplaintStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.get('/complaints/mine');
        const data = response.data;

        const total = data.length;
        const pending = data.filter(c => c.status === 'Pending').length;
        const progress = data.filter(c => c.status === 'In Progress').length;
        const resolved = data.filter(c => c.status === 'Resolved').length;

        setComplaintStats({ total, pending, progress, resolved });
      } catch (err) {
        console.error('Error fetching citizen complaints stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="container">
      {/* Welcome Header */}
      <section style={styles.header}>
        <div>
          <h1 style={styles.title}>Citizen Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, <strong>{user?.name}</strong>. Track your reports and raise new civic concerns.</p>
        </div>
      </section>

      {/* Action Grid */}
      <section style={styles.actionsGrid}>
        <Link to="/complaints/new" className="neo-box neo-box-hover" style={{ ...styles.actionCard, textDecoration: 'none' }}>
          <div style={{ ...styles.iconBg, backgroundColor: '#eef2ff' }}>
            <PlusCircle size={28} color="var(--primary)" />
          </div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>Report a Complaint</h3>
            <p style={styles.actionDesc}>File a new local concern regarding road, water, electricity, or waste management.</p>
          </div>
        </Link>

        <Link to="/complaints/mine" className="neo-box neo-box-hover" style={{ ...styles.actionCard, textDecoration: 'none' }}>
          <div style={{ ...styles.iconBg, backgroundColor: '#ecfdf5' }}>
            <FileText size={28} color="var(--success)" />
          </div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>My Complaints</h3>
            <p style={styles.actionDesc}>Check progress, read officer replies, and rate resolution satisfaction.</p>
          </div>
        </Link>

        <Link to="/complaints" className="neo-box neo-box-hover" style={{ ...styles.actionCard, textDecoration: 'none' }}>
          <div style={{ ...styles.iconBg, backgroundColor: '#fffbeb' }}>
            <Search size={28} color="var(--warning)" />
          </div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>Browse Public Feed</h3>
            <p style={styles.actionDesc}>Upvote other issues reported in your locality to boost their priority.</p>
          </div>
        </Link>
      </section>

      {/* Stats Summary */}
      <section style={{ marginTop: '40px' }}>
        <h2 style={styles.sectionTitle}>Your Report Metrics</h2>
        {loading ? (
          <div style={styles.loading}>Calculating stats...</div>
        ) : (
          <div className="grid-cols-3" style={{ gap: '24px' }}>
            <div className="neo-box" style={styles.metricCard}>
              <Clock size={32} color="var(--danger)" />
              <div style={styles.metricInfo}>
                <span style={styles.metricLabel}>Pending Issues</span>
                <span style={styles.metricNum}>{complaintStats.pending}</span>
              </div>
            </div>

            <div className="neo-box" style={styles.metricCard}>
              <Clock size={32} color="var(--warning)" />
              <div style={styles.metricInfo}>
                <span style={styles.metricLabel}>In Progress</span>
                <span style={styles.metricNum}>{complaintStats.progress}</span>
              </div>
            </div>

            <div className="neo-box" style={styles.metricCard}>
              <CheckCircle size={32} color="var(--success)" />
              <div style={styles.metricInfo}>
                <span style={styles.metricLabel}>Resolved Concerns</span>
                <span style={styles.metricNum}>{complaintStats.resolved}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-light)',
    margin: 0,
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  actionCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    color: 'var(--text-color)',
  },
  iconBg: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-out-sm)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    flexShrink: 0,
  },
  actionContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 6px 0',
    color: 'var(--text-color)',
  },
  actionDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    margin: 0,
    lineHeight: '1.4',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-color)',
    marginBottom: '20px',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 24px',
  },
  metricInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricNum: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    marginTop: '2px',
  },
  loading: {
    textAlign: 'center',
    color: 'var(--text-light)',
    padding: '30px 0',
  },
};

export default CitizenDashboard;
