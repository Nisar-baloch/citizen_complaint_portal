import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Clock, Save, Edit, AlertCircle, CheckCircle, Tag, MapPin, User, Calendar } from 'lucide-react';

const OfficerComplaintReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [status, setStatus] = useState('Pending');
  const [remark, setRemark] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
      setStatus(response.data.status);
      setRemark(response.data.officerRemark || '');
    } catch (err) {
      console.error('Error fetching complaint for review:', err);
      setErrorMsg('Failed to load complaint details. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!status) {
      alert('Please select a valid resolution status.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsUpdating(true);

    try {
      const response = await api.patch(`/complaints/${id}/status`, {
        status,
        officerRemark: remark,
      });

      setComplaint(response.data);
      setSuccessMsg('Complaint status and officer remark updated successfully!');
      setTimeout(() => {
        navigate('/officer/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error updating status:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="container" style={styles.loading}>Loading registry concern...</div>;
  }

  if (errorMsg && !complaint) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="neo-box" style={styles.errorBox}>
          <AlertCircle size={48} color="var(--danger)" />
          <h2 style={{ marginTop: '16px', fontSize: '1.4rem' }}>Error Occurred</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>{errorMsg}</p>
          <Link to="/officer/dashboard" className="neo-button">
            Back to Officer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/officer/dashboard" className="neo-button" style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Officer Dashboard</span>
        </Link>
      </div>

      <div style={styles.layoutGrid}>
        {/* Left Side: Complaint Details Review */}
        <div className="neo-box" style={{ ...styles.card, flex: 2 }}>
          <div style={styles.cardHeader}>
            <div style={styles.badgeGroup}>
              <span className={`neo-badge badge-inset status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                {complaint.status}
              </span>
              <span className={`neo-badge badge-${complaint.priorityBadge.toLowerCase()}`}>
                Priority: {complaint.priorityBadge}
              </span>
            </div>
            <span style={styles.date}>
              <Calendar size={14} style={{ marginRight: '4px' }} />
              {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h2 style={styles.title}>{complaint.title}</h2>

          <div style={styles.metaPanel}>
            <div style={styles.metaItem}>
              <Tag size={14} color="var(--primary)" />
              <span>Category: <strong>{complaint.category}</strong></span>
            </div>
            <div style={styles.metaItem}>
              <MapPin size={14} color="var(--primary)" />
              <span>Locality: <strong style={{ textTransform: 'capitalize' }}>{complaint.area}</strong></span>
            </div>
            <div style={styles.metaItem}>
              <User size={14} color="var(--primary)" />
              <span>Citizen: <strong>{complaint.createdBy?.name || 'Anonymous'}</strong></span>
            </div>
          </div>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Citizen Narrative</h4>
            <p style={styles.description}>{complaint.description}</p>
          </div>

          {complaint.imageUrl && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Uploaded Verification Photo</h4>
              <div style={styles.imageContainer}>
                <img src={complaint.imageUrl} alt={complaint.title} style={styles.image} onError={(e)=>{e.target.style.display='none'}} />
              </div>
            </div>
          )}

          {complaint.feedbackGiven && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Citizen Satisfaction rating</h4>
              <div className="neo-badge badge-low neo-badge-inset" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                <span>Score: <strong>{complaint.feedbackRating} / 5.0</strong></span>
                {complaint.feedbackComment && (
                  <span style={{ marginLeft: '12px', fontStyle: 'italic' }}>
                    "{complaint.feedbackComment}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Deployment & Resolution Controls */}
        <div className="neo-box" style={{ ...styles.card, flex: 1, height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Edit size={20} color="var(--primary)" />
            <h3 style={styles.sidebarTitle}>Update Complaint</h3>
          </div>

          {errorMsg && (
            <div className="neo-badge badge-critical neo-badge-inset" style={styles.alert}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="neo-badge badge-low neo-badge-inset" style={styles.alert}>
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleStatusUpdate} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Resolution Status</label>
              <select
                className="neo-input"
                style={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending (Not Started)</option>
                <option value="In Progress">In Progress (Assigned)</option>
                <option value="Resolved">Resolved (Fixed)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Officer Remarks / Remarks</label>
              <textarea
                className="neo-input"
                style={{ minHeight: '120px', resize: 'vertical', fontSize: '0.9rem', paddingTop: '10px' }}
                placeholder="e.g. Assigned municipal field team. Repairs will commence on Wednesday."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="neo-button neo-button-primary"
              style={styles.submitBtn}
              disabled={isUpdating}
            >
              <Save size={16} />
              <span>{isUpdating ? 'Saving Changes...' : 'Save Update'}</span>
            </button>
          </form>
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
  layoutGrid: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  card: {
    padding: '32px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(203, 213, 225, 0.4)',
    paddingBottom: '14px',
  },
  badgeGroup: {
    display: 'flex',
    gap: '8px',
  },
  date: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    margin: '0 0 16px 0',
  },
  metaPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px 18px',
    backgroundColor: '#fafafb',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-in-sm)',
    marginBottom: '24px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: 'var(--text-color)',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-color)',
    marginBottom: '8px',
  },
  description: {
    fontSize: '0.95rem',
    color: 'var(--text-color)',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  imageContainer: {
    width: '100%',
    maxHeight: '300px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-in-sm)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '800',
  },
  alert: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '16px',
    fontSize: '0.8rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-color)',
    paddingLeft: '2px',
  },
  select: {
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '0.95rem',
    marginTop: '6px',
  },
};

export default OfficerComplaintReview;
