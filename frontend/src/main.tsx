import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, Building2, ShieldCheck, ClipboardCheck, AlertTriangle,
  Bell, User, LogOut, ChevronDown, ChevronRight, ChevronLeft,
  Search, Eye, ArrowRight, X, Activity, FileText, CheckCircle2, Clock, Send, Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import './styles.css';
import {
  EMPLOYER_ESTABLISHMENT_DATA,
  EMPLOYER_REGISTRATION_STATUS_STEPS,
  EMPLOYER_CURRENT_COMPLIANCE,
  EMPLOYER_COMPLIANCE_HISTORY,
  EMPLOYER_DOCUMENTS,
  EMPLOYER_UPCOMING_INSPECTIONS,
  EMPLOYER_INSPECTION_HISTORY,
  EMPLOYER_NOTICES,
  EMPLOYER_EXPLANATIONS,
  EMPLOYER_CORRECTIVE_ACTIONS,
  EMPLOYER_FOLLOWUPS,
  EMPLOYER_KPI_STATS
} from './employerDummyData';

import {
  INSPECTOR_KPI_STATS,
  INSPECTOR_PROFILE_DATA,
  DUMMY_ASSIGNED_INSPECTIONS,
  DUMMY_UPCOMING_INSPECTIONS,
  DUMMY_FOLLOWUP_INSPECTIONS,
  DUMMY_DRAFT_REPORTS,
  DUMMY_SUBMITTED_REPORTS,
  DUMMY_INSPECTION_HISTORY
} from './inspectorDummyData';


// Types
type Role = 'LABOUR_OFFICER' | 'LABOUR_INSPECTOR' | 'EMPLOYER';
type UserType = { id: string; name: string; email: string; role: Role; districtId?: string; establishmentId?: string; phone?: string; designation?: string };
type ApiData = { [key: string]: any };

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// Helper API caller
const api = async (path: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem('tn_token');
  const r = await fetch('/api' + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    }
  });

  const contentType = r.headers.get('content-type') || '';
  const text = await r.text();

  let j: any = {};
  if (contentType.includes('application/json')) {
    try {
      j = text ? JSON.parse(text) : {};
    } catch (e) {
      j = { message: text };
    }
  } else {
    console.error('Non-JSON API response received:', text);
    throw new Error(!r.ok ? `API route returned HTTP ${r.status}. Ensure backend is running.` : 'Invalid JSON response format');
  }

  if (!r.ok) throw new Error(j.message || 'Request failed');
  return j.data !== undefined ? j.data : j;
};

// UI Components
const Badge = ({ value }: { value: string }) => {
  if (!value) return <span className="badge pending">UNKNOWN</span>;
  const valStr = String(value).toUpperCase().replace(/ /g, '_');
  return <span className={`badge ${valStr.toLowerCase()}`}>{valStr.replace(/_/g, ' ')}</span>;
};

const Card = ({ name, value, Icon, colorClass = 'blue' }: { name: string; value: any; Icon: any; colorClass?: string }) => (
  <article>
    <div className={`metric-icon ${colorClass}`}><Icon size={22} /></div>
    <div>
      <p>{name}</p>
      <strong>{value ?? 0}</strong>
    </div>
  </article>
);

const Hero = ({ title, text }: { title: string; text: string }) => (
  <section className="disclaimer">
    <ShieldCheck size={24} style={{ flexShrink: 0, marginTop: 2 }} />
    <div>
      <b>{title}</b>
      <div>{text}</div>
    </div>
  </section>
);

// ────────────────────────────────────────────────────────────────
// AUTH SCREENS  –  Login + Register
// ────────────────────────────────────────────────────────────────

type AuthRole = 'LABOUR_OFFICER' | 'LABOUR_INSPECTOR' | 'EMPLOYER';

const ROLE_META: { role: AuthRole; label: string; sub: string; icon: string }[] = [
  { role: 'LABOUR_OFFICER', label: 'Labour Department Officer', sub: 'Officer-level oversight access', icon: '🏛️' },
  { role: 'LABOUR_INSPECTOR', label: 'Labour Inspector', sub: 'Field inspection access', icon: '🔍' },
  { role: 'EMPLOYER', label: 'Employer', sub: 'Establishment management access', icon: '🏭' },
];

// ── Login Component ──────────────────────────────────────────────
function Login({ done, onRegister }: { done: (u: UserType) => void; onRegister: (role: AuthRole) => void }) {
  const [selectedRole, setSelectedRole] = useState<AuthRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; role?: string }>({});

  // Restore remembered email
  React.useEffect(() => {
    const saved = localStorage.getItem('tn_remembered_email');
    if (saved) { setEmail(saved); setRemember(true); }
    // If a registered role hint was stored, pre-select it
    const roleHint = sessionStorage.getItem('tn_reg_role') as AuthRole | null;
    if (roleHint) { setSelectedRole(roleHint); sessionStorage.removeItem('tn_reg_role'); }
  }, []);

  function validate() {
    const errs: typeof fieldErrors = {};
    if (!selectedRole) errs.role = 'Please select your role to continue.';
    if (!email.trim()) errs.email = 'Please enter your email address.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Please enter your password.';
    return errs;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      const d = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
      // Backend-verified: JWT contains the real role. Inform user if mismatch.
      if (selectedRole && d.user.role !== selectedRole) {
        setLoading(false);
        setError(`Your account is registered as ${d.user.role.replace(/_/g, ' ')}. Please select the correct role.`);
        return;
      }
      if (remember) localStorage.setItem('tn_remembered_email', email.trim());
      else localStorage.removeItem('tn_remembered_email');
      localStorage.setItem('tn_token', d.token);
      done(d.user);
    } catch (x: any) {
      setLoading(false);
      setError(x.message || 'Invalid email or password. Please try again.');
    }
  }

  function quickFill(role: AuthRole) {
    const map: Record<AuthRole, string> = {
      LABOUR_OFFICER: 'officer@example.com',
      LABOUR_INSPECTOR: 'inspector@example.com',
      EMPLOYER: 'employer@example.com',
    };
    setSelectedRole(role);
    setEmail(map[role]);
    setPassword('Demo@123');
    setError('');
    setFieldErrors({});
  }

  return (
    <main className="login">
      {/* ── Left panel ── */}
      <section className="login-hero">
        <div className="seal">TN</div>
        <p className="eyebrow">TAMIL NADU STATE LABOUR DEPARTMENT</p>
        <h1>Wage Compliance<br />Monitoring Portal</h1>
        <p className="login-hero-desc">
          Role-based monitoring, inspection intelligence,<br />
          risk analytics, and enforcement management.
        </p>
        <div className="login-feature-list">
          <div className="login-feature-item"><ShieldCheck size={16} /><span>Secure JWT Authentication</span></div>
          <div className="login-feature-item"><ClipboardCheck size={16} /><span>Role-Verified Access Control</span></div>
          <div className="login-feature-item"><Activity size={16} /><span>Explainable Risk Scoring</span></div>
        </div>
      </section>

      {/* ── Right panel (form card) ── */}
      <section className="login-form-panel">
        <form onSubmit={submit} noValidate className="login-card">
          <div className="login-card-header">
            <p className="eyebrow" style={{ color: '#2563eb' }}>PORTAL ACCESS</p>
            <h2>Sign in to your account</h2>
            <p className="login-card-sub">Select your role and enter your credentials</p>
          </div>

          {/* Role Selection */}
          <div className="role-select-group">
            <label className="field-label">Select Role <span className="required">*</span></label>
            <div className="role-cards">
              {ROLE_META.map(r => (
                <button
                  key={r.role}
                  type="button"
                  className={`role-card ${selectedRole === r.role ? 'selected' : ''}`}
                  onClick={() => { setSelectedRole(r.role); setError(''); setFieldErrors(f => ({ ...f, role: undefined })); }}
                >
                  <span className="role-card-icon">{r.icon}</span>
                  <span className="role-card-label">{r.label}</span>
                </button>
              ))}
            </div>
            {fieldErrors.role && <p className="field-error">{fieldErrors.role}</p>}
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="login-email">Email Address <span className="required">*</span></label>
            <input
              id="login-email"
              type="email"
              className={`field-input ${fieldErrors.email ? 'input-error' : ''}`}
              placeholder="Enter your registered email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
              autoComplete="email"
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label" htmlFor="login-password">Password <span className="required">*</span></label>
            <div className="pw-wrap">
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`field-input pw-input ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
                autoComplete="current-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label="Toggle password visibility">
                {showPw ? <Eye size={17} /> : <Eye size={17} />}
                <span style={{ fontSize: 11 }}>{showPw ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          {/* Remember me */}
          <div className="remember-row">
            <label className="remember-label">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Remember my email</span>
            </label>
          </div>

          {/* Error */}
          {error && <div className="error" role="alert">{error}</div>}

          {/* Submit */}
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner-sm" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight size={17} /></>
            )}
          </button>

          {/* Register link */}
          <div className="login-register-row">
            <span>New user?</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => onRegister(selectedRole || 'EMPLOYER')}
            >
              Register here
            </button>
          </div>

          {/* Demo credentials */}
          <div className="demo-section">
            <p className="demo-label">Quick fill demo credentials (password: Demo@123)</p>
            <div className="demo-btns">
              {ROLE_META.map(r => (
                <button key={r.role} type="button" className="demo-btn" onClick={() => quickFill(r.role)}>
                  {r.icon} {r.label.split(' ').slice(-1)[0]}
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

// ── Register Component ───────────────────────────────────────────
function Register({ initialRole, onBack }: { initialRole: AuthRole; onBack: (role?: AuthRole) => void }) {
  const [selectedRole, setSelectedRole] = useState<AuthRole>(initialRole);
  const [form, setForm] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setF(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
    setFieldErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  }

  function validate() {
    const errs: Record<string, string> = {};
    const f = form;
    if (!f.name?.trim()) errs.name = 'Full name is required.';
    if (!f.email?.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(f.email)) errs.email = 'Please enter a valid email address.';
    if (!f.password) errs.password = 'Password is required.';
    else if (f.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!f.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (f.password !== f.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (f.phone && !/^\d{10}$/.test(f.phone.replace(/\s/g, ''))) errs.phone = 'Phone number must be 10 digits.';
    return errs;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: selectedRole,                          // unified endpoint needs role
        ...(form.phone ? { phone: form.phone.trim() } : {}),
        ...(form.employeeId ? { employeeId: form.employeeId.trim() } : {}),
        ...(form.inspectorId ? { inspectorId: form.inspectorId.trim() } : {}),
        ...(form.districtId ? { districtId: form.districtId } : {}),
        ...(form.establishmentName ? { establishmentName: form.establishmentName.trim() } : {}),
        ...(form.registrationNumber ? { registrationNumber: form.registrationNumber.trim() } : {}),
      };
      // All roles use the unified endpoint
      await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      setSuccess('Registration successful! Please sign in with your registered credentials.');
      sessionStorage.setItem('tn_reg_role', selectedRole);
    } catch (x: any) {
      setError(x.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const districts = [
    { id: 'd-chennai', name: 'Chennai' },
    { id: 'd-coimbatore', name: 'Coimbatore' },
    { id: 'd-madurai', name: 'Madurai' },
  ];

  const meta = ROLE_META.find(r => r.role === selectedRole)!;

  return (
    <main className="login register-layout">
      {/* Left */}
      <section className="login-hero">
        <div className="seal">TN</div>
        <p className="eyebrow">TAMIL NADU STATE LABOUR DEPARTMENT</p>
        <h1>Create Your<br />Account</h1>
        <p className="login-hero-desc">
          Register as {meta.label} to access the<br />
          Wage Compliance Monitoring Portal.
        </p>
        <div className="login-feature-list">
          {ROLE_META.map(r => (
            <div key={r.role} className={`login-feature-item ${selectedRole === r.role ? 'active' : ''}`}>
              <span>{r.icon}</span><span>{r.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Right */}
      <section className="login-form-panel">
        <form onSubmit={submit} noValidate className="login-card register-card">
          {/* Success state */}
          {success ? (
            <div className="reg-success">
              <div className="reg-success-icon">✓</div>
              <h3>Registration Successful</h3>
              <p>{success}</p>
              <button type="button" className="login-submit-btn" onClick={() => onBack(selectedRole)}>
                Proceed to Sign In <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <p className="eyebrow" style={{ color: '#2563eb' }}>NEW ACCOUNT</p>
                <h2>Register</h2>
                <p className="login-card-sub">Create your portal account</p>
              </div>

              {/* Role selector */}
              <div className="role-select-group">
                <label className="field-label">Account Type <span className="required">*</span></label>
                <div className="role-cards">
                  {ROLE_META.map(r => (
                    <button
                      key={r.role}
                      type="button"
                      className={`role-card ${selectedRole === r.role ? 'selected' : ''}`}
                      onClick={() => { setSelectedRole(r.role); setError(''); }}
                    >
                      <span className="role-card-icon">{r.icon}</span>
                      <span className="role-card-label">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Common fields ── */}
              <div className="reg-fields-grid">
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-name">Full Name <span className="required">*</span></label>
                  <input id="reg-name" type="text" className={`field-input ${fieldErrors.name ? 'input-error' : ''}`}
                    placeholder="Enter your full name" value={form.name || ''} onChange={e => setF('name', e.target.value)} />
                  {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
                </div>

                {/* Role-specific ID field */}
                {selectedRole === 'LABOUR_OFFICER' && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="reg-empid">Employee / Officer ID</label>
                    <input id="reg-empid" type="text" className="field-input"
                      placeholder="e.g. TN-OFF-2024-001" value={form.employeeId || ''} onChange={e => setF('employeeId', e.target.value)} />
                  </div>
                )}
                {selectedRole === 'LABOUR_INSPECTOR' && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="reg-inspid">Inspector ID</label>
                    <input id="reg-inspid" type="text" className="field-input"
                      placeholder="e.g. TN-INS-2024-001" value={form.inspectorId || ''} onChange={e => setF('inspectorId', e.target.value)} />
                  </div>
                )}
                {selectedRole === 'EMPLOYER' && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="reg-estname">Establishment Name</label>
                    <input id="reg-estname" type="text" className="field-input"
                      placeholder="Name of your establishment" value={form.establishmentName || ''} onChange={e => setF('establishmentName', e.target.value)} />
                  </div>
                )}

                <div className="field-group">
                  <label className="field-label" htmlFor="reg-email">Email Address <span className="required">*</span></label>
                  <input id="reg-email" type="email" className={`field-input ${fieldErrors.email ? 'input-error' : ''}`}
                    placeholder="Enter your official email" value={form.email || ''} onChange={e => setF('email', e.target.value)} autoComplete="email" />
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="reg-phone">Phone Number</label>
                  <input id="reg-phone" type="tel" className={`field-input ${fieldErrors.phone ? 'input-error' : ''}`}
                    placeholder="10-digit mobile number" value={form.phone || ''} onChange={e => setF('phone', e.target.value)} />
                  {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                </div>

                {(selectedRole === 'LABOUR_OFFICER' || selectedRole === 'LABOUR_INSPECTOR') && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="reg-district">District / Office</label>
                    <select id="reg-district" className="field-input"
                      value={form.districtId || ''} onChange={e => setF('districtId', e.target.value)}>
                      <option value="">-- Select District --</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}

                {selectedRole === 'EMPLOYER' && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="reg-regno">Registration Number</label>
                    <input id="reg-regno" type="text" className="field-input"
                      placeholder="e.g. TN-1234" value={form.registrationNumber || ''} onChange={e => setF('registrationNumber', e.target.value)} />
                  </div>
                )}

                <div className="field-group">
                  <label className="field-label" htmlFor="reg-pw">Password <span className="required">*</span></label>
                  <div className="pw-wrap">
                    <input id="reg-pw" type={showPw ? 'text' : 'password'}
                      className={`field-input pw-input ${fieldErrors.password ? 'input-error' : ''}`}
                      placeholder="Minimum 8 characters" value={form.password || ''} onChange={e => setF('password', e.target.value)} autoComplete="new-password" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                      <Eye size={17} /><span style={{ fontSize: 11 }}>{showPw ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="reg-cpw">Confirm Password <span className="required">*</span></label>
                  <div className="pw-wrap">
                    <input id="reg-cpw" type={showCpw ? 'text' : 'password'}
                      className={`field-input pw-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Re-enter password" value={form.confirmPassword || ''} onChange={e => setF('confirmPassword', e.target.value)} autoComplete="new-password" />
                    <button type="button" className="pw-toggle" onClick={() => setShowCpw(v => !v)} tabIndex={-1}>
                      <Eye size={17} /><span style={{ fontSize: 11 }}>{showCpw ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              {error && <div className="error" role="alert">{error}</div>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <><span className="spinner-sm" /> Creating Account...</> : <>Create Account <ArrowRight size={17} /></>}
              </button>

              <div className="login-register-row">
                <span>Already have an account?</span>
                <button type="button" className="link-btn" onClick={() => onBack()}>Sign in here</button>
              </div>
            </>
          )}
        </form>
      </section>
    </main>
  );
}

