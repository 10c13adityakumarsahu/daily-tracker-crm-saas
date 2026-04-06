import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (token) {
      // In a real app, fetch current user info
      // For now, we use the stored role
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
         navigate('/login');
      }
    }
  }, [token, navigate]);

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    navigate('/login');
  };

  return (
    <div className="app-container">
      {token && (
        <nav className="navbar">
          <div className="nav-brand">DailyTracker <span style={{fontWeight: 200, opacity:0.6}}>SaaS</span></div>
          <div className="nav-links">
             <Link to="/" className={window.location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
             <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={token ? <Dashboard role={role} token={token} /> : <LandingPage />} />
        </Routes>
      </main>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-page animate-fadeIn" style={{textAlign: 'center', padding: '6rem 0'}}>
       <div className="badge-success" style={{display: 'inline-block', padding: '0.4rem 1.2rem', marginBottom: '2rem'}}>NEW: Enterprise Ready 🚀</div>
       <h1 style={{fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '1.5rem'}}>
         Master Your <span className="nav-brand" style={{fontSize: '4.5rem'}}>Educational</span> Workflow.
       </h1>
       <p style={{fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 3rem'}}>
         The only SaaS platform built for high-performance learning organizations to manage students, staff, and analytics with surgical precision.
       </p>
       <div style={{display: 'flex', gap: '1.5rem', justifyContent: 'center'}}>
          <button className="btn-primary" style={{padding: '1.2rem 2.5rem', fontSize: '1.2rem'}} onClick={() => navigate('/signup')}>Start Free Trial</button>
          <button className="btn-secondary" style={{padding: '1.2rem 2.5rem', fontSize: '1.2rem'}} onClick={() => navigate('/login')}>Sign In to Dashboard</button>
       </div>
       <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginTop: '6rem'}}>
          <div className="stat-card" style={{border: '1px solid var(--border-color)'}}><h3>Custom Fields</h3><p>Design your own data schema for students and instructors in seconds.</p></div>
          <div className="stat-card" style={{border: '1px solid var(--border-color)'}}><h3>Bulk Control</h3><p>Onboard hundreds of users instantly via our intelligent CSV mapping tool.</p></div>
          <div className="stat-card" style={{border: '1px solid var(--border-color)'}}><h3>Smart Reports</h3><p>Gain insights with automated attendance and academic session logging.</p></div>
       </div>
    </div>
  );
}

function Login({ setToken, setRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        setToken(data.access);
        const realRole = data.role || 'ADMIN';
        localStorage.setItem('role', realRole);
        setRole(realRole);
        localStorage.setItem('has_portal_access', !!data.has_portal_access);
        navigate('/');
      } else {
        alert('Login failed');
      }
    } catch(err) {
      console.error(err);
      alert('Error connecting to backend');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Login to your account.</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{position: 'relative', width: '100%'}}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required style={{paddingRight: '2.5rem'}} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0', margin: '0', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
              </button>
            </div>
          </div>
            <button type="submit" className="btn-primary">Login</button>
        </form>
        <p style={{marginTop: '1rem', textAlign: 'center'}}>
          Want to start an organization? <Link to="/signup">Sign up as Organizer</Link>
        </p>
      </div>
    </div>
  );
}

function Dashboard({ role, token }) {
  if (role === 'ADMIN') return <AdminDashboard token={token} />;
  if (role === 'MANAGER') return <ManagerDashboard token={token} />;
  if (role === 'INSTRUCTOR') return <div className="dashboard"><h2>Instructor Dashboard</h2><p>View your classes, upload materials, and update logs.</p></div>;
  if (role === 'PARENT') return <div className="dashboard"><h2>Parent Dashboard</h2><p>View your child's pending and completed homework.</p></div>;
  return <div>Loading Dashboard...</div>;
}

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup/organizer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, org_name: orgName })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Signup successful! Administrator will review your account.');
      } else {
        setMessage(data.error || 'Signup failed');
      }
    } catch(err) {
      setMessage('Error connecting to backend');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Organizer Signup</h2>
        <p>Register your organization</p>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Organization Name</label>
            <input value={orgName} onChange={e => setOrgName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Manager Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{position: 'relative', width: '100%'}}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required style={{paddingRight: '2.5rem'}} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0', margin: '0', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        {message && <p style={{marginTop: '1rem', color: '#C084FC'}}>{message}</p>}
        <p style={{marginTop: '1rem', textAlign: 'center'}}><Link to="/login">Back to Login</Link></p>
      </div>
    </div>
  );
}

