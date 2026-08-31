import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, ThumbsUp, Calendar, MapPin, Tag, User, MessageSquare, AlertCircle, Clock } from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setErrorMsg('Failed to load complaint details. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleUpvote = async () => {
    if (!user) {
      alert('Please log in to upvote complaints.');
      navigate('/login');
      return;
    }

    if (user.role !== 'citizen') {
      alert('Only citizen accounts can upvote complaints.');
      return;
    }

    try {
      const response = await api.patch(`/complaints/${id}/upvote`);
      setComplaint(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upvote complaint.');
    }
  };

  if (loading) {
    return <div className="container" style={styles.loading}>Loading complaint details...</div>;
  }

  if (errorMsg || !complaint) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="neo-box" style={styles.errorBox}>
          <AlertCircle size={48} color="var(--danger)" />
          <h2 style={{ marginTop: '16px', fontSize: '1.4rem' }}>Error Occurred</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>{errorMsg || 'Complaint not found.'}</p>
          <Link to="/complaints" className="neo-button">
            Back to Public Feed
          </Link>
        </div>
      </div>
    );
  }

  const hasUpvoted = user && complaint.upvotedBy?.includes(user._id);

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="neo-button" style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>

      <div className="neo-box" style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.badgeGroup}>
            <span className={`neo-badge badge-inset status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
              {complaint.status}
            </span>
            <span className={`neo-badge badge-${complaint.priorityBadge.toLowerCase()}`}>
              Priority: {complaint.priorityBadge} (Score: {complaint.priorityScore})
            </span>
          </div>
          <span style={styles.date}>
            <Calendar size={16} style={{ marginRight: '6px' }} />
            {new Date(complaint.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 style={styles.title}>{complaint.title}</h1>

        <div style={styles.metaPanel}>
          <span style={styles.metaItem}>
            <Tag size={16} color="var(--primary)" />
            Category: <strong>{complaint.category}</strong>
          </span>
          <span style={styles.metaItem}>
            <MapPin size={16} color="var(--primary)" />
            Locality: <strong style={{ textTransform: 'capitalize' }}>{complaint.area}</strong>
          </span>
          <span style={styles.metaItem}>
            <User size={16} color="var(--primary)" />
            Filed By: <strong>{complaint.createdBy?.name || 'Anonymous Citizen'}</strong>
          </span>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Detailed Description</h3>
          <p style={styles.description}>{complaint.description}</p>
        </div>

        {complaint.imageUrl && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Uploaded Proof Photo</h3>
            <div style={styles.imageContainer}>
              <img src={complaint.imageUrl} alt={complaint.title} style={styles.image} onError={(e)=>{e.target.style.display='none'}} />
            </div>
          </div>
        )}

        {/* Timeline response from officer */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Resolution Status & Remarks</h3>
          <div className="neo-box" style={styles.remarkBox}>
            <div style={styles.remarkHeader}>
              <Clock size={18} color="var(--primary)" />
              <span style={{ fontWeight: 'bold' }}>Resolution Activity Log</span>
            </div>
            {complaint.officerRemark ? (
              <div style={{ marginTop: '12px' }}>
                <p style={styles.remarkText}>
                  <strong>Officer Remark:</strong> "{complaint.officerRemark}"
                </p>
                <span style={styles.remarkTime}>
                  Last updated: {new Date(complaint.updatedAt).toLocaleDateString()} at {new Date(complaint.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <p style={{ ...styles.remarkText, color: 'var(--text-light)', fontStyle: 'italic', marginTop: '12px' }}>
                No remarks added yet. A government representative will review the case soon.
              </p>
            )}
          </div>
        </div>

        {/* Feedback rating if given */}
        {complaint.feedbackGiven && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Citizen Satisfaction Feedback</h3>
            <div className="neo-badge badge-low neo-badge-inset" style={styles.feedbackGivenBox}>
              <span style={styles.feedbackLabel}>Rating:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <ThumbsUp
                    key={i}
                    size={14}
                    fill={i < complaint.feedbackRating ? '#15803d' : 'none'}
                    color={i < complaint.feedbackRating ? '#15803d' : '#15803d'}
                  />
                ))}
              </div>
              {complaint.feedbackComment && (
                <span style={{ marginLeft: '12px', fontStyle: 'italic' }}>
                  "{complaint.feedbackComment}"
                </span>
              )}
            </div>
          </div>
        )}

        <div style={styles.cardFooter}>
          <button
            onClick={handleUpvote}
            className={`neo-button ${hasUpvoted ? 'neo-badge-inset' : ''}`}
            style={{
              ...styles.upvoteBtn,
              color: hasUpvoted ? 'var(--primary)' : 'var(--text-color)',
              fontWeight: hasUpvoted ? 'bold' : 'normal'
            }}
            disabled={user && user.role !== 'citizen'}
          >
            <ThumbsUp size={18} fill={hasUpvoted ? 'var(--primary)' : 'none'} />
            <span>{complaint.upvotes} Upvotes</span>
          </button>

          {user && user.role === 'officer' && (
            <Link to={`/officer/complaints/${complaint._id}`} className="neo-button neo-button-primary" style={styles.actionBtn}>
              Resolve / Review Issue
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  backBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
  },
  loading: {
    textAlign: 'center',
    padding: '80px 0',
    color: 'var(--text-light)',
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px',
    marginTop: '40px',
  },
  card: {
    padding: '40px 48px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(203, 213, 225, 0.4)',
    paddingBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  badgeGroup: {
    display: 'flex',
    gap: '10px',
  },
  date: {
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    lineHeight: '1.25',
    margin: '0 0 20px 0',
  },
  metaPanel: {
    display: 'flex',
    gap: '24px',
    padding: '16px 24px',
    backgroundColor: '#fafafb',
    boxShadow: 'var(--shadow-in-sm)',
    borderRadius: '14px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-color)',
  },
  section: {
    marginBottom: '28px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-color)',
    marginBottom: '12px',
  },
  description: {
    fontSize: '1.05rem',
    color: 'var(--text-color)',
    lineHeight: '1.7',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  imageContainer: {
    width: '100%',
    maxHeight: '450px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-in)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  remarkBox: {
    padding: '20px 24px',
  },
  remarkHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
  },
  remarkText: {
    margin: '0 0 8px 0',
    fontSize: '1rem',
    lineHeight: '1.5',
    color: 'var(--text-color)',
  },
  remarkTime: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
  },
  feedbackGivenBox: {
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
  },
  feedbackLabel: {
    fontWeight: 'bold',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(203, 213, 225, 0.4)',
  },
  upvoteBtn: {
    padding: '12px 20px',
    fontSize: '0.95rem',
  },
  actionBtn: {
    padding: '12px 20px',
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
};

export default ComplaintDetail;