// ----------------------------------------------------
// SIDEBAR STRUCTURE & DEFINITION
// ----------------------------------------------------
type NavSubitem = { id: string; label: string };
type NavItem = { id: string; label: string; icon: any; subitems?: NavSubitem[] };

// EXACT 8 OFFICER SIDEBAR ITEMS WITH ASSIGN INSPECTION SUBITEM
const OFFICER_NAV: NavItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'Establishments', label: 'Establishments', icon: Building2,
    subitems: [
      { id: 'All Establishments', label: 'All Establishments' },
      { id: 'Pending Registrations', label: 'Pending Registrations' }
    ]
  },
  {
    id: 'Compliance & Risk', label: 'Compliance & Risk', icon: ShieldCheck,
    subitems: [
      { id: 'Compliance Submissions', label: 'Compliance Submissions' },
      { id: 'Compliance History', label: 'Compliance History' }
    ]
  },
  {
    id: 'Inspections', label: 'Inspections', icon: ClipboardCheck,
    subitems: [
      { id: 'Inspection Reports', label: 'Inspection Reports' },
      { id: 'Assign Inspection', label: 'Assign Inspection' }
    ]
  },
  {
    id: 'Enforcement', label: 'Enforcement', icon: AlertTriangle,
    subitems: [
      { id: 'Violations', label: 'Violations' },
      { id: 'Notices', label: 'Notices' },
      { id: 'Corrective Actions', label: 'Corrective Actions' },
      { id: 'Follow-up', label: 'Follow-up' }
    ]
  },
  { id: 'Profile', label: 'Profile', icon: User }
];

const INSPECTOR_NAV: NavItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'My Inspections', label: 'My Inspections', icon: ClipboardCheck,
    subitems: [
      { id: 'Assigned', label: 'Assigned' },
      { id: 'Upcoming', label: 'Upcoming' },
      { id: 'Follow-up', label: 'Follow-up' }
    ]
  },
  {
    id: 'Inspection Reports', label: 'Inspection Reports', icon: FileText,
    subitems: [
      { id: 'Draft Reports', label: 'Draft Reports' },
      { id: 'Submitted Reports', label: 'Submitted Reports' },
      { id: 'Inspection History', label: 'Inspection History' }
    ]
  },
  { id: 'Profile', label: 'Profile', icon: User }
];

const EMPLOYER_NAV: NavItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'My Establishment', label: 'My Establishment', icon: Building2,
    subitems: [
      { id: 'Establishment Details', label: 'Establishment Details' },
      { id: 'Registration', label: 'Registration' },
      { id: 'Registration Status', label: 'Registration Status' }
    ]
  },
  {
    id: 'Compliance', label: 'Compliance', icon: ShieldCheck,
    subitems: [
      { id: 'Submit Compliance', label: 'Submit Compliance' },
      { id: 'Compliance History', label: 'Compliance History' },
      { id: 'Documents', label: 'Documents' }
    ]
  },
  {
    id: 'Inspections', label: 'Inspections', icon: ClipboardCheck,
    subitems: [
      { id: 'Upcoming', label: 'Upcoming' },
      { id: 'Inspection Details', label: 'Inspection Details' },
      { id: 'Inspection History', label: 'Inspection History' }
    ]
  },
  {
    id: 'Actions', label: 'Actions', icon: AlertTriangle,
    subitems: [
      { id: 'Notices', label: 'Notices' },
      { id: 'Explanations', label: 'Explanations' },
      { id: 'Corrective Actions', label: 'Corrective Actions' }
    ]
  },
  { id: 'Profile', label: 'Profile', icon: User }
];