function AdminDashboard({ token }) {
  const [orgs, setOrgs] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchOrgs = () => {
    fetch(`${API_BASE_URL}/api/organizations/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(setOrgs);
  };

  useEffect(() => { fetchOrgs(); }, [token]);

  const generateLicense = async (org, months) => {
    // First update duration
    await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subscription_duration_months: months })
    });
    
    // Then generate
    const res = await fetch(`${API_BASE_URL}/api/organizations/${org.id}/generate_license/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    alert(`License Generated: ${data.license_key}`);
    fetchOrgs(); 
    setSelected(null);
  }

  const deleteOrg = async (orgId) => {
    if (!window.confirm("Are you sure? This will delete all students, instructors, and data for this organization!")) return;
    await fetch(`${API_BASE_URL}/api/organizations/${orgId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchOrgs();
  }

  return (
    <div className="dashboard animate-fadeIn">
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem'}}>
        <div>
           <h2 style={{fontSize: '2.25rem'}}>Licensing & Account <span className="nav-brand" style={{fontSize: '2.25rem'}}>Control</span></h2>
           <p style={{color: 'var(--text-muted)'}}>Manage organization access, verify renewals, and monitor payments.</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem'}}>
        {orgs.map(org => (
          <div key={org.id} className="dashboard-card" style={{border: '1px solid var(--border-color)', position: 'relative'}}>
             <button 
                onClick={() => deleteOrg(org.id)}
                style={{position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1.2rem'}}
                title="Delete Organization"
             >
                <i className="fas fa-trash"></i>
             </button>
             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingRight: '2rem'}}>
                <span className={`badge ${org.has_portal_access ? 'badge-success' : 'badge-warning'}`}>{org.has_portal_access ? 'PORTAL ACTIVE' : 'PENDING ACTIVATION'}</span>
                {org.is_payment_verified && <span className="badge-success" style={{fontSize: '0.7rem', padding: '0.2rem 0.5rem'}}>PAID</span>}
             </div>
             <h3 style={{margin: '0 0 0.5rem 0'}}>{org.name}</h3>
             <div style={{fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem'}}>Owner: {org.contact_email}</div>

             <div className="info-grid" style={{background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}><span>License Key:</span> <code>{org.license_key || 'Not Generated'}</code></div>
                <div className="field-builder-row"><span>Subscription Plan:</span> <span className="badge">{org.subscription_plan}</span></div>
                <div className="field-builder-row"><span>Global Status:</span> <span className={`badge ${org.has_portal_access ? 'badge-success' : 'badge-warning'}`}>{org.has_portal_access ? 'ACTIVATED' : 'LIMITED'}</span></div>
                <div className="field-builder-row"><span>Expiry:</span> <span>{org.subscription_expiry ? new Date(org.subscription_expiry).toLocaleDateString() : 'N/A'}</span></div>
                {org.subscription_expiry && (
                  <div className="field-builder-row" style={{color: (Math.ceil((new Date(org.subscription_expiry) - new Date()) / (1000 * 60 * 60 * 24)) < 30) ? '#EF4444' : 'var(--primary-color)'}}>
                     <span>Days Remaining:</span> <strong>{Math.max(0, Math.ceil((new Date(org.subscription_expiry) - new Date()) / (1000 * 60 * 60 * 24)))} Days</strong>
                  </div>
                )}
             </div>
             
             <div style={{display: 'flex', gap: '1rem'}}>
                <button 
                  className="btn-primary" 
                  style={{flex: 1, filter: !org.is_payment_verified ? 'grayscale(1)' : 'none'}}
                  onClick={() => {
                    const months = prompt("Enter duration (months):", "12");
                    if (months) generateLicense(org, months);
                  }}
                  disabled={!org.is_payment_verified}
                >
                  {org.is_license_generated ? 'Update & Regen Key' : 'Generate Key'}
                </button>
                <button className="btn-secondary" onClick={() => setSelected(org)}>Organization Details</button>
             </div>
             {!org.is_payment_verified && <p style={{fontSize: '0.75rem', color: '#EF4444', marginTop: '0.5rem'}}>Waiting for Manager to complete Payment.</p>}
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.8)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
           <div className="dashboard-card animate-slideUp" style={{width: '600px', border: '1px solid var(--primary-color)'}}>
              <h3>Organization Analysis: {selected.name}</h3>
              <p style={{opacity: 0.7}}>Structural integrity and licensing metadata.</p>
              <hr style={{opacity: 0.1, margin: '1rem 0'}}/>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                 <div><strong>Plan:</strong> {selected.subscription_plan}</div>
                 <div><strong>Duration:</strong> {selected.subscription_duration_months} Months</div>
                 <div><strong>Student Model:</strong> {selected.student_fields_config.length} Fields</div>
                 <div><strong>Instructor Model:</strong> {selected.instructor_fields_config.length} Fields</div>
              </div>
              <button className="btn-primary" style={{marginTop: '2rem', width: '100%'}} onClick={() => setSelected(null)}>Close Inspection</button>
           </div>
        </div>
      )}
    </div>
  );
}

function ManagerDashboard({ token }) {
  const [org, setOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newClassroom, setNewClassroom] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [activeSchema, setActiveSchema] = useState('student');
  const [showPayment, setShowPayment] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [tempLicense, setTempLicense] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const fetchItems = () => {
    fetch(`${API_BASE_URL}/api/organizations/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => { if (data.length > 0) setOrg(data[0]); });
    fetch(`${API_BASE_URL}/api/students/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(setStudents);
    fetch(`${API_BASE_URL}/api/instructors/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(setInstructors);
    fetch(`${API_BASE_URL}/api/classrooms/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(setClassrooms);
    fetch(`${API_BASE_URL}/api/subjects/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(setSubjects);
  };

  useEffect(() => { fetchItems(); }, [token]);

  const [paymentDuration, setPaymentDuration] = useState(12);

  const processPayment = async () => {
    await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_payment_verified: true, subscription_duration_months: paymentDuration })
    });
    alert('Payment Successful! Admin will generate your license key shortly.');
    setShowPayment(false); fetchItems();
  }

  const applyLicense = async () => {
    const res = await fetch(`${API_BASE_URL}/api/organizations/${org.id}/activate_portal/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ license_key: tempLicense })
    });
    if (res.ok) {
       alert('Portal Activated Successfully!'); setTempLicense(''); fetchItems();
    } else {
       alert('Invalid License Key. Component not activated.');
    }
  }

  const addSchemaField = async () => {
    if (!newFieldName) return;
    const key = activeSchema === 'student' ? 'student_fields_config' : 'instructor_fields_config';
    const fieldData = { 
      name: newFieldName, 
      type: newFieldType, 
      id: Date.now(),
      options: newFieldType === 'select' ? newFieldOptions.split(',').map(o => o.trim()) : []
    };
    const updated = [...(org[key] || []), fieldData];
    await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ [key]: updated })
    });
    setNewFieldName('');
    setNewFieldOptions('');
    fetchItems();
  }

  const editField = async (fieldId) => {
    const key = activeSchema === 'student' ? 'student_fields_config' : 'instructor_fields_config';
    const currentFields = org[key] || [];
    const field = currentFields.find(f => f.id === fieldId);
    if (!field) return;

    const newName = prompt("New field label:", field.name);
    if (!newName) return;

    const updated = currentFields.map(f => f.id === fieldId ? { ...f, name: newName } : f);
    await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ [key]: updated })
    });
    fetchItems();
  }

  const deleteField = async (fieldId) => {
    if (!window.confirm("Delete this field? Data stored in this field for existing students will be preserved but hidden.")) return;
    const key = activeSchema === 'student' ? 'student_fields_config' : 'instructor_fields_config';
    const updated = (org[key] || []).filter(f => f.id !== fieldId);
    await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ [key]: updated })
    });
    fetchItems();
  }

  const handleAddClassroom = async () => {
    await fetch(`${API_BASE_URL}/api/classrooms/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newClassroom, organization: org.id })
    });
    setNewClassroom(''); fetchItems();
  };

  const getDaysLeft = () => {
    if (!org || !org.subscription_expiry) return null;
    const expiry = new Date(org.subscription_expiry);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  const daysLeft = getDaysLeft();

  return (
    <div className="dashboard-container" style={{display: 'flex', minHeight: '100vh'}}>
      {/* SaaS Sidebar */}
      <div className="sidebar" style={{width: '280px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid var(--border-color)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column'}}>
        {org && (
          <div style={{marginBottom: '2.5rem'}}>
             <h2 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{org.name}</h2>
             <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <span className="badge" style={{background: org.subscription_plan === 'TRIAL' ? 'rgba(255,165,0,0.1)' : 'rgba(16,185,129,0.1)', color: org.subscription_plan === 'TRIAL' ? 'orange' : '#10B981'}}>
                   {org.subscription_plan}
                </span>
                {org.has_portal_access && daysLeft !== null && (
                   <span style={{fontSize: '0.75rem', opacity: 0.6}}>{daysLeft} Days Left</span>
                )}
             </div>
          </div>
        )}

        <nav style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1}}>
          {['overview', 'schemas', 'classrooms', 'instructors', 'students', 'profile'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={activeTab === tab ? 'btn-primary' : 'btn-logout'} 
              style={{justifyContent: 'flex-start', textAlign: 'left', padding: '0.8rem 1.2rem'}}
            >
              <i className={`fas fa-${tab === 'overview' ? 'home' : (tab === 'schemas' ? 'layer-group' : (tab === 'classrooms' ? 'school' : (tab === 'instructors' ? 'chalkboard-teacher' : (tab === 'students' ? 'user-graduate' : 'id-card'))))}`} style={{marginRight: '10px', width: '20px'}}></i>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {org && (
          <div style={{marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(192,132,252,0.1), rgba(236,72,153,0.1))', borderRadius: '16px', border: '1px solid rgba(192,132,252,0.2)'}}>
             <h4 style={{margin: 0, fontSize: '0.9rem'}}>{org.subscription_plan === 'TRIAL' ? 'Enterprise Upgrade' : 'Active Subscription'}</h4>
             <p style={{fontSize: '0.75rem', opacity: 0.7, margin: '0.5rem 0 1rem 0'}}>
                {org.subscription_plan === 'TRIAL' 
                  ? 'Unlock unlimited students and custom schemas.' 
                  : `Expiring on ${new Date(org.subscription_expiry).toLocaleDateString()}`}
             </p>
             {daysLeft !== null && <div style={{fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.8rem'}}>{daysLeft} Days Remaining</div>}
             <button 
                onClick={() => setShowActivateModal(true)} 
                className="btn-primary" 
                style={{width: '100%', fontSize: '0.8rem', padding: '0.6rem'}}
             >
                {org.subscription_plan === 'TRIAL' ? 'Activate License Key' : 'Renew / Activate Key'}
             </button>
          </div>
        )}
      </div>

      <div className="main-content" style={{flex: 1, padding: '2rem 3rem', overflowY: 'auto'}}>
        {showActivateModal && (
          <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001}}>
             <div className="dashboard-card animate-slideUp" style={{width: '450px', position: 'relative'}}>
                <button onClick={() => setShowActivateModal(false)} style={{position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}><i className="fas fa-times"></i></button>
                <h3 className="nav-brand" style={{fontSize: '1.8rem'}}>Activate Platform</h3>
                <p style={{marginBottom: '2rem'}}>Unlock full institutional capabilities and remove trial limitations.</p>
                <div style={{marginBottom: '1.5rem'}}>
                   <label style={{display: 'block', marginBottom: '0.5rem', opacity: 0.7}}>License Key</label>
                   <input 
                      value={tempLicense} 
                      onChange={e => setTempLicense(e.target.value)} 
                      placeholder="XXXX-XXXX-XXXX" 
                      style={{width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white'}}
                   />
                </div>
                <button onClick={applyLicense} className="btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1rem'}}>Confirm Activation</button>
                <hr style={{margin: '1.5rem 0', opacity: 0.1}}/>
                <p style={{fontSize: '0.85rem', opacity: 0.6}}>Don't have a key? Contact your account manager or click <strong style={{color: 'var(--primary-color)', cursor: 'pointer'}} onClick={() => {setShowActivateModal(false); setShowPayment(true)}}>Pay Now</strong> to generate one.</p>
             </div>
          </div>
        )}
        {org && !org.has_portal_access && (
          <div style={{background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h4 style={{margin: 0, color: '#60A5FA'}}>{!org.is_payment_verified ? 'Payment Required' : (org.is_license_generated ? 'Activation Pending' : 'License Under Review')}</h4>
                <p style={{margin: '0.2rem 0 0 0', opacity: 0.8}}>
                  {!org.is_payment_verified ? 'Please complete payment to request your license.' : (org.is_license_generated ? 'Check your email for the key and enter below.' : 'Your payment is verified. Admin is generating your key.')}
                </p>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                 {!org.is_payment_verified && <button onClick={() => setShowPayment(true)} className="btn-primary">Pay Subscription</button>}
                 {org.is_license_generated && (
                   <div style={{display: 'flex', gap: '0.5rem'}}>
                      <input value={tempLicense} onChange={e => setTempLicense(e.target.value)} placeholder="Enter Key" style={{width: '180px'}} />
                      <button onClick={applyLicense} className="btn-primary">Activate</button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

      {showPayment && org && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
           <div className="dashboard-card animate-slideUp" style={{width: '480px', textAlign: 'center'}}>
              <h3 className="nav-brand" style={{fontSize: '1.8rem'}}>Secure Payment</h3>
              <p>Simulated Gateway for {org.name}</p>
              
              <div style={{display: 'flex', gap: '1rem', margin: '2rem 0'}}>
                 <button onClick={() => setPaymentDuration(1)} className={paymentDuration === 1 ? 'btn-primary' : 'btn-logout'} style={{flex: 1}}>Monthly</button>
                 <button onClick={() => setPaymentDuration(12)} className={paymentDuration === 12 ? 'btn-primary' : 'btn-logout'} style={{flex: 1}}>Yearly (Save 20%)</button>
              </div>

              <div style={{margin: '1.5rem 0', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}><span>Plan:</span> <span>{paymentDuration === 1 ? 'Basic Monthly' : 'PRO Yearly'}</span></div>
                 <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold'}}><span>Total Amount:</span> <span style={{color: '#10B981'}}>${paymentDuration === 1 ? '99.00' : '999.00'}</span></div>
              </div>
              <input placeholder="Card Number (4242 ...)" readOnly style={{marginBottom: '1rem', textAlign: 'center', opacity: 0.5}} />
              <button 
                className="btn-primary" 
                style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}
                onClick={processPayment}
              >
                Accept & Pay ${paymentDuration === 1 ? '99.00' : '999.00'}
              </button>
              <button className="btn-logout" style={{marginTop: '1rem'}} onClick={() => setShowPayment(false)}>Cancel Payment</button>
           </div>
        </div>
      )}

      {activeTab === 'schemas' && org && (
        <div className="animate-fadeIn">
           <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
             <button className={activeSchema === 'student' ? 'btn-primary' : 'btn-logout'} onClick={() => setActiveSchema('student')}>Student Model</button>
             <button className={activeSchema === 'instructor' ? 'btn-primary' : 'btn-logout'} onClick={() => setActiveSchema('instructor')}>Instructor Model</button>
           </div>
           
           <div className="dashboard-card">
              <h3>{activeSchema.toUpperCase()} Schema Designer</h3>
              <div style={{marginTop: '1.5rem', marginBottom: '2rem'}}>
                  <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                     <input value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="Field Label (e.g. Department or Blood Group)" style={{flex: 2}} />
                     <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)} style={{flex: 1}}>
                        <option value="text">Short Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date Picker</option>
                        <option value="checkbox">Toggle (Boolean)</option>
                        <option value="email">Email Address</option>
                        <option value="select">Dropdown Menu</option>
                     </select>
                  </div>
                  {newFieldType === 'select' && (
                    <div style={{marginBottom: '1rem'}}>
                       <label style={{display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem'}}>Dropdown Options (Comma separated)</label>
                       <input 
                          value={newFieldOptions} 
                          onChange={e => setNewFieldOptions(e.target.value)} 
                          placeholder="Option 1, Option 2, Option 3" 
                          style={{width: '100%'}} 
                       />
                    </div>
                  )}
                  <button onClick={addSchemaField} className="btn-primary" style={{width: '100%', padding: '0.8rem'}}>Add Attribute to Model</button>
               </div>

               <div className="fields-list">
                  {(org[`${activeSchema}_fields_config`] || []).map(f => (
                    <div key={f.id} className="field-builder-row" style={{display: 'flex', alignItems: 'center'}}>
                       <div style={{flex: 1}}>
                         <strong>{f.name}</strong>
                         {f.type === 'select' && <div style={{fontSize: '0.7rem', opacity: 0.5}}>{f.options?.join(' • ')}</div>}
                       </div>
                       <div className="badge" style={{marginRight: '1rem'}}>{f.type === 'checkbox' ? 'TOGGLE' : f.type.toUpperCase()}</div>
                       <button onClick={() => editField(f.id)} style={{background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginRight: '0.8rem'}} title="Edit Label"><i className="fas fa-edit"></i></button>
                       <button onClick={() => deleteField(f.id)} style={{background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer'}} title="Remove Field"><i className="fas fa-times"></i></button>
                   </div>
                 ))}
                 {!(org[`${activeSchema}_fields_config`] || []).length && (
                   <p style={{textAlign: 'center', opacity: 0.5, padding: '2rem'}}>No attributes defined for this model. Add one to unlock onboarding.</p>
                 )}
              </div>
           </div>
        </div>
      )}
      
      {activeTab === 'students' && org && (
        <div className="animate-fadeIn">
           {!org.has_portal_access ? (
             <div className="dashboard-card" style={{textAlign: 'center', padding: '4rem'}}>
               <i className="fas fa-lock" style={{fontSize: '3rem', opacity: 0.2, marginBottom: '1.5rem'}}></i>
               <h3>Student CRM Restricted</h3>
               <p>Enter a valid License Key in the Overview tab to unlock student management.</p>
             </div>
           ) : (
             <div>
                <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
                   <button onClick={() => setShowAddStudent(true)} className="btn-primary">New Student Record</button>
                   <button className="btn-secondary" onClick={() => window.open(`${API_BASE_URL}/api/students/download_template/?organization=${org.id}`)}>Get Template</button>
                </div>
                <div className="dashboard-card">
                  <table style={{width: '100%', textAlign: 'left'}}>
                     <thead><tr style={{opacity: 0.5}}><th>Name</th><th>Class</th><th>Custom Data Points</th></tr></thead>
                     <tbody>
                        {students.map(s => <tr key={s.id} style={{borderTop: '1px solid #334155'}}><td style={{padding: '1rem'}}>{s.first_name} {s.last_name}</td><td>{s.classroom_name || 'Unassigned'}</td><td>{Object.keys(s.custom_data || {}).length} Fields</td></tr>)}
                     </tbody>
                  </table>
                  {students.length === 0 && <p style={{textAlign: 'center', padding: '2rem', opacity: 0.5}}>No data records for this query.</p>}
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'profile' && org && (
        <div className="dashboard-card animate-fadeIn">
           <h3>Organization Profile</h3>
           <p style={{color: 'var(--text-muted)'}}>Manage your institution's public profile and contact information.</p>
           <form style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem'}}>
             <div className="form-group" style={{gridColumn: '1/-1'}}><label>Organization Name</label><input value={org.name || ''} onChange={e => setOrg({...org, name: e.target.value})} /></div>
             <div className="form-group"><label>Contact Email</label><input value={org.contact_email || ''} onChange={e => setOrg({...org, contact_email: e.target.value})} /></div>
             <div className="form-group"><label>Phone Number</label><input value={org.phone_number || ''} onChange={e => setOrg({...org, phone_number: e.target.value})} /></div>
             <div className="form-group" style={{gridColumn: '1/-1'}}><label>Address</label><textarea value={org.address || ''} onChange={e => setOrg({...org, address: e.target.value})} rows="3"></textarea></div>
             <div className="form-group" style={{gridColumn: '1/-1'}}><label>Description</label><textarea value={org.description || ''} onChange={e => setOrg({...org, description: e.target.value})} rows="4"></textarea></div>
           </form>
        </div>
      )}
      </div>
    </div>
  );
}

function Timetable({ role }) {
  return (
    <div className="timetable-page">
      <h2>Weekly Timetable</h2>
      <div className="calendar-grid">
         {/* Placeholder calendar grid */}
         <div className="cal-day">Monday</div>
         <div className="cal-day">Tuesday</div>
         <div className="cal-day">Wednesday</div>
         <div className="cal-day">Thursday</div>
         <div className="cal-day">Friday</div>
      </div>
    </div>
  );
}

export default App;
