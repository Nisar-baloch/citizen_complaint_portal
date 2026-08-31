import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Star, MessageSquare, AlertCircle, ArrowLeft, Check } from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback states
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMyComplaints = async () => {
    try {
      const response = await api.get('/complaints/mine');
      setComplaints(response.data);
    } catch (err) {
      console.error('Error fetching my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const openFeedbackModal = (id) => {
    setSelectedComplaintId(id);
    setRating(5);
    setComment('');
    setErrorMsg('');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a rating between 1 and 5 stars.');
      return;
    }
    setErrorMsg('');
    setIsSubmittingFeedback(true);

    try {
      await api.patch(`/complaints/${selectedComplaintId}/feedback`, {
        rating,
        feedbackComment: comment,
      });

      // Update local state to clear feedback pending flag
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === selectedComplaintId
            ? { ...c, feedbackPending: false, feedbackGiven: true, feedbackRating: rating, feedbackComment: comment }
            : c
        )
      );

      // Close modal
      setSelectedComplaintId(null);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit feedback. Try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <div style={styles.header}>
        <Link to="/dashboard" className="neo-button" style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 style={styles.title}>My Reported Complaints</h1>
        <p style={styles.subtitle}>Track progress of your filed issues and provide satisfaction ratings.</p>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading your complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="neo-box" style={styles.emptyCard}>
          <MessageSquare size={48} className="text-muted" />
          <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>You have not reported any complaints yet.</p>
          <Link to="/complaints/new" className="neo-button neo-button-primary" style={{ marginTop: '12px' }}>
            Submit a Complaint
          </Link>
        </div>
      ) : (
        <div style={styles.complaintsList}>
          {complaints.map((c) => (
            <div key={c._id} className="neo-box" style={styles.complaintCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{c.title}</h3>
                  <div style={styles.metaRow}>
                    <span>Category: <strong>{c.category}</strong></span>
                    <span>Locality: <strong style={{ textTransform: 'capitalize' }}>{c.area}</strong></span>
                    <span>Filed: <strong>{new Date(c.createdAt).toLocaleDateString()}</strong></span>
                  </div>
                </div>
                <div style={styles.badgeRow}>
                  <span className={`neo-badge badge-inset status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                  <span className={`neo-badge badge-${c.priorityBadge.toLowerCase()}`}>
                    {c.priorityBadge}
                  </span>
                </div>
              </div>

              <p style={styles.description}>{c.description}</p>

              {c.officerRemark && (
                <div style={styles.remarkBox}>
                  <h5 style={styles.remarkTitle}>Officer Response:</h5>
                  <p style={styles.remarkText}>"{c.officerRemark}"</p>
                </div>
              )}

              {/* Feedback Prompt or feedback given status */}
              {c.status === 'Resolved' && (
                <div style={styles.feedbackArea}>
                  {c.feedbackPending ? (
                    <div style={styles.feedbackPrompt}>
                      <span style={styles.promptText}>Was your concern resolved? Rate the response:</span>
                      <button
                        onClick={() => openFeedbackModal(c._id)}
                        className="neo-button neo-button-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Provide Feedback
                      </button>
                    </div>
                  ) : c.feedbackGiven ? (
                    <div style={styles.feedbackGivenBox}>
                      <span style={styles.feedbackScore}>
                        Your Rating:{' '}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < c.feedbackRating ? '#f59e0b' : 'none'}
                            color={i < c.feedbackRating ? '#f59e0b' : '#64748b'}
                          />
                        ))}
                      </span>
                      {c.feedbackComment && (
                        <p style={styles.feedbackCommentText}>Comment: "{c.feedbackComment}"</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={styles.upvotes}>👍 {c.upvotes} Citizens Upvoted</span>
                <Link to={`/complaints/${c._id}`} className="neo-button" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Open Details Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Neumorphic Feedback Dialog/Modal */}
      {selectedComplaintId && (
        <div style={styles.modalOverlay}>
          <div className="neo-box" style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Was the Issue Resolved?</h3>
            <p style={styles.modalSubtitle}>Provide a satisfaction rating to hold departments accountable.</p>

            {errorMsg && (
              <div className="neo-badge badge-critical neo-badge-inset" style={{ width: '100%', marginBottom: '16px', padding: '8px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit}>
              <div style={styles.ratingStars}>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const ratingValue = idx + 1;
                  return (
                    <Star
                      key={idx}
                      size={32}
                      onClick={() => setRating(ratingValue)}
                      onMouseEnter={() => setHoverRating(ratingValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      fill={ratingValue <= (hoverRating || rating) ? '#f59e0b' : 'none'}
                      color={ratingValue <= (hoverRating || rating) ? '#f59e0b' : '#94a3b8'}
                      style={{ cursor: 'pointer', transition: 'all 0.1s ease' }}
                    />
                  );
                })}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Resolution Remarks / Comment (Optional)</label>
                <textarea
                  className="neo-input"
                  style={{ minHeight: '80px', resize: 'vertical', fontSize: '0.9rem' }}
                  placeholder="Tell us if the department executed the fix correctly..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setSelectedComplaintId(null)}
                  className="neo-button"
                  style={styles.modalBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-button neo-button-primary"
                  style={styles.modalBtn}
                  disabled={isSubmittingFeedback}
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '32px',
  },
  backBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    marginBottom: '16px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    margin: '12px 0 8px 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '60px 0',
    color: 'var(--text-light)',
  },
  emptyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  complaintsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  complaintCard: {
    padding: '24px 32px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(203, 213, 225, 0.4)',
    paddingBottom: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: 'var(--text-color)',
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    flexWrap: 'wrap',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
  },
  description: {
    fontSize: '1rem',
    color: 'var(--text-color)',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
  },
  remarkBox: {
    backgroundColor: '#f1f5f9',
    boxShadow: 'var(--shadow-in-sm)',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  remarkTitle: {
    margin: '0 0 6px 0',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: 'var(--text-color)',
  },
  remarkText: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    fontStyle: 'italic',
  },
  feedbackArea: {
    backgroundColor: '#fafafb',
    padding: '14px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: 'var(--shadow-out-sm)',
    marginBottom: '20px',
  },
  feedbackPrompt: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  promptText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  feedbackGivenBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  feedbackScore: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  feedbackCommentText: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    fontStyle: 'italic',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(203, 213, 225, 0.4)',
  },
  upvotes: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(238, 242, 246, 0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modalContent: {
    width: '90%',
    maxWidth: '480px',
    padding: '32px',
  },
  modalTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    margin: '0 0 6px 0',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  ratingStars: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  modalLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalBtn: {
    padding: '10px 18px',
    fontSize: '0.9rem',
  },
};

export default MyComplaints;