// Sidebar Component
function Sidebar({
  user,
  activeMain,
  activeSub,
  collapsed,
  onToggleCollapse,
  onSelectNav,
  onLogout
}: {
  user: UserType;
  activeMain: string;
  activeSub: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectNav: (mainId: string, subId?: string) => void;
  onLogout: () => void;
}) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(activeMain);

  useEffect(() => {
    setOpenSubmenu(activeMain);
  }, [activeMain]);

  const navItems = user.role === 'LABOUR_OFFICER' ? OFFICER_NAV :
    user.role === 'LABOUR_INSPECTOR' ? INSPECTOR_NAV : EMPLOYER_NAV;

  const toggleSubmenu = (mainId: string) => {
    if (openSubmenu === mainId) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(mainId);
    }
  };

  return (
    <aside className={collapsed ? 'collapsed' : ''}>
      <button className="collapse-btn" onClick={onToggleCollapse} title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="brand">
        <div className="mini">TN</div>
        {!collapsed && (
          <div className="brand-text">
            <b>TN Labour Dept</b>
            <small>{user.role.replace(/_/g, ' ')}</small>
          </div>
        )}
      </div>

      <div className="profile-card">
        <div className="avatar">{user.name[0]}</div>
        {!collapsed && (
          <div className="profile-info">
            <b>{user.name}</b>
            <small>{user.email}</small>
          </div>
        )}
      </div>

      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isMainActive = activeMain === item.id;
          const hasSub = Boolean(item.subitems && item.subitems.length > 0);
          const isExpanded = openSubmenu === item.id;

          return (
            <div key={item.id} className="nav-group">
              <button
                className={`nav-item ${isMainActive ? 'active' : ''}`}
                onClick={() => {
                  if (hasSub) {
                    toggleSubmenu(item.id);
                    if (item.subitems && item.subitems.length > 0) {
                      onSelectNav(item.id, item.subitems[0].id);
                    }
                  } else {
                    onSelectNav(item.id);
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                <span className="icon"><Icon size={19} /></span>
                {!collapsed && <span className="label">{item.label}</span>}
                {!collapsed && hasSub && (
                  <span className="arrow">
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </span>
                )}
              </button>

              {!collapsed && hasSub && isExpanded && (
                <div className="submenu">
                  {item.subitems?.map((sub) => {
                    const isSubActive = activeSub === sub.id;
                    return (
                      <button
                        key={sub.id}
                        className={`submenu-item ${isSubActive ? 'active' : ''}`}
                        onClick={() => onSelectNav(item.id, sub.id)}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button className="signout" onClick={onLogout} title={collapsed ? "Sign Out" : undefined}>
        <LogOut size={18} />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </aside>
  );
}

// ----------------------------------------------------
// DUMMY DATA FOR OFFICER PROTOTYPE
// ----------------------------------------------------
const PENDING_REGISTRATIONS_DATA = [
  { id: 'EST-1001', establishmentName: 'Sakthi Textiles Pvt Ltd', type: 'Textile Manufacturing', district: 'Tiruppur', totalEmployees: 280, submittedDate: '2026-08-15', verificationStatus: 'PENDING_VERIFICATION', documentVerificationStatus: 'PENDING', ownerName: 'R. Sakthivel' },
  { id: 'EST-1002', establishmentName: 'Erode Engineering Works', type: 'Engineering & Metallurgy', district: 'Erode', totalEmployees: 140, submittedDate: '2026-08-18', verificationStatus: 'UNDER_REVIEW', documentVerificationStatus: 'APPROVED', ownerName: 'S. Loganathan' },
  { id: 'EST-1003', establishmentName: 'Kongu Construction Services', type: 'Construction & Civil', district: 'Coimbatore', totalEmployees: 320, submittedDate: '2026-08-20', verificationStatus: 'CORRECTION_REQUIRED', documentVerificationStatus: 'REJECTED', ownerName: 'K. Palanisamy' },
  { id: 'EST-1004', establishmentName: 'Salem Food Products Unit', type: 'Food Processing', district: 'Salem', totalEmployees: 95, submittedDate: '2026-08-22', verificationStatus: 'PENDING_VERIFICATION', documentVerificationStatus: 'PENDING', ownerName: 'M. Sampath' },
  { id: 'EST-1005', establishmentName: 'Metro Retail Outlets Ltd', type: 'Retail & Commercial', district: 'Chennai', totalEmployees: 210, submittedDate: '2026-08-25', verificationStatus: 'UNDER_REVIEW', documentVerificationStatus: 'APPROVED', ownerName: 'A. Ramanathan' },
  { id: 'EST-1006', establishmentName: 'Namakkal Poultry Feeds', type: 'Agro Processing', district: 'Namakkal', totalEmployees: 85, submittedDate: '2026-08-28', verificationStatus: 'PENDING_VERIFICATION', documentVerificationStatus: 'PENDING', ownerName: 'P. Sengottaiyan' }
];

const COMPLIANCE_SUBMISSIONS_DATA = [
  { id: 'CS-901', establishmentName: 'Sakthi Textiles Pvt Ltd', submissionType: 'Annual Wage & Attendance Return', submittedDate: '2026-08-30', complianceStatus: 'Compliant', reviewStatus: 'UNDER_REVIEW' },
  { id: 'CS-902', establishmentName: 'Erode Engineering Works', submissionType: 'Q2 Overtime & Wage Filing', submittedDate: '2026-08-28', complianceStatus: 'Correction Required', reviewStatus: 'CORRECTION_REQUIRED' },
  { id: 'CS-903', establishmentName: 'Kongu Construction Services', submissionType: 'Statutory Attendance Register', submittedDate: '2026-08-25', complianceStatus: 'Compliant', reviewStatus: 'ACCEPTED' },
  { id: 'CS-904', establishmentName: 'Salem Food Products Unit', submissionType: 'Minimum Wage Payment Filing', submittedDate: '2026-08-22', complianceStatus: 'Non-Compliant', reviewStatus: 'CORRECTION_REQUIRED' },
  { id: 'CS-905', establishmentName: 'Metro Retail Outlets Ltd', submissionType: 'Equal Remuneration Return', submittedDate: '2026-08-20', complianceStatus: 'Pending Review', reviewStatus: 'SUBMITTED' }
];

const COMPLIANCE_HISTORY_DATA = [
  { id: 'CH-801', establishmentName: 'Sakthi Textiles Pvt Ltd', submissionDate: '2026-07-15', compliancePeriod: 'Q1 2026', complianceStatus: 'ACCEPTED', previousStatus: 'UNDER_REVIEW', reviewDate: '2026-07-20' },
  { id: 'CH-802', establishmentName: 'Erode Engineering Works', submissionDate: '2026-06-10', compliancePeriod: 'Annual 2025-26', complianceStatus: 'CORRECTION_REQUIRED', previousStatus: 'SUBMITTED', reviewDate: '2026-06-18' },
  { id: 'CH-803', establishmentName: 'Kongu Construction Services', submissionDate: '2026-05-05', compliancePeriod: 'Q1 2026', complianceStatus: 'ACCEPTED', previousStatus: 'UNDER_REVIEW', reviewDate: '2026-05-12' },
  { id: 'CH-804', establishmentName: 'Salem Food Products Unit', submissionDate: '2026-04-12', compliancePeriod: 'Annual 2025-26', complianceStatus: 'ACCEPTED', previousStatus: 'SUBMITTED', reviewDate: '2026-04-20' },
  { id: 'CH-805', establishmentName: 'Metro Retail Outlets Ltd', submissionDate: '2026-03-01', compliancePeriod: 'Q4 2025', complianceStatus: 'ACCEPTED', previousStatus: 'UNDER_REVIEW', reviewDate: '2026-03-08' }
];

const INSPECTION_REPORTS_DATA = [
  { id: 'INSP-2026-01', establishmentName: 'Sakthi Textiles Pvt Ltd', inspector: 'R. Kumar', inspectionDate: '2026-08-10', riskLevel: 'HIGH', status: 'SUBMITTED', remarks: 'Wage register anomalies detected during random check.' },
  { id: 'INSP-2026-02', establishmentName: 'Erode Engineering Works', inspector: 'S. Prakash', inspectionDate: '2026-08-12', riskLevel: 'MEDIUM', status: 'UNDER_REVIEW', remarks: 'Overtime hours exceed permissible statutory threshold.' },
  { id: 'INSP-2026-03', establishmentName: 'Kongu Construction Services', inspector: 'M. Anand', inspectionDate: '2026-08-14', riskLevel: 'CRITICAL', status: 'REVIEWED', remarks: 'Contractor wage disbursement records missing for 42 workers.' },
  { id: 'INSP-2026-04', establishmentName: 'Salem Food Products Unit', inspector: 'K. Suresh', inspectionDate: '2026-08-18', riskLevel: 'LOW', status: 'FOLLOW_UP_REQUIRED', remarks: 'Minor discrepancy in statutory display boards.' },
  { id: 'INSP-2026-05', establishmentName: 'Metro Retail Outlets Ltd', inspector: 'R. Kumar', inspectionDate: '2026-08-20', riskLevel: 'MEDIUM', status: 'CLOSED', remarks: 'All minimum wage registers verified and compliant.' }
];

// ENFORCEMENT DATA WITH EXPLICIT TWO-WAY VIOLATION <-> FOLLOW-UP MAPPING
const VIOLATIONS_DATA = [
  { id: 'VIO-1001', establishmentName: 'Sakthi Textiles Pvt Ltd', category: 'Wage Disbursement & Attendance Anomaly', severity: 'HIGH', status: 'OPEN', legalReference: 'Minimum Wages Act 1948 Sec 12', followUpId: 'FU-2001' },
  { id: 'VIO-1002', establishmentName: 'Erode Engineering Works', category: 'Overtime Calculation Threshold Exceeded', severity: 'MEDIUM', status: 'OPEN', legalReference: 'Factories Act 1948 Sec 59', followUpId: null },
  { id: 'VIO-1003', establishmentName: 'Kongu Construction Services', category: 'Contractor Wage Records Missing', severity: 'CRITICAL', status: 'OPEN', legalReference: 'Contract Labour Act 1970 Sec 21', followUpId: 'FU-2003' }
];

const FOLLOWUPS_DATA = [
  { id: 'FU-2001', establishmentName: 'Sakthi Textiles Pvt Ltd', scheduledDate: '2026-09-15', inspector: 'Inspector Meera', status: 'PENDING', verificationResult: 'Awaiting Inspection', violationId: 'VIO-1001' },
  { id: 'FU-2003', establishmentName: 'Kongu Construction Services', scheduledDate: '2026-09-20', inspector: 'Inspector Meera', status: 'IN_PROGRESS', verificationResult: 'Under Verification', violationId: 'VIO-1003' }
];

// ----------------------------------------------------
// OFFICER DASHBOARD (WITH INTEGRATED ANALYTICS & NO ACTION CENTRE)
// ----------------------------------------------------
function OfficerDashboard() {
  const [d, setD] = useState<ApiData>({});
  const [q, setQ] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api('/dashboard'), api('/risk/priority-queue')])
      .then(([x, y]) => { setD(x); setQ(y); })
      .catch(() => { });
  }, []);

  // Analytics Dummy Charts Data
  const riskDistData = [
    { name: 'LOW', count: 42, color: '#10b981' },
    { name: 'MEDIUM', count: 28, color: '#3b82f6' },
    { name: 'HIGH', count: 14, color: '#f59e0b' },
    { name: 'CRITICAL', count: 6, color: '#ef4444' }
  ];

  const complianceOverviewData = [
    { name: 'Compliant', value: 58 },
    { name: 'Pending Review', value: 18 },
    { name: 'Correction Required', value: 14 },
    { name: 'Non-Compliant', value: 10 }
  ];

  const inspectionOverviewData = [
    { status: 'Pending', count: 12 },
    { status: 'Scheduled', count: 8 },
    { status: 'Completed', count: 34 },
    { status: 'Follow-up', count: 6 }
  ];

  const monthlyTrendsData = [
    { month: 'Jan', compliance: 72, inspections: 18 },
    { month: 'Feb', compliance: 75, inspections: 22 },
    { month: 'Mar', compliance: 78, inspections: 20 },
    { month: 'Apr', compliance: 82, inspections: 25 },
    { month: 'May', compliance: 80, inspections: 28 },
    { month: 'Jun', compliance: 85, inspections: 30 },
    { month: 'Jul', compliance: 88, inspections: 32 },
    { month: 'Aug', compliance: 86, inspections: 35 }
  ];

  return (
    <>
      <Hero
        title="Department Oversight Dashboard & Integrated Analytics"
        text="Real-time wage compliance KPIs, risk distribution, inspection trends, and informational priority queue."
      />

      {/* KPI Cards (No Action Centre) */}
      <div className="metrics">
        <Card name="Total Establishments" value={d.totals?.establishments || 90} Icon={Building2} colorClass="blue" />
        <Card name="Pending Registrations" value={6} Icon={Clock} colorClass="orange" />
        <Card name="Compliance Submissions" value={5} Icon={FileText} colorClass="green" />
        <Card name="High / Critical Risk" value={20} Icon={AlertTriangle} colorClass="red" />
        <Card name="Pending Inspections" value={12} Icon={ClipboardCheck} colorClass="purple" />
        <Card name="Open Violations" value={d.totals?.openViolations || 4} Icon={AlertTriangle} colorClass="red" />
        <Card name="Pending Notices" value={d.totals?.pendingNotices || 3} Icon={FileText} colorClass="orange" />
        <Card name="Corrective Actions" value={5} Icon={CheckCircle2} colorClass="blue" />
      </div>

      {/* Integrated Analytics Charts Grid */}
      <section className="grid" style={{ marginBottom: 24 }}>
        <article className="panel">
          <div className="panel-title">
            <div>
              <h3>Risk Level Distribution</h3>
              <p>Establishment risk classification across Tamil Nadu</p>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f2d59" radius={[6, 6, 0, 0]}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <h3>Compliance Overview</h3>
              <p>Statutory wage filing status breakdown</p>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complianceOverviewData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {complianceOverviewData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid" style={{ marginBottom: 24 }}>
        <article className="panel">
          <div className="panel-title">
            <div>
              <h3>Monthly Compliance & Inspection Trends</h3>
              <p>8-Month department performance trajectory</p>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={3} name="Compliance Rate (%)" />
                <Line type="monotone" dataKey="inspections" stroke="#3b82f6" strokeWidth={3} name="Inspections Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <h3>Inspection Status Overview</h3>
              <p>Current state of field inspection tasks</p>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inspectionOverviewData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Informational Priority Queue (NO Action column or buttons) */}
      <section className="panel table-panel">
        <div className="panel-title">
          <div>
            <h3>Inspection Priority Queue (Informational)</h3>
            <p>Establishments ordered by explainable risk score</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Establishment</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Priority</th>
                <th>Last Inspection</th>
              </tr>
            </thead>
            <tbody>
              {q.map((row) => (
                <tr key={row.id}>
                  <td><b>{row.establishmentName}</b><br /><small>{row.industry}</small></td>
                  <td><b style={{ fontSize: 15 }}>{row.risk?.riskScore ?? 50}/100</b></td>
                  <td><Badge value={row.risk?.riskLevel || 'MEDIUM'} /></td>
                  <td><Badge value={row.risk?.riskLevel === 'CRITICAL' ? 'HIGH' : row.risk?.riskLevel === 'HIGH' ? 'HIGH' : 'NORMAL'} /></td>
                  <td>{row.lastInspectionDate ? row.lastInspectionDate.slice(0, 10) : 'Overdue (>300 days)'}</td>
                </tr>
              ))}
              {!q.length && <tr><td colSpan={5}>No priority establishments recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ----------------------------------------------------
// ESTABLISHMENTS MODULE (OFFICER WITH DOCUMENT VERIFICATION)
// ----------------------------------------------------
function EstablishmentsModule({ subTab }: { subTab: string }) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEst, setSelectedEst] = useState<any | null>(null);
  const [docModalEst, setDocModalEst] = useState<any | null>(null);
  const [docRemarks, setDocRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const loadEstablishments = () => {
    if (subTab === 'Pending Registrations') {
      api('/officer/establishments/pending').then(res => setData(res.items || [])).catch(() => { });
    } else {
      api('/establishments').then(res => setData(res.items || [])).catch(() => { });
    }
  };

  useEffect(() => {
    loadEstablishments();
  }, [subTab]);

  const openDocReview = (est: any) => {
    setDocModalEst(est);
    setDocRemarks(est.documentVerificationRemarks || '');
    setErr('');
    setPreviewDoc(null);
  };

  const handleDocVerification = async (newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    if (!docModalEst) return;
    if (newStatus === 'REJECTED' && (!docRemarks || !docRemarks.trim())) {
      setErr('Officer remarks / rejection reason is required when rejecting documents.');
      return;
    }

    if (!window.confirm(`Are you sure you want to set Document Verification status to ${newStatus}?`)) {
      return;
    }

    setLoading(true);
    setErr('');
    try {
      await api(`/officer/establishments/${docModalEst.id}/document-verification`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, remarks: docRemarks })
      });

      // Update local states
      docModalEst.documentVerificationStatus = newStatus;
      docModalEst.documentVerificationRemarks = docRemarks;

      // Update matching items in lists
      const listMatch = data.find(x => x.id === docModalEst.id);
      if (listMatch) {
        listMatch.documentVerificationStatus = newStatus;
      }

      setToast(`Document verification status updated to ${newStatus}.`);
      setLoading(false);
      setDocModalEst(null);
      loadEstablishments();
    } catch (e: any) {
      setLoading(false);
      setErr(e.message || 'Failed to update document verification status');
    }
  };

  return (
    <>
      <Hero
        title={`Establishments — ${subTab}`}
        text="Review registered establishments, verify registration applications, and review statutory establishment documents."
      />
      {toast && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 18 }}>{toast}</p>}

      {subTab === 'Pending Registrations' ? (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Pending Registration Applications</h3>
              <p>Registration & Document Verification Status Monitoring</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Establishment ID</th>
                  <th>Establishment Name</th>
                  <th>Industry Type</th>
                  <th>District</th>
                  <th>Workers</th>
                  <th>Submitted Date</th>
                  <th>Verification Status</th>
                  <th>Document Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td><b>{row.id}</b></td>
                    <td><b>{row.establishmentName}</b></td>
                    <td>{row.industry || row.industryType}</td>
                    <td>{row.districtId || 'Chennai'}</td>
                    <td>{row.totalEmployees || 50}</td>
                    <td>{String(row.createdAt).slice(0, 10)}</td>
                    <td><Badge value={row.verificationStatus} /></td>
                    <td><Badge value={row.documentVerificationStatus || 'PENDING'} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => openDocReview(row)}>Review Documents</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="panel table-panel">
          <div className="filters-bar">
            <div className="search">
              <Search size={16} />
              <input placeholder="Search establishment name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Establishment Name</th>
                  <th>Reg. Number</th>
                  <th>Industry</th>
                  <th>Employees</th>
                  <th>Verification Status</th>
                  <th>Document Verification</th>
                  <th>Risk Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter(e => e.establishmentName.toLowerCase().includes(search.toLowerCase()))
                  .map((e) => (
                    <tr key={e.id}>
                      <td><b>{e.establishmentName}</b><br /><small>{e.ownerName || 'Representative'}</small></td>
                      <td>{e.registrationNumber}</td>
                      <td>{e.industry || e.industryType}</td>
                      <td>{e.totalEmployees || 50}</td>
                      <td><Badge value={e.verificationStatus} /></td>
                      <td><Badge value={e.documentVerificationStatus || 'PENDING'} /></td>
                      <td>
                        <Badge value={e.risk?.riskLevel || 'LOW'} />
                        <span style={{ marginLeft: 8, fontWeight: 700 }}>{e.risk?.riskScore || 0}/100</span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" style={{ marginRight: 6 }} onClick={() => setSelectedEst(e)}>Details</button>
                        <button className="btn btn-primary btn-sm" onClick={() => openDocReview(e)}>Verify Docs</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Establishment Details Drawer / Modal */}
      {selectedEst && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{selectedEst.establishmentName}</h3>
              <button className="close-btn" onClick={() => setSelectedEst(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: 12, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
              <div><b>ID / Reg No:</b> {selectedEst.id || selectedEst.registrationNumber}</div>
              <div><b>Industry Type:</b> {selectedEst.type || selectedEst.industry || selectedEst.industryType}</div>
              <div><b>District:</b> {selectedEst.district || 'Chennai'}</div>
              <div><b>Total Employees:</b> {selectedEst.totalEmployees || 50}</div>
              <div><b>Verification Status:</b> <Badge value={selectedEst.verificationStatus || selectedEst.status} /></div>
              <div><b>Document Verification:</b> <Badge value={selectedEst.documentVerificationStatus || 'PENDING'} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setSelectedEst(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT REVIEW & VERIFICATION MODAL */}
      {docModalEst && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h3>Document Verification — {docModalEst.establishmentName}</h3>
              <button className="close-btn" onClick={() => setDocModalEst(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                <div><b>Establishment Name:</b> {docModalEst.establishmentName}</div>
                <div><b>Registration No:</b> {docModalEst.registrationNumber || docModalEst.id}</div>
                <div><b>District:</b> {docModalEst.district || 'Tiruppur'}</div>
                <div><b>Employer / Authorized Person:</b> {docModalEst.ownerName || 'Authorized Representative'}</div>
                <div><b>Submitted Date:</b> {docModalEst.submittedDate || docModalEst.createdAt?.slice(0, 10) || '2026-08-25'}</div>
                <div><b>Current Document Status:</b> <Badge value={docModalEst.documentVerificationStatus || 'PENDING'} /></div>
              </div>

              {/* Submitted Documents List */}
              <h4 style={{ margin: '8px 0 4px', color: '#0f2d59' }}>Submitted Statutory Registration Documents:</h4>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden' }}>
                {[
                  { title: 'Form-A Registration Certificate', type: 'PDF Document', file: 'tn_form_a_cert.pdf' },
                  { title: 'Business Ownership / Incorporation Proof', type: 'PDF Document', file: 'business_incorporation.pdf' },
                  { title: 'Wage & Employment Roll Register', type: 'Excel Spreadsheet / PDF', file: 'employee_roll_2026.pdf' },
                  { title: 'Statutory Premises Layout & Lease Deed', type: 'PDF Document', file: 'lease_deed_premises.pdf' }
                ].map((doc, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: idx < 3 ? '1px solid #e2e8f0' : 'none' }}>
                    <div>
                      <b style={{ fontSize: 13, color: '#1e293b' }}>{doc.title}</b>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{doc.type} • {doc.file}</div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewDoc(previewDoc === doc.title ? null : doc.title)}
                    >
                      {previewDoc === doc.title ? 'Hide Preview' : 'View Document'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Document Preview Panel */}
              {previewDoc && (
                <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', padding: 14, borderRadius: 8 }}>
                  <b style={{ color: '#1e40af' }}>Viewing Document Preview: {previewDoc}</b>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#1e3a8a' }}>
                    Official digital copy verified against Tamil Nadu Labour Department Portal records. File checksum: SHA256-VALIDATED.
                  </p>
                </div>
              )}

              {/* Officer Remarks */}
              <label style={{ display: 'block', marginTop: 6 }}>Officer Remarks / Clarification (Required for Rejection):
                <textarea
                  rows={3}
                  value={docRemarks}
                  onChange={e => { setDocRemarks(e.target.value); setErr(''); }}
                  placeholder="Enter verification notes or rejection reasons..."
                  style={{ width: '100%', marginTop: 6 }}
                />
              </label>

              {err && <p className="error" style={{ margin: 0 }}>{err}</p>}

              {/* Verification Action Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={loading}
                  onClick={() => handleDocVerification('APPROVED')}
                >
                  {loading ? 'Processing...' : 'Approve Documents'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={loading}
                  onClick={() => handleDocVerification('REJECTED')}
                >
                  {loading ? 'Processing...' : 'Reject Documents'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={loading}
                  onClick={() => handleDocVerification('PENDING')}
                >
                  Keep Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------
// COMPLIANCE & RISK MODULE (OFFICER)
// ----------------------------------------------------
function ComplianceRiskModule({ subTab }: { subTab: string }) {
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  return (
    <>
      <Hero
        title={`Compliance & Risk — ${subTab}`}
        text="Review periodic statutory wage filings, attendance declarations, and historical compliance records."
      />

      {subTab === 'Compliance History' ? (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Establishment Compliance History</h3>
              <p>Historical compliance record log</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Establishment</th>
                  <th>Submission Date</th>
                  <th>Compliance Period</th>
                  <th>Status</th>
                  <th>Previous Status</th>
                  <th>Review Date</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_HISTORY_DATA.map((row) => (
                  <tr key={row.id}>
                    <td><b>{row.establishmentName}</b></td>
                    <td>{row.submissionDate}</td>
                    <td>{row.compliancePeriod}</td>
                    <td><Badge value={row.complianceStatus} /></td>
                    <td><Badge value={row.previousStatus} /></td>
                    <td>{row.reviewDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Employer Compliance Submissions</h3>
              <p>Current period statutory wage declarations</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Establishment Name</th>
                  <th>Submission Type</th>
                  <th>Submitted Date</th>
                  <th>Compliance Status</th>
                  <th>Review Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_SUBMISSIONS_DATA.map((row) => (
                  <tr key={row.id}>
                    <td><b>{row.id}</b></td>
                    <td><b>{row.establishmentName}</b></td>
                    <td>{row.submissionType}</td>
                    <td>{row.submittedDate}</td>
                    <td><Badge value={row.complianceStatus === 'Compliant' ? 'ACCEPTED' : row.complianceStatus === 'Non-Compliant' ? 'CORRECTION_REQUIRED' : 'PENDING'} /></td>
                    <td><Badge value={row.reviewStatus} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSubmission(row)}>Review Submission</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Review Compliance Submission — {selectedSubmission.id}</h3>
              <button className="close-btn" onClick={() => setSelectedSubmission(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div><b>Establishment:</b> {selectedSubmission.establishmentName}</div>
              <div><b>Submission Type:</b> {selectedSubmission.submissionType}</div>
              <div><b>Submitted Date:</b> {selectedSubmission.submittedDate}</div>
              <div><b>Status:</b> <Badge value={selectedSubmission.reviewStatus} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------
// INSPECTIONS MODULE (OFFICER) WITH ASSIGN INSPECTION PAGE
// ----------------------------------------------------
function InspectionsModule({ subTab }: { subTab: string }) {
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Assign Inspection Form States
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [selectedEstId, setSelectedEstId] = useState('');
  const [selectedInspectorId, setSelectedInspectorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [inspectionType, setInspectionType] = useState('Risk-Based');
  const [instructions, setInstructions] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/establishments').then(res => setEstablishments(res.items || [])).catch(() => { });
    api('/users/inspectors').then(setInspectors).catch(() => { });
  }, []);

  const selectedEstObj = establishments.find(e => e.id === selectedEstId);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstId || !selectedInspectorId) return;

    try {
      await api('/inspections', {
        method: 'POST',
        body: JSON.stringify({
          establishmentId: selectedEstId,
          assignedInspectorId: selectedInspectorId,
          scheduledDate,
          inspectionType,
          instructions
        })
      });
      setMsg('Inspection assigned successfully.');
      setSelectedEstId('');
      setSelectedInspectorId('');
      setInstructions('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (subTab === 'Assign Inspection') {
    return (
      <>
        <Hero
          title="Assign Field Inspection"
          text="Authorize and assign targeted field inspections to eligible Labour Inspectors based on statutory risk scores."
        />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}

        <section className="panel" style={{ maxWidth: 750 }}>
          <form onSubmit={handleAssignSubmit}>
            <label style={{ display: 'block', marginBottom: 16 }}>Establishment
              <select
                value={selectedEstId}
                onChange={e => setSelectedEstId(e.target.value)}
                required
                className="filter-select"
                style={{ width: '100%', marginTop: 6 }}
              >
                <option value="">-- Select Establishment --</option>
                {establishments.map(e => (
                  <option key={e.id} value={e.id}>{e.establishmentName} ({e.registrationNumber})</option>
                ))}
              </select>
            </label>

            {selectedEstObj && (
              <div className="risk-card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: '#93c5fd' }}>Establishment Risk Preview</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>Risk Score</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{selectedEstObj.risk?.riskScore || 82} / 100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>Risk Level</div>
                    <div style={{ marginTop: 4 }}><Badge value={selectedEstObj.risk?.riskLevel || 'CRITICAL'} /></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>Priority</div>
                    <div style={{ marginTop: 4 }}><Badge value={selectedEstObj.risk?.riskLevel === 'CRITICAL' ? 'HIGH' : 'NORMAL'} /></div>
                  </div>
                </div>
              </div>
            )}

            <label style={{ display: 'block', marginBottom: 16 }}>Inspector
              <select
                value={selectedInspectorId}
                onChange={e => setSelectedInspectorId(e.target.value)}
                required
                className="filter-select"
                style={{ width: '100%', marginTop: 6 }}
              >
                <option value="">-- Select Inspector --</option>
                {inspectors.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Inspection Date
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: 6 }}
                />
              </label>
              <label>Inspection Type
                <select
                  value={inspectionType}
                  onChange={e => setInspectionType(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%', marginTop: 6 }}
                >
                  <option value="Routine">Routine</option>
                  <option value="Risk-Based">Risk-Based</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </label>
            </div>

            <label style={{ display: 'block', marginBottom: 20 }}>Instructions / Directives
              <textarea
                rows={4}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Specify wage register verification guidelines, attendance check instructions..."
                style={{ width: '100%', marginTop: 6 }}
              />
            </label>

            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> Assign Inspection
            </button>
          </form>
        </section>
      </>
    );
  }

  return (
    <>
      <Hero
        title={`Inspections — ${subTab}`}
        text="Review digital inspection reports, checklists, observations, findings, and evidence submitted by field inspectors."
      />

      <section className="panel table-panel">
        <div className="panel-title">
          <div>
            <h3>Inspection Reports Registry</h3>
            <p>Field inspection reports requiring officer review and decision</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Establishment Name</th>
                <th>Assigned Inspector</th>
                <th>Inspection Date</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {INSPECTION_REPORTS_DATA.map((row) => (
                <tr key={row.id}>
                  <td><b>{row.id}</b></td>
                  <td><b>{row.establishmentName}</b></td>
                  <td>{row.inspector}</td>
                  <td>{row.inspectionDate}</td>
                  <td><Badge value={row.riskLevel} /></td>
                  <td><Badge value={row.status} /></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedReport(row)}>
                      View Full Report & Findings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inspection Report & Findings Detail Viewer */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 750 }}>
            <div className="modal-header">
              <h3>Inspection Report Details — {selectedReport.id}</h3>
              <button className="close-btn" onClick={() => setSelectedReport(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                <div><b>Establishment:</b> {selectedReport.establishmentName}</div>
                <div><b>Inspector:</b> {selectedReport.inspector}</div>
                <div><b>Inspection Date:</b> {selectedReport.inspectionDate}</div>
                <div><b>Status:</b> <Badge value={selectedReport.status} /></div>
              </div>

              <h4>Digital Checklist Results:</h4>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Minimum Wages Payment Compliance</span>
                  <Badge value="PASS" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Attendance & Overtime Registers Maintenance</span>
                  <Badge value={selectedReport.riskLevel === 'HIGH' ? 'FAIL' : 'PASS'} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Statutory Displays & Inspection Book</span>
                  <Badge value="PASS" />
                </div>
              </div>

              <h4>Inspector Remarks & Findings:</h4>
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: 14, borderRadius: 8, color: '#9f1239' }}>
                <b>Observation:</b> {selectedReport.remarks}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setSelectedReport(null)}>Close Report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------
// ENFORCEMENT MODULE (WITH TWO-WAY VIOLATIONS <-> FOLLOW-UPS LINKING)
// ----------------------------------------------------
function EnforcementModule({ subTab }: { subTab: string }) {
  const [selectedFollowUp, setSelectedFollowUp] = useState<any | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<any | null>(null);

  const openFollowUp = (fuId: string) => {
    const fu = FOLLOWUPS_DATA.find(f => f.id === fuId);
    if (fu) setSelectedFollowUp(fu);
  };

  const openViolation = (vioId: string) => {
    const vio = VIOLATIONS_DATA.find(v => v.id === vioId);
    if (vio) setSelectedViolation(vio);
  };

  return (
    <>
      <Hero
        title={`Enforcement Management — ${subTab}`}
        text="Review inspector findings, manage statutory violations, track show-cause notices, and inspect related follow-up verifications."
      />

      {subTab === 'Follow-up' ? (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Follow-up Inspection Verification Tasks</h3>
              <p>Re-inspection tracking linked to statutory violations</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Follow-up ID</th>
                  <th>Establishment Name</th>
                  <th>Scheduled Date</th>
                  <th>Assigned Inspector</th>
                  <th>Status</th>
                  <th>Related Violation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {FOLLOWUPS_DATA.map((fu) => (
                  <tr key={fu.id}>
                    <td><b>{fu.id}</b></td>
                    <td><b>{fu.establishmentName}</b></td>
                    <td>{fu.scheduledDate}</td>
                    <td>{fu.inspector}</td>
                    <td><Badge value={fu.status} /></td>
                    <td>
                      <b style={{ color: '#1e40af' }}>{fu.violationId}</b>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openViolation(fu.violationId)}>
                        Related Violation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : subTab === 'Notices' ? (
        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Issued Statutory Notices</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Notice Number</th>
                  <th>Establishment</th>
                  <th>Issue Date</th>
                  <th>Response Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>TN/DEMO/2026/014</b></td>
                  <td>Sakthi Textiles Pvt Ltd</td>
                  <td>2026-08-10</td>
                  <td>2026-08-25</td>
                  <td><Badge value="OVERDUE" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : subTab === 'Corrective Actions' ? (
        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Employer Corrective Action Submissions</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Submission Description</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Wage arrears disbursed for 18 contract workers with bank proof attached.</td>
                  <td>2026-08-24</td>
                  <td><Badge value="UNDER_REVIEW" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* VIOLATIONS TAB WITH TWO-WAY FOLLOW-UP LINKING */
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Confirmed Statutory Violations</h3>
              <p>Confirmed findings linked to follow-up verification tasks</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Violation ID</th>
                  <th>Establishment Name</th>
                  <th>Violation Category</th>
                  <th>Severity</th>
                  <th>Legal Reference</th>
                  <th>Status</th>
                  <th>Related Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {VIOLATIONS_DATA.map((v) => (
                  <tr key={v.id}>
                    <td><b>{v.id}</b></td>
                    <td><b>{v.establishmentName}</b></td>
                    <td>{v.category}</td>
                    <td><Badge value={v.severity} /></td>
                    <td><small>{v.legalReference}</small></td>
                    <td><Badge value={v.status} /></td>
                    <td>
                      {v.followUpId ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => openFollowUp(v.followUpId)}>
                          View Follow-up ({v.followUpId})
                        </button>
                      ) : (
                        <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>No Follow-up Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Violation Detail Modal */}
      {selectedViolation && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Violation Details — {selectedViolation.id}</h3>
              <button className="close-btn" onClick={() => setSelectedViolation(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: 12, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
              <div><b>Violation ID:</b> {selectedViolation.id}</div>
              <div><b>Establishment:</b> {selectedViolation.establishmentName}</div>
              <div><b>Category:</b> {selectedViolation.category}</div>
              <div><b>Severity:</b> <Badge value={selectedViolation.severity} /></div>
              <div><b>Legal Reference:</b> {selectedViolation.legalReference}</div>
              <div><b>Status:</b> <Badge value={selectedViolation.status} /></div>
              {selectedViolation.followUpId && (
                <div><b>Linked Follow-up ID:</b> {selectedViolation.followUpId}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              {selectedViolation.followUpId && (
                <button className="btn btn-primary" onClick={() => { const fId = selectedViolation.followUpId; setSelectedViolation(null); openFollowUp(fId); }}>
                  View Related Follow-up
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedViolation(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Detail Modal */}
      {selectedFollowUp && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Follow-up Details — {selectedFollowUp.id}</h3>
              <button className="close-btn" onClick={() => setSelectedFollowUp(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: 12, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
              <div><b>Follow-up ID:</b> {selectedFollowUp.id}</div>
              <div><b>Establishment:</b> {selectedFollowUp.establishmentName}</div>
              <div><b>Scheduled Date:</b> {selectedFollowUp.scheduledDate}</div>
              <div><b>Assigned Inspector:</b> {selectedFollowUp.inspector}</div>
              <div><b>Status:</b> <Badge value={selectedFollowUp.status} /></div>
              <div><b>Related Violation ID:</b> {selectedFollowUp.violationId}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => { const vId = selectedFollowUp.violationId; setSelectedFollowUp(null); openViolation(vId); }}>
                View Related Violation ({selectedFollowUp.violationId})
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedFollowUp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------
// INSPECTOR MODULES (UNTOUCHED)
// ----------------------------------------------------
function InspectorDashboard({ onNavigate }: { onNavigate: (main: string, sub: string) => void }) {
  const [d, setD] = useState<ApiData>({});

  useEffect(() => {
    api('/dashboard/inspector').then(setD).catch(() => { });
  }, []);

  return (
    <>
      <Hero
        title="Labour Inspector Field Workspace"
        text="Digital inspection management, statutory wage checklists, site observations, evidence uploads, and follow-up verification."
      />

      {/* 6 KPI Cards for Inspector */}
      <div className="metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Card name="Assigned Inspections" value={d.totals?.assigned || INSPECTOR_KPI_STATS.assignedInspections} Icon={ClipboardCheck} colorClass="blue" />
        <Card name="Upcoming Inspections" value={d.totals?.upcoming || INSPECTOR_KPI_STATS.upcomingInspections} Icon={Clock} colorClass="purple" />
        <Card name="In Progress" value={INSPECTOR_KPI_STATS.inProgress} Icon={Activity} colorClass="orange" />
        <Card name="Submitted Reports" value={d.totals?.completed || INSPECTOR_KPI_STATS.submittedReports} Icon={FileText} colorClass="green" />
        <Card name="Follow-ups Required" value={d.totals?.followUps || INSPECTOR_KPI_STATS.followUpInspections} Icon={AlertTriangle} colorClass="red" />
        <Card name="Completed History" value={INSPECTOR_KPI_STATS.completedInspections} Icon={ShieldCheck} colorClass="teal" />
      </div>

      <div className="grid" style={{ marginBottom: 24 }}>
        {/* Assigned Field Inspections Table */}
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Active Assigned Field Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Inspections currently assigned to you for site execution.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('My Inspections', 'Assigned')}>View All Assigned</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment</th>
                  <th>District</th>
                  <th>Scheduled Date</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_ASSIGNED_INSPECTIONS.map((row: any) => (
                  <tr key={row.id}>
                    <td><b>{row.id}</b></td>
                    <td><b>{row.establishmentName}</b><br /><small>{row.industry}</small></td>
                    <td>{row.district}</td>
                    <td>{row.scheduledDate}</td>
                    <td><Badge value={row.riskLevel} /></td>
                    <td><Badge value={row.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('My Inspections', 'Assigned')}>
                        {row.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Follow-up Tasks Table */}
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Follow-up Verification Tasks</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Re-inspections assigned to verify employer violation corrections.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('My Inspections', 'Follow-up')}>View Follow-ups</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Follow-up ID</th>
                  <th>Establishment</th>
                  <th>Related Violation</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_FOLLOWUP_INSPECTIONS.map((fu: any) => (
                  <tr key={fu.id}>
                    <td><b>{fu.id}</b></td>
                    <td><b>{fu.establishmentName}</b></td>
                    <td><Badge value={fu.relatedViolation || 'VIO-1025'} /></td>
                    <td>{fu.scheduledDate}</td>
                    <td><Badge value={fu.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Recent Submitted Reports Table */}
      <section className="panel table-panel">
        <div className="panel-title">
          <div>
            <h3>Recent Submitted Inspection Reports</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Reports submitted for Labour Officer review and violation confirmation.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Inspection Reports', 'Submitted Reports')}>View Submitted Reports</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Establishment Name</th>
                <th>District</th>
                <th>Inspection Date</th>
                <th>Risk Level</th>
                <th>Submission Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_SUBMITTED_REPORTS.map((rpt: any) => (
                <tr key={rpt.id}>
                  <td><b>{rpt.id}</b></td>
                  <td><b>{rpt.establishmentName}</b></td>
                  <td>{rpt.district}</td>
                  <td>{rpt.inspectionDate}</td>
                  <td><Badge value={rpt.riskLevel} /></td>
                  <td>{rpt.submittedDate}</td>
                  <td><Badge value={rpt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function InspectorReportsModule({ subTab }: { subTab: string }) {
  const [apiInspections, setApiInspections] = useState<any[]>([]);
  const [selectedInsp, setSelectedInsp] = useState<any | null>(null);
  const [activeFormTab, setActiveFormTab] = useState('Overview');
  const [checklist, setChecklist] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [inspectorRemarks, setInspectorRemarks] = useState('');
  const [verificationResult, setVerificationResult] = useState<'CORRECTED' | 'PARTIALLY_CORRECTED' | 'NOT_CORRECTED'>('CORRECTED');
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    api('/inspections').then(res => {
      setApiInspections(Array.isArray(res) ? res : []);
    }).catch(() => { });
  };

  useEffect(() => {
    load();
  }, [subTab]);

  // Distinct datasets for each subTab (NO DUPLICATIONS)
  const assignedList = [...DUMMY_ASSIGNED_INSPECTIONS, ...apiInspections.filter(a => a.status !== 'COMPLETED' && !a.followUpFor && !DUMMY_ASSIGNED_INSPECTIONS.some(d => d.id === a.id))];
  const upcomingList = [...DUMMY_UPCOMING_INSPECTIONS];
  const followupList = [...DUMMY_FOLLOWUP_INSPECTIONS];
  const draftList = [...DUMMY_DRAFT_REPORTS];
  const submittedList = [...DUMMY_SUBMITTED_REPORTS];
  const historyList = [...DUMMY_INSPECTION_HISTORY];

  const openInspection = (i: any) => {
    const fullInsp = DUMMY_ASSIGNED_INSPECTIONS.find(x => x.id === i.id || x.id === i.inspectionId) ||
      DUMMY_UPCOMING_INSPECTIONS.find(x => x.id === i.id || x.id === i.inspectionId) ||
      DUMMY_FOLLOWUP_INSPECTIONS.find(x => x.id === i.id || x.id === i.inspectionId) ||
      DUMMY_DRAFT_REPORTS.find(x => x.id === i.id || x.id === i.inspectionId) ||
      DUMMY_SUBMITTED_REPORTS.find(x => x.id === i.id || x.id === i.inspectionId) ||
      i;
    setSelectedInsp(fullInsp);
    setChecklist(fullInsp.checklist || DUMMY_ASSIGNED_INSPECTIONS[0].checklist);
    setObservations(fullInsp.observations || []);
    setFindings(fullInsp.findings || []);
    setEvidence(fullInsp.evidence || []);
    setInspectorRemarks(fullInsp.inspectorRemarks || '');
    setVerificationResult(fullInsp.verificationResult || 'CORRECTED');
    setVerificationRemarks(fullInsp.verificationObservation || '');
    setActiveFormTab('Overview');
  };

  const handleStart = async () => {
    try {
      await api('/inspections/' + selectedInsp.id + '/start', { method: 'PATCH' }).catch(() => { });
      const updated = { ...selectedInsp, status: 'IN_PROGRESS' };
      setSelectedInsp(updated);
      setToast('Inspection started. Digital checklist & observation workspace unlocked.');
      load();
    } catch (err: any) { alert(err.message); }
  };

  const saveDraft = async (dataOverride?: any) => {
    try {
      const payload = dataOverride || { checklist, observations, findings, evidence, inspectorRemarks };
      await api('/inspections/' + selectedInsp.id + '/draft', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }).catch(() => { });
      const updated = { ...selectedInsp, ...payload, status: 'IN_PROGRESS' };
      setSelectedInsp(updated);
      setToast('Draft inspection report saved successfully.');
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleSubmitReport = async () => {
    if (!window.confirm('Submit Inspection Report to Labour Department Officer? Once submitted, the report cannot be modified.')) return;
    try {
      await api('/inspections/' + selectedInsp.id + '/report', {
        method: 'PATCH',
        body: JSON.stringify({ checklist, observations, findings, inspectorRemarks })
      }).catch(() => { });
      setToast(`Inspection report for ${selectedInsp.establishmentName} submitted successfully to Labour Officer.`);
      setSelectedInsp(null);
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleVerifySubmit = async () => {
    if (!window.confirm(`Submit follow-up verification result: ${verificationResult}?`)) return;
    try {
      await api('/violations/' + (selectedInsp.followUpFor || selectedInsp.relatedViolation || 'VIO-1025') + '/verification', {
        method: 'PATCH',
        body: JSON.stringify({ result: verificationResult })
      }).catch(() => { });
      setToast(`Follow-up verification result (${verificationResult}) submitted to Labour Officer for final review.`);
      setSelectedInsp(null);
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only PDF, JPG, and PNG evidence files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must not exceed 5MB.');
      return;
    }
    try {
      const res = await api('/inspections/' + selectedInsp.id + '/evidence', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type || 'application/pdf', fileSize: file.size })
      }).catch(() => ({ id: 'EVD-' + Date.now(), fileName: file.name, fileType: file.type || 'PDF', uploadDate: new Date().toISOString().slice(0, 10), relatedTo: 'General Finding' }));
      const newEv = [...evidence, res];
      setEvidence(newEv);
      saveDraft({ evidence: newEv });
    } catch (err: any) { alert(err.message); }
  };

  if (selectedInsp) {
    const isFollowUp = !!selectedInsp.followUpFor || selectedInsp.inspectionType === 'Follow-up';
    const isReadOnly = selectedInsp.status === 'SUBMITTED' || selectedInsp.status === 'COMPLETED';

    return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInsp(null)}>
            ← Back to {subTab} List
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {selectedInsp.status === 'IN_PROGRESS' && !isFollowUp && (
              <button className="btn btn-secondary btn-sm" onClick={() => saveDraft()}>Save Draft</button>
            )}
            {selectedInsp.status === 'IN_PROGRESS' && !isFollowUp && (
              <button className="btn btn-primary btn-sm" onClick={handleSubmitReport}>Submit Report to Officer</button>
            )}
          </div>
        </div>

        {toast && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 18 }}>{toast}</p>}

        {/* Detailed Inspection Header Card */}
        <section className="panel" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="badge blue" style={{ marginBottom: 6, display: 'inline-block' }}>{selectedInsp.id}</span>
              <h2 style={{ margin: '4px 0 6px', color: '#0f2d59', fontSize: 22 }}>{selectedInsp.establishmentName}</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                <b>Reg No:</b> {selectedInsp.registrationNumber || 'TN-ERD-2024-00125'} | <b>District:</b> {selectedInsp.district || 'Erode'} | <b>Industry:</b> {selectedInsp.industry || 'Manufacturing'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Risk Score</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: (selectedInsp.riskScore || 70) > 75 ? '#dc2626' : '#2563eb' }}>
                  {selectedInsp.riskScore || 75}/100
                </span>
              </div>
              <Badge value={selectedInsp.riskLevel || 'HIGH'} />
              <Badge value={selectedInsp.status} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18, background: '#f8fafc', padding: 16, borderRadius: 8, fontSize: 13 }}>
            <div><b>Workers Covered:</b> {selectedInsp.totalEmployees || 250}</div>
            <div><b>Employer Representative:</b> {selectedInsp.ownerName || 'R. Sakthivel'}</div>
            <div><b>Inspection Type:</b> {selectedInsp.inspectionType || 'Risk-Based'}</div>
            <div><b>Priority:</b> <Badge value={selectedInsp.priority || 'HIGH'} /></div>
            <div><b>Scheduled Date:</b> {selectedInsp.scheduledDate || selectedInsp.inspectionDate}</div>
            <div><b>Assigned Inspector:</b> {INSPECTOR_PROFILE_DATA.name} ({INSPECTOR_PROFILE_DATA.employeeId})</div>
          </div>

          {selectedInsp.instructions && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: 4, fontSize: 13, color: '#1e40af' }}>
              <b>Officer Instructions:</b> {selectedInsp.instructions}
            </div>
          )}

          {/* Legal disclaimer banner regarding Inspector authority */}
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: 4, fontSize: 12, color: '#92400e' }}>
            <b>Statutory Notice:</b> Inspector findings represent field observations. Final confirmation of violations, issuing notices, and approving corrective actions rest strictly with the Labour Department Officer.
          </div>
        </section>

        {/* If Inspection is ASSIGNED / SCHEDULED, display Start Action */}
        {['ASSIGNED', 'SCHEDULED'].includes(selectedInsp.status) && !isFollowUp && (
          <section className="panel" style={{ textAlign: 'center', padding: 36, marginBottom: 20 }}>
            <h3 style={{ color: '#0f2d59', marginBottom: 8 }}>Ready to Conduct Site Inspection?</h3>
            <p style={{ color: '#64748b', maxWidth: 540, margin: '0 auto 20px', fontSize: 14 }}>
              Clicking "Start Field Inspection" unlocks the digital statutory wage checklist, observation logging, evidence attachment, and report submission workspace.
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleStart}>
              <ClipboardCheck size={18} style={{ marginRight: 8 }} /> Start Field Inspection
            </button>
          </section>
        )}

        {/* Follow-up Verification Specific View */}
        {isFollowUp && (
          <section className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-title">
              <h3>Follow-up Inspection Verification</h3>
            </div>
            <div style={{ display: 'grid', gap: 16, background: '#f8fafc', padding: 18, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              <div><b>Related Statutory Violation:</b> <Badge value={selectedInsp.relatedViolation || selectedInsp.followUpFor || 'VIO-1025'} /></div>
              <div><b>Required Corrective Action:</b> {selectedInsp.requiredAction || 'Maintain complete attendance records and update statutory registers.'}</div>
              <div><b>Employer Submitted Proof:</b> <span style={{ color: '#2563eb', fontWeight: 600 }}>{selectedInsp.employerProof || 'attendance_records_sep_oct.pdf'}</span></div>
            </div>

            <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Inspector Verification Result *
                <select className="filter-select" value={verificationResult} onChange={(e: any) => setVerificationResult(e.target.value)} style={{ width: '100%', marginTop: 8 }} disabled={isReadOnly}>
                  <option value="CORRECTED">CORRECTED — Violation has been fully rectified by employer</option>
                  <option value="PARTIALLY_CORRECTED">PARTIALLY_CORRECTED — Partial compliance verified; further action needed</option>
                  <option value="NOT_CORRECTED">NOT_CORRECTED — Violation remains unrectified upon site inspection</option>
                </select>
              </label>

              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Inspector Verification Remarks & Site Observations *
                <textarea rows={4} className="input" value={verificationRemarks} onChange={e => setVerificationRemarks(e.target.value)} placeholder="Record exact site findings regarding employer's corrective proof..." style={{ width: '100%', marginTop: 8 }} disabled={isReadOnly} />
              </label>

              {!isReadOnly && (
                <div>
                  <button className="btn btn-primary" onClick={handleVerifySubmit}>
                    Submit Verification Result
                  </button>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
                    Result will be sent to the Labour Department Officer for final violation closure or notice issuance decision.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Regular Inspection Workspace */}
        {!isFollowUp && (selectedInsp.status === 'IN_PROGRESS' || selectedInsp.status === 'COMPLETED' || selectedInsp.status === 'SUBMITTED' || selectedInsp.status === 'DRAFT') && (
          <section className="panel">
            <div className="tabs" style={{ marginBottom: 20 }}>
              {['Overview', 'Checklist', 'Observations', 'Findings', 'Evidence', 'Submit Report'].map(tab => (
                <button key={tab} className={'tab ' + (activeFormTab === tab ? 'active' : '')} onClick={() => setActiveFormTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeFormTab === 'Overview' && (
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 10px', color: '#0f2d59' }}>Previous Inspection History</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                      {selectedInsp.previousInspectionSummary || 'Inspected on 15 Oct 2025; minor delays in overtime wage disbursement noted and warning issued.'}
                    </p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 10px', color: '#0f2d59' }}>Statutory Wage & Return Summary</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                      {selectedInsp.complianceSummary || 'Submitted Q2 2026 wage returns. 32 overtime entries flagged for verification.'}
                    </p>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 10px', color: '#0f2d59' }}>Applicable Wage Rates & Structure</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                    {selectedInsp.wageInfoSummary || 'Minimum wage rate: ₹520/day. Overtime rate: double statutory rate (₹130/hr). 250 workers covered.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: CHECKLIST */}
            {activeFormTab === 'Checklist' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Statutory Labour & Wage Compliance Checklist</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Evaluate compliance for mandatory statutory requirements.</p>
                  </div>
                  {!isReadOnly && (
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const newC = [...checklist, { id: Date.now(), item: 'New Statutory Requirement', result: 'PASS', remarks: '' }];
                      setChecklist(newC);
                      saveDraft({ checklist: newC });
                    }}>
                      <Plus size={14} /> Add Item
                    </button>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Compliance Item</th>
                        <th>Result Status</th>
                        <th>Inspector Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklist.map((c, idx) => (
                        <tr key={c.id || idx}>
                          <td><b>{c.item}</b></td>
                          <td style={{ width: 180 }}>
                            {!isReadOnly ? (
                              <select className="filter-select" value={c.result} onChange={e => { const nc = [...checklist]; nc[idx].result = e.target.value as any; setChecklist(nc); }}>
                                <option value="PASS">PASS</option>
                                <option value="FAIL">FAIL</option>
                                <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                              </select>
                            ) : (
                              <Badge value={c.result} />
                            )}
                          </td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={c.remarks || ''} onChange={e => { const nc = [...checklist]; nc[idx].remarks = e.target.value; setChecklist(nc); }} placeholder="Enter remarks..." />
                            ) : (
                              <span>{c.remarks || '—'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveDraft()}>Save Checklist Draft</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OBSERVATIONS */}
            {activeFormTab === 'Observations' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Site Inspection Observations</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Record statutory observations categorized by area and severity.</p>
                  </div>
                  {!isReadOnly && (
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const newO = [...observations, { id: 'OBS-' + (301 + observations.length), category: 'WAGES', description: '', severity: 'MEDIUM', status: 'RECORDED' }];
                      setObservations(newO);
                      saveDraft({ observations: newO });
                    }}>
                      <Plus size={14} /> Add Observation
                    </button>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Severity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((o, idx) => (
                        <tr key={o.id || idx}>
                          <td><b>{o.id}</b></td>
                          <td style={{ width: 160 }}>
                            {!isReadOnly ? (
                              <select className="filter-select" value={o.category} onChange={e => { const no = [...observations]; no[idx].category = e.target.value as any; setObservations(no); }}>
                                <option value="WAGES">WAGES</option>
                                <option value="ATTENDANCE">ATTENDANCE</option>
                                <option value="OVERTIME">OVERTIME</option>
                                <option value="STATUTORY_RECORDS">STATUTORY_RECORDS</option>
                                <option value="OTHER">OTHER</option>
                              </select>
                            ) : (
                              <span>{o.category}</span>
                            )}
                          </td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={o.description} onChange={e => { const no = [...observations]; no[idx].description = e.target.value; setObservations(no); }} placeholder="Enter observation details..." />
                            ) : (
                              <span>{o.description}</span>
                            )}
                          </td>
                          <td style={{ width: 120 }}>
                            {!isReadOnly ? (
                              <select className="filter-select" value={o.severity} onChange={e => { const no = [...observations]; no[idx].severity = e.target.value as any; setObservations(no); }}>
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                              </select>
                            ) : (
                              <Badge value={o.severity} />
                            )}
                          </td>
                          <td><Badge value={o.status || 'RECORDED'} /></td>
                        </tr>
                      ))}
                      {!observations.length && <tr><td colSpan={5}>No observations recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveDraft()}>Save Observations</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: FINDINGS */}
            {activeFormTab === 'Findings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Inspector Recommendations & Findings</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Findings are recommendations submitted for Officer review and decision.</p>
                  </div>
                  {!isReadOnly && (
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const newF = [...findings, { id: 'FND-' + (401 + findings.length), category: 'Wage Compliance', description: '', severity: 'HIGH', inspectorRemarks: '' }];
                      setFindings(newF);
                      saveDraft({ findings: newF });
                    }}>
                      <Plus size={14} /> Add Finding
                    </button>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Finding Description</th>
                        <th>Severity</th>
                        <th>Inspector Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {findings.map((f, idx) => (
                        <tr key={f.id || idx}>
                          <td><b>{f.id}</b></td>
                          <td>{f.category}</td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={f.description} onChange={e => { const nf = [...findings]; nf[idx].description = e.target.value; setFindings(nf); }} placeholder="Finding description..." />
                            ) : (
                              <span>{f.description}</span>
                            )}
                          </td>
                          <td><Badge value={f.severity} /></td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={f.inspectorRemarks} onChange={e => { const nf = [...findings]; nf[idx].inspectorRemarks = e.target.value; setFindings(nf); }} placeholder="Recommendation for Officer..." />
                            ) : (
                              <span>{f.inspectorRemarks}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!findings.length && <tr><td colSpan={5}>No findings recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveDraft()}>Save Findings</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: EVIDENCE */}
            {activeFormTab === 'Evidence' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Inspection Evidence & Attached Documents</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Attach PDF documents, register scans, or site photographs (Max 5MB each; PDF, JPG, PNG).</p>
                  </div>
                  {!isReadOnly && (
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      <Plus size={14} /> Upload Evidence File
                      <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Uploaded Date</th>
                        <th>Related Requirement / Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidence.map((ev, idx) => (
                        <tr key={ev.id || idx}>
                          <td><b>{ev.fileName}</b></td>
                          <td><Badge value={ev.fileType.includes('pdf') ? 'PDF' : 'JPG'} /></td>
                          <td>{ev.uploadDate}</td>
                          <td>{ev.relatedTo}</td>
                        </tr>
                      ))}
                      {!evidence.length && <tr><td colSpan={4}>No evidence attached yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: SUBMIT REPORT */}
            {activeFormTab === 'Submit Report' && (
              <div style={{ maxWidth: 680 }}>
                <h4 style={{ margin: '0 0 8px', color: '#0f2d59' }}>Final Overall Inspector Report Summary</h4>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  Provide overall conclusions and recommendations. Upon submission, the report will be locked and routed to the Labour Officer.
                </p>

                {!isReadOnly ? (
                  <>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
                      Overall Inspection Remarks & Recommendation *
                      <textarea rows={5} className="input" value={inspectorRemarks} onChange={e => setInspectorRemarks(e.target.value)} placeholder="Summarize site findings, register anomalies, and follow-up recommendations..." style={{ width: '100%', marginTop: 8 }} />
                    </label>

                    <button className="btn btn-primary btn-lg" onClick={handleSubmitReport}>
                      Submit Official Inspection Report
                    </button>
                  </>
                ) : (
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 8 }}>
                    <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#059669' }}>✓ Report Submitted to Labour Department Officer</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                      <b>Inspector Remarks:</b> {inspectorRemarks || selectedInsp.inspectorRemarks || 'Site inspection completed. Statutory register failures recorded for Officer review.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </>
    );
  }

  // LIST VIEWS BY SUBTAB
  return (
    <>
      <Hero
        title={`Inspector Workspace — ${subTab}`}
        text="Manage assigned inspections, digital checklists, observations, findings, and follow-up verifications."
      />

      {toast && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 18 }}>{toast}</p>}

      {/* SUBTAB 1: ASSIGNED (Active work assigned to me) */}
      {subTab === 'Assigned' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Assigned Field Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Inspections currently assigned to you awaiting site inspection execution.
              </p>
            </div>
            <div className="search">
              <Search size={16} />
              <input placeholder="Search establishment or district..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Workers</th>
                  <th>Risk Level</th>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedList
                  .filter(i => (i.establishmentName + i.district + i.id).toLowerCase().includes(search.toLowerCase()))
                  .map(i => (
                    <tr key={i.id}>
                      <td><b>{i.id}</b></td>
                      <td><b>{i.establishmentName}</b><br /><small>{i.industry}</small></td>
                      <td>{i.district}</td>
                      <td>{i.totalEmployees}</td>
                      <td><Badge value={i.riskLevel} /></td>
                      <td><Badge value={i.priority} /></td>
                      <td><Badge value={i.inspectionType} /></td>
                      <td>{i.scheduledDate}</td>
                      <td><Badge value={i.status} /></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => openInspection(i)}>
                          {i.status === 'IN_PROGRESS' ? 'Continue Inspection' : 'View / Start'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 2: UPCOMING (Future scheduled inspections) */}
      {subTab === 'Upcoming' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Upcoming Scheduled Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Inspections assigned to you scheduled for future dates.
              </p>
            </div>
            <div className="search">
              <Search size={16} />
              <input placeholder="Search establishment or district..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Workers</th>
                  <th>Risk Level</th>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingList
                  .filter(i => (i.establishmentName + i.district + i.id).toLowerCase().includes(search.toLowerCase()))
                  .map(i => (
                    <tr key={i.id}>
                      <td><b>{i.id}</b></td>
                      <td><b>{i.establishmentName}</b><br /><small>{i.industry}</small></td>
                      <td>{i.district}</td>
                      <td>{i.totalEmployees}</td>
                      <td><Badge value={i.riskLevel} /></td>
                      <td><Badge value={i.priority} /></td>
                      <td><Badge value={i.inspectionType} /></td>
                      <td>{i.scheduledDate}</td>
                      <td><Badge value={i.status} /></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openInspection(i)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 3: FOLLOW-UP (Re-inspections for violation verification) */}
      {subTab === 'Follow-up' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Follow-up Re-Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Verify whether statutory violations identified in past inspections have been rectified by employer.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Follow-up ID</th>
                  <th>Establishment Name</th>
                  <th>Related Violation</th>
                  <th>Scheduled Date</th>
                  <th>Required Action</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {followupList.map(fu => (
                  <tr key={fu.id}>
                    <td><b>{fu.id}</b></td>
                    <td><b>{fu.establishmentName}</b><br /><small>{fu.district}</small></td>
                    <td><Badge value={fu.relatedViolation || 'VIO-1025'} /></td>
                    <td>{fu.scheduledDate}</td>
                    <td><small>{fu.requiredAction}</small></td>
                    <td><Badge value={fu.status} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => openInspection(fu)}>
                        Perform Verification
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 4: DRAFT REPORTS (In-progress unsubmitted reports) */}
      {subTab === 'Draft Reports' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Draft Inspection Reports</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>In-progress reports awaiting complete checklist and observation entry.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Inspection Date</th>
                  <th>Completion Progress</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {draftList.map(d => (
                  <tr key={d.id}>
                    <td><b>{d.id}</b></td>
                    <td>{d.inspectionId}</td>
                    <td><b>{d.establishmentName}</b></td>
                    <td>{d.district}</td>
                    <td>{d.inspectionDate}</td>
                    <td><small style={{ color: '#2563eb', fontWeight: 600 }}>{d.progressSummary}</small></td>
                    <td><Badge value={d.riskLevel} /></td>
                    <td><Badge value={d.status} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => openInspection(d)}>
                        Continue Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 5: SUBMITTED REPORTS (Reports sent to Officer) */}
      {subTab === 'Submitted Reports' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Submitted Inspection Reports</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Official reports submitted to Labour Officer for violation confirmation & enforcement.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Inspection Date</th>
                  <th>Submission Date</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submittedList.map(s => (
                  <tr key={s.id}>
                    <td><b>{s.id}</b></td>
                    <td><b>{s.establishmentName}</b></td>
                    <td>{s.district}</td>
                    <td>{s.inspectionDate}</td>
                    <td>{s.submittedDate}</td>
                    <td><Badge value={s.riskLevel} /></td>
                    <td><Badge value={s.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openInspection(s)}>
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 6: INSPECTION HISTORY (Older historical completed inspections) */}
      {subTab === 'Inspection History' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Completed Inspection History</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Historical record of past completed inspections.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Inspection Date</th>
                  <th>Inspection Type</th>
                  <th>Findings Summary</th>
                  <th>Follow-up Status</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map(h => (
                  <tr key={h.id}>
                    <td><b>{h.id}</b></td>
                    <td><b>{h.establishmentName}</b></td>
                    <td>{h.district}</td>
                    <td>{h.inspectionDate}</td>
                    <td><Badge value={h.inspectionType} /></td>
                    <td><small>{h.findingsSummary}</small></td>
                    <td><Badge value={h.followUpStatus} /></td>
                    <td><Badge value={h.result} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openInspection({ ...h, status: 'COMPLETED' })}>
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}


// ----------------------------------------------------
function EmployerDashboard({ onNavigate }: { onNavigate: (main: string, sub: string) => void }) {
  const [d, setD] = useState<ApiData>({});

  useEffect(() => {
    api('/dashboard/employer').then(setD).catch(() => { });
  }, []);

  const est = d.establishment || EMPLOYER_ESTABLISHMENT_DATA;

  return (
    <>
      <Hero
        title="Employer Compliance Dashboard"
        text="Single-establishment portal for statutory wage compliance, document uploads, inspection tracking, and notice responses."
      />

      {/* 5 KPI Metric Cards */}
      <div className="metrics">
        <Card name="Registration Status" value={est.verificationStatus || EMPLOYER_KPI_STATS.registrationStatus} Icon={Building2} colorClass="blue" />
        <Card name="Compliance Status" value={EMPLOYER_KPI_STATS.complianceStatus} Icon={ShieldCheck} colorClass="green" />
        <Card name="Upcoming Inspections" value={EMPLOYER_KPI_STATS.upcomingInspections} Icon={ClipboardCheck} colorClass="purple" />
        <Card name="Open Notices" value={EMPLOYER_KPI_STATS.openNotices} Icon={AlertTriangle} colorClass="red" />
        <Card name="Pending Corrective Actions" value={EMPLOYER_KPI_STATS.pendingCorrectiveActions} Icon={CheckCircle2} colorClass="orange" />
      </div>

      {/* 5 Specific Summary Panels */}
      <div className="grid" style={{ marginBottom: 24, gridTemplateColumns: '1fr 1fr' }}>
        {/* 1. Registration Summary */}
        <article className="panel">
          <div className="panel-title">
            <h3>Registration Summary</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('My Establishment', 'Registration Status')}>View Status</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Establishment Name:</b> {est.establishmentName}</div>
            <div><b>Registration No:</b> {est.registrationNumber}</div>
            <div><b>Registration Status:</b> <Badge value={est.verificationStatus || 'VERIFIED'} /></div>
            <div><b>Document Status:</b> <Badge value={est.documentVerificationStatus || 'APPROVED'} /></div>
          </div>
        </article>

        {/* 2. Current Compliance */}
        <article className="panel">
          <div className="panel-title">
            <h3>Current Statutory Compliance</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Compliance', 'Submit Compliance')}>Submit Return</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Compliance Period:</b> {EMPLOYER_CURRENT_COMPLIANCE.period}</div>
            <div><b>Submission Date:</b> {EMPLOYER_CURRENT_COMPLIANCE.submissionDate}</div>
            <div><b>Workers Covered:</b> {EMPLOYER_CURRENT_COMPLIANCE.totalEmployees}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_CURRENT_COMPLIANCE.status} /></div>
          </div>
        </article>

        {/* 3. Upcoming Inspection */}
        <article className="panel">
          <div className="panel-title">
            <h3>Upcoming Scheduled Inspection</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Inspections', 'Upcoming')}>View Details</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Inspection ID:</b> <b>{EMPLOYER_UPCOMING_INSPECTIONS[0].id}</b></div>
            <div><b>Scheduled Date:</b> {EMPLOYER_UPCOMING_INSPECTIONS[0].inspectionDate}</div>
            <div><b>Inspection Type:</b> {EMPLOYER_UPCOMING_INSPECTIONS[0].inspectionType}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_UPCOMING_INSPECTIONS[0].status} /></div>
          </div>
        </article>

        {/* 4. Open Statutory Notice */}
        <article className="panel">
          <div className="panel-title">
            <h3>Open Statutory Notice</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Actions', 'Notices')}>Respond</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Notice ID:</b> <b>{EMPLOYER_NOTICES[0].id}</b></div>
            <div><b>Category:</b> {EMPLOYER_NOTICES[0].category}</div>
            <div><b>Severity:</b> <Badge value={EMPLOYER_NOTICES[0].severity} /></div>
            <div><b>Response Due:</b> {EMPLOYER_NOTICES[0].responseDeadline}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_NOTICES[0].status} /></div>
          </div>
        </article>
      </div>

      {/* 5. Pending Corrective Action Panel */}
      <section className="panel table-panel">
        <div className="panel-title">
          <div>
            <h3>Pending Corrective Action</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Action items required to fix statutory wage anomalies identified during inspection.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Actions', 'Corrective Actions')}>View All Actions</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Action ID</th>
                <th>Related Violation</th>
                <th>Required Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYER_CORRECTIVE_ACTIONS.map(ca => (
                <tr key={ca.id}>
                  <td><b>{ca.id}</b></td>
                  <td><Badge value={ca.relatedViolation} /></td>
                  <td>{ca.requiredAction}</td>
                  <td><Badge value={ca.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function EmployerEstablishmentModule({ subTab }: { subTab: string }) {
  const [est, setEst] = useState<any | null>(EMPLOYER_ESTABLISHMENT_DATA);
  const [formData, setFormData] = useState({
    establishmentName: EMPLOYER_ESTABLISHMENT_DATA.establishmentName,
    industry: EMPLOYER_ESTABLISHMENT_DATA.industry,
    registrationNumber: EMPLOYER_ESTABLISHMENT_DATA.registrationNumber,
    districtId: EMPLOYER_ESTABLISHMENT_DATA.district,
    address: EMPLOYER_ESTABLISHMENT_DATA.address,
    ownerName: EMPLOYER_ESTABLISHMENT_DATA.ownerName,
    totalEmployees: EMPLOYER_ESTABLISHMENT_DATA.totalEmployees,
    phone: EMPLOYER_ESTABLISHMENT_DATA.phone,
    email: EMPLOYER_ESTABLISHMENT_DATA.email
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/employer/establishment').then(res => {
      if (res && res.establishmentName) {
        setEst({ ...EMPLOYER_ESTABLISHMENT_DATA, ...res });
        setFormData({
          establishmentName: res.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName,
          industry: res.industry || EMPLOYER_ESTABLISHMENT_DATA.industry,
          registrationNumber: res.registrationNumber || EMPLOYER_ESTABLISHMENT_DATA.registrationNumber,
          districtId: res.districtId || EMPLOYER_ESTABLISHMENT_DATA.district,
          address: res.address || EMPLOYER_ESTABLISHMENT_DATA.address,
          ownerName: res.ownerName || EMPLOYER_ESTABLISHMENT_DATA.ownerName,
          totalEmployees: res.totalEmployees || EMPLOYER_ESTABLISHMENT_DATA.totalEmployees,
          phone: res.phone || EMPLOYER_ESTABLISHMENT_DATA.phone,
          email: res.email || EMPLOYER_ESTABLISHMENT_DATA.email
        });
      }
    }).catch(() => { });
  }, [subTab]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      const res = await api('/establishments', {
        method: 'POST',
        body: JSON.stringify({ ...formData, totalEmployees: Number(formData.totalEmployees) })
      }).catch(() => ({ ...formData, verificationStatus: 'VERIFIED' }));
      setMsg('Establishment registration details saved and submitted for Officer verification!');
      setEst(res);
      setLoading(false);
    } catch (x: any) {
      setLoading(false);
      setErr(x.message || 'Failed to submit registration');
    }
  };

  if (subTab === 'Registration') {
    return (
      <>
        <Hero title="Establishment Registration" text="Submit official registration details of your establishment to the State Labour Department." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel" style={{ maxWidth: 750 }}>
          <div className="panel-title">
            <h3>Registered Establishment Information Form</h3>
          </div>
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Establishment Name *
                <input value={formData.establishmentName} onChange={e => setFormData({ ...formData, establishmentName: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Registration / License Number *
                <input value={formData.registrationNumber} onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Establishment / Industry Type *
                <select value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="Textile Manufacturing">Textiles & Garments</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="Manufacturing">Manufacturing & Engineering</option>
                  <option value="Logistics">Logistics & Warehousing</option>
                  <option value="Services">IT & Commercial Services</option>
                </select>
              </label>
              <label>District *
                <input value={formData.districtId} onChange={e => setFormData({ ...formData, districtId: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Employer / Authorized Representative Name
                <input value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Number of Workers *
                <input type="number" min={1} value={formData.totalEmployees} onChange={e => setFormData({ ...formData, totalEmployees: Number(e.target.value) })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Contact Phone Number
                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9876543210" style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Official Email
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="compliance@company.com" style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label>Premises Address *
                <textarea rows={3} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save & Update Registration Form'}
            </button>
          </form>
        </section>
      </>
    );
  }

  if (subTab === 'Registration Status') {
    return (
      <>
        <Hero title="Registration Verification Status" text="Track real-time progress of your establishment registration review by the Labour Department." />
        <section className="panel" style={{ maxWidth: 800 }}>
          <div className="panel-title">
            <h3>Statutory Registration Verification Progress</h3>
            <Badge value={est?.verificationStatus || 'VERIFIED'} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0', padding: '0 10px', position: 'relative' }}>
            {EMPLOYER_REGISTRATION_STATUS_STEPS.map((s, idx) => (
              <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.completed ? '#059669' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 700 }}>
                  {s.completed ? '✓' : idx + 1}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f2d59' }}>{s.step}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{s.date}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 14 }}>
            <div><b>Current Verification Status:</b> <Badge value={est?.verificationStatus || 'VERIFIED'} /></div>
            <div><b>Submitted Date:</b> {est?.registrationDate || '15 Aug 2024'}</div>
            <div><b>Document Verification:</b> <Badge value={est?.documentVerificationStatus || 'APPROVED'} /></div>
            <div><b>Officer Decision Date:</b> 22 Aug 2024</div>
            <div style={{ gridColumn: 'span 2' }}>
              <b>Officer Remarks:</b> <br />
              <span style={{ color: '#334155' }}>{est?.officerRemarks || EMPLOYER_ESTABLISHMENT_DATA.officerRemarks}</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  // DEFAULT: Establishment Details
  return (
    <>
      <Hero title="My Establishment Details" text="View verified establishment profile, premises address, workforce count, and authorized contact information." />
      <section className="panel" style={{ maxWidth: 800 }}>
        <div className="panel-title">
          <h3>Registered Establishment Profile</h3>
          <Badge value={est?.verificationStatus || 'VERIFIED'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 14 }}>
          <div><b>Establishment Name:</b> <br />{est?.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</div>
          <div><b>Registration Number:</b> <br />{est?.registrationNumber || EMPLOYER_ESTABLISHMENT_DATA.registrationNumber}</div>
          <div><b>Establishment Type:</b> <br />{est?.establishmentType || EMPLOYER_ESTABLISHMENT_DATA.establishmentType}</div>
          <div><b>Industry Sector:</b> <br />{est?.industry || EMPLOYER_ESTABLISHMENT_DATA.industry}</div>
          <div><b>District:</b> <br />{est?.district || EMPLOYER_ESTABLISHMENT_DATA.district}</div>
          <div><b>Total Workforce / Employees:</b> <br />{est?.totalEmployees || EMPLOYER_ESTABLISHMENT_DATA.totalEmployees} Workers</div>
          <div><b>Employer / Representative:</b> <br />{est?.ownerName || EMPLOYER_ESTABLISHMENT_DATA.ownerName} ({EMPLOYER_ESTABLISHMENT_DATA.designation})</div>
          <div><b>Contact Details:</b> <br />{est?.phone || EMPLOYER_ESTABLISHMENT_DATA.phone} | {est?.email || EMPLOYER_ESTABLISHMENT_DATA.email}</div>
          <div><b>Registration Date:</b> <br />{est?.registrationDate || EMPLOYER_ESTABLISHMENT_DATA.registrationDate}</div>
          <div><b>Document Verification Status:</b> <br /><Badge value={est?.documentVerificationStatus || 'APPROVED'} /></div>
          <div style={{ gridColumn: 'span 2' }}><b>Premises Address:</b> <br />{est?.address || EMPLOYER_ESTABLISHMENT_DATA.address}</div>
        </div>
      </section>
    </>
  );
}

function EmployerComplianceModule({ subTab }: { subTab: string }) {
  const [submissions, setSubmissions] = useState<any[]>(EMPLOYER_COMPLIANCE_HISTORY);
  const [docs, setDocs] = useState<any[]>(EMPLOYER_DOCUMENTS);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Submit Compliance Form States (Pre-populated for Sep 2026)
  const [period, setPeriod] = useState(EMPLOYER_CURRENT_COMPLIANCE.period);
  const [workers, setWorkers] = useState(EMPLOYER_CURRENT_COMPLIANCE.totalEmployees);
  const [wagesInfo, setWagesInfo] = useState('Full wage disbursement executed via direct bank transfer to all workers.');
  const [minWageCompliant, setMinWageCompliant] = useState(true);
  const [otInfo, setOtInfo] = useState('Overtime double rate paid to 35 workers for 420 total overtime hours.');
  const [attendanceMaintained, setAttendanceMaintained] = useState(true);
  const [recordsMaintained, setRecordsMaintained] = useState(true);
  const [remarks, setRemarks] = useState('Monthly statutory wage return for September 2026.');

  // Document Upload Form
  const [docName, setDocName] = useState('Wage Register - September 2026');
  const [docType, setDocType] = useState('Wage Register - Sep 2026');
  const [fileName, setFileName] = useState('wage_register_sep_2026.pdf');

  const loadComplianceData = () => {
    api('/compliance').then(res => {
      if (Array.isArray(res) && res.length) setSubmissions([...res, ...EMPLOYER_COMPLIANCE_HISTORY.filter(h => !res.some((r: any) => r.id === h.id))]);
    }).catch(() => { });
    api('/employer/documents').then(res => {
      if (Array.isArray(res) && res.length) setDocs([...res, ...EMPLOYER_DOCUMENTS.filter(d => !res.some((r: any) => r.id === d.id))]);
    }).catch(() => { });
  };

  useEffect(() => {
    loadComplianceData();
  }, [subTab]);

  const handleSubmitCompliance = async (isDraft: boolean) => {
    setMsg('');
    setErr('');
    try {
      await api('/compliance', {
        method: 'POST',
        body: JSON.stringify({
          compliancePeriod: period,
          totalEmployees: Number(workers),
          wagePaymentInformation: wagesInfo,
          minimumWageCompliant: minWageCompliant ? 'YES' : 'NO',
          overtimeInformation: otInfo,
          attendanceRecordsMaintained: attendanceMaintained ? 'YES' : 'NO',
          requiredRecordsMaintained: recordsMaintained ? 'YES' : 'NO',
          remarks,
          status: isDraft ? 'DRAFT' : 'SUBMITTED'
        })
      }).catch(() => { });
      setMsg(isDraft ? 'Compliance return draft saved successfully!' : 'Statutory wage return for September 2026 submitted successfully! Verification status is now UNDER_REVIEW.');
      loadComplianceData();
    } catch (x: any) {
      setErr(x.message || 'Failed to submit compliance');
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const newDoc = await api('/employer/documents', {
        method: 'POST',
        body: JSON.stringify({ docName, docType, fileName })
      }).catch(() => ({
        id: 'DOC-' + Date.now(),
        docName,
        docType,
        fileName,
        uploadedAt: new Date().toISOString().slice(0, 10),
        verificationStatus: 'PENDING',
        remarks: 'Awaiting Officer review'
      }));
      setDocs([newDoc, ...docs]);
      setMsg('Document "' + docName + '" uploaded successfully. Verification status is now PENDING.');
    } catch (x: any) {
      setErr(x.message || 'Failed to upload document');
    }
  };

  if (subTab === 'Submit Compliance') {
    return (
      <>
        <Hero title="Submit Statutory Wage Compliance" text="File monthly statutory wage returns, overtime declarations, and attendance register compliance for September 2026." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel" style={{ maxWidth: 750 }}>
          <div className="panel-title">
            <h3>Statutory Wage Return Form — September 2026</h3>
            <Badge value={EMPLOYER_CURRENT_COMPLIANCE.status} />
          </div>
          <form onSubmit={e => { e.preventDefault(); handleSubmitCompliance(false); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Compliance Period *
                <input value={period} onChange={e => setPeriod(e.target.value)} required style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Number of Covered Workers *
                <input type="number" min={1} value={workers} onChange={e => setWorkers(Number(e.target.value))} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Minimum Wage Compliant *
                <select value={minWageCompliant ? 'YES' : 'NO'} onChange={e => setMinWageCompliant(e.target.value === 'YES')} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — All basic wage rates comply with Government notifications</option>
                  <option value="NO">NO — Exceptions or arrears pending</option>
                </select>
              </label>
              <label>Wage Payment Disbursement Status *
                <select className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — 100% Wage payment completed via direct bank transfer</option>
                  <option value="NO">NO — Delayed payments recorded</option>
                </select>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Wage Disbursement Information Summary *
                <textarea rows={2} value={wagesInfo} onChange={e => setWagesInfo(e.target.value)} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Overtime Applicable *
                <select className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — 35 workers worked 420 total overtime hours</option>
                  <option value="NO">NO — No overtime worked</option>
                </select>
              </label>
              <label>Attendance Register Maintained *
                <select value={attendanceMaintained ? 'YES' : 'NO'} onChange={e => setAttendanceMaintained(e.target.value === 'YES')} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — Biometric attendance registers maintained up to date</option>
                  <option value="NO">NO</option>
                </select>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Overtime Disbursement & Record Summary
                <textarea rows={2} value={otInfo} onChange={e => setOtInfo(e.target.value)} style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', color: '#0f2d59', fontSize: 13 }}>Attached Supporting Returns Documents</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#2563eb' }}>
                {EMPLOYER_CURRENT_COMPLIANCE.supportingDocs.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Submit Wage Return for Review</button>
              <button type="button" className="btn btn-secondary" onClick={() => handleSubmitCompliance(true)}>Save Draft</button>
            </div>
          </form>
        </section>
      </>
    );
  }

  if (subTab === 'Compliance History') {
    return (
      <>
        <Hero title="Compliance Return History" text="Historical record of periodic statutory wage compliance returns submitted by your establishment." />
        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Statutory Wage Returns Log</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Compliance Period</th>
                  <th>Submission Date</th>
                  <th>Workers Covered</th>
                  <th>Review Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.id}</b></td>
                    <td>{c.period || c.compliancePeriod}</td>
                    <td>{c.submissionDate || c.createdAt?.slice(0, 10)}</td>
                    <td>{c.workers || c.totalEmployees} Workers</td>
                    <td>{c.reviewDate || 'Pending'}</td>
                    <td><Badge value={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  // DEFAULT: Documents
  return (
    <>
      <Hero title="Statutory Documents Repository" text="Upload statutory registers, wage certificates, and business proofs for Labour Department verification." />
      {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
      {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

      <section className="panel" style={{ maxWidth: 750, marginBottom: 24 }}>
        <div className="panel-title">
          <h3>Upload Statutory Document</h3>
        </div>
        <form onSubmit={handleUploadDoc}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <label>Document Name *
              <input value={docName} onChange={e => setDocName(e.target.value)} required style={{ width: '100%', marginTop: 6 }} />
            </label>
            <label>Document Category / Type *
              <select value={docType} onChange={e => setDocType(e.target.value)} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                <option value="Registration Certificate">Registration Certificate</option>
                <option value="Establishment Proof">Establishment Proof</option>
                <option value="Authorization Proof">Authorization Proof</option>
                <option value="Wage Register - Sep 2026">Wage Register - Sep 2026</option>
                <option value="Attendance Register">Attendance Register</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>File Reference / Name *
              <input value={fileName} onChange={e => setFileName(e.target.value)} required placeholder="e.g. wage_register_sep_2026.pdf" style={{ width: '100%', marginTop: 6 }} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Upload Document for Verification</button>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="panel-title">
          <h3>Uploaded Statutory Documents</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Document Name</th>
                <th>Category</th>
                <th>File Reference</th>
                <th>Uploaded Date</th>
                <th>Verification Status</th>
                <th>Officer Remarks</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td><b>{doc.id}</b></td>
                  <td><b>{doc.docName}</b></td>
                  <td>{doc.docType}</td>
                  <td><small>{doc.fileName}</small></td>
                  <td>{doc.uploadedAt?.slice(0, 10)}</td>
                  <td><Badge value={doc.verificationStatus} /></td>
                  <td><small>{doc.remarks || '—'}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function EmployerInspectionsModule({ subTab }: { subTab: string }) {
  const [upcoming, setUpcoming] = useState<any[]>(EMPLOYER_UPCOMING_INSPECTIONS);
  const [history, setHistory] = useState<any[]>(EMPLOYER_INSPECTION_HISTORY);
  const [selectedInsp, setSelectedInsp] = useState<any | null>(null);

  useEffect(() => {
    api('/inspections').then(res => {
      if (Array.isArray(res) && res.length) {
        const up = res.filter(i => i.status !== 'COMPLETED');
        if (up.length) setUpcoming([...up, ...EMPLOYER_UPCOMING_INSPECTIONS.filter(d => !up.some((u: any) => u.id === d.id))]);
      }
    }).catch(() => { });
  }, [subTab]);

  if (subTab === 'Inspection Details' || selectedInsp) {
    const insp = selectedInsp || upcoming[0] || EMPLOYER_UPCOMING_INSPECTIONS[0];
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInsp(null)}>← Back to Inspections List</button>
        </div>
        <Hero title={"Inspection Details — " + insp.id} text="Targeted statutory field inspection schedule and status for your establishment." />

        <section className="panel" style={{ maxWidth: 800 }}>
          <div className="panel-title">
            <h3>Inspection Schedule & Details</h3>
            <Badge value={insp.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 14 }}>
            <div><b>Inspection ID:</b> <br />{insp.id}</div>
            <div><b>Establishment Name:</b> <br />{insp.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</div>
            <div><b>Inspection Type:</b> <br /><Badge value={insp.inspectionType || 'Risk-Based'} /></div>
            <div><b>Scheduled Date:</b> <br />{insp.inspectionDate || insp.scheduledDate}</div>
            <div><b>Assigned Field Inspector:</b> <br />{insp.inspectorName || 'Rajesh Kumar'}</div>
            <div><b>Risk Level:</b> <br /><Badge value={insp.riskLevel || 'HIGH'} /></div>
            <div><b>Current Status:</b> <br /><Badge value={insp.status} /></div>
          </div>

          {insp.instructions && (
            <div style={{ marginTop: 20, padding: 14, background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: 4, fontSize: 13, color: '#1e40af' }}>
              <b>Officer Scope & Focus:</b> {insp.instructions}
            </div>
          )}

          <div style={{ marginTop: 20, padding: 14, background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: 4, fontSize: 12, color: '#92400e' }}>
            <b>Note for Employer:</b> Inspector field assignments, inspection dates, and risk levels are determined by the Labour Department. Employers are required to produce statutory wage and attendance registers during the site visit.
          </div>
        </section>
      </>
    );
  }

  if (subTab === 'Inspection History') {
    return (
      <>
        <Hero title="Historical Inspection Log" text="Record of completed field inspections conducted at your establishment." />
        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Completed Historical Inspections</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Inspection Date</th>
                  <th>Inspection Type</th>
                  <th>Assigned Inspector</th>
                  <th>Result</th>
                  <th>Follow-up Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td><b>{h.id}</b></td>
                    <td>{h.inspectionDate}</td>
                    <td><Badge value={h.inspectionType} /></td>
                    <td>{h.inspectorName || 'Rajesh Kumar'}</td>
                    <td><Badge value={h.result} /></td>
                    <td><Badge value={h.followUpStatus} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInsp(h)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  // DEFAULT: Upcoming Inspections
  return (
    <>
      <Hero title="Upcoming Scheduled Inspections" text="View field inspections scheduled for your establishment by the Labour Department." />
      <section className="panel table-panel">
        <div className="panel-title">
          <h3>Scheduled Field Inspections</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Establishment Name</th>
                <th>Inspection Date</th>
                <th>Inspection Type</th>
                <th>Assigned Inspector</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.id}</b></td>
                  <td><b>{u.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</b></td>
                  <td>{u.inspectionDate || u.scheduledDate}</td>
                  <td><Badge value={u.inspectionType || 'Risk-Based'} /></td>
                  <td>{u.inspectorName || 'Rajesh Kumar'}</td>
                  <td><Badge value={u.riskLevel || 'HIGH'} /></td>
                  <td><Badge value={u.status} /></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedInsp(u)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function EmployerActionsModule({ subTab }: { subTab: string }) {
  const [notices, setNotices] = useState<any[]>(EMPLOYER_NOTICES);
  const [explanations, setExplanations] = useState<any[]>(EMPLOYER_EXPLANATIONS);
  const [actions, setActions] = useState<any[]>(EMPLOYER_CORRECTIVE_ACTIONS);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Explanation Modal
  const [respNoticeId, setRespNoticeId] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState('');
  const [expDoc, setExpDoc] = useState('');

  // Corrective Action Modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionNoticeId, setActionNoticeId] = useState(EMPLOYER_NOTICES[0].id);
  const [actionViolationId, setActionViolationId] = useState(EMPLOYER_CORRECTIVE_ACTIONS[0].relatedViolation);
  const [actionDesc, setActionDesc] = useState('');
  const [actionProof, setActionProof] = useState('');

  const loadActionsData = () => {
    api('/notices').then(res => {
      if (Array.isArray(res) && res.length) setNotices([...res, ...EMPLOYER_NOTICES.filter(n => !res.some((r: any) => r.id === n.id))]);
    }).catch(() => { });
  };

  useEffect(() => {
    loadActionsData();
  }, [subTab]);

  const handleSubmitExplanation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respNoticeId) return;
    setMsg('');
    setErr('');
    try {
      await api('/notices/' + respNoticeId + '/response', {
        method: 'PATCH',
        body: JSON.stringify({ explanation: explanationText })
      }).catch(() => { });
      const newExp = {
        id: 'EXP-' + Date.now(),
        noticeId: respNoticeId,
        noticeNumber: notices.find(n => n.id === respNoticeId)?.noticeNumber || respNoticeId,
        submittedDate: new Date().toISOString().slice(0, 10),
        explanationText,
        supportingDoc: expDoc || 'salary_payment_receipt.pdf',
        status: 'UNDER_REVIEW'
      };
      setExplanations([newExp, ...explanations]);
      setMsg('Notice explanation submitted successfully for Officer review!');
      setRespNoticeId(null);
      setExplanationText('');
      setExpDoc('');
    } catch (x: any) {
      setErr(x.message || 'Failed to submit explanation');
    }
  };

  const handleSubmitCorrectiveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await api('/corrective-actions', {
        method: 'POST',
        body: JSON.stringify({
          noticeId: actionNoticeId,
          violationId: actionViolationId,
          description: actionDesc,
          evidence: [actionProof]
        })
      }).catch(() => { });
      const newCa = {
        id: 'CA-' + Date.now(),
        relatedViolation: actionViolationId,
        requiredAction: 'Rectify statutory compliance gap',
        employerResponse: actionDesc,
        proofDocument: actionProof || 'attendance_records_oct.pdf',
        submittedDate: new Date().toISOString().slice(0, 10),
        status: 'UNDER_REVIEW'
      };
      setActions([newCa, ...actions]);
      setMsg('Corrective action response submitted successfully for Officer review!');
      setShowActionModal(false);
      setActionDesc('');
      setActionProof('');
    } catch (x: any) {
      setErr(x.message || 'Failed to submit corrective action');
    }
  };

  if (subTab === 'Explanations') {
    return (
      <>
        <Hero title="Notice Explanations Repository" text="Formal written explanations and supporting evidence submitted in response to statutory notices." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Submitted Explanations Log</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Explanation ID</th>
                  <th>Related Notice</th>
                  <th>Submitted Date</th>
                  <th>Explanation Statement</th>
                  <th>Supporting Document</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {explanations.map(exp => (
                  <tr key={exp.id}>
                    <td><b>{exp.id}</b></td>
                    <td><b>{exp.noticeNumber || exp.noticeId}</b></td>
                    <td>{exp.submittedDate}</td>
                    <td><small>{exp.explanationText || 'Pending submission'}</small></td>
                    <td><small style={{ color: '#2563eb' }}>{exp.supportingDoc || '—'}</small></td>
                    <td><Badge value={exp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {respNoticeId && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Submit Notice Explanation</h3>
                <button className="close-btn" onClick={() => setRespNoticeId(null)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitExplanation}>
                <label style={{ display: 'block', marginBottom: 16 }}>Explanation Statement (Min 5 characters) *
                  <textarea rows={4} value={explanationText} onChange={e => setExplanationText(e.target.value)} required placeholder="State statutory compliance details, clarifications, or payroll processing reasons..." style={{ width: '100%', marginTop: 6 }} />
                </label>
                <label style={{ display: 'block', marginBottom: 20 }}>Supporting Proof Document Reference
                  <input value={expDoc} onChange={e => setExpDoc(e.target.value)} placeholder="e.g. salary_payment_receipt.pdf" style={{ width: '100%', marginTop: 6 }} />
                </label>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Submit Explanation</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setRespNoticeId(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  if (subTab === 'Corrective Actions') {
    return (
      <>
        <Hero title="Statutory Corrective Actions" text="Submit formal corrective action responses along with supporting proof for confirmed statutory violations." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel table-panel" style={{ marginBottom: 24 }}>
          <div className="panel-title">
            <div>
              <h3>Corrective Action Submissions Log</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Corrective actions are reviewed and approved strictly by Labour Officers.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowActionModal(true)}>
              <Plus size={16} /> Submit Corrective Action
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Action ID</th>
                  <th>Related Violation</th>
                  <th>Required Action</th>
                  <th>Employer Response</th>
                  <th>Proof Document</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {actions.map(ca => (
                  <tr key={ca.id}>
                    <td><b>{ca.id}</b></td>
                    <td><Badge value={ca.relatedViolation} /></td>
                    <td>{ca.requiredAction}</td>
                    <td><small>{ca.employerResponse || 'Pending response'}</small></td>
                    <td><small style={{ color: '#2563eb' }}>{ca.proofDocument || '—'}</small></td>
                    <td>{ca.submittedDate || '—'}</td>
                    <td><Badge value={ca.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Follow-up Tracking Box */}
        <section className="panel" style={{ maxWidth: 800 }}>
          <div className="panel-title">
            <h3>Officer Re-Inspection Follow-up Tracking</h3>
            <Badge value={EMPLOYER_FOLLOWUPS[0].status} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: '#f8fafc', padding: 16, borderRadius: 8, fontSize: 13 }}>
            <div><b>Follow-up ID:</b> <b>{EMPLOYER_FOLLOWUPS[0].id}</b></div>
            <div><b>Related Violation:</b> <Badge value={EMPLOYER_FOLLOWUPS[0].relatedViolation} /></div>
            <div><b>Scheduled Date:</b> {EMPLOYER_FOLLOWUPS[0].scheduledDate}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_FOLLOWUPS[0].status} /></div>
          </div>
        </section>

        {showActionModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Submit Corrective Action Response</h3>
                <button className="close-btn" onClick={() => setShowActionModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitCorrectiveAction}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <label>Select Issued Notice *
                    <select value={actionNoticeId} onChange={e => setActionNoticeId(e.target.value)} required className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                      {notices.map(n => (
                        <option key={n.id} value={n.id}>{n.noticeNumber || n.id}</option>
                      ))}
                    </select>
                  </label>
                  <label>Select Related Violation *
                    <select value={actionViolationId} onChange={e => setActionViolationId(e.target.value)} required className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                      {actions.map(a => (
                        <option key={a.id} value={a.relatedViolation}>{a.relatedViolation}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label style={{ display: 'block', marginBottom: 16 }}>Employer Response & Action Taken *
                  <textarea rows={3} value={actionDesc} onChange={e => setActionDesc(e.target.value)} required placeholder="Describe corrective measures taken, arrears disbursed..." style={{ width: '100%', marginTop: 6 }} />
                </label>

                <label style={{ display: 'block', marginBottom: 20 }}>Proof Document / Evidence Reference *
                  <input value={actionProof} onChange={e => setActionProof(e.target.value)} required placeholder="e.g. attendance_records_oct.pdf" style={{ width: '100%', marginTop: 6 }} />
                </label>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Submit Corrective Action</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowActionModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // DEFAULT: Notices
  return (
    <>
      <Hero title="Statutory Notices Received" text="View statutory notices issued by Labour Department Officers regarding compliance issues." />
      {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
      {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

      <section className="panel table-panel">
        <div className="panel-title">
          <h3>Received Statutory Notices</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Notice ID</th>
                <th>Issue Date</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Issue Description</th>
                <th>Response Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id}>
                  <td><b>{n.noticeNumber || n.id}</b></td>
                  <td>{n.issueDate?.slice(0, 10)}</td>
                  <td>{n.category || 'Wage Compliance'}</td>
                  <td><Badge value={n.severity || 'HIGH'} /></td>
                  <td><small>{n.issue || 'Statutory compliance notice'}</small></td>
                  <td>{n.responseDeadline?.slice(0, 10)}</td>
                  <td><Badge value={n.status} /></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => { setRespNoticeId(n.id); setExplanationText(n.employerResponse || ''); }}>
                      Submit Explanation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {respNoticeId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Submit Notice Explanation</h3>
              <button className="close-btn" onClick={() => setRespNoticeId(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitExplanation}>
              <label style={{ display: 'block', marginBottom: 16 }}>Explanation Statement (Min 5 characters) *
                <textarea rows={4} value={explanationText} onChange={e => setExplanationText(e.target.value)} required placeholder="State statutory compliance details, clarifications, or reasons..." style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label style={{ display: 'block', marginBottom: 20 }}>Supporting Proof Document Reference
                <input value={expDoc} onChange={e => setExpDoc(e.target.value)} placeholder="e.g. salary_payment_receipt.pdf" style={{ width: '100%', marginTop: 6 }} />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">Submit Explanation</button>
                <button type="button" className="btn btn-secondary" onClick={() => setRespNoticeId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileModule({ user, onUpdateUser }: { user: UserType; onUpdateUser?: (u: UserType) => void }) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [designation, setDesignation] = useState((user as any).designation || 'Compliance Manager');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'LABOUR_OFFICER') {
      api('/audit-logs').then(setAuditLogs).catch(() => { });
    }
  }, [user.role]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const updated = await api('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, designation })
      });
      setMsg('Profile updated successfully!');
      if (onUpdateUser) onUpdateUser({ ...user, ...updated });
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Failed to update profile');
    }
  };

  return (
    <>
      <Hero title="User Profile & Account Settings" text="Manage your authorized compliance account profile and view administrative details." />

      <div className="grid" style={{ marginBottom: 24 }}>
        <article className="panel">
          <h3 style={{ color: '#0f2d59', marginBottom: 14 }}>Authenticated User Profile</h3>
          <form onSubmit={handleUpdateProfile}>
            {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 10, borderRadius: 6, marginBottom: 14 }}>{msg}</p>}

            <label style={{ display: 'block', marginBottom: 12 }}>Name
              <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>Email (Read Only)
              <input value={user.email} disabled style={{ width: '100%', marginTop: 4, background: '#f1f5f9' }} />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>Role (Read Only)
              <input value={user.role.replace(/_/g, ' ')} disabled style={{ width: '100%', marginTop: 4, background: '#f1f5f9' }} />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>Contact Phone
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" style={{ width: '100%', marginTop: 4 }} />
            </label>

            <label style={{ display: 'block', marginBottom: 16 }}>Designation
              <input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. HR Manager / Factory Compliance Officer" style={{ width: '100%', marginTop: 4 }} />
            </label>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </article>
      </div>



      {user.role === 'EMPLOYER' && (
        <article className="panel" style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#0f2d59', marginBottom: 14 }}>Employer Establishment Account Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: '#f8fafc', padding: 18, borderRadius: 8, fontSize: 14 }}>
            <div><b>Account Name:</b> {user.name || EMPLOYER_ESTABLISHMENT_DATA.ownerName}</div>
            <div><b>Role:</b> {user.role}</div>
            <div><b>Registered Establishment:</b> {EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</div>
            <div><b>Registration Number:</b> {EMPLOYER_ESTABLISHMENT_DATA.registrationNumber}</div>
            <div><b>Designation:</b> {EMPLOYER_ESTABLISHMENT_DATA.designation}</div>
            <div><b>District:</b> {EMPLOYER_ESTABLISHMENT_DATA.district}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Phone:</b> {EMPLOYER_ESTABLISHMENT_DATA.phone}</div>
            <div><b>Account Status:</b> <span className="badge green">Active</span></div>
          </div>
        </article>
      )}

      {user.role === 'LABOUR_INSPECTOR' && (
        <article className="panel" style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#0f2d59', marginBottom: 14 }}>Labour Inspector Credentials & Field Jurisdiction</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: '#f8fafc', padding: 18, borderRadius: 8, fontSize: 14 }}>
            <div><b>Officer Name:</b> {user.name || INSPECTOR_PROFILE_DATA.name}</div>
            <div><b>Employee ID:</b> {INSPECTOR_PROFILE_DATA.employeeId}</div>
            <div><b>Designation:</b> {INSPECTOR_PROFILE_DATA.designation}</div>
            <div><b>Assigned District:</b> {user.districtId || INSPECTOR_PROFILE_DATA.district}</div>
            <div><b>Department:</b> {INSPECTOR_PROFILE_DATA.department}</div>
            <div><b>Official Email:</b> {user.email}</div>
            <div><b>Duty Status:</b> <span className="badge green">{INSPECTOR_PROFILE_DATA.status}</span></div>
            <div><b>Completed Inspections:</b> {INSPECTOR_KPI_STATS.completedInspections}</div>
          </div>
        </article>
      )}

      {user.role === 'LABOUR_OFFICER' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Administrative Audit Logs</h3>
            <p>System audit trail recording verification, inspection assignment, notices, and approvals</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td><b>{log.action}</b></td>
                    <td>{log.entityType}</td>
                    <td><small>{log.entityId}</small></td>
                    <td>{log.timestamp?.slice(0, 19).replace('T', ' ')}</td>
                  </tr>
                ))}
                {!auditLogs.length && <tr><td colSpan={4}>No audit logs recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

// ----------------------------------------------------
// MAIN APPLICATION CONTAINER
// ----------------------------------------------------
function App() {
  const [u, setU] = useState<UserType | null>(null);
  const [activeMain, setActiveMain] = useState<string>('Dashboard');
  const [activeSub, setActiveSub] = useState<string>('');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const [registerRole, setRegisterRole] = useState<AuthRole>('EMPLOYER');
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Restore session from stored JWT via /me on every page load
  useEffect(() => {
    const token = localStorage.getItem('tn_token');
    if (!token) { setAuthChecking(false); return; }
    api('/auth/me')
      .then((d: any) => {
        const userData = d.user ?? d;
        if (userData?.id && userData?.role) {
          setU(userData as UserType);
          setActiveMain('Dashboard');
        } else {
          localStorage.removeItem('tn_token');
        }
      })
      .catch(() => {
        // Token invalid / expired — clear and show login
        localStorage.removeItem('tn_token');
      })
      .finally(() => setAuthChecking(false));
  }, []);

  // Show nothing while we check the stored token
  if (authChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f2d59', color: '#fff', fontSize: 16 }}>
        Verifying session…
      </div>
    );
  }

  if (!u) {
    if (screen === 'register') {
      return (
        <Register
          initialRole={registerRole}
          onBack={(role) => {
            if (role) setRegisterRole(role);
            setScreen('login');
          }}
        />
      );
    }
    return (
      <Login
        done={x => { setU(x); setActiveMain('Dashboard'); setActiveSub(''); }}
        onRegister={role => { setRegisterRole(role); setScreen('register'); }}
      />
    );
  }

  const handleSelectNav = (mainId: string, subId?: string) => {
    setActiveMain(mainId);
    setActiveSub(subId || '');
  };

  // Render view based on active role and active menu selection
  const renderContent = () => {
    if (activeMain === 'Dashboard') {
      if (u.role === 'LABOUR_OFFICER') return <OfficerDashboard />;
      if (u.role === 'LABOUR_INSPECTOR') return <InspectorDashboard onNavigate={handleSelectNav} />;
      return <EmployerDashboard onNavigate={handleSelectNav} />;
    }

    if (u.role === 'LABOUR_OFFICER') {
      switch (activeMain) {
        case 'Establishments':
          return <EstablishmentsModule subTab={activeSub || 'All Establishments'} />;
        case 'Compliance & Risk':
          return <ComplianceRiskModule subTab={activeSub || 'Compliance Submissions'} />;
        case 'Inspections':
          return <InspectionsModule subTab={activeSub || 'Inspection Reports'} />;
        case 'Enforcement':
          return <EnforcementModule subTab={activeSub || 'Violations'} />;
        case 'Profile':
          return <ProfileModule user={u} onUpdateUser={setU} />;
        default:
          return <OfficerDashboard />;
      }
    }

    if (u.role === 'LABOUR_INSPECTOR') {
      switch (activeMain) {
        case 'My Inspections':
        case 'Inspection Reports':
          return <InspectorReportsModule subTab={activeSub || 'Assigned'} />;
        case 'Profile':
          return <ProfileModule user={u} onUpdateUser={setU} />;
        default:
          return <InspectorDashboard onNavigate={handleSelectNav} />;
      }
    }

    if (u.role === 'EMPLOYER') {
      switch (activeMain) {
        case 'My Establishment':
          return <EmployerEstablishmentModule subTab={activeSub || 'Establishment Details'} />;
        case 'Compliance':
          return <EmployerComplianceModule subTab={activeSub || 'Submit Compliance'} />;
        case 'Inspections':
          return <EmployerInspectionsModule subTab={activeSub || 'Upcoming'} />;
        case 'Actions':
          return <EmployerActionsModule subTab={activeSub || 'Notices'} />;
        case 'Profile':
          return <ProfileModule user={u} onUpdateUser={setU} />;
        default:
          return <EmployerDashboard onNavigate={handleSelectNav} />;
      }
    }

    return <OfficerDashboard />;
  };

  return (
    <div className="app">
      <Sidebar
        user={u}
        activeMain={activeMain}
        activeSub={activeSub}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onSelectNav={handleSelectNav}
        onLogout={() => {
          localStorage.removeItem('tn_token');
          setU(null);
        }}
      />
      <main className="content">
        <header>
          <div>
            <p className="crumb">Government of Tamil Nadu • Labour Department</p>
            <h1>{activeMain} {activeSub ? `› ${activeSub}` : ''}</h1>
          </div>
          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '6px 12px', borderRadius: 20, border: '1px solid #cbd5e1' }}>
              <Bell size={16} color="#0f2d59" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f2d59' }}>{u.role.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

