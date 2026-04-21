import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
   const [token, setToken] = useState(localStorage.getItem('access_token'));
   const [role, setRole] = useState(localStorage.getItem('role'));
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
         // Allow root path (Landing Page), login, and signup without token
         const publicPaths = ['/', '/login', '/signup'];
         if (!publicPaths.includes(window.location.pathname)) {
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

   const isLanding = window.location.pathname === '/';

   return (
      <div className="app-container">
         {!token && isLanding && (
            <nav className="land-nav" style={{
               position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
               padding: '18px 60px', background: 'rgba(13,15,20,0.85)',
               backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
               <div className="logo-mark" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
                     <rect width="40" height="40" rx="10" fill="#F5A623"/>
                     <path d="M8 28L14 14L20 22L26 12L32 28" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                     <circle cx="20" cy="22" r="3" fill="#0D0F14"/>
                     <path d="M8 32H32" stroke="#0D0F14" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  </svg>
                  <span className="logo-text" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.5px' }}>
                     upgrade<span style={{ color: 'var(--amber)' }}>fied</span>
                  </span>
               </div>
               <div className="nav-links">
                  <Link to="/login" style={{ color: 'var(--soft)', textDecoration: 'none', fontSize: '15px' }}>Login</Link>
                  <Link to="/signup" className="btn-primary" style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'var(--amber)', color: '#0D0F14', fontWeight: 700, textDecoration: 'none' }}>Get Started</Link>
               </div>
            </nav>
         )}

         {token && (
            <nav className="navbar" style={{ background: 'var(--ink2)', borderBottom: '1px solid var(--rim)' }}>
               <div className="logo-mark" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => navigate('/')}>
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '30px', height: '30px' }}>
                     <rect width="40" height="40" rx="10" fill="#F5A623"/>
                     <path d="M8 28L14 14L20 22L26 12L32 28" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="logo-text" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--white)' }}>
                     upgrade<span style={{ color: 'var(--amber)' }}>fied</span>
                  </span>
               </div>
               <div className={`nav-links ${mobileMenuOpen ? 'mobile-show' : ''}`}>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={window.location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="btn-logout">
                     <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
               </div>
               {role !== 'MANAGER' && (
                  <button className="navbar-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                     <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                  </button>
               )}
            </nav>
         )}

         <main className={isLanding ? "landing-main" : "main-content"}>
            <Routes>
               <Route path="/" element={<LandingPage />} />
               <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
               <Route path="/signup" element={<Signup />} />
               <Route path="/dashboard" element={token ? <Dashboard role={role} token={token} logout={logout} /> : <Login setToken={setToken} setRole={setRole} />} />
               <Route path="*" element={<NotFound />} />
            </Routes>
         </main>
      </div>
   );
}


