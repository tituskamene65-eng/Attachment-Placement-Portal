import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Mail, Lock, User, BookOpen, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoleCard = ({ label, Icon, selected, onClick }) => (
  <div className={`role-btn ${selected ? 'selected' : ''}`} onClick={onClick}>
    <Icon size={22} strokeWidth={1.6} style={{ color: selected ? 'var(--accent)' : 'var(--ink-3)' }} />
    <div className="role-btn-label">{label}</div>
  </div>
);

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    course: '', year: '', university: '',
    industry: '', location: '', description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = mode === 'login'
        ? await login(form.email, form.password)
        : await register({ ...form, role });
      navigate(user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
      <div>
        <img 
          src="kwust-logo.png" 
          alt="kwust logo"
          style={{ width: "120px", height: "auto" }}
        />
      </div>
        <div className="auth-brand">KWUST Student Attachment<br />Placement Portal</div>
        <p className="auth-tagline">
          Connecting students with industry partners for meaningful internship
          experiences — streamlined from application to placement.
        </p>
        <div className="auth-features">
          {[
            { Icon: GraduationCap, title: 'Students',     desc: 'Find and apply to attachment opportunities' },
            { Icon: Building2,     title: 'Companies',    desc: 'Post positions and discover talent' },
            { Icon: BookOpen,      title: 'Universities', desc: 'Monitor and manage all placements' },
          ].map(({ Icon, title, desc }) => (
            <div className="auth-feature" key={title}>
              <div className="auth-feature-icon">
                <Icon size={16} strokeWidth={1.8} style={{ color: 'var(--accent-2)' }} />
              </div>
              <div><strong style={{ color: '#fff' }}>{title}</strong>{' '}— {desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</div>
          <div className="auth-sub">{mode === 'login' ? 'Sign in to your account' : 'Join the SAPMS platform'}</div>

          {mode === 'register' && (
            <div className="role-selector">
              <RoleCard label="Student" Icon={GraduationCap} selected={role === 'student'} onClick={() => setRole('student')} />
              <RoleCard label="Company" Icon={Building2}     selected={role === 'company'} onClick={() => setRole('company')} />
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handle}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-icon-wrap">
                  <User size={15} className="input-icon" />
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={15} className="input-icon" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
              </div>
            </div>

            {mode === 'register' && role === 'student' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Course / Programme</label>
                    <input value={form.course} onChange={e => set('course', e.target.value)} placeholder="BSc Computer Science" />
                  </div>
                  <div className="form-group">
                    <label>Year of Study</label>
                    <select value={form.year} onChange={e => set('year', e.target.value)}>
                      <option value="">Select year</option>
                      {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>University / Institution</label>
                  <input value={form.university} onChange={e => set('university', e.target.value)} placeholder="University of Nairobi" />
                </div>
              </>
            )}

            {mode === 'register' && role === 'company' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Industry</label>
                    <input value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Technology" />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <div className="input-icon-wrap">
                      <MapPin size={15} className="input-icon" />
                      <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Nairobi" />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Company Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of your company…" rows={3} />
                </div>
              </>
            )}

            <button className="btn btn-accent w-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login'
              ? (<>Don't have an account? <a onClick={() => { setMode('register'); setError(''); }}>Register</a></>)
              : (<>Already have an account? <a onClick={() => { setMode('login'); setError(''); }}>Sign in</a></>)
            }
          </div>

          {mode === 'login' && (
            <div className="demo-creds">
              <strong>Default Admin Login</strong>
              Email: <code>admin@sapms.ac</code>&nbsp;/&nbsp;Password: <code>admin123</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
