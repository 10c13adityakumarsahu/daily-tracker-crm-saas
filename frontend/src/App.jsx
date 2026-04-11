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
               <div className="nav-brand">DailyTracker <span style={{ fontWeight: 200, opacity: 0.6 }}>SaaS</span></div>
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
               <Route path="/" element={token ? <Dashboard role={role} token={token} logout={logout} /> : <LandingPage />} />
            </Routes>
         </main>
      </div>
   );
}

function LandingPage() {
   const navigate = useNavigate();
   return (
      <div className="landing-page animate-fadeIn" style={{ textAlign: 'center', padding: '6rem 0' }}>
         <div className="badge-success" style={{ display: 'inline-block', padding: '0.4rem 1.2rem', marginBottom: '2rem' }}>NEW: Enterprise Ready 🚀</div>
         <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '1.5rem' }}>
            Master Your <span className="nav-brand" style={{ fontSize: '4.5rem' }}>Educational</span> Workflow.
         </h1>
         <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 3rem' }}>
            The only SaaS platform built for high-performance learning organizations to manage students, staff, and analytics with surgical precision.
         </p>
         <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button className="btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem' }} onClick={() => navigate('/signup')}>Start Free Trial</button>
            <button className="btn-secondary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem' }} onClick={() => navigate('/login')}>Sign In to Dashboard</button>
         </div>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginTop: '6rem' }}>
            <div className="stat-card" style={{ border: '1px solid var(--border-color)' }}><h3>Custom Fields</h3><p>Design your own data schema for students and instructors in seconds.</p></div>
            <div className="stat-card" style={{ border: '1px solid var(--border-color)' }}><h3>Bulk Control</h3><p>Onboard hundreds of users instantly via our intelligent CSV mapping tool.</p></div>
            <div className="stat-card" style={{ border: '1px solid var(--border-color)' }}><h3>Smart Reports</h3><p>Gain insights with automated attendance and academic session logging.</p></div>
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
            alert(data.detail || data.error || 'Login failed: Invalid credentials');
         }
      } catch (err) {
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
                  <div style={{ position: 'relative', width: '100%' }}>
                     <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0', margin: '0', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                     </button>
                  </div>
               </div>
               <button type="submit" className="btn-primary">Login</button>
            </form>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
               Want to start an organization? <Link to="/signup">Sign up as Organizer</Link>
            </p>
         </div>
      </div>
   );
}