function NotFound() {
   const navigate = useNavigate();
   return (
      <div className="not-found-container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
         <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card"
            style={{ maxWidth: '600px', margin: '0 auto', padding: '5rem' }}
         >
            <h1 style={{ fontSize: '8rem', margin: 0, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--white)' }}>Page Lost in Orbit</h2>
            <p style={{ color: 'var(--soft)', marginBottom: '3rem', fontSize: '1.2rem' }}>
               The page you are looking for doesn't exist or has been moved to another dimension.
            </p>
            <button className="btn-primary" onClick={() => navigate('/')}>Return to Base</button>
         </motion.div>
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
            navigate('/dashboard');
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
   if (role === 'PARENT') return <ParentDashboard token={token} logout={logout} />;
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
               <h2 style={{ fontSize: '2.25rem', color: 'var(--white)' }}>Licensing & Account <span style={{ color: 'var(--amber)' }}>Control</span></h2>
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
            <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
               <div className="dashboard-card animate-slideUp" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--primary-color)' }}>
                  <h3>Organization Analysis: {selected.name}</h3>
                  <p style={{ opacity: 0.7 }}>Structural integrity and licensing metadata.</p>
                  <hr style={{ opacity: 0.1, margin: '1rem 0' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-mobile-stack">
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


const SidebarLink = ({ active, onClick, icon, label }) => (
   <button
      onClick={onClick}
      style={{
         display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px',
         color: active ? 'var(--amber)' : 'var(--soft)', background: active ? 'var(--amber-glow)' : 'transparent',
         border: active ? '1px solid var(--amber-rim)' : '1px solid transparent',
         textDecoration: 'none', fontSize: '14px', marginBottom: '2px', transition: 'all 0.2s',
         width: '100%', cursor: 'pointer', textAlign: 'left'
      }}
   >
      <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{icon}</span>
      {label}
   </button>
);

const MetricCard = ({ label, value, change, up, color, status }) => (
   <div className="metric-card" style={{ background: 'var(--ink2)', border: '1px solid var(--rim)', borderRadius: '14px', padding: '22px', position: 'relative', overflow: 'hidden' }}>
      <div className="metric-label" style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{label}</div>
      <div className="metric-value" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: status ? '22px' : '36px', fontWeight: 800, color: 'var(--white)', lineHeight: 1, marginBottom: '6px' }}>
         {status ? <span className={`status-badge sb-active`} style={{ fontSize: '12px', verticalAlign: 'middle' }}>● {value}</span> : value}
      </div>
      <div style={{ fontSize: '12px', color: up ? 'var(--teal)' : 'var(--soft)' }}>{change}</div>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', borderRadius: '50%', opacity: 0.08, background: `var(--${color})`, transform: 'translate(20%, -20%)' }}></div>
   </div>
);

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
   const [classDetails, setClassDetails] = useState({ subjects: [], students: [], timetable: [], sessions: [], homework: [], dailyTasks: [] });
   const [newSubject, setNewSubject] = useState({ name: '', id: '', instructors: [] });
   const [viewingSubject, setViewingSubject] = useState(null);
   const [courseSearch, setCourseSearch] = useState('');
   const [classroomSearch, setClassroomSearch] = useState('');
   const [studentSearch, setStudentSearch] = useState('');
   const [instructorSearch, setInstructorSearch] = useState('');
   const [newInterval, setNewInterval] = useState({ name: '', start: '', end: '' });
   const [showTimetable, setShowTimetable] = useState(false);
   const [monitoringDate, setMonitoringDate] = useState(new Date().toISOString().split('T')[0]);
   const [selectedScheduleDay, setSelectedScheduleDay] = useState(0); // 0 = Mon

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
      const [subRes, stuRes, ttRes, sesRes, hwRes, taskRes] = await Promise.all([
         fetch(`${API_BASE_URL}/api/subjects/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/students/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/timetables/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/sessions/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/homeworks/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
         fetch(`${API_BASE_URL}/api/daily_tasks/?classroom=${cid}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      ]);
      setClassDetails({ subjects: subRes, students: stuRes, timetable: ttRes, sessions: sesRes, homework: hwRes, dailyTasks: taskRes });
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

      const periodDuration = parseInt(org.period_duration_minutes) || 45;
      if (periodDuration <= 0) return [];

      let pNum = 1;
      let guard = 0;
      while (currentMins < endMins && guard < 100) {
         guard++;
         const h = Math.floor(currentMins / 60);
         const m = currentMins % 60;
         const currentTimeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
         
         // Search for ANY custom interval that starts at or BEFORE current time and ends AFTER
         const activeCI = custom.find(ci => ci.startMins <= currentMins && ci.endMins > currentMins);

         if (activeCI) {
            slots.push({ type: 'BREAK', label: activeCI.name.toUpperCase(), start: activeCI.start + ':00', end: activeCI.end + ':00' });
            currentMins = activeCI.endMins;
         } else {
            const sStr = currentTimeStr + ':00';
            const periodEnd = currentMins + periodDuration;
            
            // If the next period would overlap with the start of a custom interval, shorten it or skip?
            // Usually, we just skip to the next available slot if a break is coming up.
            const nextCI = custom.find(ci => ci.startMins > currentMins && ci.startMins < periodEnd);
            
            if (nextCI) {
               // We hit a break before the period could finish. Move current time to break start.
               currentMins = nextCI.startMins;
               continue; 
            }

            if (periodEnd > endMins) break;
            
            const eStr = `${String(Math.floor(periodEnd / 60)).padStart(2, '0')}:${String(periodEnd % 60).padStart(2, '0')}:00`;
            slots.push({ type: 'PERIOD', label: `P${pNum++}`, start: sStr, end: eStr });
            currentMins = periodEnd;

            // Auto-break logic for simple setups
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
      <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--ink)' }}>
         {/* Sidebar Overlay */}
         <div className={`sidebar-overlay ${showMobileMenu ? 'visible' : ''}`} onClick={() => setShowMobileMenu(false)} />
         
         {/* SIDEBAR */}
         <aside className={`sidebar ${showMobileMenu ? 'mobile-open' : ''}`} style={{ width: '260px', background: 'var(--ink2)', borderRight: '1px solid var(--rim)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 100 }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--rim)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
                    <rect width="40" height="40" rx="10" fill="#F5A623"/>
                    <path d="M8 28L14 14L20 22L26 12L32 28" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="logo-text" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.5px' }}>
                     upgrade<span style={{ color: 'var(--amber)' }}>fied</span>
                  </span>
               </div>
               
               {org && (
                  <div style={{ marginTop: '16px' }}>
                     <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--white)' }}>{org.name}</div>
                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--amber-glow)', border: '1px solid var(--amber-rim)', borderRadius: '20px', padding: '3px 10px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 700 }}>{org.subscription_plan} · {daysLeft} days left</span>
                     </div>
                  </div>
               )}
            </div>

            <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', margin: '20px 0 8px' }}>Essential</div>
                <SidebarLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<i className="fas fa-home"></i>} label="Dashboard" />
                <SidebarLink active={activeTab === 'renew'} onClick={() => setActiveTab('renew')} icon={<i className="fas fa-key"></i>} label="Renew License" />
                
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', margin: '20px 0 8px' }}>Academics</div>
                <SidebarLink active={activeTab === 'master'} onClick={() => setActiveTab('master')} icon={<i className="fas fa-calendar-alt"></i>} label="Master Schedule" />
                <SidebarLink active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<i className="fas fa-book"></i>} label="Course Bank" />
                <SidebarLink active={activeTab === 'classrooms'} onClick={() => setActiveTab('classrooms')} icon={<i className="fas fa-school"></i>} label="Classrooms Hub" />
                
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', margin: '20px 0 8px' }}>People</div>
                <SidebarLink active={activeTab === 'instructors'} onClick={() => setActiveTab('instructors')} icon={<i className="fas fa-chalkboard-teacher"></i>} label="Staff Roster" />
                <SidebarLink active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<i className="fas fa-user-graduate"></i>} label="Student Body" />
                <SidebarLink active={activeTab === 'schemas'} onClick={() => setActiveTab('schemas')} icon={<i className="fas fa-database"></i>} label="Model Designer" />
                
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', margin: '20px 0 8px' }}>Operations</div>
                <SidebarLink active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} icon={<i className="fas fa-chart-line"></i>} label="Daily Monitoring" />
                <SidebarLink active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<i className="fas fa-paper-plane"></i>} label="Parent Reports" />
                <SidebarLink active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<i className="fas fa-cog"></i>} label="Settings" />
             </nav>

            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--rim)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0D0F14' }}>AD</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>Admin</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>School Owner</div>
                  </div>
               </div>
            </div>
         </aside>

         {/* MAIN CONTENT AREA */}
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--ink)' }}>
               {/* MAIN HEADER */}
               <header style={{ padding: '24px 36px', borderBottom: '1px solid var(--rim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ink2)', position: 'sticky', top: 0, zIndex: 10 }}>
                  <div>
                     <div style={{ fontSize: '14px', color: 'var(--muted)' }}>School Management</div>
                     <h1 style={{ color: 'var(--white)', fontSize: '18px', margin: 0 }}>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div className="icon-btn-wrap" title="Pending Student Requests">
                        <div className="icon-btn"><i className="fas fa-bell"></i></div>
                        {students.filter(s => !s.is_active).length > 0 && (
                           <div className="notif-count">{students.filter(s => !s.is_active).length}</div>
                        )}
                     </div>
                     <div className="icon-btn">🔍</div>
                     <button className="btn-sm btn-sm-amber" onClick={() => { setActiveTab('students'); setShowAddStudent(true); }}>+ Add Student</button>
                  </div>
               </header>

               {/* DASHBOARD BODY */}
               <main style={{ padding: '32px 36px' }}>
                  {activeTab === 'overview' && org && (
                     <div className="fade-in">
                        {/* METRICS ROW */}
                        <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                           <MetricCard label="Total Students" value={students.length} change={`${students.filter(s => s.is_active).length} active`} up color="amber" />
                           <MetricCard label="Staff Members" value={instructors.length} change="Faculty roster" up color="teal" />
                           <MetricCard label="Active Classes" value={classrooms.length} change="Total classrooms" color="rose" />
                           <MetricCard label="Portal Status" value={org.has_portal_access ? "LIVE" : "PENDING"} status color="violet" />
                        </div>

                        {/* DOUBLE COL GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                           
                           {/* RECENT STUDENTS */}
                           <div className="section-card">
                              <div className="sc-header">
                                 <div>
                                    <h3 className="sc-title">Recent Students</h3>
                                    <p className="sc-subtitle">Latest enrollments</p>
                                 </div>
                                 <button className="btn-sm" onClick={() => setActiveTab('students')}>View All</button>
                              </div>
                              <table className="data-table">
                                 <thead>
                                    <tr>
                                       <th>Student</th>
                                       <th>Class</th>
                                       <th>Roll</th>
                                       <th>Status</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {students.slice(0, 5).map((s, i) => (
                                       <tr key={i}>
                                          <td>
                                             <div className="avatar-cell">
                                                <div className="av" style={{ background: i % 2 === 0 ? 'var(--amber-glow)' : 'var(--teal-glow)', color: i % 2 === 0 ? 'var(--amber)' : 'var(--teal)' }}>
                                                   {Object.values(s.custom_data || {})[0]?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                   <div className="av-name">{Object.values(s.custom_data || {})[0]}</div>
                                                   <div className="av-email">{s.classroom_name}</div>
                                                </div>
                                             </div>
                                          </td>
                                          <td>{s.classroom_name?.split('-')[0] || 'Grade 10'}</td>
                                          <td>{s.registration_number}</td>
                                          <td><span className={`status-badge ${s.is_active ? 'sb-active' : 'sb-pending'}`}>{s.is_active ? 'Active' : 'Pending'}</span></td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>

                           {/* TODAY SUMMARY */}
                           <div className="section-card" style={{ padding: '24px' }}>
                              <h3 className="sc-title">Today's Activity</h3>
                              <p className="sc-subtitle" style={{ marginBottom: '24px' }}>
                                 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                              </p>
                              
                              <div style={{ marginBottom: '24px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                    <span>Portal Enrollment</span>
                                    <span style={{ color: 'var(--white)' }}>{Math.round((students.filter(s => s.is_active).length / (students.length || 1)) * 100)}%</span>
                                 </div>
                                 <div className="progress-bar-wrap">
                                    <div className="progress-bar pb-teal" style={{ width: `${(students.filter(s => s.is_active).length / (students.length || 1)) * 100}%` }}></div>
                                 </div>
                              </div>

                              <div style={{ marginBottom: '24px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                    <span>Classes Assigned</span>
                                    <span style={{ color: 'var(--white)' }}>{subjects.filter(s => s.classroom).length} / {subjects.length}</span>
                                 </div>
                                 <div className="progress-bar-wrap">
                                    <div className="progress-bar pb-amber" style={{ width: `${(subjects.filter(s => s.classroom).length / (subjects.length || 1)) * 100}%` }}></div>
                                 </div>
                              </div>

                              <div style={{ marginBottom: '24px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                    <span>Faculty Allocation</span>
                                    <span style={{ color: 'var(--white)' }}>{instructors.length > 0 ? 'Optimal' : 'Low'}</span>
                                 </div>
                                 <div className="progress-bar-wrap">
                                    <div className="progress-bar pb-violet" style={{ width: instructors.length > 0 ? '100%' : '10%' }}></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'renew' && org && (
                     <div className="fade-in">
                        <div className="section-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
                           <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔑</div>
                           <h2 className="sc-title" style={{ fontSize: '24px', marginBottom: '10px' }}>License Activation</h2>
                           <p className="sc-subtitle" style={{ marginBottom: '30px' }}>Enter your 16-character institutional deployment key to activate or extend your portal access.</p>
                           
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                              <input 
                                 value={tempLicense} 
                                 onChange={e => setTempLicense(e.target.value)} 
                                 placeholder="XXXX-XXXX-XXXX-XXXX" 
                                 style={{ width: '100%', textAlign: 'center', fontSize: '18px', letterSpacing: '2px', fontFamily: 'monospace', padding: '15px' }} 
                              />
                              <button 
                                 className="btn-primary" 
                                 style={{ width: '100%', padding: '15px', fontWeight: 800 }} 
                                 onClick={applyLicense}
                              >
                                 Activate Portal Now
                              </button>
                           </div>
                           
                           <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                              <p>Current Status: <span style={{ color: org.has_portal_access ? 'var(--teal)' : 'var(--amber)', fontWeight: 700 }}>{org.has_portal_access ? 'ACTIVE' : 'EXPIRED / LIMITED'}</span></p>
                              {daysLeft && <p style={{ marginTop: '5px' }}>Expires in: {daysLeft} days</p>}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* CATCH-ALL FOR UPGRADING MODULES */}
                  {activeTab !== 'overview' && activeTab !== 'monitoring' && activeTab !== 'master' && 
                   activeTab !== 'subjects' && activeTab !== 'classrooms' && activeTab !== 'instructors' && 
                   activeTab !== 'students' && activeTab !== 'schemas' && activeTab !== 'renew' && (
                     <div className="fade-in">
                        {/* Tab content placeholder for other tabs */}
                        <div style={{ background: 'var(--ink2)', border: '1px solid var(--rim)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                           <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛠️</div>
                           <h3 style={{ color: 'var(--white)' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                           <p style={{ color: 'var(--soft)' }}>The full UI for this module is being upgraded. Functional components remain active below.</p>
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

                     <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                           <button 
                              key={d} 
                              onClick={() => setSelectedScheduleDay(i)}
                              className="badge" 
                              style={{ 
                                 background: selectedScheduleDay === i ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)', 
                                 border: '1px solid rgba(255,255,255,0.1)', 
                                 cursor: 'pointer',
                                 color: selectedScheduleDay === i ? 'white' : 'inherit'
                              }}
                           >
                              {d}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="dashboard-card" style={{ padding: '0', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '24px', overflow: 'hidden', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
                     {/* Sticky Deployment Bank - Local to this container */}
                     <div style={{ position: 'sticky', top: '0', zIndex: 100, background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                           <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4, letterSpacing: '1px', whiteSpace: 'nowrap' }}>FACULTY BANK:</span>
                           <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                              {subjects.flatMap(s => (s.instructors || []).map(iid => ({ s, iid }))).map(({ s, iid }) => {
                                 const teacher = instructors.find(i => i.id === iid);
                                 const tName = teacher ? (Object.values(teacher.custom_data || {})[0] || teacher.registration_number) : '??';
                                 return (
                                    <div 
                                       key={`${s.id}-${iid}`} 
                                       draggable 
                                       onDragStart={(e) => {
                                          e.dataTransfer.setData('subjectId', s.id);
                                          e.dataTransfer.setData('instructorId', iid);
                                       }} 
                                       style={{ padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg, var(--primary-color), #0D9488)', fontSize: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'grab', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}
                                    >
                                       <i className="fas fa-grip-lines-vertical" style={{ opacity: 0.4 }}></i>
                                       {s.name} <span style={{ opacity: 0.6, fontWeight: 400 }}>| {tName}</span>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </div>

                     <div style={{ overflow: 'auto', flex: 1, width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${classrooms.length}, minmax(180px, 1fr))`, gap: '1px', background: 'rgba(255,255,255,0.05)', width: 'max-content', minWidth: '100%' }}>
                           <div style={{ padding: '1rem', background: 'var(--background-card)', fontWeight: 900, color: 'var(--primary-color)', fontSize: '0.7rem', letterSpacing: '1px', position: 'sticky', top: 0, left: 0, zIndex: 20 }}>TIME SLOTS</div>
                           {classrooms.map(c => (
                              <div key={c.id} style={{ padding: '1rem', background: 'var(--background-card)', textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid rgba(192,132,252,0.3)', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                                 {c.name}
                              </div>
                           ))}

                           {generateSlots().map((slot, sIdx) => {
                              const isBreak = slot.type === 'BREAK';
                              return (
                                 <React.Fragment key={sIdx}>
                                    <div style={{ padding: '1rem', background: isBreak ? 'linear-gradient(to right, #1a1528, #080c14)' : 'var(--background-card)', borderRight: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'sticky', left: 0, zIndex: 5 }}>
                                       <div style={{ fontSize: '0.8rem', fontWeight: 900, color: isBreak ? 'var(--primary-color)' : 'white' }}>{slot.label}</div>
                                       <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{slot.start.slice(0, 5)} - {slot.end.slice(0, 5)}</div>
                                    </div>
                                    {classrooms.map(c => {
                                       const entry = allTimetables.find(t => t.day_of_week === selectedScheduleDay && t.start_time === slot.start && subjects.find(sub => sub.id === t.subject)?.classroom === c.id);
                                       const subj = entry ? subjects.find(s => s.id === entry.subject) : null;
                                       const teacherName = entry?.instructor_name || 'No Faculty';

                                       return (
                                          <div
                                             key={c.id}
                                             onDragOver={e => e.preventDefault()}
                                             onDrop={async (e) => {
                                                const sid = e.dataTransfer.getData('subjectId');
                                                const iid = e.dataTransfer.getData('instructorId');
                                                const res = await fetch(`${API_BASE_URL}/api/timetables/`, {
                                                   method: 'POST',
                                                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                   body: JSON.stringify({ organization: org.id, subject: sid, instructor: iid, day_of_week: selectedScheduleDay, start_time: slot.start, end_time: slot.end })
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
                                                      <div style={{ fontSize: '0.75rem', opacity: 0.7, fontStyle: 'italic' }}>{teacherName}</div>
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

                  <div className="dashboard-card" style={{ padding: '0' }}>
                     <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <table className="responsive-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                           <thead><tr style={{ opacity: 0.5 }}><th style={{ padding: '0 1.2rem' }}>Course Name</th><th style={{ padding: '0 1.2rem' }}>Target Unit</th><th style={{ padding: '0 1.2rem' }}>Faculty Lead</th><th style={{ textAlign: 'right', padding: '0 1.2rem' }}>Admin</th></tr></thead>
                           <tbody>
                              {subjects.filter(s => s.name.toLowerCase().includes(courseSearch.toLowerCase())).map(s => (
                                 <tr key={s.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <td style={{ padding: '1.2rem' }} data-label="Course Name">{s.name}</td>
                                    <td style={{ padding: '1.2rem' }} data-label="Target Unit">
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
                                    <td style={{ padding: '1.2rem' }} data-label="Faculty Lead">
                                       <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                          <div style={{ fontSize: '0.8rem', opacity: 0.7, flex: 1 }}>
                                             {s.instructor_names || 'No Faculty Assigned'}
                                          </div>
                                          <button onClick={() => setViewingSubject(s)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>View & Manage Staff</button>
                                       </div>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '1.2rem', borderRadius: '0 12px 12px 0' }} data-label="Admin">
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <button onClick={() => { setSelectedClassId(null); setShowTimetable(false); }} className="btn-logout" style={{ padding: '0.4rem 0.8rem' }}><i className="fas fa-chevron-left"></i></button>
                              <h2 style={{ margin: 0 }}>{classrooms.find(c => c.id === selectedClassId)?.name} <span className="nav-brand" style={{ fontSize: '1rem', marginLeft: '1rem' }}>Institutional Hub</span></h2>
                           </div>
                           <button 
                              onClick={() => setShowTimetable(!showTimetable)} 
                              className={showTimetable ? "btn-primary" : "btn-secondary"}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                           >
                              <i className={showTimetable ? "fas fa-times" : "fas fa-calendar-alt"}></i>
                              {showTimetable ? "Close Schedule" : "View Time Table"}
                           </button>
                        </div>

                        {showTimetable && (
                           <motion.div 
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="dashboard-card" 
                              style={{ marginBottom: '2rem', padding: '0', border: '1px solid var(--primary-color)' }}
                           >
                              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                 <h4 style={{ margin: 0 }}>Class Weekly Schedule (Read Only)</h4>
                                 <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Instructors listed per slot</span>
                              </div>
                              <div style={{ padding: '1.5rem', maxHeight: '450px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 12px 12px' }}>
                                 <TimetableView compact={true} key={allTimetables.length} token={token} type="CLASSROOM" id={selectedClassId} />
                              </div>
                           </motion.div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 3fr', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                           {/* Left Column: People & Metadata */}
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <div className="dashboard-card">
                                 <h4>Subjects & Instructors</h4>
                                 <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '1rem' }}>Active courses assigned from the subject bank.</p>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {classDetails.subjects.map(s => (
                                       <div
                                          key={s.id}
                                          style={{ padding: '0.8rem', background: 'var(--primary-color)', opacity: 0.8, borderRadius: '8px' }}
                                       >
                                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.name}</div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Staff: {s.instructor_names || 'None'}</div>
                                       </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                       <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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

                           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                               <div className="dashboard-card" style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="grid-mobile-stack">
                                     <div>
                                        <h4 style={{ margin: 0 }}>Daily Monitoring</h4>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Insights for the selected period</p>
                                     </div>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <input 
                                           type="date" 
                                           value={monitoringDate} 
                                           onChange={e => setMonitoringDate(e.target.value)} 
                                           style={{ fontSize: '0.8rem', padding: '0.4rem', borderRadius: '6px', width: 'auto' }}
                                        />
                                        <div className="badge">LIVE</div>
                                     </div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                     {/* Session Logs for Date */}
                                     <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)', padding: '1.2rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.5rem' }}>SESSIONS LOGGED ({monitoringDate})</div>
                                        {classDetails.sessions.filter(s => s.date === monitoringDate).length > 0 ? (
                                           classDetails.sessions.filter(s => s.date === monitoringDate).map(session => (
                                              <div key={session.id} style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                 <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{session.summary}</div>
                                                 <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.2rem' }}>
                                                    {classDetails.subjects.find(sub => sub.id === session.subject)?.name || 'General'}
                                                 </div>
                                              </div>
                                           ))
                                        ) : (
                                           <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>No sessions recorded for this date.</div>
                                        )}
                                     </div>

                                     {/* Daily Tasks / Work for Date */}
                                     <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', padding: '1.2rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>CLASSWORK & ASSIGNMENTS</div>
                                        {classDetails.dailyTasks && classDetails.dailyTasks.filter(t => t.date === monitoringDate).length > 0 ? (
                                           classDetails.dailyTasks.filter(t => t.date === monitoringDate).map(task => (
                                              <div key={task.id} style={{ marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                       <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', marginRight: '0.5rem' }}>{task.category_display}</span>
                                                       <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{task.topic}</span>
                                                    </div>
                                                 </div>
                                                 <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.4rem' }}>{task.description}</div>
                                                 <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.3rem' }}>Subject: {task.subject_name} • By {task.instructor_name}</div>
                                              </div>
                                           ))
                                        ) : (
                                           <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>No specific tasks or classwork logged.</div>
                                        )}
                                     </div>
                                     
                                     {/* Homework Due for Date */}
                                     <div style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.1)', padding: '1.2rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ec4899', marginBottom: '0.5rem' }}>DEADLINES DUE</div>
                                        {classDetails.homework.filter(h => h.deadline.startsWith(monitoringDate)).length > 0 ? (
                                           classDetails.homework.filter(h => h.deadline.startsWith(monitoringDate)).map(hw => (
                                              <div key={hw.id} style={{ marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                 <div style={{ fontWeight: 'bold' }}>{hw.title}</div>
                                                 <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Time: {new Date(hw.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                              </div>
                                           ))
                                        ) : (
                                           <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>No homework due on this date.</div>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   ) : (
                     <div>
                        <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="grid-mobile-stack">
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
                           <div style={{ display: 'flex', gap: '1rem' }} className="grid-mobile-stack">
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
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }} className="grid-mobile-stack">
                     <button className={activeSchema === 'student' ? 'btn-primary' : 'btn-logout'} onClick={() => setActiveSchema('student')}>Student Model</button>
                     <button className={activeSchema === 'instructor' ? 'btn-primary' : 'btn-logout'} onClick={() => setActiveSchema('instructor')}>Instructor Model</button>
                  </div>

                  <div className="dashboard-card">
                     <h3>{activeSchema.toUpperCase()} Schema Designer</h3>
                     <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }} className="grid-mobile-stack">
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="grid-mobile-stack">
                           <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              <button onClick={() => setShowAddStudent(true)} className="btn-primary">New Student Record</button>
                              <button className="btn-secondary" onClick={() => window.open(`${API_BASE_URL}/api/students/download_template/?organization=${org.id}`)}>Get Template</button>
                              <button className="btn-secondary" onClick={() => document.getElementById('student-import').click()}>Import CSV</button>
                              <input id="student-import" type="file" hidden accept=".csv" onChange={e => handleBulkImport('student', e.target.files[0])} />
                           </div>
                           <div className="search-container" style={{ maxWidth: '400px', width: '100%' }}>
                              <i className="fas fa-search"></i>
                              <input
                                 placeholder="Search Students..."
                                 value={studentSearch}
                                 onChange={e => setStudentSearch(e.target.value)}
                              />
                           </div>
                        </div>
                        <div className="dashboard-card" style={{ padding: '0' }}>
                           <table className="responsive-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
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
                                    <tr key={s.id} style={{ background: s.user_is_active === false ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', borderLeft: s.user_is_active === false ? '4px solid #EF4444' : 'none' }}>
                                       {org.student_fields_config?.slice(0, 3).map((f, idx) => (
                                          <td key={f.id} data-label={f.name} style={{ padding: '1rem', borderRadius: idx === 0 ? '12px 0 0 12px' : '0' }}>
                                             {s.custom_data?.[f.name] || '-'}
                                             {idx === 0 && s.user_is_active === false && (
                                                <span className="badge badge-warning" style={{ marginLeft: '0.8rem', fontSize: '0.65rem', background: '#EF4444', color: 'white' }}>PORTAL REVOKED</span>
                                             )}
                                          </td>
                                       ))}
                                       <td style={{ padding: '1rem' }} data-label="Portal Login">
                                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>User: <strong>{s.user_username || 'N/A'}</strong></div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>Default: Pass@{s.registration_number}</div>
                                       </td>
                                       <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 12px 12px 0' }} data-label="Actions">
                                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                             <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} onClick={() => { setEditingStudent(s); setStudentForm({ custom_data: s.custom_data }); setShowAddStudent(true); }}>Edit</button>
                                             
                                             {s.user_is_active !== false ? (
                                                <button 
                                                   onClick={async () => {
                                                      if (!window.confirm("Revoke this student's login access?")) return;
                                                      await fetch(`${API_BASE_URL}/api/students/${s.id}/revoke/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                                                      fetchItems();
                                                   }} 
                                                   style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid #EF4444', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                >
                                                   Revoke Access
                                                </button>
                                             ) : (
                                                <button 
                                                   onClick={async () => {
                                                      await fetch(`${API_BASE_URL}/api/students/${s.id}/activate/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                                                      fetchItems();
                                                   }} 
                                                   style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid #10B981', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                >
                                                   Restore Access
                                                </button>
                                             )}

                                             <button 
                                                onClick={async () => {
                                                   if (!window.confirm("PERMANENTLY DELETE student record and user account? This cannot be undone.")) return;
                                                   await fetch(`${API_BASE_URL}/api/students/${s.id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                                   fetchItems();
                                                }} 
                                                style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                title="Delete Permanently"
                                             >
                                                <i className="fas fa-trash-alt"></i>
                                             </button>
                                          </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="grid-mobile-stack">
                     <div style={{ display: 'flex', gap: '1rem' }} className="grid-mobile-stack">
                        <button onClick={() => setShowAddInstructor(true)} className="btn-primary">Add New Instructor</button>
                        <button className="btn-secondary" onClick={() => window.open(`${API_BASE_URL}/api/instructors/download_template/?organization=${org.id}`)}>Download Template</button>
                        <button className="btn-secondary" onClick={() => document.getElementById('instructor-import').click()}>Import CSV</button>
                        <input id="instructor-import" type="file" hidden accept=".csv" onChange={e => handleBulkImport('instructor', e.target.files[0])} />
                     </div>
                     <div className="search-container" style={{ maxWidth: '400px', width: '100%' }}>
                        <i className="fas fa-search"></i>
                        <input
                           placeholder="Search Staff..."
                           value={instructorSearch}
                           onChange={e => setInstructorSearch(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="dashboard-card" style={{ padding: '0' }}>
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
                              <tr key={inst.id} style={{ background: inst.user_is_active === false ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', borderLeft: inst.user_is_active === false ? '4px solid #EF4444' : 'none' }}>
                                 {org.instructor_fields_config?.slice(0, 3).map((f, idx) => (
                                    <td key={f.id} data-label={f.name} style={{ padding: '1rem' }}>
                                       {inst.custom_data?.[f.name] || '-'}
                                       {idx === 0 && inst.user_is_active === false && (
                                          <span className="badge badge-warning" style={{ marginLeft: '0.8rem', fontSize: '0.65rem', background: '#EF4444', color: 'white' }}>REVOKED</span>
                                       )}
                                    </td>
                                 ))}
                                 <td style={{ padding: '1rem' }} data-label="Staff Login">
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>User: <strong>{inst.user_username || 'N/A'}</strong></div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>Default: Pass@{inst.registration_number}</div>
                                 </td>
                                 <td style={{ padding: '1rem', textAlign: 'right' }} data-label="Actions">
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                       <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} onClick={() => {
                                          setEditingInstructor(inst);
                                          const taught = subjects.filter(s => s.instructors?.includes(inst.id)).map(s => s.id);
                                          setInstructorForm({ subjects: taught, classrooms: inst.classrooms || [], custom_data: inst.custom_data || {} });
                                          setShowAddInstructor(true);
                                       }}>Edit</button>

                                       {inst.user_is_active !== false ? (
                                          <button 
                                             onClick={async () => {
                                                if (!window.confirm("Revoke all portal access for this instructor?")) return;
                                                await fetch(`${API_BASE_URL}/api/instructors/${inst.id}/revoke/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                                                fetchItems();
                                             }} 
                                             style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid #EF4444', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                          >
                                             Revoke
                                          </button>
                                       ) : (
                                          <button 
                                             onClick={async () => {
                                                await fetch(`${API_BASE_URL}/api/instructors/${inst.id}/activate/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                                                fetchItems();
                                             }} 
                                             style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid #10B981', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                          >
                                             Restore
                                          </button>
                                       )}

                                       <button 
                                          onClick={async () => {
                                             if (!window.confirm("PERMANENTLY DELETE instructor?")) return;
                                             await fetch(`${API_BASE_URL}/api/instructors/${inst.id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                             fetchItems();
                                          }} 
                                          style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                          title="Delete"
                                       >
                                          <i className="fas fa-trash-alt"></i>
                                       </button>
                                    </div>
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
                  <div style={{ display: 'flex', gap: '2rem' }} className="grid-mobile-stack">
                     {/* Profile Column */}
                     <div className="dashboard-card" style={{ flex: 1 }}>
                        <h3>Organization Information</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Basic details of your institution.</p>
                        <form style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', marginTop: '1.5rem' }}>
                           <div className="form-group"><label>Name</label><input value={org.name || ''} onChange={e => setOrg({ ...org, name: e.target.value })} /></div>
                           <div className="form-group"><label>Primary Contact</label><input value={org.contact_email || ''} onChange={e => setOrg({ ...org, contact_email: e.target.value })} /></div>
                           <div className="form-group">
                              <label>Webhook URL (Daily Task Notifications)</label>
                              <input 
                                 value={org.webhook_url || ''} 
                                 onChange={async (e) => {
                                    const url = e.target.value;
                                    await fetch(`${API_BASE_URL}/api/organizations/${org.id}/`, {
                                       method: 'PATCH',
                                       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                       body: JSON.stringify({ webhook_url: url })
                                    });
                                    fetchItems();
                                 }} 
                                 placeholder="https://your-webhook-target.com/api/tasks" 
                              />
                           </div>
                           <div className="form-group"><label>Portal Access</label><div className={`badge ${org.has_portal_access ? 'badge-success' : 'badge-warning'}`} style={{ display: 'inline-block' }}>{org.has_portal_access ? 'ENABLED' : 'DISABLED'}</div></div>
                        </form>
                     </div>

                     {/* Settings Column */}
                     <div className="dashboard-card" style={{ flex: 1.5, border: '1px solid var(--primary-color)', overflowX: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                           <div className="badge badge-success" style={{ padding: '0.5rem' }}><i className="fas fa-clock"></i></div>
                           <h3>School Operations & Intervals</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem' }}>Configure global hours and define specific intervals/breaks.</p>

                        <div className="grid-mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
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
                           <div className="grid-mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', alignItems: 'end' }}>
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
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
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
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-mobile-stack">
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
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="nav-brand" style={{ fontSize: '1.8rem' }}>{editingInstructor ? 'Edit Profile' : 'New Instructor'}</h3>
                        <button onClick={() => { setShowAddInstructor(false); setEditingInstructor(null); setInstructorForm({ subjects: [], classrooms: [], custom_data: {} }); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                     </div>
                     <form onSubmit={handleCreateOrUpdateInstructor}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                           <label>Responsibilities (Taught Subjects)</label>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }} className="grid-mobile-stack">
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
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }} className="grid-mobile-stack">
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
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-mobile-stack">
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
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
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
                </main>
             </div>
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
   function TimetableView({ token, type, id, dayFilter = null, compact = false }) {
      const [slots, setSlots] = useState([]);
      const [timetables, setTimetables] = useState([]);
      const [subjects, setSubjects] = useState([]);
      const [org, setOrg] = useState(null);
      const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 0 : new Date().getDay() - 1);

      useEffect(() => {
         const headers = { 'Authorization': `Bearer ${token}` };
         fetch(`${API_BASE_URL}/api/organizations/mine/`, { headers }).then(res => res.json()).then(data => data && setOrg(data));
         fetch(`${API_BASE_URL}/api/subjects/`, { headers }).then(res => res.json()).then(setSubjects);
         
         let url = `${API_BASE_URL}/api/timetables/`;
         if (type === 'CLASSROOM') url += `?classroom=${id}`;
         else if (type === 'INSTRUCTOR') url += `?instructor=${id}`;
         fetch(url, { headers }).then(res => res.json()).then(setTimetables);
      }, [token, type, id]);

      const generateSlots = () => {
         if (!org) return [];
         const [sh, sm] = (org.school_start_time || '08:30:00').split(':').map(Number);
         const [eh, em] = (org.school_end_time || '15:30:00').split(':').map(Number);
         const periodDuration = parseInt(org.period_duration_minutes) || 45;
         const custom = (org.custom_intervals || []).map(ci => ({
            ...ci,
            startMins: parseInt(ci.start.split(':')[0]) * 60 + parseInt(ci.start.split(':')[1]),
            endMins: parseInt(ci.end.split(':')[0]) * 60 + parseInt(ci.end.split(':')[1]),
         }));

         let current = sh * 60 + sm;
         const end = eh * 60 + em;
         const res = [];
         let pNum = 1;
         let guard = 0;
         while (current < end && guard < 100) {
            guard++;
            const activeCI = custom.find(ci => ci.startMins <= current && ci.endMins > current);
            if (activeCI) {
               res.push({ type: 'BREAK', label: activeCI.name.toUpperCase(), start: activeCI.start + ':00', end: activeCI.end + ':00' });
               current = activeCI.endMins;
            } else {
               const nextCI = custom.find(ci => ci.startMins > current && ci.startMins < current + periodDuration);
               if (nextCI) { current = nextCI.startMins; continue; }
               if (current + periodDuration > end) break;
               const sStr = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}:00`;
               const eStr = `${String(Math.floor((current + periodDuration) / 60)).padStart(2, '0')}:${String((current + periodDuration) % 60).padStart(2, '0')}:00`;
               res.push({ type: 'PERIOD', label: `P${pNum++}`, start: sStr, end: eStr });
               current += periodDuration;
            }
         }
         return res;
      };

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const currentSlots = generateSlots();

      return (
         <div className="animate-fadeIn">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: compact ? '0.8rem' : '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
               {days.map((d, i) => (
                  <button key={d} onClick={() => setSelectedDay(i)} className={selectedDay === i ? 'badge badge-success' : 'badge'} style={{ minWidth: compact ? '60px' : '80px', fontSize: compact ? '0.7rem' : '0.8rem', padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: selectedDay === i ? 'var(--primary-color)' : 'transparent', color: 'white', cursor: 'pointer' }}>{d}</button>
               ))}
            </div>
            <div className="dashboard-card" style={{ padding: '0', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {currentSlots.map((slot, idx) => {
                     const isBreak = slot.type === 'BREAK';
                     const entries = timetables.filter(t => t.day_of_week === selectedDay && t.start_time === slot.start);
                     return (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: compact ? '80px 1fr' : '120px 1fr', borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: isBreak ? (compact ? '35px' : '50px') : (compact ? '60px' : '100px') }}>
                           <div style={{ padding: compact ? '0.5rem' : '1rem', background: isBreak ? 'rgba(192,132,252,0.05)' : 'transparent', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ fontWeight: 'bold', fontSize: compact ? '0.75rem' : '1rem', color: isBreak ? 'var(--primary-color)' : 'white' }}>{slot.label}</div>
                              <div style={{ fontSize: compact ? '0.6rem' : '0.7rem', opacity: 0.4 }}>{slot.start.slice(0, 5)} - {slot.end.slice(0, 5)}</div>
                           </div>
                           <div style={{ padding: compact ? '0.5rem' : '1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              {isBreak ? (
                                 <span style={{ fontSize: compact ? '0.65rem' : '0.8rem', opacity: 0.2, letterSpacing: '2px' }}>REST INTERVAL</span>
                              ) : (
                                 entries.map(t => (
                                    <div key={t.id} style={{ padding: compact ? '0.4rem 0.8rem' : '0.8rem 1.2rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(192,132,252,0.1))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', minWidth: compact ? '120px' : '150px' }}>
                                       <div style={{ fontWeight: 'bold', fontSize: compact ? '0.75rem' : '0.9rem' }}>{t.subject_name}</div>
                                       <div style={{ fontSize: compact ? '0.65rem' : '0.75rem', opacity: 0.6 }}>{t.instructor_name} {type === 'INSTRUCTOR' && `• ${subjects.find(s => s.id === t.subject)?.classroom_name || 'Class'}`}</div>
                                    </div>
                                 ))
                              )}
                              {!isBreak && entries.length === 0 && <span style={{ opacity: 0.1, fontSize: '0.65rem' }}>Empty Slot</span>}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      );
   }


   function DailyTaskCalendar({ token, classroomId, date, role }) {
      const [tasks, setTasks] = useState([]);
      const [students, setStudents] = useState([]);
      const [showAddTask, setShowAddTask] = useState(false);
      const [subjects, setSubjects] = useState([]);
      const [newTask, setNewTask] = useState({ topic: '', category: 'HW', subject: '', deadline: '', description: '' });
      const [editingTask, setEditingTask] = useState(null);

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

      const handleSaveTask = async (e) => {
         e.preventDefault();
         const isUpdate = !!editingTask;
         const url = isUpdate ? `${API_BASE_URL}/api/daily_tasks/${editingTask.id}/` : `${API_BASE_URL}/api/daily_tasks/`;
         const method = isUpdate ? 'PATCH' : 'POST';

         const res = await fetch(url, {
            method,
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
            setEditingTask(null);
            setNewTask({ topic: '', category: 'HW', subject: '', deadline: '', description: '' });
            fetchTasks();
         } else {
            const errDetails = await res.json();
            alert("Failed to save task: " + (errDetails.deadline?.[0] || errDetails.subject?.[0] || JSON.stringify(errDetails)));
         }
      };

      const handleDeleteTask = async (taskId) => {
         if (!window.confirm("Permanently delete this task slot?")) return;
         const res = await fetch(`${API_BASE_URL}/api/daily_tasks/${taskId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
            fetchTasks();
         } else {
            alert("Failed to delete task.");
         }
      };

      return (
         <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="grid-mobile-stack">
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="grid-mobile-stack">
                  <h3 style={{ margin: 0 }}>Tasks for {new Date(date).toLocaleDateString()}</h3>
                  {role === 'INSTRUCTOR' && <button className="btn-primary" onClick={() => setShowAddTask(true)}>New Slot</button>}
               </div>
               <div className="dashboard-card" style={{ border: '1px solid var(--border-color)', minHeight: '400px' }}>
                  {tasks.length > 0 ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map(t => (
                           <div key={t.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${t.category === 'HW' ? '#FACC15' : (t.category === 'CW' ? '#60A5FA' : '#C084FC')}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                 <span className="badge" style={{ fontSize: '0.7rem' }}>{t.category_display}</span>
                                 <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{t.subject_name}</span>
                                    {role === 'INSTRUCTOR' && (
                                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                                          <button onClick={() => { setEditingTask(t); setNewTask({ topic: t.topic, category: t.category, subject: t.subject, deadline: t.deadline ? t.deadline.slice(0, 16) : '', description: t.description }); setShowAddTask(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem' }} title="Edit Task"><i className="fas fa-edit"></i></button>
                                          <button onClick={() => handleDeleteTask(t.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem' }} title="Delete Task"><i className="fas fa-trash"></i></button>
                                       </div>
                                    )}
                                 </div>
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
               <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
                  <div className="dashboard-card animate-slideUp" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="nav-brand" style={{ fontSize: '1.5rem' }}>{editingTask ? 'Edit Task Slot' : 'Add New Slot'}</h3>
                        <button onClick={() => { setShowAddTask(false); setEditingTask(null); setNewTask({ topic: '', category: 'HW', subject: '', deadline: '', description: '' }); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                     </div>
                     <form onSubmit={handleSaveTask}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="grid-mobile-stack">
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
      const [instructorProfile, setInstructorProfile] = useState(null);
      const [selectedClassId, setSelectedClassId] = useState('');
      const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
      const [instructorView, setInstructorView] = useState('tasks');

      useEffect(() => {
         fetch(`${API_BASE_URL}/api/classrooms/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(setClassrooms);
         
         // Fetch instructor profile to get instructor_id
         fetch(`${API_BASE_URL}/api/instructors/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => data && data[0] && setInstructorProfile(data[0]));
      }, [token]);

      return (
         <div className="dashboard animate-fadeIn">
            <h2 style={{ fontSize: '2.25rem' }}>Instructor <span className="nav-brand" style={{ fontSize: '2.25rem' }}>Portal</span></h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Access your classrooms, manage students, and schedule daily tasks.</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
               <button onClick={() => setInstructorView('tasks')} className={instructorView === 'tasks' ? 'btn-primary' : 'btn-logout'} style={{ padding: '0.5rem 1.5rem' }}>Daily Progress</button>
               <button onClick={() => setInstructorView('timetable')} className={instructorView === 'timetable' ? 'btn-primary' : 'btn-logout'} style={{ padding: '0.5rem 1.5rem' }}>Personal Schedule</button>
            </div>

            {instructorView === 'tasks' ? (
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
            ) : null}

            {instructorView === 'tasks' ? (
               selectedClassId ? (
                  <DailyTaskCalendar token={token} classroomId={selectedClassId} date={selectedDate} role="INSTRUCTOR" />
               ) : (
                  <div className="animate-fadeIn">
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {classrooms.map(c => (
                           <div key={c.id} className="dashboard-card" style={{ cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.3s ease', padding: '1.25rem' }} onClick={() => setSelectedClassId(c.id)}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(192,132,252,0.1)', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                    <i className="fas fa-chalkboard"></i>
                                 </div>
                                 <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0 }}>{c.name}</h4>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', opacity: 0.5 }}>Monitoring Hub</p>
                                 </div>
                                 <i className="fas fa-chevron-right" style={{ opacity: 0.2 }}></i>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )
            ) : (
               instructorProfile ? (
                  <TimetableView token={token} type="INSTRUCTOR" id={instructorProfile.id} />
               ) : (
                  <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.5 }}>Loading personal schedule...</div>
               )
            )}
         </div>
      );
   }

   function StudentDashboard({ token, logout }) {
      const navigate = useNavigate();
      const [activeTab, setActiveTab] = useState('dashboard');
      const [studentProfile, setStudentProfile] = useState(null);
      const [timetable, setTimetable] = useState([]);
      const [selectedDay, setSelectedDay] = useState(new Date().getDay() > 0 && new Date().getDay() < 6 ? new Date().getDay() - 1 : 0);
      const [showMobileMenu, setShowMobileMenu] = useState(false);
      const [chatInput, setChatInput] = useState('');
      const [messages, setMessages] = useState([
         { id: 1, role: 'bot', text: "Hi! 👋 I'm your study assistant. Ask me anything about today's syllabus or any concept you're stuck on." }
      ]);
      const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
      const lastMessageRef = useRef(null);

      useEffect(() => {
         fetch(`${API_BASE_URL}/api/students/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
               if (data && data[0]) {
                  setStudentProfile(data[0]);
                  if (data[0].classroom) fetchTimetable(data[0].classroom);
               }
            });
      }, [token]);

      const fetchTimetable = (classId) => {
         fetch(`${API_BASE_URL}/api/timetables/?classroom=${classId}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setTimetable(data));
      };

      const handleSendChat = async () => {
         if (!chatInput.trim()) return;
         const userMsg = { id: Date.now(), role: 'user', text: chatInput };
         setMessages(prev => [...prev, userMsg]);
         setChatInput('');
         
         try {
            const history = messages.map(m => ({
               role: m.role === 'bot' ? 'model' : 'user',
               text: m.text
            }));

            const res = await fetch(`${API_BASE_URL}/api/ask_ai/`, {
               method: 'POST',
               headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
               },
               body: JSON.stringify({ 
                  query: chatInput,
                  history: history,
                  context: { // Send UI State
                     active_tab: activeTab,
                     selected_date: selectedDate
                  }
               })
            });
            const data = await res.json();
            if (data.answer) {
               const botMsg = { id: Date.now() + 1, role: 'bot', text: data.answer };
               setMessages(prev => [...prev, botMsg]);
            } else {
               const botMsg = { id: Date.now() + 1, role: 'bot', text: `Sorry, I'm having trouble connecting: ${data.error || 'Unknown error'}` };
               setMessages(prev => [...prev, botMsg]);
            }
         } catch (err) {
            const botMsg = { id: Date.now() + 1, role: 'bot', text: "The AI assistant is currently unreachable. Please check your connection." };
            setMessages(prev => [...prev, botMsg]);
         }
      };

      useEffect(() => {
         lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const daySchedule = timetable.filter(t => t.day_of_week === selectedDay);

      return (
         <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--ink)' }}>
             {/* Sidebar Overlay */}
             <div className={`sidebar-overlay ${showMobileMenu ? 'visible' : ''}`} onClick={() => setShowMobileMenu(false)} />
             
             {/* SIDEBAR */}
             <aside className={`sidebar ${showMobileMenu ? 'mobile-open' : ''}`} style={{ width: '260px', background: 'var(--ink2)', borderRight: '1px solid var(--rim)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 100 }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--rim)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
                        <rect width="40" height="40" rx="10" fill="#F5A623"/>
                        <path d="M8 28L14 14L20 22L26 12L32 28" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="logo-text" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.5px' }}>
                         upgrade<span style={{ color: 'var(--amber)' }}>fied</span>
                      </span>
                   </div>
                </div>

                <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
                   <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<i className="fas fa-home"></i>} label="My Dashboard" />
                   <SidebarLink active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<i className="fas fa-calendar-alt"></i>} label="My Schedule" />
                   <SidebarLink active={activeTab === 'homework'} onClick={() => setActiveTab('homework')} icon={<i className="fas fa-stream"></i>} label="Learning Feed" />
                   <SidebarLink active={activeTab === 'grades'} onClick={() => setActiveTab('grades')} icon={<i className="fas fa-chart-bar"></i>} label="My Grades" />
                   <SidebarLink active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<i className="fas fa-robot"></i>} label="AI Assistant" />
                   <SidebarLink active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<i className="fas fa-bell"></i>} label="Notifications" />
                </nav>

                <div style={{ padding: '16px 12px', borderTop: '1px solid var(--rim)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0D0F14' }}>
                         {studentProfile ? Object.values(studentProfile.custom_data || {})[0]?.charAt(0) : 'S'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>{studentProfile ? Object.values(studentProfile.custom_data || {})[0] : 'Student'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{studentProfile?.classroom_name}</div>
                      </div>
                   </div>
                </div>
             </aside>

             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', background: 'var(--ink)', padding: '32px 36px' }}>
                   {activeTab === 'dashboard' && (
                      <div className="fade-in">
                         {/* METRICS ROW */}
                         <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                            <MetricCard label="My Avg Score" value="82%" change="+4 pts improvement" up color="amber" />
                            <MetricCard label="Attendance" value="96%" change="Excellent record" up color="teal" />
                            <MetricCard label="HW Due Today" value="2" change="Math, Physics" color="rose" />
                            <MetricCard label="Next Test" value="Friday" change="Chemistry" color="violet" />
                         </div>

                         <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', minHeight: 'calc(100vh - 250px)' }}>
                            
                            {/* TODAY'S SCHEDULE */}
                            <div className="section-card" style={{ padding: '24px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                  <h3 className="sc-title">Today's Schedule</h3>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                     {days.map((d, i) => (
                                        <button 
                                           key={d} 
                                           onClick={() => setSelectedDay(i)}
                                           style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--rim)', background: selectedDay === i ? 'var(--amber-glow)' : 'var(--ink3)', color: selectedDay === i ? 'var(--amber)' : 'var(--muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                           {d}
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {daySchedule.length > 0 ? (
                                     daySchedule.sort((a,b) => a.start_time.localeCompare(b.start_time)).map((slot, idx) => {
                                        const isActive = idx === 1; // Simulation
                                        const isDone = idx === 0; // Simulation
                                        return (
                                           <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                                              <div style={{ width: '60px', textAlign: 'right', paddingTop: '8px' }}>
                                                 <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--white)' }}>P{idx+1}</div>
                                                 <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{slot.start_time.slice(0,5)}</div>
                                              </div>
                                              <div style={{ flex: 1, padding: '16px', background: isActive ? 'var(--amber-glow)' : 'var(--ink2)', border: isActive ? '1px solid var(--amber-rim)' : '1px solid var(--rim)', borderRadius: '12px', position: 'relative' }}>
                                                 {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--amber)' }} />}
                                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div style={{ fontSize: '15px', fontWeight: 700, color: isActive ? 'var(--white)' : 'var(--soft)' }}>
                                                       {slot.subject_name} {isDone && '✓'} {isActive && '← Now'}
                                                    </div>
                                                    {isDone && <span style={{ fontSize: '10px', color: 'var(--teal)', fontWeight: 700 }}>Done</span>}
                                                 </div>
                                                 <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{slot.instructor_name}</div>
                                              </div>
                                           </div>
                                        );
                                     })
                                  ) : (
                                     <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>No classes scheduled for {days[selectedDay]}</div>
                                  )}
                               </div>
                            </div>

                            {/* AI ASSISTANT MINI-PANEL */}
                            <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                               <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--rim)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}><i className="fas fa-robot"></i></div>
                                  <div>
                                     <h3 className="sc-title" style={{ fontSize: '15px' }}>Quick AI Help</h3>
                                     <p className="sc-subtitle" style={{ fontSize: '11px', color: 'var(--teal)' }}>● Online</p>
                                  </div>
                               </div>
                               <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {messages.slice(-2).map((m) => (
                                     <div key={m.id} style={{ alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', maxWidth: '90%' }}>
                                        <div style={{ padding: '10px 14px', borderRadius: '12px', background: m.role === 'bot' ? 'var(--ink3)' : 'var(--amber)', color: m.role === 'bot' ? 'var(--soft)' : '#0D0F14', fontSize: '13px' }}>{m.text}</div>
                                     </div>
                                  ))}
                                  <div ref={lastMessageRef} />
                               </div>
                               <div style={{ padding: '16px', borderTop: '1px solid var(--rim)' }}>
                                  <button className="btn-sm btn-sm-amber" style={{ width: '100%' }} onClick={() => setActiveTab('ai')}>Open Full Assistant</button>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                   {activeTab === 'schedule' && studentProfile && (
                      <div className="fade-in">
                         <h2 style={{ marginBottom: '20px' }}>Comprehensive Schedule</h2>
                         <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <TimetableView token={token} type="CLASSROOM" id={studentProfile.classroom} />
                         </div>
                      </div>
                   )}

                   {activeTab === 'homework' && studentProfile && (
                      <div className="fade-in">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }} className="grid-mobile-stack">
                            <div>
                               <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--white)', margin: 0 }}>Learning Feed</h2>
                               <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Classwork, Homework & Daily Updates</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                               <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Select Date:</span>
                               <input 
                                  type="date" 
                                  value={selectedDate} 
                                  onChange={e => setSelectedDate(e.target.value)} 
                                  className="btn-secondary" 
                                  style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--ink2)', border: '1px solid var(--rim)', color: 'var(--white)', cursor: 'pointer' }} 
                               />
                            </div>
                         </div>

                         <div className="section-card" style={{ padding: '0', background: 'transparent', border: 'none' }}>
                            <DailyTaskCalendar token={token} classroomId={studentProfile.classroom} date={selectedDate} role="STUDENT" />
                         </div>
                      </div>
                   )}

                   {activeTab === 'grades' && (
                      <div className="fade-in">
                         <h2 style={{ marginBottom: '20px' }}>Academic Performance</h2>
                         <div className="section-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📈</div>
                            <h3 style={{ color: 'var(--white)' }}>Gradebook Under Review</h3>
                            <p style={{ color: 'var(--muted)' }}>End of term grades are being processed by your instructors.</p>
                         </div>
                      </div>
                   )}

                   {activeTab === 'ai' && (
                      <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                         <div className="section-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--rim)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}><i className="fas fa-robot"></i></div>
                               <div>
                                  <h3 className="sc-title">Upgradefied AI Study Partner</h3>
                                  <p className="sc-subtitle" style={{ color: 'var(--teal)' }}>● Ready to help with your curriculum</p>
                               </div>
                            </div>
                            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                               {messages.map(m => (
                                  <div key={m.id} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: m.role === 'bot' ? 'flex-start' : 'flex-end' }}>
                                     <div style={{ maxWidth: '70%', padding: '16px', borderRadius: '20px', background: m.role === 'bot' ? 'var(--ink3)' : 'var(--amber)', color: m.role === 'bot' ? 'var(--soft)' : '#1a1a1a', border: m.role === 'bot' ? '1px solid var(--rim)' : 'none' }}>{m.text}</div>
                                  </div>
                               ))}
                               <div ref={lastMessageRef} />
                            </div>
                            <div style={{ padding: '24px', borderTop: '1px solid var(--rim)' }}>
                               <div style={{ display: 'flex', gap: '12px', background: 'var(--ink3)', padding: '12px', borderRadius: '16px' }}>
                                  <input 
                                     placeholder="Type your question here..." 
                                     value={chatInput}
                                     onChange={e => setChatInput(e.target.value)}
                                     onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                                     style={{ flex: 1, background: 'transparent', border: 'none', color: 'white' }} 
                                  />
                                  <button onClick={handleSendChat} style={{ background: 'var(--amber)', border: 'none', width: '44px', height: '44px', borderRadius: '12px', color: '#1a1a1a' }}><i className="fas fa-paper-plane"></i></button>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                   {activeTab === 'notifications' && (
                      <div className="fade-in">
                         <h2 style={{ marginBottom: '20px' }}>Notifications Center</h2>
                         <div className="section-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔔</div>
                            <h3 style={{ color: 'var(--white)' }}>All Clear</h3>
                            <p style={{ color: 'var(--muted)' }}>No new alerts for today. Enjoy your classes!</p>
                         </div>
                      </div>
                   )}
                </div>
             </div>
         </div>
      );
   }

   function SmartAssistant({ token }) {
      const [query, setQuery] = useState('');
      const [history, setHistory] = useState([]);
      const [loading, setLoading] = useState(false);

      const historyRef = useRef(null);

      useEffect(() => {
         if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
         }
      }, [history]);

      const askAI = async (e) => {
         e.preventDefault();
         const cleanQuery = query.trim().replace(/[{}<>]/g, '').slice(0, 500);
         if (!cleanQuery) return;

         const userMsg = { role: 'user', text: cleanQuery };
         setHistory(prev => [...prev, userMsg]);
         setLoading(true);
         setQuery('');

         try {
            const res = await fetch(`${API_BASE_URL}/api/ask_ai/`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ query: userMsg.text })
            });
            const data = await res.json();
            setHistory(prev => [...prev, { role: 'ai', text: String(data.answer || data.error || 'No response received') }]);
         } catch (err) {
            setHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error connecting to the AI service.' }]);
         } finally { setLoading(false); }
      };

      return (
         <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0, overflow: 'hidden', border: '1px solid var(--primary-color)', background: 'rgba(15,23,42,0.6)' }}>
            <div style={{ padding: '1.2rem', background: 'linear-gradient(to right, rgba(192,132,252,0.1), transparent)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
               <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <i className="fas fa-robot"></i>
               </div>
               <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>upgradefied Smart Assistant</h4>
                  <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6 }}>Instant answers to school queries</p>
               </div>
            </div>

            <div ref={historyRef} style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', scrollBehavior: 'smooth' }}>
               {history.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.3 }}>
                     <i className="fas fa-microchip" style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}></i>
                     <p style={{ fontSize: '0.85rem' }}>Ask me about homework, lessons, or deadlines.</p>
                  </div>
               )}
               {history.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                     <div style={{ 
                        padding: '0.6rem 1rem', 
                        borderRadius: msg.role === 'user' ? '15px 15px 2px 15px' : '15px 15px 15px 2px',
                        background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: '0.85rem',
                        lineHeight: '1.4'
                     }}>
                        {msg.text}
                     </div>
                  </div>
               ))}
               {loading && <div style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.75rem', opacity: 0.5 }}>Analyzing records...</div>}
            </div>

            <form onSubmit={askAI} style={{ padding: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.6rem' }}>
               <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type your message..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.6rem 1rem', color: 'white', fontSize: '0.85rem' }} disabled={loading} />
               <button type="submit" disabled={loading} className="btn-primary" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-paper-plane" style={{ fontSize: '0.9rem' }}></i>
               </button>
            </form>
         </div>
      );
   }

   function ParentDashboard({ token }) {
      const [children, setChildren] = useState([]);

      useEffect(() => {
         fetch(`${API_BASE_URL}/api/students/`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(setChildren);
      }, [token]);

      return (
         <div className="dashboard animate-fadeIn">
            <div style={{ marginBottom: '2.5rem' }}>
               <h2 style={{ fontSize: '2.25rem' }}>Parent <span className="nav-brand" style={{ fontSize: 'inherit' }}>Portal</span></h2>
               <p style={{ color: 'var(--text-muted)' }}>Stay updated with your children's progress and activities.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }} className="grid-mobile-stack">
               <div>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                     <i className="fas fa-user-graduate" style={{ color: 'var(--primary-color)' }}></i> Your Children
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {children.length > 0 ? children.map(child => (
                        <div key={child.id} className="dashboard-card" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                 <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{child.first_name} {child.last_name}</h4>
                                 <p style={{ opacity: 0.5, margin: '0.2rem 0' }}>Class: {child.classroom_name || 'Not assigned'}</p>
                              </div>
                              <span className="badge badge-success">Active</span>
                           </div>
                           <hr style={{ opacity: 0.1, margin: '1rem 0' }} />
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                              <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                 <div style={{ opacity: 0.5 }}>Attendance</div>
                                 <strong>98%</strong>
                              </div>
                              <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                 <div style={{ opacity: 0.5 }}>Pending Tasks</div>
                                 <strong>3</strong>
                              </div>
                           </div>
                        </div>
                     )) : <div className="dashboard-card" style={{ textAlign: 'center', opacity: 0.5 }}>No children linked.</div>}
                  </div>
               </div>

               <div>
                  <SmartAssistant token={token} />
               </div>
            </div>
         </div>
      );
   }

   export default App;