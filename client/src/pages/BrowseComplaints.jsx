import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Search, Filter, ThumbsUp, Calendar, MapPin, Tag, RefreshCw } from 'lucide-react';

const BrowseComplaints = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [area, setArea] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'upvotes'

  const fetchComplaints = async () => {
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

      let data = response.data;

      // Apply client-side sorting since backend returns sorted by newest
      if (sortBy === 'upvotes') {
        data.sort((a, b) => b.upvotes - a.upvotes);
      } else {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, status, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setCategory('');
    setStatus('');
    setArea('');
    setSortBy('newest');
    // Fetch directly using empty values
    setTimeout(() => {
      fetchComplaints();
    }, 0);
  };

  const handleUpvote = async (complaintId) => {
    if (!user) {
      alert('Please log in as a citizen to upvote complaints.');
      navigate('/login');
      return;
    }

    if (user.role !== 'citizen') {
      alert('Only citizen accounts can upvote complaints.');
      return;
    }

    try {
      const response = await api.patch(`/complaints/${complaintId}/upvote`);
      const updated = response.data;

      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, ...updated } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upvote complaint.');
    }
  };

  return (
    <div className="container">
      <div style={styles.header}>
        <h1 style={styles.title}>Browse Public Complaints Feed</h1>
        <p style={styles.subtitle}>View civic concerns filed by citizens. Upvote issues in your area to raise their priority.</p>
      </div>

      {/* Filter and Search Panel */}
      <section className="neo-box" style={styles.filterPanel}>
        <form onSubmit={handleSearchSubmit} style={styles.searchRow}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} color="var(--text-light)" />
            <input
              type="text"
              className="neo-input"
              style={styles.searchInput}
              placeholder="Search by title, description or keyword..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button type="submit" className="neo-button neo-button-primary" style={styles.searchBtn}>
            Search
          </button>
        </form>

        <div style={styles.filterRow}>
          {/* Category Filter */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Category</label>
            <select
              className="neo-input"
              style={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Road">Roads / Potholes</option>
              <option value="Garbage">Garbage / Waste</option>
              <option value="Water">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Other">Others</option>
            </select>
          </div>

          {/* Area Filter */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Area / Locality</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="neo-input"
                style={{ paddingRight: '40px' }}
                placeholder="e.g. Sector G-9"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onBlur={fetchComplaints}
              />
              <MapPin size={16} style={{ position: 'absolute', right: '16px' }} color="var(--text-light)" />
            </div>
          </div>

          {/* Status Filter */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Resolution Status</label>
            <select
              className="neo-input"
              style={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Sort By</label>
            <select
              className="neo-input"
              style={styles.select}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="upvotes">Most Upvotes</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <div style={{ ...styles.filterItem, justifyContent: 'flex-end', display: 'flex' }}>
            <button
              type="button"
              onClick={handleResetFilters}
              className="neo-button"
              style={styles.resetBtn}
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Feed Listing */}
      {loading ? (
        <div style={styles.loading}>Loading public complaints list...</div>
      ) : complaints.length === 0 ? (
        <div className="neo-box" style={styles.emptyFeed}>
          <Search size={48} className="text-muted" />
          <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>
            No complaints found matching your search filters.
          </p>
          <button onClick={handleResetFilters} className="neo-button" style={{ marginTop: '12px' }}>
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {complaints.map((c) => {
            const hasUpvoted = user && c.upvotedBy?.includes(user._id);

            return (
              <div key={c._id} className="neo-box neo-box-hover" style={styles.complaintCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.badgeGroup}>
                    <span className={`neo-badge badge-inset status-${c.status.toLowerCase().replace(' ', '-')}`}>
                      {c.status}
                    </span>
                    <span className={`neo-badge badge-${c.priorityBadge.toLowerCase()}`}>
                      {c.priorityBadge}
                    </span>
                  </div>
                  <span style={styles.cardDate}>
                    <Calendar size={14} style={{ marginRight: '4px' }} />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={styles.cardTitle}>{c.title}</h3>

                <div style={styles.metaRow}>
                  <span style={styles.metaField}>
                    <Tag size={14} />
                    Category: <strong>{c.category}</strong>
                  </span>
                  <span style={styles.metaField}>
                    <MapPin size={14} />
                    Locality: <strong style={{ textTransform: 'capitalize' }}>{c.area}</strong>
                  </span>
                </div>

                <p style={styles.cardDescription}>
                  {c.description.substring(0, 160)}
                  {c.description.length > 160 ? '...' : ''}
                </p>

                {c.imageUrl && (
                  <div style={styles.imageContainer}>
                    <img src={c.imageUrl} alt={c.title} style={styles.cardImage} onError={(e)=>{e.target.style.display='none'}} />
                  </div>
                )}

                <div style={styles.cardFooter}>
                  <button
                    onClick={() => handleUpvote(c._id)}
                    className={`neo-button ${hasUpvoted ? 'neo-badge-inset' : ''}`}
                    style={{
                      ...styles.upvoteButton,
                      color: hasUpvoted ? 'var(--primary)' : 'var(--text-color)',
                      fontWeight: hasUpvoted ? 'bold' : 'normal'
                    }}
                    disabled={user && user.role !== 'citizen'}
                  >
                    <ThumbsUp size={16} fill={hasUpvoted ? 'var(--primary)' : 'none'} />
                    <span>{c.upvotes} {hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                  </button>

                  <Link to={`/complaints/${c._id}`} className="neo-button neo-button-primary" style={styles.detailLink}>
                    Full Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  filterPanel: {
    padding: '24px',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  searchRow: {
    display: 'flex',
    gap: '16px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '48px',
  },
  searchBtn: {
    padding: '12px 28px',
    fontSize: '1rem',
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    alignItems: 'flex-end',
  },
  filterItem: {
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
  select: {
    cursor: 'pointer',
  },
  resetBtn: {
    width: '100%',
    padding: '11px',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 0',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '30px',
  },
  complaintCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px 28px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  badgeGroup: {
    display: 'flex',
    gap: '8px',
  },
  cardDate: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 12px 0',
    color: 'var(--text-color)',
    lineHeight: '1.3',
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    marginBottom: '14px',
  },
  metaField: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  cardDescription: {
    fontSize: '0.95rem',
    color: 'var(--text-color)',
    lineHeight: '1.5',
    marginBottom: '16px',
    flexGrow: 1,
  },
  imageContainer: {
    width: '100%',
    maxHeight: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '18px',
    boxShadow: 'var(--shadow-in-sm)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(203, 213, 225, 0.4)',
    marginTop: 'auto',
  },
  upvoteButton: {
    padding: '8px 14px',
    fontSize: '0.85rem',
  },
  detailLink: {
    padding: '8px 14px',
    fontSize: '0.85rem',
    textDecoration: 'none',
  },
};

export default BrowseComplaints;