function Dashboard({ role, token, logout }) {
   if (role === 'ADMIN') return <AdminDashboard token={token} logout={logout} />;
   if (role === 'MANAGER') return <ManagerDashboard token={token} logout={logout} />;
   if (role === 'INSTRUCTOR') return <InstructorDashboard token={token} logout={logout} />;
   if (role === 'STUDENT') return <StudentDashboard token={token} logout={logout} />;
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
      } catch (err) {
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
                  <div style={{ position: 'relative', width: '100%' }}>
                     <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0', margin: '0', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                     </button>
                  </div>
               </div>
               <button type="submit" className="btn-primary">Sign Up</button>
            </form>
            {message && <p style={{ marginTop: '1rem', color: '#C084FC' }}>{message}</p>}
            <p style={{ marginTop: '1rem', textAlign: 'center' }}><Link to="/login">Back to Login</Link></p>
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
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
               <h2 style={{ fontSize: '2.25rem' }}>Licensing & Account <span className="nav-brand" style={{ fontSize: '2.25rem' }}>Control</span></h2>
               <p style={{ color: 'var(--text-muted)' }}>Manage organization access, verify renewals, and monitor payments.</p>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
            {orgs.map(org => (
               <div key={org.id} className="dashboard-card" style={{ border: '1px solid var(--border-color)', position: 'relative' }}>
                  <button
                     onClick={() => deleteOrg(org.id)}
                     style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1.2rem' }}
                     title="Delete Organization"
                  >
                     <i className="fas fa-trash"></i>
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingRight: '2rem' }}>
                     <span className={`badge ${org.has_portal_access ? 'badge-success' : 'badge-warning'}`}>{org.has_portal_access ? 'PORTAL ACTIVE' : 'PENDING ACTIVATION'}</span>
                     {org.is_payment_verified && <span className="badge-success" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>PAID</span>}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{org.name}</h3>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>Owner: {org.contact_email}</div>

                  <div className="info-grid" style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>License Key:</span> <code>{org.license_key || 'Not Generated'}</code></div>
                     <div className="field-builder-row"><span>Subscription Plan:</span> <span className="badge">{org.subscription_plan}</span></div>
                     <div className="field-builder-row"><span>Global Status:</span> <span className={`badge ${org.has_portal_access ? 'badge-success' : 'badge-warning'}`}>{org.has_portal_access ? 'ACTIVATED' : 'LIMITED'}</span></div>
                     <div className="field-builder-row"><span>Expiry:</span> <span>{org.subscription_expiry ? new Date(org.subscription_expiry).toLocaleDateString() : 'N/A'}</span></div>
                     {org.subscription_expiry && (
                        <div className="field-builder-row" style={{ color: (Math.ceil((new Date(org.subscription_expiry) - new Date()) / (1000 * 60 * 60 * 24)) < 30) ? '#EF4444' : 'var(--primary-color)' }}>
                           <span>Days Remaining:</span> <strong>{Math.max(0, Math.ceil((new Date(org.subscription_expiry) - new Date()) / (1000 * 60 * 60 * 24)))} Days</strong>
                        </div>
                     )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <button
                        className="btn-primary"
                        style={{ flex: 1, filter: !org.is_payment_verified ? 'grayscale(1)' : 'none' }}
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
                  {!org.is_payment_verified && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.5rem' }}>Waiting for Manager to complete Payment.</p>}
               </div>
            ))}
         </div>

         {selected && (
            <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
               <div className="dashboard-card animate-slideUp" style={{ width: '600px', border: '1px solid var(--primary-color)' }}>
                  <h3>Organization Analysis: {selected.name}</h3>
                  <p style={{ opacity: 0.7 }}>Structural integrity and licensing metadata.</p>
                  <hr style={{ opacity: 0.1, margin: '1rem 0' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                     <div><strong>Plan:</strong> {selected.subscription_plan}</div>
                     <div><strong>Duration:</strong> {selected.subscription_duration_months} Months</div>
                     <div><strong>Student Model:</strong> {selected.student_fields_config.length} Fields</div>
                     <div><strong>Instructor Model:</strong> {selected.instructor_fields_config.length} Fields</div>
                  </div>
                  <button className="btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setSelected(null)}>Close Inspection</button>
               </div>
            </div>
         )}
      </div>
   );
}

function ManagerDashboard({ token, logout }) {
   const [showMobileMenu, setShowMobileMenu] = useState(false);
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
   const [allTimetables, setAllTimetables] = useState([]);
   const [showPayment, setShowPayment] = useState(false);
   const [showActivateModal, setShowActivateModal] = useState(false);
   const [tempLicense, setTempLicense] = useState('');
   const [newFieldOptions, setNewFieldOptions] = useState('');

   const [selectedClassId, setSelectedClassId] = useState(null);
   const [classDetails, setClassDetails] = useState({ subjects: [], students: [], timetable: [], sessions: [], homework: [] });
   const [newSubject, setNewSubject] = useState({ name: '', id: '', instructors: [] });
   const [viewingSubject, setViewingSubject] = useState(null);
   const [courseSearch, setCourseSearch] = useState('');
   const [classroomSearch, setClassroomSearch] = useState('');
   const [studentSearch, setStudentSearch] = useState('');
   const [instructorSearch, setInstructorSearch] = useState('');
   const [newInterval, setNewInterval] = useState({ name: '', start: '', end: '' });

   const [studentForm, setStudentForm] = useState({
      classroom: '',
      custom_data: {}
   });
   const [editingStudent, setEditingStudent] = useState(null);

   const [instructorForm, setInstructorForm] = useState({
      subjects: [],
      classrooms: [],
      custom_data: {}
   });
   const [editingInstructor, setEditingInstructor] = useState(null);

   const handleCreateOrUpdateStudent = async (e) => {
      e.preventDefault();
      const isUpdate = !!editingStudent;
      const url = isUpdate ? `${API_BASE_URL}/api/students/${editingStudent.id}/` : `${API_BASE_URL}/api/students/`;
      const method = isUpdate ? 'PATCH' : 'POST';

      // Map first field for backend identity if it's a new record
      const firstFieldVal = Object.values(studentForm.custom_data)[0] || 'Student';
      const regNoFieldVal = studentForm.custom_data['Registration ID'] || studentForm.custom_data['ID'] || Math.floor(Math.random() * 10000);

      const payload = isUpdate ? studentForm : {
         ...studentForm,
         organization: org.id,
         first_name: firstFieldVal,
         registration_number: regNoFieldVal
      };

      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(payload)
      });

      if (res.ok) {
         alert(isUpdate ? 'Record updated!' : 'Record created!');
         setShowAddStudent(false);
         setEditingStudent(null);
         setStudentForm({ classroom: '', custom_data: {} });
         fetchItems();
         if (selectedClassId) fetchClassroomDetails(selectedClassId);
      } else {
         alert('Failed to save record. Please check individual field constraints.');
      }
   };

   const handleCreateOrUpdateInstructor = async (e) => {
      e.preventDefault();
      const isUpdate = !!editingInstructor;
      const url = isUpdate ? `${API_BASE_URL}/api/instructors/${editingInstructor.id}/` : `${API_BASE_URL}/api/instructors/`;
      const method = isUpdate ? 'PATCH' : 'POST';

      // registration_number consistency
      const regNo = instructorForm.custom_data['Instructor ID'] || instructorForm.custom_data['Registration Number'] || (isUpdate ? editingInstructor.registration_number : Math.floor(Math.random() * 10000));

      const payload = {
         organization: org.id,
         registration_number: String(regNo),
         classrooms: instructorForm.classrooms,
         custom_data: instructorForm.custom_data,
      };

      if (!isUpdate) {
         payload.user_data = {
            username: `inst_${regNo}`,
            password: `Pass@${regNo}`
         };
      }

      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(payload)
      });

      if (res.ok) {
         const instructorObj = await res.json();

         // Handle subjects M2M (Incremental updates)
         const currentTaught = subjects.filter(s => s.instructors?.includes(instructorObj.id)).map(s => s.id);
         const selected = instructorForm.subjects || [];

         const toAdd = selected.filter(id => !currentTaught.includes(id));
         const toRemove = currentTaught.filter(id => !selected.includes(id));

         await Promise.all(toAdd.map(async sid => {
            const s = subjects.find(x => x.id === sid);
            if (!s) return;
            const next = Array.from(new Set([...(s.instructors || []), instructorObj.id]));
            await fetch(`${API_BASE_URL}/api/subjects/${sid}/`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ instructors: next })
            });
         }));

         await Promise.all(toRemove.map(async sid => {
            const s = subjects.find(x => x.id === sid);
            if (!s) return;
            const next = (s.instructors || []).filter(id => id !== instructorObj.id);
            await fetch(`${API_BASE_URL}/api/subjects/${sid}/`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ instructors: next })
            });
         }));

         alert(isUpdate ? 'Instructor Profile Saved!' : 'New Instructor Created!');
         setShowAddInstructor(false);
         setEditingInstructor(null);
         setInstructorForm({ subjects: [], classrooms: [], custom_data: {} });
         fetchItems();
      } else {
         const err = await res.json();
         alert('Failed to save: ' + (err.error || err.detail || 'Check constraints'));
      }
   };

   const handleBulkImport = async (type, file) => {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      if (org) formData.append('organization', org.id);

      const endpoint = type === 'student' ? 'students' : 'instructors';

      try {
         const res = await fetch(`${API_BASE_URL}/api/${endpoint}/bulk_import/`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`
            },
            body: formData
         });
         if (res.ok) {
            alert('Bulk import successful!');
            fetchItems();
         } else {
            const err = await res.json();
            alert('Import failed: ' + (err.error || 'Check CSV format'));
         }
      } catch (err) {
         alert('Error connecting to server.');
      }
   };

   const fetchItems = () => {
      fetch(`${API_BASE_URL}/api/organizations/mine/`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(res => { if (res.status === 401) { logout(); return; } return res.json(); })
         .then(data => data && data.id && setOrg(data));

      fetch(`${API_BASE_URL}/api/students/`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(res => { if (res.status === 401) { logout(); return; } return res.json(); })
         .then(data => data && setStudents(data));

      fetch(`${API_BASE_URL}/api/instructors/`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(res => { if (res.status === 401) { logout(); return; } return res.json(); })
         .then(data => data && setInstructors(data));

      fetch(`${API_BASE_URL}/api/classrooms/`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(res => { if (res.status === 401) { logout(); return; } return res.json(); })
         .then(data => data && setClassrooms(data));

      fetch(`${API_BASE_URL}/api/subjects/`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(res => { if (res.status === 401) { logout(); return; } return res.json(); })
         .then(data => data && setSubjects(data));

      fetch(`${API_BASE_URL}/api/timetables/`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(res => { if (res.status === 401) { logout(); return; } return res.json(); })
         .then(data => data && setAllTimetables(data));
   };

   const fetchClassroomDetails = async (cid) => {
      if (!cid || cid === 'undefined') return;
      const [subRes, stuRes, ttRes, sesRes, hwRes] = await Promise.all([
         fetch(`${API_BASE_URL}/api/subjects/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/students/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/timetables/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/sessions/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/homeworks/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      ]);
      setClassDetails({ subjects: subRes, students: stuRes, timetable: ttRes, sessions: sesRes, homework: hwRes });
   }

   const fetchMasterData = async () => {
      if (!org || !org.id) return;
      const res = await fetch(`${API_BASE_URL}/api/timetables/?organization=${org.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAllTimetables(await res.json());
   }

   const generateSlots = () => {
      if (!org) return [];
      const slots = [];
      const [sh, sm] = (org.school_start_time || '08:30:00').split(':').map(Number);
      const [eh, em] = (org.school_end_time || '15:30:00').split(':').map(Number);
      let currentMins = sh * 60 + sm;
      const endMins = eh * 60 + em;

      const custom = (org.custom_intervals || []).map(ci => ({
         ...ci,
         startMins: parseInt(ci.start.split(':')[0]) * 60 + parseInt(ci.start.split(':')[1]),
         endMins: parseInt(ci.end.split(':')[0]) * 60 + parseInt(ci.end.split(':')[1]),
      })).sort((a, b) => a.startMins - b.startMins);

      let pNum = 1;
      let guard = 0;
      while (currentMins < endMins && guard < 100) {
         guard++;
         const currentTimeStr = `${String(Math.floor(currentMins / 60)).padStart(2, '0')}:${String(currentMins % 60).padStart(2, '0')}`;
         const matchingCI = custom.find(ci => ci.start === currentTimeStr);

         if (matchingCI) {
            slots.push({ type: 'BREAK', label: matchingCI.name.toUpperCase(), start: matchingCI.start + ':00', end: matchingCI.end + ':00' });
            currentMins = matchingCI.endMins;
         } else {
            const sStr = currentTimeStr + ':00';
            const periodEnd = currentMins + (org.period_duration_minutes || 45);
            if (periodEnd > endMins) break;
            const eStr = `${String(Math.floor(periodEnd / 60)).padStart(2, '0')}:${String(periodEnd % 60).padStart(2, '0')}:00`;
            slots.push({ type: 'PERIOD', label: `P${pNum++}`, start: sStr, end: eStr });
            currentMins = periodEnd;

            if (custom.length === 0 && pNum - 1 === (org.break_after_period || 3)) {
               const bs = eStr;
               currentMins += (org.break_duration_minutes || 15);
               const be = `${String(Math.floor(currentMins / 60)).padStart(2, '0')}:${String(currentMins % 60).padStart(2, '0')}:00`;
               slots.push({ type: 'BREAK', label: 'BREAK', start: bs, end: be });
            }
         }
      }
      return slots;
   };

   useEffect(() => { if (selectedClassId) fetchClassroomDetails(selectedClassId); }, [selectedClassId]);
   useEffect(() => { if (activeTab === 'master') fetchMasterData(); }, [activeTab]);

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
      if (!newClassroom) return alert("Please enter a classroom name.");
      const res = await fetch(`${API_BASE_URL}/api/classrooms/`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ name: newClassroom, organization: org.id })
      });
      if (res.ok) {
         setNewClassroom(''); fetchItems();
      } else {
         alert("Failed to create classroom.");
      }
   };

   const handleAddSubject = async () => {
      // We create a NEW subject based on a template from the bank
      const bankSubjectId = newSubject.id;
      if (!bankSubjectId) return alert("Please select a course from the bank.");

      const template = subjects.find(s => s.id == bankSubjectId);
      if (!template) return alert("Template not found.");

      const payload = {
         name: template.name,
         organization: org.id,
         classroom: selectedClassId,
         instructors: template.instructors, // Inherit from template bank
         is_template: false
      };

      const res = await fetch(`${API_BASE_URL}/api/subjects/`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(payload)
      });
      if (res.ok) {
         setNewSubject({ id: '', instructors: [], name: '' });
         fetchItems();
         fetchClassroomDetails(selectedClassId);
         alert("Subject added to classroom!");
      } else {
         const err = await res.json();
         alert("Failed to add subject: " + (err.error || JSON.stringify(err)));
      }
   }

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
      <div className="dashboard-container" style={{display: 'flex', minHeight: '100vh', position: 'relative', overflowX: 'hidden'}}>
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${showMobileMenu ? 'visible' : ''}`} onClick={() => setShowMobileMenu(false)} />
      
      {/* Hamburger Toggle */}
      <button className="hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)} style={{position: 'fixed', top: '15px', right: '20px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
            <span></span>
            <span></span>
            <span></span>
         </button>
         {/* SaaS Sidebar */}
         <div className={`sidebar ${showMobileMenu ? 'mobile-open' : ''}`} style={{ width: '280px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid var(--border-color)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
            {org && (
               <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{org.name}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                     <span className="badge" style={{ background: org.subscription_plan === 'FREE' ? 'rgba(255,165,0,0.1)' : 'rgba(16,185,129,0.1)', color: org.subscription_plan === 'FREE' ? 'orange' : '#10B981' }}>
                        {org.subscription_plan}
                     </span>
                     {org.has_portal_access && daysLeft !== null && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{daysLeft} Days Left</span>
                     )}
                  </div>
               </div>
            )}

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
               {[
                  { id: 'overview', icon: 'home', label: 'Overview' },
                  { id: 'schemas', icon: 'layer-group', label: 'Schemas' },
                  { id: 'master', icon: 'th-list', label: 'Master Schedule' },
                  { id: 'classrooms', icon: 'school', label: 'Classrooms Hub' },
                  { id: 'subjects', icon: 'book', label: 'Course Bank' },
                  { id: 'instructors', icon: 'user-tie', label: 'Staff Roster' },
                  { id: 'students', icon: 'user-graduate', label: 'Student Body' },
                  { id: 'monitoring', icon: 'calendar-alt', label: 'Daily Monitoring' },
                  { id: 'profile', icon: 'cog', label: 'School Settings' }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => { setActiveTab(tab.id); setSelectedClassId(null); }}
                     className={activeTab === tab.id ? 'btn-primary' : 'btn-logout'}
                     style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.8rem 1.2rem' }}
                  >
                     <i className={`fas fa-${tab.icon}`} style={{ marginRight: '10px', width: '20px' }}></i>
                     {tab.label}
                  </button>
               ))}
            </nav>

            {org && (
               <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(192,132,252,0.1), rgba(236,72,153,0.1))', borderRadius: '16px', border: '1px solid rgba(192,132,252,0.2)' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{org.subscription_plan === 'FREE' ? 'Upgrade Plan' : 'Active Plan'}</h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0.5rem 0 1rem 0' }}>
                     Manage all institutional units with premium access.
                  </p>
                  <button
                     onClick={() => setShowActivateModal(true)}
                     className={org.is_payment_verified ? "btn-logout" : "btn-primary"}
                     style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem' }}
                  >
                     {org.subscription_plan === 'FREE' ? (org.is_payment_verified ? 'Activation Pending' : 'Activate License') : 'Renew License'}
                  </button>
               </div>
            )}
         </div>

         <div className="main-content" style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', background: '#080c14' }}>
            {activeTab === 'monitoring' && (
               <DailyMonitoringView token={token} />
            )}
            {showActivateModal && (
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '450px', position: 'relative' }}>
                     <button onClick={() => setShowActivateModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                     <h3 className="nav-brand" style={{ fontSize: '1.8rem' }}>Activate Platform</h3>
                     <p style={{ marginBottom: '2rem' }}>Unlock full institutional capabilities and remove trial limitations.</p>
                     <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>License Key</label>
                        <input
                           value={tempLicense}
                           onChange={e => setTempLicense(e.target.value)}
                           placeholder="XXXX-XXXX-XXXX"
                           style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
                        />
                     </div>
                     <button onClick={applyLicense} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>Confirm Activation</button>
                     <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />
                     <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Don't have a key? Contact your account manager or click <strong style={{ color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => { setShowActivateModal(false); setShowPayment(true) }}>Pay Now</strong> to generate one.</p>
                  </div>
               </div>
            )}
            {org && !org.has_portal_access && (
               <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <h4 style={{ margin: 0, color: '#60A5FA' }}>{!org.is_payment_verified ? 'Payment Required' : (org.is_license_generated ? 'Activation Pending' : 'License Under Review')}</h4>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                           {!org.is_payment_verified ? 'Please complete payment to request your license.' : (org.is_license_generated ? 'Check your email for the key and enter below.' : 'Your payment is verified. Admin is generating your key.')}
                        </p>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        {!org.is_payment_verified && <button onClick={() => setShowPayment(true)} className="btn-primary">Pay Subscription</button>}
                        {org.is_license_generated && (
                           <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input value={tempLicense} onChange={e => setTempLicense(e.target.value)} placeholder="Enter Key" style={{ width: '180px' }} />
                              <button onClick={applyLicense} className="btn-primary">Activate</button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {showPayment && org && (
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '480px', textAlign: 'center' }}>
                     <h3 className="nav-brand" style={{ fontSize: '1.8rem' }}>Secure Payment</h3>
                     <p>Simulated Gateway for {org.name}</p>

                     <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
                        <button onClick={() => setPaymentDuration(1)} className={paymentDuration === 1 ? 'btn-primary' : 'btn-logout'} style={{ flex: 1 }}>Monthly</button>
                        <button onClick={() => setPaymentDuration(12)} className={paymentDuration === 12 ? 'btn-primary' : 'btn-logout'} style={{ flex: 1 }}>Yearly (Save 20%)</button>
                     </div>

                     <div style={{ margin: '1.5rem 0', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Plan:</span> <span>{paymentDuration === 1 ? 'Basic Monthly' : 'PRO Yearly'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}><span>Total Amount:</span> <span style={{ color: '#10B981' }}>${paymentDuration === 1 ? '99.00' : '999.00'}</span></div>
                     </div>
                     <input placeholder="Card Number (4242 ...)" readOnly style={{ marginBottom: '1rem', textAlign: 'center', opacity: 0.5 }} />
                     <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        onClick={processPayment}
                     >
                        Accept & Pay ${paymentDuration === 1 ? '99.00' : '999.00'}
                     </button>
                     <button className="btn-logout" style={{ marginTop: '1rem' }} onClick={() => setShowPayment(false)}>Cancel Payment</button>
                  </div>
               </div>
            )}

            {activeTab === 'overview' && org && (
               <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                     <div>
                        <h2 style={{ fontSize: '2.25rem' }}>Dashboard <span className="nav-brand" style={{ fontSize: '2.25rem' }}>Overview</span></h2>
                        <p style={{ color: 'var(--text-muted)' }}>High-level metrics and system status for <strong>{org.name}</strong>.</p>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }} className="stat-grid">
                     <div className="dashboard-card" style={{ border: '1px solid var(--border-color)' }}>
                        <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>TOTAL STUDENTS</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{students.length}</div>
                     </div>
                     <div className="dashboard-card" style={{ border: '1px solid var(--border-color)' }}>
                        <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>STAFF MEMBERS</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{instructors.length}</div>
                     </div>
                     <div className="dashboard-card" style={{ border: '1px solid var(--border-color)' }}>
                        <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>ACTIVE CLASSES</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{classrooms.length}</div>
                     </div>
                     <div className="dashboard-card" style={{ border: '1px solid var(--border-color)' }}>
                        <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>PORTAL STATUS</div>
                        <div className={`badge ${org.has_portal_access ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{org.has_portal_access ? 'ACCEPTS LOGINS' : 'READ ONLY'}</div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="dashboard-overview-grid">
                     <div className="dashboard-card">
                        <h3>Subscription Metadata</h3>
                        <div className="info-grid" style={{ marginTop: '1.5rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span>Plan:</span> <strong>{org.subscription_plan}</strong></div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span>License Status:</span> <strong>{org.is_license_generated ? 'ISSUED' : 'PENDING'}</strong></div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span>Expiration:</span> <strong>{org.subscription_expiry ? new Date(org.subscription_expiry).toLocaleDateString() : 'N/A'}</strong></div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0' }}><span>Support Tier:</span> <strong style={{ color: 'var(--primary-color)' }}>PRIORITY</strong></div>
                        </div>
                     </div>
                     <div className="dashboard-card" style={{ background: 'rgba(192,132,252,0.03)', border: '1px dashed rgba(192,132,252,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <i className="fas fa-rocket" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                        <h4>Scalability Actions</h4>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Bulk import or export your student data using our CSV engine.</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                           <button className="btn-secondary" onClick={() => setActiveTab('students')}>Go to Student CRM</button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'master' && org && (
               <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                     <div>
                        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '0.4rem' }}>Universal <span className="nav-brand" style={{ fontSize: '2.4rem' }}>Master Schedule</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Institutional control center for all academic assignments.</p>
                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                              <div key={d} className="badge" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed' }}>{d}</div>
                           ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.4 }}>DP-DRAG BANK:</span>
                           <div style={{ display: 'flex', gap: '0.6rem' }}>
                              {subjects.filter(s => s.instructor).slice(0, 4).map(s => (
                                 <div key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData('subjectId', s.id)} style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-color)', fontSize: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'grab', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                    {s.name}
                                 </div>
                              ))}
                              {subjects.filter(s => s.instructor).length > 4 && <span style={{ opacity: 0.3, fontSize: '0.7rem' }}>+{subjects.filter(s => s.instructor).length - 4} more</span>}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="dashboard-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                     <div style={{ overflowX: 'auto', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ minWidth: '1200px', display: 'grid', gridTemplateColumns: `140px repeat(${classrooms.length}, 1fr)`, gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                           <div style={{ padding: '1.5rem', background: 'var(--background-card)', fontWeight: 900, color: 'var(--primary-color)', fontSize: '0.8rem', letterSpacing: '1px' }}>TIME SLOTS</div>
                           {classrooms.map(c => (
                              <div key={c.id} style={{ padding: '1.5rem', background: 'var(--background-card)', textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid rgba(192,132,252,0.3)', color: 'white', position: 'relative' }}>
                                 <i className="fas fa-desktop" style={{ position: 'absolute', left: '1.5rem', opacity: 0.1, fontSize: '2rem' }}></i>
                                 {c.name}
                              </div>
                           ))}

                           {generateSlots().map((slot, sIdx) => {
                              const isBreak = slot.type === 'BREAK';
                              return (
                                 <React.Fragment key={sIdx}>
                                    <div style={{ padding: '1.5rem', background: isBreak ? 'linear-gradient(to right, rgba(192,132,252,0.05), transparent)' : 'var(--background-card)', borderRight: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                       <div style={{ fontSize: '1rem', fontWeight: 900, color: isBreak ? 'var(--primary-color)' : 'white' }}>{slot.label}</div>
                                       <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{slot.start.slice(0, 5)} - {slot.end.slice(0, 5)}</div>
                                    </div>
                                    {classrooms.map(c => {
                                       const entry = allTimetables.find(t => t.start_time === slot.start && subjects.find(sub => sub.id === t.subject)?.classroom === c.id);
                                       const subj = entry ? subjects.find(s => s.id === entry.subject) : null;
                                       const teacher = subj ? instructors.find(i => i.id === subj.instructor) : null;

                                       return (
                                          <div
                                             key={c.id}
                                             onDragOver={e => e.preventDefault()}
                                             onDrop={async (e) => {
                                                const sid = e.dataTransfer.getData('subjectId');
                                                const res = await fetch(`${API_BASE_URL}/api/timetables/`, {
                                                   method: 'POST',
                                                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                   body: JSON.stringify({ organization: org.id, subject: sid, day_of_week: 0, start_time: slot.start, end_time: slot.end })
                                                });
                                                if (res.ok) fetchMasterData();
                                                else { const err = await res.json(); alert(err.error || "Conflict detected."); }
                                             }}
                                             style={{ padding: '1rem', minHeight: '120px', background: isBreak ? 'rgba(255,255,255,0.02)' : 'var(--background-card)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                                          >
                                             {isBreak ? (
                                                <div style={{ fontSize: '0.7rem', opacity: 0.1, fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase' }}>Rest Interval</div>
                                             ) : (
                                                subj ? (
                                                   <div style={{ textAlign: 'center', width: '100%', padding: '1rem', background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(236,72,153,0.15))', border: '1px solid var(--primary-color)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(192,132,252,0.2)', cursor: 'default' }}>
                                                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white', marginBottom: '0.3rem' }}>{subj.name}</div>
                                                      <div style={{ fontSize: '0.75rem', opacity: 0.7, fontStyle: 'italic' }}>{Object.values(teacher?.custom_data || {})[0] || teacher?.registration_number || 'Unnamed Staff'}</div>
                                                      <button
                                                         onClick={async () => {
                                                            if (!window.confirm("Remove session?")) return;
                                                            await fetch(`${API_BASE_URL}/api/timetables/${entry.id}/`, {
                                                               method: 'DELETE',
                                                               headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            fetchMasterData();
                                                         }}
                                                         style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.6rem' }}
                                                      >
                                                         <i className="fas fa-times"></i>
                                                      </button>
                                                   </div>
                                                ) : (
                                                   <div style={{ opacity: 0.05, fontSize: '2rem', fontWeight: 100 }}>+</div>
                                                )
                                             )}
                                          </div>
                                       );
                                    })}
                                 </React.Fragment>
                              )
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'subjects' && org && (
               <div className="animate-fadeIn">
                  <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                           <h3>Subject Discovery Bank</h3>
                           <p style={{ opacity: 0.6 }}>Create and manage universal course assets.</p>
                        </div>
                        <div className="search-container" style={{ maxWidth: '400px' }}>
                           <i className="fas fa-search"></i>
                           <input
                              placeholder="Search Courses..."
                              value={courseSearch}
                              onChange={e => setCourseSearch(e.target.value)}
                           />
                        </div>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <input value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} placeholder="e.g. Mathematics II" style={{ flex: 1 }} />
                        <button onClick={async () => {
                           if (!newSubject.name) return;
                           await fetch(`${API_BASE_URL}/api/subjects/`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ name: newSubject.name, organization: org.id, is_template: true })
                           });
                           setNewSubject({ ...newSubject, name: '' }); fetchItems();
                        }} className="btn-primary">Create Universal Subject</button>
                     </div>
                  </div>

                  <div className="dashboard-card">
                     <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                           <thead><tr style={{ opacity: 0.5 }}><th style={{ padding: '0 1.2rem' }}>Course Name</th><th style={{ padding: '0 1.2rem' }}>Target Unit</th><th style={{ padding: '0 1.2rem' }}>Faculty Lead</th><th style={{ textAlign: 'right', padding: '0 1.2rem' }}>Admin</th></tr></thead>
                           <tbody>
                              {subjects.filter(s => s.name.toLowerCase().includes(courseSearch.toLowerCase())).map(s => (
                                 <tr key={s.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <td style={{ padding: '1.2rem', borderRadius: '12px 0 0 12px' }}>{s.name}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                       <select
                                          style={{ padding: '0.5rem 1rem', width: '100%', fontSize: '0.9rem' }}
                                          value={s.classroom || ''}
                                          onChange={async (e) => {
                                             await fetch(`${API_BASE_URL}/api/subjects/${s.id}/`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                body: JSON.stringify({ classroom: e.target.value || null })
                                             });
                                             fetchItems();
                                          }}>
                                          <option value="">Bank (Unassigned)</option>
                                          {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                       </select>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                       <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                          <div style={{ fontSize: '0.8rem', opacity: 0.7, flex: 1 }}>
                                             {s.instructor_names || 'No Faculty Assigned'}
                                          </div>
                                          <button onClick={() => setViewingSubject(s)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>View & Manage Staff</button>
                                       </div>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '1.2rem', borderRadius: '0 12px 12px 0' }}>
                                       <button onClick={async () => {
                                          if (!window.confirm("Permanently delete course?")) return;
                                          await fetch(`${API_BASE_URL}/api/subjects/${s.id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                          fetchItems();
                                       }} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}><i className="fas fa-trash-alt"></i></button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'classrooms' && org && (
               <div className="animate-fadeIn">
                  {selectedClassId ? (
                     <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                           <button onClick={() => setSelectedClassId(null)} className="btn-logout" style={{ padding: '0.4rem 0.8rem' }}><i className="fas fa-chevron-left"></i></button>
                           <h2 style={{ margin: 0 }}>{classrooms.find(c => c.id === selectedClassId)?.name} <span className="nav-brand" style={{ fontSize: '1rem', marginLeft: '1rem' }}>Institutional Hub</span></h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 3fr', gap: '2rem' }}>
                           {/* Left Column: People & Metadata */}
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <div className="dashboard-card">
                                 <h4>Subjects & Instructors</h4>
                                 <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '1rem' }}>Drag subjects into the grid to schedule them.</p>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {classDetails.subjects.map(s => (
                                       <div
                                          key={s.id}
                                          draggable
                                          onDragStart={(e) => e.dataTransfer.setData('subjectId', s.id)}
                                          style={{ padding: '0.8rem', background: 'var(--primary-color)', opacity: 0.8, borderRadius: '8px', cursor: 'grab' }}
                                       >
                                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.name}</div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Staff: {s.instructor_names || 'None'}</div>
                                       </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                       <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Assign Course from Bank</label>
                                       <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                          <select value={newSubject.id || ""} onChange={e => setNewSubject({ ...newSubject, id: e.target.value })} style={{ fontSize: '0.8rem', flex: 1 }}>
                                             <option value="">Select Course Blueprint...</option>
                                             {subjects.filter(s => s.is_template).map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                             ))}
                                          </select>
                                          <button onClick={handleAddSubject} className="btn-primary" style={{ padding: '0.4rem 0.6rem' }}><i className="fas fa-plus"></i></button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="dashboard-card">
                              <h4>Enrolled Students ({classDetails.students.length})</h4>
                              <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
                                 {classDetails.students.map(stu => (
                                    <div key={stu.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                       {Object.values(stu.custom_data)[0] || 'Unknown Record'}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Right Column: Interactive Timetable */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                           <div className="dashboard-card" style={{ padding: '0' }}>
                              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <h4>Interactive Timetable Planner</h4>
                                 <div className="badge badge-success">Drag & Drop Ready</div>
                              </div>
                              <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                                 <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ padding: '1rem', background: 'var(--background-card)' }}></div>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => <div key={d} style={{ padding: '1rem', background: 'var(--background-card)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>{d}</div>)}

                                    {[1, 2, 3, 4, 5].map(period => (
                                       <React.Fragment key={period}>
                                          <div style={{ padding: '1rem', background: 'var(--background-card)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>P {period}</div>
                                          {[0, 1, 2, 3, 4].map(day => {
                                             const entry = classDetails.timetable.find(t => t.day_of_week === day && t.start_time === `${period + 7}:00:00`);
                                             const subject = entry ? classDetails.subjects.find(s => s.id === entry.subject) : null;
                                             return (
                                                <div
                                                   key={`${day}-${period}`}
                                                   onDragOver={(e) => e.preventDefault()}
                                                   onDrop={async (e) => {
                                                      const sid = e.dataTransfer.getData('subjectId');
                                                      const res = await fetch(`${API_BASE_URL}/api/timetables/`, {
                                                         method: 'POST',
                                                         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                         body: JSON.stringify({
                                                            organization: org.id,
                                                            subject: sid,
                                                            day_of_week: day,
                                                            start_time: `${period + 7}:00:00`,
                                                            end_time: `${period + 8}:00:00`
                                                         })
                                                      });
                                                      if (res.ok) {
                                                         fetchClassroomDetails(selectedClassId);
                                                      } else {
                                                         const err = await res.json();
                                                         alert(err.error || "Clash detected or assignment failed.");
                                                      }
                                                   }}
                                                   style={{ padding: '1rem', height: '80px', background: entry ? 'rgba(192,132,252,0.1)' : 'var(--background-card)', border: entry ? '1px solid var(--primary-color)' : 'none', position: 'relative' }}
                                                >
                                                   {subject && (
                                                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                         {subject.name}
                                                         <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>{subject.instructor_names}</div>
                                                      </div>
                                                   )}
                                                </div>
                                             );
                                          })}
                                       </React.Fragment>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="dashboard-card" style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                 <h4>Academic Progress & Homework</h4>
                                 <div className="badge">LIVE UPDATES</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                 <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)', padding: '1.2rem', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.5rem' }}>LATEST TOPIC COVERED</div>
                                    {classDetails.sessions[0] ? (
                                       <div>
                                          <div style={{ fontSize: '1rem' }}>{classDetails.sessions[0].summary}</div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.4rem' }}>Subject: {classDetails.subjects.find(s => s.id === classDetails.sessions[0].subject)?.name || 'General'} • {classDetails.sessions[0].date}</div>
                                       </div>
                                    ) : "No sessions logged yet."}
                                 </div>
                                 <div style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.1)', padding: '1.2rem', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ec4899', marginBottom: '0.5rem' }}>UPCOMING HOMEWORK</div>
                                    {classDetails.homework.filter(h => new Date(h.deadline) > new Date()).map(hw => (
                                       <div key={hw.id} style={{ marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                          <div style={{ fontWeight: 'bold' }}>{hw.title}</div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Deadline: {new Date(hw.deadline).toLocaleString()}</div>
                                       </div>
                                    ))}
                                    {!classDetails.homework.length && <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>No pending assignments.</div>}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div>
                        <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                              <div>
                                 <h3>Institution Structure</h3>
                                 <p style={{ opacity: 0.6 }}>Add and manage classrooms or organizational units.</p>
                              </div>
                              <div className="search-container" style={{ maxWidth: '400px' }}>
                                 <i className="fas fa-search"></i>
                                 <input
                                    placeholder="Search Classrooms..."
                                    value={classroomSearch}
                                    onChange={e => setClassroomSearch(e.target.value)}
                                 />
                              </div>
                           </div>
                           <div style={{ display: 'flex', gap: '1rem' }}>
                              <input value={newClassroom} onChange={e => setNewClassroom(e.target.value)} placeholder="e.g. Class 10-A or Physics Lab" style={{ flex: 1 }} />
                              <button onClick={handleAddClassroom} className="btn-primary">Create Classroom</button>
                           </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                           {classrooms.filter(c => c.name.toLowerCase().includes(classroomSearch.toLowerCase())).map(c => (
                              <div key={c.id} onClick={() => setSelectedClassId(c.id)} className="dashboard-card" style={{ border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                                 <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary-color)', opacity: 0.5 }}></div>
                                 <div>
                                    <h4 style={{ margin: 0 }}>{c.name}</h4>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{subjects.filter(s => s.classroom === c.id).length} Active Subjects</div>
                                 </div>
                                 <i className="fas fa-chevron-right" style={{ opacity: 0.3 }}></i>
                              </div>
                           ))}
                        </div>
                        {classrooms.length === 0 && <p style={{ textAlign: 'center', padding: '4rem', opacity: 0.4 }}>No classrooms defined yet.</p>}
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'schemas' && org && (
               <div className="animate-fadeIn">
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                     <button className={activeSchema === 'student' ? 'btn-primary' : 'btn-logout'} onClick={() => setActiveSchema('student')}>Student Model</button>
                     <button className={activeSchema === 'instructor' ? 'btn-primary' : 'btn-logout'} onClick={() => setActiveSchema('instructor')}>Instructor Model</button>
                  </div>

                  <div className="dashboard-card">
                     <h3>{activeSchema.toUpperCase()} Schema Designer</h3>
                     <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                           <input value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="Field Label (e.g. Department or Blood Group)" style={{ flex: 2 }} />
                           <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)} style={{ flex: 1 }}>
                              <option value="text">Short Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date Picker</option>
                              <option value="checkbox">Toggle (Boolean)</option>
                              <option value="email">Email Address</option>
                              <option value="select">Dropdown Menu</option>
                           </select>
                        </div>
                        {newFieldType === 'select' && (
                           <div style={{ marginBottom: '1rem' }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Dropdown Options (Comma separated)</label>
                              <input
                                 value={newFieldOptions}
                                 onChange={e => setNewFieldOptions(e.target.value)}
                                 placeholder="Option 1, Option 2, Option 3"
                                 style={{ width: '100%' }}
                              />
                           </div>
                        )}
                        <button onClick={addSchemaField} className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>Add Attribute to Model</button>
                     </div>

                     <div className="fields-list">
                        {(org[`${activeSchema}_fields_config`] || []).map(f => (
                           <div key={f.id} className="field-builder-row" style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ flex: 1 }}>
                                 <strong>{f.name}</strong>
                                 {f.type === 'select' && <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{f.options?.join(' • ')}</div>}
                              </div>
                              <div className="badge" style={{ marginRight: '1rem' }}>{f.type === 'checkbox' ? 'TOGGLE' : f.type.toUpperCase()}</div>
                              <button onClick={() => editField(f.id)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginRight: '0.8rem' }} title="Edit Label"><i className="fas fa-edit"></i></button>
                              <button onClick={() => deleteField(f.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Remove Field"><i className="fas fa-times"></i></button>
                           </div>
                        ))}
                        {!(org[`${activeSchema}_fields_config`] || []).length && (
                           <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No attributes defined for this model. Add one to unlock onboarding.</p>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'students' && org && (
               <div className="animate-fadeIn">
                  {!org.has_portal_access ? (
                     <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <i className="fas fa-lock" style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1.5rem' }}></i>
                        <h3>Student CRM Restricted</h3>
                        <p>Enter a valid License Key in the Overview tab to unlock student management.</p>
                     </div>
                  ) : (
                     <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                           <div style={{ display: 'flex', gap: '1rem' }}>
                              <button onClick={() => setShowAddStudent(true)} className="btn-primary">New Student Record</button>
                              <button className="btn-secondary" onClick={() => window.open(`${API_BASE_URL}/api/students/download_template/?organization=${org.id}`)}>Get Template</button>
                              <button className="btn-secondary" onClick={() => document.getElementById('student-import').click()}>Import CSV</button>
                              <input id="student-import" type="file" hidden accept=".csv" onChange={e => handleBulkImport('student', e.target.files[0])} />
                           </div>
                           <div className="search-container" style={{ maxWidth: '400px' }}>
                              <i className="fas fa-search"></i>
                              <input
                                 placeholder="Search Students..."
                                 value={studentSearch}
                                 onChange={e => setStudentSearch(e.target.value)}
                              />
                           </div>
                        </div>
                        <div className="dashboard-card">
                           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                              <thead>
                                 <tr style={{ opacity: 0.5 }}>
                                    {org.student_fields_config?.slice(0, 3).map(f => <th key={f.id} style={{ padding: '1rem' }}>{f.name}</th>)}
                                    <th style={{ padding: '1rem' }}>Portal Login</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {students.filter(s =>
                                    Object.values(s.custom_data || {}).some(v => v.toString().toLowerCase().includes(studentSearch.toLowerCase()))
                                 ).map(s => (
                                    <tr key={s.id} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                       {org.student_fields_config?.slice(0, 3).map((f, idx) => (
                                          <td key={f.id} style={{ padding: '1rem', borderRadius: idx === 0 ? '12px 0 0 12px' : '0' }}>{s.custom_data?.[f.name] || '-'}</td>
                                       ))}
                                       <td style={{ padding: '1rem' }}>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>User: <strong>{s.user_username || 'N/A'}</strong></div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>Default: Pass@{s.registration_number}</div>
                                       </td>
                                       <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                                          <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }} onClick={() => { setEditingStudent(s); setStudentForm({ custom_data: s.custom_data }); setShowAddStudent(true); }}>Edit</button>
                                          <button onClick={async () => {
                                             if (!window.confirm("Permanently archive student record?")) return;
                                             await fetch(`${API_BASE_URL}/api/students/${s.id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                             fetchItems();
                                          }} style={{ marginLeft: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Archive</button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                           {students.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No data records for this query.</p>}
                        </div>
                     </div>

                  )}
               </div>
            )}

            {activeTab === 'instructors' && org && (
               <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setShowAddInstructor(true)} className="btn-primary">Add New Instructor</button>
                        <button className="btn-secondary" onClick={() => window.open(`${API_BASE_URL}/api/instructors/download_template/?organization=${org.id}`)}>Download Template</button>
                        <button className="btn-secondary" onClick={() => document.getElementById('instructor-import').click()}>Import CSV</button>
                        <input id="instructor-import" type="file" hidden accept=".csv" onChange={e => handleBulkImport('instructor', e.target.files[0])} />
                     </div>
                     <div className="search-container" style={{ maxWidth: '400px' }}>
                        <i className="fas fa-search"></i>
                        <input
                           placeholder="Search Staff..."
                           value={instructorSearch}
                           onChange={e => setInstructorSearch(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="dashboard-card" style={{ overflowX: 'auto' }}>
                     <table className="responsive-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                        <thead>
                           <tr style={{ opacity: 0.5 }}>
                              {org.instructor_fields_config?.slice(0, 3).map(f => <th key={f.id} style={{ padding: '1rem' }}>{f.name}</th>)}
                              <th style={{ padding: '1rem' }}>Staff Login</th>
                              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {instructors.filter(inst =>
                              Object.values(inst.custom_data || {}).some(v => v.toString().toLowerCase().includes(instructorSearch.toLowerCase()))
                           ).map(inst => (
                              <tr key={inst.id} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                 {org.instructor_fields_config?.slice(0, 3).map((f, idx) => (
                                    <td key={f.id} style={{ padding: '1rem', borderRadius: idx === 0 ? '12px 0 0 12px' : '0' }}>{inst.custom_data?.[f.name] || '-'}</td>
                                 ))}
                                 <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>User: <strong>{inst.user_username || 'N/A'}</strong></div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>Default: Pass@{inst.registration_number}</div>
                                 </td>
                                 <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                                    <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }} onClick={() => {
                                       setEditingInstructor(inst);
                                       const taught = subjects.filter(s => s.instructors?.includes(inst.id)).map(s => s.id);
                                       setInstructorForm({ subjects: taught, classrooms: inst.classrooms || [], custom_data: inst.custom_data || {} });
                                       setShowAddInstructor(true);
                                    }}>Edit</button>
                                    <button onClick={async () => {
                                       if (!window.confirm("Revoke instructor access? This removes them from all subjects.")) return;
                                       await fetch(`${API_BASE_URL}/api/instructors/${inst.id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                       fetchItems();
                                    }} style={{ marginLeft: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Revoke</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     {instructors.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No instructors found.</p>}
                  </div>
               </div>
            )}

            {activeTab === 'profile' && org && (
               <div className="animate-fadeIn">
                  <div style={{ display: 'flex', gap: '2rem' }}>
                     {/* Profile Column */}
                     <div className="dashboard-card" style={{ flex: 1 }}>
                        <h3>Organization Information</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Basic details of your institution.</p>
                        <form style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', marginTop: '1.5rem' }}>
                           <div className="form-group"><label>Name</label><input value={org.name || ''} onChange={e => setOrg({ ...org, name: e.target.value })} /></div>
                           <div className="form-group"><label>Primary Contact</label><input value={org.contact_email || ''} onChange={e => setOrg({ ...org, contact_email: e.target.value })} /></div>
                           <div className="form-group"><label>Portal Access</label><div className={`badge ${org.has_portal_access ? 'badge-success' : 'badge-warning'}`} style={{ display: 'inline-block' }}>{org.has_portal_access ? 'ENABLED' : 'DISABLED'}</div></div>
                        </form>
                     </div>

                     {/* Settings Column */}
                     <div className="dashboard-card" style={{ flex: 1.5, border: '1px solid var(--primary-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                           <div className="badge badge-success" style={{ padding: '0.5rem' }}><i className="fas fa-clock"></i></div>
                           <h3>School Operations & Intervals</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem' }}>Configure global hours and define specific intervals/breaks.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                           <div className="form-group">
                              <label>School Starts At</label>
                              <input type="time" value={org.school_start_time || ''} onChange={async (e) => {
                                 const time = e.target.value.length === 5 ? e.target.value + ':00' : e.target.value;
                                 await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ school_start_time: time })
                                 });
                                 fetchItems();
                              }} />
                           </div>
                           <div className="form-group">
                              <label>School Ends At</label>
                              <input type="time" value={org.school_end_time || ''} onChange={async (e) => {
                                 const time = e.target.value.length === 5 ? e.target.value + ':00' : e.target.value;
                                 await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ school_end_time: time })
                                 });
                                 fetchItems();
                              }} />
                           </div>
                           <div className="form-group">
                              <label>Period Duration (min)</label>
                              <input type="number" value={org.period_duration_minutes || ''} onChange={async (e) => {
                                 await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ period_duration_minutes: parseInt(e.target.value) })
                                 });
                                 fetchItems();
                              }} />
                           </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                           <h4 style={{ marginBottom: '1rem' }}>Custom Breaks & Intervals</h4>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.8rem', background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                              <input placeholder="Break Name" value={newInterval.name} onChange={e => setNewInterval({ ...newInterval, name: e.target.value })} />
                              <input type="time" value={newInterval.start} onChange={e => setNewInterval({ ...newInterval, start: e.target.value })} />
                              <input type="time" value={newInterval.end} onChange={e => setNewInterval({ ...newInterval, end: e.target.value })} />
                              <button onClick={async () => {
                                 if (!newInterval.name || !newInterval.start || !newInterval.end) return;
                                 const updated = [...(org.custom_intervals || []), newInterval];
                                 await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ custom_intervals: updated })
                                 });
                                 setNewInterval({ name: '', start: '', end: '' });
                                 fetchItems();
                              }} className="btn-primary" style={{ padding: '0 1rem' }}><i className="fas fa-plus"></i></button>
                           </div>

                           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {(org.custom_intervals || []).map((inv, idx) => (
                                 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                       <div className="badge badge-warning" style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', padding: 0 }}><i className="fas fa-coffee"></i></div>
                                       <div>
                                          <div style={{ fontWeight: 'bold' }}>{inv.name}</div>
                                          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{inv.start} - {inv.end}</div>
                                       </div>
                                    </div>
                                    <button onClick={async () => {
                                       const updated = org.custom_intervals.filter((_, i) => i !== idx);
                                       await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ custom_intervals: updated })
                                       });
                                       fetchItems();
                                    }} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', opacity: 0.6 }}><i className="fas fa-trash-alt"></i></button>
                                 </div>
                              ))}
                              {(!org.custom_intervals || org.custom_intervals.length === 0) && (
                                 <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3, fontSize: '0.85rem' }}>No custom intervals defined.</div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {showAddStudent && (
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="nav-brand" style={{ fontSize: '1.8rem' }}>{editingStudent ? 'Edit Record' : 'New Record'}</h3>
                        <button onClick={() => { setShowAddStudent(false); setEditingStudent(null); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                     </div>
                     <form onSubmit={handleCreateOrUpdateStudent}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                           <label>Assigned Classroom</label>
                           <select required value={studentForm.classroom} onChange={e => setStudentForm({ ...studentForm, classroom: e.target.value })}>
                              <option value="">Select Classroom...</option>
                              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>

                        {org.student_fields_config?.length > 0 ? (
                           <div style={{ marginTop: '1rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                 {org.student_fields_config.map(field => (
                                    <div key={field.id} className="form-group">
                                       <label>{field.name}</label>
                                       {field.type === 'select' ? (
                                          <select required value={studentForm.custom_data[field.name] || ''} onChange={e => setStudentForm({ ...studentForm, custom_data: { ...studentForm.custom_data, [field.name]: e.target.value } })}>
                                             <option value="">Select Option</option>
                                             {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                          </select>
                                       ) : (
                                          <input
                                             required
                                             type={field.type === 'number' ? 'number' : (field.type === 'date' ? 'date' : (field.type === 'checkbox' ? 'checkbox' : 'text'))}
                                             value={studentForm.custom_data[field.name] || ''}
                                             onChange={e => setStudentForm({ ...studentForm, custom_data: { ...studentForm.custom_data, [field.name]: field.type === 'checkbox' ? e.target.checked : e.target.value } })}
                                          />
                                       )}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ) : (
                           <div style={{ textAlign: 'center', padding: '2rem' }}>
                              <p>No schema defined. please go to <strong>Schemas</strong> tab first.</p>
                           </div>
                        )}
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }} disabled={!org.student_fields_config?.length}>Create Profile</button>
                     </form>
                  </div>
               </div>
            )}

            {showAddInstructor && (
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '600px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="nav-brand" style={{ fontSize: '1.8rem' }}>{editingInstructor ? 'Edit Profile' : 'New Instructor'}</h3>
                        <button onClick={() => { setShowAddInstructor(false); setEditingInstructor(null); setInstructorForm({ subjects: [], classrooms: [], custom_data: {} }); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                     </div>
                     <form onSubmit={handleCreateOrUpdateInstructor}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                           <label>Responsibilities (Taught Subjects)</label>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                              {subjects.length > 0 ? (
                                 subjects.map(s => (
                                    <label key={s.id} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                       <input
                                          type="checkbox"
                                          checked={instructorForm.subjects.includes(s.id)}
                                          onChange={e => {
                                             const next = e.target.checked
                                                ? [...instructorForm.subjects, s.id]
                                                : instructorForm.subjects.filter(sid => sid !== s.id);
                                             setInstructorForm({ ...instructorForm, subjects: next });
                                          }}
                                       />
                                       {s.name} ({classrooms.find(c => c.id === s.classroom)?.name || 'N/A'})
                                    </label>
                                 ))
                              ) : (
                                 <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>No subjects defined in system yet.</p>
                              )}
                           </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                           <label>Classroom Association (Teacher Access)</label>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                              {classrooms.map(c => (
                                 <label key={c.id} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                       type="checkbox"
                                       checked={instructorForm.classrooms?.includes(c.id)}
                                       onChange={e => {
                                          const next = e.target.checked
                                             ? [...(instructorForm.classrooms || []), c.id]
                                             : (instructorForm.classrooms || []).filter(cid => cid !== c.id);
                                          setInstructorForm({ ...instructorForm, classrooms: next });
                                       }}
                                    />
                                    {c.name}
                                 </label>
                              ))}
                           </div>
                        </div>

                        {org.instructor_fields_config?.length > 0 ? (
                           <div style={{ marginTop: '1rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                 {org.instructor_fields_config.map(field => (
                                    <div key={field.id} className="form-group">
                                       <label>{field.name}</label>
                                       <input
                                          required
                                          type={field.type === 'number' ? 'number' : (field.type === 'date' ? 'date' : 'text')}
                                          value={instructorForm.custom_data[field.name] || ''}
                                          onChange={e => setInstructorForm({ ...instructorForm, custom_data: { ...instructorForm.custom_data, [field.name]: e.target.value } })}
                                       />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ) : (
                           <div style={{ textAlign: 'center', padding: '2rem' }}>
                              <p>No instructor schema defined.</p>
                           </div>
                        )}
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }} disabled={!org.instructor_fields_config?.length}>
                           {editingInstructor ? 'Update Profile' : 'Add Instructor'}
                        </button>
                     </form>
                  </div>
               </div>
            )}

            {viewingSubject && (
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '500px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="nav-brand" style={{ fontSize: '1.5rem' }}>Faculty Assignment</h3>
                        <button onClick={() => setViewingSubject(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                     </div>
                     <p style={{ marginBottom: '1.5rem', opacity: 0.7 }}>Manage teaching staff for <strong>{viewingSubject.name}</strong>.</p>

                     <div style={{ maxHeight: '400px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem' }}>
                        {instructors.length > 0 ? (
                           instructors.map(inst => {
                              const isAssigned = (viewingSubject.instructors || []).includes(inst.id);
                              return (
                                 <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                       <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isAssigned ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                          <i className={`fas fa-${isAssigned ? 'check' : 'user'}`}></i>
                                       </div>
                                       <div>
                                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{Object.values(inst.custom_data || {})[0] || inst.registration_number}</div>
                                          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{inst.designation || 'Faculty Member'}</div>
                                       </div>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={async () => {
                                          const next = isAssigned
                                             ? viewingSubject.instructors.filter(id => id !== inst.id)
                                             : [...(viewingSubject.instructors || []), inst.id];

                                          const res = await fetch(`${API_BASE_URL}/api/subjects/${viewingSubject.id}/`, {
                                             method: 'PATCH',
                                             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                             body: JSON.stringify({ instructors: next })
                                          });
                                          if (res.ok) {
                                             const updated = await res.json();
                                             setViewingSubject(updated);
                                             fetchItems();
                                          }
                                       }}
                                       className={isAssigned ? "btn-logout" : "btn-primary"}
                                       style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                    >
                                       {isAssigned ? 'Remove' : 'Assign'}
                                    </button>
                                 </div>
                              );
                           })
                        ) : (
                           <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No staff records found.</div>
                        )}
                     </div>
                     <button onClick={() => setViewingSubject(null)} className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>Close Panel</button>
                  </div>
               </div>
            )}
        </div>
      </div>
    );
}

function DailyMonitoringView({ token }) {
      const [classrooms, setClassrooms] = useState([]);
      const [selectedClassId, setSelectedClassId] = useState('');
      const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

      useEffect(() => {
         fetch(`${API_BASE_URL}/api/classrooms/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(setClassrooms);
      }, [token]);

      return (
         <div className="animate-fadeIn">
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Daily <span className="nav-brand" style={{ fontSize: '2rem' }}>Monitoring</span></h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }} className="grid-mobile-stack">
               <div className="form-group" style={{ flex: 1 }}>
                  <label>Select Classroom</label>
                  <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                     <option value="">Choose Class...</option>
                     {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="form-group">
                  <label>Select Date</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
               </div>
            </div>
            {selectedClassId ? (
               <DailyTaskCalendar token={token} classroomId={selectedClassId} date={selectedDate} role="MANAGER" />
            ) : (
               <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                  <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                  <h3>Select a classroom to start monitoring activities</h3>
               </div>
            )}
         </div>
      );
   }

   function DailyTaskCalendar({ token, classroomId, date, role }) {
      const [tasks, setTasks] = useState([]);
      const [students, setStudents] = useState([]);
      const [showAddTask, setShowAddTask] = useState(false);
      const [subjects, setSubjects] = useState([]);
      const [newTask, setNewTask] = useState({ topic: '', category: 'HW', subject: '', deadline: '', description: '' });

      const fetchTasks = () => {
         fetch(`${API_BASE_URL}/api/daily_tasks/?classroom=${classroomId}&date=${date}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(setTasks);
      };

      useEffect(() => {
         if (classroomId) {
            fetchTasks();
            fetch(`${API_BASE_URL}/api/students/?classroom=${classroomId}`, { headers: { 'Authorization': `Bearer ${token}` } })
               .then(res => res.json()).then(setStudents);
            fetch(`${API_BASE_URL}/api/subjects/?classroom=${classroomId}`, { headers: { 'Authorization': `Bearer ${token}` } })
               .then(res => res.json()).then(setSubjects);
         }
      }, [classroomId, date, token]);

      const handleAddTask = async (e) => {
         e.preventDefault();
         const res = await fetch(`${API_BASE_URL}/api/daily_tasks/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
               ...newTask, 
               deadline: newTask.deadline || null,
               classroom: classroomId, 
               date: date 
            })
         });
         if (res.ok) {
            setShowAddTask(false);
            setNewTask({ topic: '', category: 'HW', subject: '', deadline: '', description: '' });
            fetchTasks();
         } else {
            const errDetails = await res.json();
            console.error("Task Creation Error:", errDetails);
            alert("Failed to create task: " + (errDetails.deadline?.[0] || errDetails.subject?.[0] || JSON.stringify(errDetails)));
         }
      };

      return (
         <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="grid-mobile-stack">
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Tasks for {new Date(date).toLocaleDateString()}</h3>
                  {role === 'INSTRUCTOR' && <button className="btn-primary" onClick={() => setShowAddTask(true)}>New Slot</button>}
               </div>
               <div className="dashboard-card" style={{ border: '1px solid var(--border-color)', minHeight: '400px' }}>
                  {tasks.length > 0 ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map(t => (
                           <div key={t.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${t.category === 'HW' ? '#FACC15' : (t.category === 'CW' ? '#60A5FA' : '#C084FC')}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                 <span className="badge" style={{ fontSize: '0.7rem' }}>{t.category_display}</span>
                                 <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{t.subject_name}</span>
                              </div>
                              <h4 style={{ margin: '0 0 0.5rem 0' }}>{t.topic}</h4>
                              {t.description && <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>{t.description}</p>}
                              {t.deadline && <div style={{ fontSize: '0.75rem', color: '#EF4444' }}>Deadline: {new Date(t.deadline).toLocaleString()}</div>}
                              <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', opacity: 0.4 }}>Created by: {t.instructor_name}</div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>No tasks scheduled for this day.</div>
                  )}
               </div>
            </div>

            <div>
               <h3>Students ({students.length})</h3>
               <div className="dashboard-card" style={{ border: '1px solid var(--border-color)', padding: '1rem' }}>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                     {students.map(s => (
                        <div key={s.id} style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                              {s.first_name?.[0] || 'S'}
                           </div>
                           <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{s.first_name} {s.last_name || ''}</div>
                              <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Reg: {s.registration_number}</div>
                           </div>
                        </div>
                     ))}
                     {students.length === 0 && <p style={{ textAlign: 'center', opacity: 0.3, padding: '2rem' }}>No students in this class.</p>}
                  </div>
               </div>
            </div>

            {showAddTask && (
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '500px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="nav-brand" style={{ fontSize: '1.5rem' }}>Add New Slot</h3>
                        <button onClick={() => setShowAddTask(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                     </div>
                     <form onSubmit={handleAddTask}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                           <label>Subject</label>
                           <select required value={newTask.subject} onChange={e => setNewTask({ ...newTask, subject: e.target.value })}>
                              <option value="">Select Subject...</option>
                              {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                           </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                           <label>Topic</label>
                           <input required value={newTask.topic} onChange={e => setNewTask({ ...newTask, topic: e.target.value })} placeholder="e.g. Algebra Fundamentals" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                           <div className="form-group">
                              <label>Category</label>
                              <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })}>
                                 <option value="CW">Classwork</option>
                                 <option value="HW">Homework</option>
                                 <option value="PROJECT">Project</option>
                                 <option value="ASSIGNMENT">Assignment</option>
                              </select>
                           </div>
                           <div className="form-group">
                              <label>Deadline (Optional)</label>
                              <input type="datetime-local" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                           </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                           <label>Description</label>
                           <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows="3"></textarea>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Publish to Students</button>
                     </form>
                  </div>
               </div>
            )}
         </div>
      );
   }

   function InstructorDashboard({ token, logout }) {
      const [classrooms, setClassrooms] = useState([]);
      const [selectedClassId, setSelectedClassId] = useState('');
      const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

      useEffect(() => {
         fetch(`${API_BASE_URL}/api/classrooms/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(setClassrooms);
      }, [token]);

      return (
         <div className="dashboard animate-fadeIn">
            <h2 style={{ fontSize: '2.25rem' }}>Instructor <span className="nav-brand" style={{ fontSize: '2.25rem' }}>Portal</span></h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Access your classrooms, manage students, and schedule daily tasks.</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }} className="grid-mobile-stack">
               <div className="form-group" style={{ flex: 1 }}>
                  <label>Current Classroom</label>
                  <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                     <option value="">Select Classroom...</option>
                     {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="form-group">
                  <label>Working Date</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
               </div>
            </div>

            {selectedClassId ? (
               <DailyTaskCalendar token={token} classroomId={selectedClassId} date={selectedDate} role="INSTRUCTOR" />
            ) : (
               <div className="animate-fadeIn">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                     {classrooms.map(c => (
                        <div key={c.id} className="dashboard-card" style={{ cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.3s ease', padding: '1.25rem' }} onClick={() => setSelectedClassId(c.id)}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(192,132,252,0.1)', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                 <i className="fas fa-school"></i>
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                 <h3 style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h3>
                                 <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', opacity: 0.6 }}>Tap to manage</p>
                              </div>
                           </div>
                        </div>
                     ))}
                     {classrooms.length === 0 && (
                        <div className="dashboard-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', opacity: 0.5 }}>
                           <i className="fas fa-chalkboard-teacher" style={{ fontSize: '4rem', marginBottom: '2rem' }}></i>
                           <h3>No assigned classrooms found.</h3>
                           <p>Please contact your manager to ensure you are linked to classrooms or subjects.</p>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      );
   }

   function StudentDashboard({ token, logout }) {
      const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
      const [studentProfile, setStudentProfile] = useState(null);

      useEffect(() => {
         fetch(`${API_BASE_URL}/api/students/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => data && data[0] && setStudentProfile(data[0]));
      }, [token]);

      return (
         <div className="dashboard animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <div>
                  <h2 style={{ fontSize: '2.25rem' }}>Student <span className="nav-brand" style={{ fontSize: '2.25rem' }}>Learning Hub</span></h2>
                  {studentProfile && <p style={{ opacity: 0.7 }}>Welcome, {studentProfile.first_name}! Access your daily schedule and materials for <strong>{studentProfile.classroom_name}</strong>.</p>}
               </div>
               <div className="form-group">
                  <label>Filter Date</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)' }} />
               </div>
            </div>

            {studentProfile?.classroom ? (
               <DailyTaskCalendar token={token} classroomId={studentProfile.classroom} date={selectedDate} role="STUDENT" />
            ) : (
               <div className="dashboard-card" style={{ textAlign: 'center', padding: '6rem', opacity: 0.5 }}>
                  <i className="fas fa-lock" style={{ fontSize: '4rem', marginBottom: '2rem' }}></i>
                  <h3>No classroom assigned yet.</h3>
                  <p>Please contact your institution manager to link your profile to a classroom.</p>
               </div>
            )}
         </div>
      );
   }

   export default App;