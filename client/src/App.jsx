import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages (to be implemented next)
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportComplaint from './pages/ReportComplaint';
import MyComplaints from './pages/MyComplaints';
import BrowseComplaints from './pages/BrowseComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerComplaintReview from './pages/OfficerComplaintReview';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="neo-box" style={styles.loader}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '12px', fontWeight: 'bold' }}>Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to correct dashboard
    return <Navigate to={user.role === 'officer' ? '/officer/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={styles.appLayout}>
          <Navbar />
          <main style={styles.mainContent}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/complaints" element={<BrowseComplaints />} />
              <Route path="/complaints/:id" element={<ComplaintDetail />} />

              {/* Citizen Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/new"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <ReportComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/mine"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />

              {/* Officer Routes */}
              <Route
                path="/officer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['officer']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['officer']}>
                    <OfficerComplaintReview />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  appLayout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color)',
  },
  mainContent: {
    flex: 1,
    padding: '40px 0',
  },
  loaderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(79, 70, 229, 0.1)',
    borderTop: '4px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Insert keyframes for spinner dynamically
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default App;
