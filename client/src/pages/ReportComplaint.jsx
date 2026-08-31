import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ClipboardList, MapPin, AlignLeft, Image as ImageIcon, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

const ReportComplaint = () => {
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Road');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Duplicate Check States
  const [duplicateComplaints, setDuplicateComplaints] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Flow control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Trigger duplicate check when Category or Area changes
  useEffect(() => {
    const checkDuplicates = async () => {
      if (!area.trim() || !category) {
        setDuplicateComplaints([]);
        return;
      }

      setIsCheckingDuplicates(true);
      try {
        // Query unresolved complaints (Pending or In Progress) with matching category and area
        const response = await api.get(
          `/complaints?category=${category}&area=${area.trim()}&status=Pending,In Progress`
        );
        setDuplicateComplaints(response.data);
      } catch (err) {
        console.error('Error checking duplicate reports:', err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    };

    // Debounce duplicate check slightly
    const delayDebounce = setTimeout(() => {
      checkDuplicates();
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [category, area]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !area) {
      setErrorMsg('Please enter all required fields.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await api.post('/complaints', {
        title,
        description,
        category,
        area: area.trim(),
        imageUrl: imageUrl.trim(),
      });

      setSuccessMsg('Complaint registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/complaints/mine');
      }, 2000);
    } catch (err) {
      console.error('Error reporting complaint:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleUpvoteDuplicate = async (id) => {
    try {
      await api.patch(`/complaints/${id}/upvote`);
      // Recheck/Update duplicate complaints upvote count
      setDuplicateComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, upvotes: c.upvotes + 1 } : c))
      );
      setSuccessMsg('Upvoted successfully instead of duplicate reporting!');
      setTimeout(() => {
        navigate('/complaints/mine');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Already upvoted or failed.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" className="neo-button" style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="neo-box" style={styles.card}>
        <div style={styles.header}>
          <ClipboardList size={36} color="var(--primary)" />
          <h2 style={styles.title}>Report a Civic Complaint</h2>
          <p style={styles.subtitle}>Provide accurate details to assist local authorities in resolving it swiftly.</p>
        </div>

        {errorMsg && (
          <div className="neo-badge badge-critical neo-badge-inset" style={styles.alert}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="neo-badge badge-low neo-badge-inset" style={styles.alert}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Duplicate warning card */}
        {duplicateComplaints.length > 0 && (
          <div className="neo-box" style={styles.warningBox}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={24} color="var(--danger)" />
              <h4 style={{ margin: 0, color: '#b91c1c', fontWeight: 'bold' }}>
                Similar Issues Already Reported in "{area}"
              </h4>
            </div>
            <p style={styles.warningText}>
              A similar complaint matching category <strong>{category}</strong> exists. Instead of reporting a duplicate, please upvote it to increase its visibility and priority score!
            </p>
            <div style={styles.duplicateList}>
              {duplicateComplaints.map((c) => (
                <div key={c._id} style={styles.duplicateCard}>
                  <div>
                    <h5 style={styles.dupTitle}>{c.title}</h5>
                    <p style={styles.dupDesc}>{c.description.substring(0, 80)}...</p>
                    <span className="neo-badge badge-inset status-pending" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      👍 {c.upvotes} Upvotes
                    </span>
                  </div>
                  <div style={styles.dupActions}>
                    <button
                      type="button"
                      onClick={() => handleUpvoteDuplicate(c._id)}
                      className="neo-button neo-button-primary"
                      style={styles.upvoteBtn}
                    >
                      Upvote This Instead
                    </button>
                    <Link to={`/complaints/${c._id}`} target="_blank" className="neo-button" style={styles.upvoteBtn}>
                      Read Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Complaint Title *</label>
            <input
              type="text"
              className="neo-input"
              placeholder="e.g. Broken water pipe leaking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Category *</label>
              <select
                className="neo-input"
                style={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Road">Road / Pothole</option>
                <option value="Garbage">Garbage / Waste disposal</option>
                <option value="Water">Water Supply / Leakage</option>
                <option value="Electricity">Electricity / Streetlight</option>
                <option value="Other">Other Civic Concern</option>
              </select>
            </div>

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Area / Locality Name *</label>
              <div style={styles.inputWrapper}>
                <MapPin size={18} style={styles.inputIcon} color="var(--text-light)" />
                <input
                  type="text"
                  className="neo-input"
                  style={styles.inputWithIcon}
                  placeholder="e.g. Sector G-9, Block C"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Detailed Description *</label>
            <div style={styles.inputWrapper}>
              <AlignLeft size={18} style={{ ...styles.inputIcon, top: '16px' }} color="var(--text-light)" />
              <textarea
                className="neo-input"
                style={{ ...styles.inputWithIcon, minHeight: '120px', resize: 'vertical', paddingTop: '12px' }}
                placeholder="Describe the problem, severity, landmarks to identify the exact spot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Photo / Proof Image URL (Optional)</label>
            <div style={styles.inputWrapper}>
              <ImageIcon size={18} style={styles.inputIcon} color="var(--text-light)" />
              <input
                type="url"
                className="neo-input"
                style={styles.inputWithIcon}
                placeholder="https://example.com/pothole.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="neo-button neo-button-primary"
            style={styles.submitBtn}
            disabled={isSubmitting || isCheckingDuplicates}
          >
            {isSubmitting ? 'Submitting Complaint...' : 'Register Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
  },
  card: {
    padding: '40px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    marginTop: '12px',
    marginBottom: '6px',
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
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
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
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    marginTop: '12px',
  },
  warningBox: {
    background: '#fef2f2',
    border: '1px solid #fee2e2',
    boxShadow: 'inset 3px 3px 6px #f87171, inset -3px -3px 6px #ffffff',
    padding: '24px',
    marginBottom: '28px',
    borderRadius: '16px',
  },
  warningText: {
    fontSize: '0.9rem',
    color: '#7f1d1d',
    lineHeight: '1.4',
    margin: '10px 0 16px 0',
  },
  duplicateList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  duplicateCard: {
    background: 'var(--bg-color)',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-out-sm)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  dupTitle: {
    margin: '0 0 4px 0',
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
  dupDesc: {
    margin: '0 0 6px 0',
    fontSize: '0.85rem',
    color: 'var(--text-light)',
  },
  dupActions: {
    display: 'flex',
    gap: '8px',
  },
  upvoteBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
  },
};

export default ReportComplaint;
