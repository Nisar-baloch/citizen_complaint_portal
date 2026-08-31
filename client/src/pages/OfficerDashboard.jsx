import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Download, AlertTriangle, CheckCircle, Clock, Star, Sparkles, RefreshCw, Eye } from 'lucide-react';

const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Briefing States
  const [aiBriefing, setAiBriefing] = useState('');
  const [aiStats, setAiStats] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [area, setArea] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Operations stats computed locally
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    progress: 0,
    resolved: 0,
    overdue: 0,
    avgSatisfaction: 0,
    ratedCount: 0
  });

  const fetchAIBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const response = await api.post('/ai/officer-summary');
      setAiBriefing(response.data.summary);
      setAiStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching AI operations briefing:', err);
      setAiBriefing('Could not generate operations briefing due to LLM connectivity issues. Falling back to manual summaries.');
    } finally {
      setLoadingBriefing(false);
    }
  };

  const fetchOfficerData = async () => {
    setLoading(true);
    try {
      // Build query string
      let queryParts = [];
      if (searchText.trim()) queryParts.push(`search=${encodeURIComponent(searchText.trim())}`);
      if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
      if (status) queryParts.push(`status=${encodeURIComponent(status)}`);
      if (area.trim()) queryParts.push(`area=${encodeURIComponent(area.trim())}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const response = await api.get(`/complaints${queryString}`);

      let filteredComplaints = response.data;

      // Filter by Priority Badge client-side if selected
      if (priorityFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.priorityBadge === priorityFilter);
      }

      setComplaints(filteredComplaints);

      // Compute statistics over all loaded complaints
      const total = filteredComplaints.length;
      const pending = filteredComplaints.filter(c => c.status === 'Pending').length;
      const progress = filteredComplaints.filter(c => c.status === 'In Progress').length;
      const resolved = filteredComplaints.filter(c => c.status === 'Resolved').length;

      // Calculate Overdue complaints (created > 3 days ago and not resolved)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const overdue = filteredComplaints.filter(
        c => c.status !== 'Resolved' && new Date(c.createdAt) < threeDaysAgo
      ).length;

      // Calculate Average Satisfaction Score
      const ratedComplaints = filteredComplaints.filter(c => c.feedbackGiven && c.feedbackRating);
      const ratedCount = ratedComplaints.length;
      const sumSatisfaction = ratedComplaints.reduce((acc, c) => acc + c.feedbackRating, 0);
      const avgSatisfaction = ratedCount > 0 ? (sumSatisfaction / ratedCount).toFixed(1) : 'N/A';

      setStats({
        total,
        pending,
        progress,
        resolved,
        overdue,
        avgSatisfaction,
        ratedCount
      });
    } catch (err) {
      console.error('Error fetching complaints list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, [category, status, priorityFilter]);

  useEffect(() => {
    fetchAIBriefing();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOfficerData();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setCategory('');
    setStatus('');
    setArea('');
    setPriorityFilter('');
    setTimeout(() => {
      fetchOfficerData();
    }, 0);
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get('/complaints/export', {
        params: { category, status, area },
        responseType: 'blob'
      });

      // Trigger download in browser
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const todayDate = new Date().toISOString().split('T')[0];
      link.download = `complaints_export_${todayDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to download CSV export. Please check connection.');
    }
  };

  return (
    <div className="container">
      {/* Welcome Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Officer Admin Portal</h1>
          <p style={styles.subtitle}>Review civic complaints, deploy maintenance teams, and monitor public satisfaction.</p>
        </div>
      </div>

      {/* AI Briefing Card */}
      <section className="neo-box" style={styles.aiBrief}>
        <div style={styles.aiBriefHeader}>
          <div style={styles.aiTitleRow}>
            <Sparkles size={24} color="#f59e0b" fill="#f59e0b" />
            <h3 style={styles.aiTitle}>AI Daily Operations Briefing</h3>
          </div>
          <button onClick={fetchAIBriefing} className="neo-button" style={styles.refreshBtn} title="Regenerate Briefing">
            <RefreshCw size={14} className={loadingBriefing ? 'spin-anim' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        {loadingBriefing ? (
          <p style={{ color: 'var(--text-light)', margin: 0 }}>Generating live briefing with Claude/Gemini API...</p>
        ) : (
          <p style={styles.aiText}>{aiBriefing}</p>
        )}
      </section>

      {/* Stats counters */}
      <section style={styles.statsSection} className="grid-cols-3">
        <div className="neo-box" style={styles.statCard}>
          <Clock size={32} color="var(--danger)" />
          <div style={styles.statInfo}>
            <h4 style={styles.statNumber}>{stats.overdue}</h4>
            <p style={styles.statLabel}>Overdue Issues (&gt;3 days)</p>
          </div>
        </div>

        <div className="neo-box" style={styles.statCard}>
          <Clock size={32} color="var(--warning)" />
          <div style={styles.statInfo}>
            <h4 style={styles.statNumber}>{stats.pending + stats.progress}</h4>
            <p style={styles.statLabel}>Total Active Cases</p>
          </div>
        </div>

        <div className="neo-box" style={styles.statCard}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <Star size={32} color="var(--primary)" fill="var(--primary)" />
          </div>
          <div style={styles.statInfo}>
            <h4 style={styles.statNumber}>
              {stats.avgSatisfaction} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-light)' }}>/ 5.0</span>
            </h4>
            <p style={styles.statLabel}>Citizen Satisfaction Rating</p>
          </div>
        </div>
      </section>

      {/* Filters and export bar */}
      <section className="neo-box" style={styles.filterBox}>
        <div style={styles.filterTop}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '12px' }}>
            <input
              type="text"
              className="neo-input"
              placeholder="Search by keywords..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit" className="neo-button neo-button-primary">Search</button>
          </form>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleDownloadCSV} className="neo-button neo-button-primary" style={styles.actionBtn}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button onClick={handleResetFilters} className="neo-button" style={styles.actionBtn}>
              <RefreshCw size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        <div style={styles.filterGrid}>
          {/* Category */}
          <div style={styles.filterCell}>
            <label style={styles.filterLabel}>Category</label>
            <select
              className="neo-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Road">Road / Pothole</option>
              <option value="Garbage">Garbage / Waste</option>
              <option value="Water">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Area */}
          <div style={styles.filterCell}>
            <label style={styles.filterLabel}>Locality Area</label>
            <input
              type="text"
              className="neo-input"
              placeholder="e.g. Sector G-9"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              onBlur={fetchOfficerData}
            />
          </div>

          {/* Status */}
          <div style={styles.filterCell}>
            <label style={styles.filterLabel}>Resolution Status</label>
            <select
              className="neo-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority */}
          <div style={styles.filterCell}>
            <label style={styles.filterLabel}>Priority Score</label>
            <select
              className="neo-input"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical (Score &gt; 30)</option>
              <option value="High">High (Score 16-30)</option>
              <option value="Medium">Medium (Score 5-15)</option>
              <option value="Low">Low (Score &lt; 5)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Complaints Table Grid */}
      <section className="neo-box" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={styles.loading}>Loading registry data...</div>
        ) : complaints.length === 0 ? (
          <div style={{ ...styles.loading, padding: '60px' }}>No complaints match the specified filters.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.tableTh}>Complaint Title</th>
                  <th style={styles.tableTh}>Category</th>
                  <th style={styles.tableTh}>Area / Locality</th>
                  <th style={styles.tableTh}>Priority</th>
                  <th style={styles.tableTh}>Upvotes</th>
                  <th style={styles.tableTh}>Status</th>
                  <th style={styles.tableTh}>Filed On</th>
                  <th style={styles.tableTh}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} style={styles.tableRow}>
                    <td style={styles.tableTd}>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        ID: {c._id.substring(0, 8)}...
                      </div>
                    </td>
                    <td style={styles.tableTd}>{c.category}</td>
                    <td style={{ ...styles.tableTd, textTransform: 'capitalize' }}>{c.area}</td>
                    <td style={styles.tableTd}>
                      <span className={`neo-badge badge-${c.priorityBadge.toLowerCase()}`}>
                        {c.priorityBadge}
                      </span>
                    </td>
                    <td style={{ ...styles.tableTd, fontWeight: 'bold' }}>👍 {c.upvotes}</td>
                    <td style={styles.tableTd}>
                      <span className={`neo-badge badge-inset status-${c.status.toLowerCase().replace(' ', '-')}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={styles.tableTd}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.tableTd}>
                      <Link to={`/officer/complaints/${c._id}`} className="neo-button" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        <Eye size={12} />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '32px',
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
  aiBrief: {
    padding: '24px 32px',
    background: 'linear-gradient(145deg, #fefbf3, #fdf6e2)',
    border: '1px solid #fef3c7',
    boxShadow: 'var(--shadow-out)',
    marginBottom: '36px',
  },
  aiBriefHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  aiTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  aiTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#854d0e',
  },
  refreshBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    backgroundColor: '#fff',
    borderColor: '#fef3c7',
  },
  aiText: {
    margin: 0,
    fontSize: '1.05rem',
    lineHeight: '1.6',
    color: '#713f12',
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: '36px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 24px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text-color)',
  },
  statLabel: {
    margin: 0,
    color: 'var(--text-light)',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  filterBox: {
    padding: '24px',
    marginBottom: '32px',
  },
  filterTop: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  actionBtn: {
    padding: '10px 16px',
    fontSize: '0.85rem',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  filterCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    paddingLeft: '4px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-light)',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '2px solid rgba(203, 213, 225, 0.6)',
  },
  tableTh: {
    padding: '18px 24px',
    fontWeight: '700',
    color: 'var(--text-light)',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid rgba(203, 213, 225, 0.4)',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f8fafc'
    }
  },
  tableTd: {
    padding: '16px 24px',
    fontSize: '0.95rem',
  },
};

// Insert animation for loader
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .spin-anim {
      animation: spin 1.2s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default OfficerDashboard;
