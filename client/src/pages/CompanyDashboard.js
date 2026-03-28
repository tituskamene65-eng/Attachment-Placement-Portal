import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, ClipboardList, Send, MapPin, Settings,
  Users, BookOpen, Clock, CheckCircle2, XCircle, Plus,
  Pencil, Trash2, ToggleLeft, ToggleRight, X, Search,
  CalendarDays, Building2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const useData = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    try { const r = await axios.get(url); setData(r.data); } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, [url]); // eslint-disable-line
  return { data, loading, refresh };
};

// ── Company Home ──────────────────────────────────────────────────────────────
function CompanyHome() {
  const { user } = useAuth();
  const { data: apps }       = useData('/applications');
  const { data: opps }       = useData('/opportunities');
  const { data: placements } = useData('/placements');
  const { data: companies }  = useData('/companies');

  const myCompany = companies?.find(c => c.userId === user?.id);
  const myOppIds  = opps?.filter(o => o.companyId === myCompany?.id).map(o => o.id) || [];
  const myApps    = apps?.filter(a => myOppIds.includes(a.opportunityId)) || [];

  const stats = [
    { label: 'Active Opportunities', value: myOppIds.length,                               Icon: BookOpen,       cls: 'stat-accent' },
    { label: 'Pending Applications', value: myApps.filter(a => a.status === 'pending').length,  Icon: Clock,    cls: '' },
    { label: 'Accepted',             value: myApps.filter(a => a.status === 'accepted').length, Icon: CheckCircle2, cls: 'stat-green' },
    { label: 'Placed Students',      value: placements?.length || 0,                        Icon: MapPin,         cls: 'stat-blue' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Company Dashboard</div>
        <div className="page-subtitle">Manage your attachment opportunities and applicants.</div>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, Icon, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-value">{value}</div>
              <Icon size={20} strokeWidth={1.5} style={{ color: 'var(--ink-4)' }} />
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Recent Applications</h3>
        {!myApps.length ? (
          <div className="empty-state">
            <Send size={32} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">No applications yet</div>
            <div style={{ color: 'var(--ink-3)', fontSize: '0.85rem', marginTop: 4 }}>Post opportunities to start receiving applications</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Student</th><th>Position</th><th>Applied</th><th>Status</th></tr></thead>
              <tbody>
                {myApps.slice(0, 6).map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.student?.name || '—'}</td>
                    <td>{a.opportunity?.title || '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Opportunities Management ──────────────────────────────────────────────────
function MyOpportunities() {
  const { data: opps, loading, refresh } = useData('/opportunities');
  const { data: companies }              = useData('/companies');
  const { user }                         = useAuth();
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ title: '', description: '', slots: '', duration: '3 months', requirements: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const myCompany = companies?.find(c => c.userId === user?.id);
  const myOpps    = opps?.filter(o => o.companyId === myCompany?.id) || [];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm({ title: '', description: '', slots: '', duration: '3 months', requirements: '' }); setModal('new'); setMsg(''); };
  const openEdit   = (o) => { setForm({ title: o.title, description: o.description, slots: o.slots, duration: o.duration, requirements: o.requirements }); setModal(o.id); setMsg(''); };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      modal === 'new'
        ? await axios.post('/opportunities', form)
        : await axios.put(`/opportunities/${modal}`, form);
      refresh(); setModal(null);
    } catch (e) { setMsg(e.response?.data?.error || 'Error saving'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    await axios.delete(`/opportunities/${id}`); refresh();
  };

  const toggleStatus = async (o) => {
    await axios.put(`/opportunities/${o.id}`, { status: o.status === 'active' ? 'inactive' : 'active' });
    refresh();
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">My Opportunities</div>
          <div className="page-subtitle">Post and manage attachment positions.</div>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>
          <Plus size={15} /> Post Opportunity
        </button>
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !myOpps.length ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <ClipboardList size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">No opportunities posted yet</div>
            <button className="btn btn-accent mt-4" onClick={openCreate}><Plus size={14} /> Post your first opportunity</button>
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: 24 }}>
            <table>
              <thead><tr><th>Title</th><th>Slots</th><th>Applications</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {myOpps.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.title}</td>
                    <td>{o.slots}</td>
                    <td>{o.applicationCount || 0}</td>
                    <td>{o.duration}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-xs btn-outline" onClick={() => openEdit(o)} title="Edit">
                          <Pencil size={12} />
                        </button>
                        <button className="btn btn-xs btn-outline" onClick={() => toggleStatus(o)} title={o.status === 'active' ? 'Deactivate' : 'Activate'}>
                          {o.status === 'active' ? <ToggleRight size={14} style={{ color: 'var(--green)' }} /> : <ToggleLeft size={14} />}
                        </button>
                        <button className="btn btn-xs btn-red" onClick={() => remove(o.id)} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === 'new' ? 'Post Opportunity' : 'Edit Opportunity'}</div>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Job Title</label><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Software Engineering Intern" required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the role and what the intern will do…" /></div>
              <div className="form-row">
                <div className="form-group"><label>Available Slots</label><input type="number" min="1" value={form.slots} onChange={e => set('slots', e.target.value)} placeholder="3" /></div>
                <div className="form-group"><label>Duration</label><input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="3 months" /></div>
              </div>
              <div className="form-group"><label>Requirements</label><textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={2} placeholder="Year 3 CS student, Python skills…" /></div>
              {msg && <div className="alert alert-error">{msg}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Opportunity'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Applications Management ───────────────────────────────────────────────────
function CompanyApplications() {
  const { data: apps, loading, refresh } = useData('/applications');
  const [updating, setUpdating] = useState(null);
  const [tab, setTab]           = useState('pending');

  const filtered = apps?.filter(a => a.status === tab) || [];

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try { await axios.put(`/applications/${id}/status`, { status }); refresh(); }
    catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Applications</div>
        <div className="page-subtitle">Review and respond to student applications.</div>
      </div>

      <div className="tab-row">
        {['pending', 'accepted', 'rejected'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({apps?.filter(a => a.status === t).length || 0})
          </button>
        ))}
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !filtered.length ? (
          <div className="empty-state">
            <Send size={32} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">No {tab} applications</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>University</th><th>Position</th><th>Applied</th><th>Cover Letter</th>
                  {tab === 'pending' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.student?.name || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>{a.student?.email}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {a.student?.university || '—'}
                      <br /><span style={{ color: 'var(--ink-3)', fontSize: '0.78rem' }}>{a.student?.course}{a.student?.year ? ` · Yr ${a.student.year}` : ''}</span>
                    </td>
                    <td>{a.opportunity?.title || '—'}</td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.83rem', maxWidth: 200, color: 'var(--ink-3)' }}>
                      {a.coverLetter ? a.coverLetter.slice(0, 80) + (a.coverLetter.length > 80 ? '…' : '') : <em>None provided</em>}
                    </td>
                    {tab === 'pending' && (
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-xs btn-green" disabled={updating === a.id} onClick={() => updateStatus(a.id, 'accepted')}>
                            <CheckCircle2 size={12} /> Accept
                          </button>
                          <button className="btn btn-xs btn-red" disabled={updating === a.id} onClick={() => updateStatus(a.id, 'rejected')}>
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

// ── Placed Students ───────────────────────────────────────────────────────────
function PlacedStudents() {
  const { data: placements, loading } = useData('/placements');

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Placed Students</div>
        <div className="page-subtitle">Students confirmed for attachment at your organisation.</div>
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !placements?.length ? (
          <div className="empty-state">
            <Users size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">No students placed yet</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Student</th><th>Course</th><th>Position</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
              <tbody>
                {placements.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.student?.name || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>{p.student?.course}</td>
                    <td>{p.opportunity?.title || '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{p.startDate || 'TBD'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{p.endDate || 'TBD'}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

// ── Company Profile ───────────────────────────────────────────────────────────
function CompanyProfile() {
  const { user }                       = useAuth();
  const { data: companies, refresh }   = useData('/companies');
  const myCompany                      = companies?.find(c => c.userId === user?.id);
  const [form, setForm]   = useState({ name: '', industry: '', location: '', description: '' });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (myCompany) setForm({ name: myCompany.name, industry: myCompany.industry, location: myCompany.location, description: myCompany.description });
  }, [myCompany]); // eslint-disable-line

  const save = async () => {
    setSaving(true);
    await axios.put(`/companies/${myCompany.id}`, form);
    setSaved(true); refresh();
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">Company Profile</div></div>
      <div className="card" style={{ maxWidth: 560 }}>
        {saved && <div className="alert alert-success"><CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Profile updated successfully!</div>}
        <div className="form-group"><label>Company Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label>Industry</label><input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
          <div className="form-group">
            <label>Location</label>
            <div className="input-icon-wrap">
              <Building2 size={15} className="input-icon" />
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} /></div>
        <button className="btn btn-accent" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<CompanyHome />} />
          <Route path="opportunities" element={<MyOpportunities />} />
          <Route path="applications"  element={<CompanyApplications />} />
          <Route path="placements"    element={<PlacedStudents />} />
          <Route path="profile"       element={<CompanyProfile />} />
        </Routes>
      </main>
    </div>
  );
}
