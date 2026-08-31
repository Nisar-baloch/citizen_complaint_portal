import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Shield, Users, CheckCircle, ArrowRight, MessageSquare, AlertTriangle } from 'lucide-react';

const Home = () => {
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/complaints');
        const data = response.data;
        
        // Calculate basic stats
        const total = data.length;
        const resolved = data.filter(c => c.status === 'Resolved').length;
        const active = total - resolved;

        setStats({ total, resolved, active });
        setRecentComplaints(data.slice(0, 3)); // show top 3 latest
      } catch (err) {
        console.error('Error fetching home feed details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="neo-box" style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Transparent Bridge Between Citizens & Authorities
          </h1>
          <p style={styles.heroText}>
            Report local civic issues in under a minute, upvote existing reports in your locality, and track resolutions in real-time. Join hands in building a better community.
          </p>
          <div style={styles.heroActions}>
            <Link to="/complaints/new" className="neo-button neo-button-primary" style={styles.btnLarge}>
              <span>Report an Issue</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/complaints" className="neo-button" style={styles.btnLarge}>
              Browse Public Feed
            </Link>
          </div>
        </div>
        <div style={styles.heroIconContainer}>
          <Shield size={160} color="var(--primary)" style={styles.heroIcon} />
        </div>
      </section>

      {/* Stats Counter Section */}
      <section style={styles.statsSection} className="grid-cols-3">
        <div className="neo-box" style={styles.statCard}>
          <AlertTriangle size={32} color="var(--warning)" />
          <div>
            <h3 style={styles.statNumber}>{stats.total}</h3>
            <p style={styles.statLabel}>Total Issues Filed</p>
          </div>
        </div>
        <div className="neo-box" style={styles.statCard}>
          <Users size={32} color="var(--primary)" />
          <div>
            <h3 style={styles.statNumber}>{stats.active}</h3>
            <p style={styles.statLabel}>Active Investigations</p>
          </div>
        </div>
        <div className="neo-box" style={styles.statCard}>
          <CheckCircle size={32} color="var(--success)" />
          <div>
            <h3 style={styles.statNumber}>{stats.resolved}</h3>
            <p style={styles.statLabel}>Resolved Complaints</p>
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section style={{ marginTop: '50px' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Citizens Reports</h2>
          <Link to="/complaints" style={styles.viewAllLink}>
            View all reports &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading public feed...</div>
        ) : recentComplaints.length === 0 ? (
          <div className="neo-box" style={styles.emptyFeed}>
            <MessageSquare size={48} className="text-muted" />
            <p style={{ marginTop: '16px' }}>No complaints filed yet. Be the first to make a change!</p>
            <Link to="/complaints/new" className="neo-button neo-button-primary" style={{ marginTop: '12px' }}>
              Report a Complaint
            </Link>
          </div>
        ) : (
          <div className="grid-cols-3">
            {recentComplaints.map((c) => (
              <div key={c._id} className="neo-box neo-box-hover" style={styles.complaintCard}>
                <div style={styles.cardHeader}>
                  <span className={`neo-badge badge-inset status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                  <span className={`neo-badge badge-${c.priorityBadge.toLowerCase()}`}>
                    {c.priorityBadge}
                  </span>
                </div>
                <h4 style={styles.cardTitle}>{c.title}</h4>
                <p style={styles.cardArea}>Locality: <strong style={{ textTransform: 'capitalize' }}>{c.area}</strong></p>
                <p style={styles.cardDesc}>
                  {c.description.substring(0, 100)}
                  {c.description.length > 100 ? '...' : ''}
                </p>
                <div style={styles.cardFooter}>
                  <span style={styles.upvotes}>👍 {c.upvotes} Upvotes</span>
                  <Link to={`/complaints/${c._id}`} className="neo-button" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '48px',
    marginBottom: '40px',
    background: 'var(--bg-color)',
    gap: '30px',
  },
  heroContent: {
    flex: 2,
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '20px',
    color: 'var(--text-color)',
    letterSpacing: '-0.8px',
  },
  heroText: {
    fontSize: '1.1rem',
    color: 'var(--text-light)',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  btnLarge: {
    padding: '14px 28px',
    fontSize: '1.05rem',
  },
  heroIconContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: {
    filter: 'drop-shadow(6px 6px 12px #c2cbd8) drop-shadow(-6px -6px 12px #ffffff)',
  },
  statsSection: {
    marginBottom: '40px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px 32px',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text-color)',
  },
  statLabel: {
    margin: 0,
    color: 'var(--text-light)',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-color)',
  },
  viewAllLink: {
    textDecoration: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
  },
  complaintCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  cardArea: {
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    margin: '0 0 12px 0',
  },
  cardDesc: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    lineHeight: '1.5',
    flexGrow: 1,
    marginBottom: '20px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  upvotes: {
    fontWeight: '600',
    color: 'var(--text-color)',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-light)',
  },
  emptyFeed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
};

export default Home;
