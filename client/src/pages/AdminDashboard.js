import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Building2, BookOpen, Send, MapPin, CheckCircle2, XCircle,
  RotateCcw, Plus, Trash2, Search, X, CalendarDays, GraduationCap,
  Clock, AlertCircle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

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

// ── Admin Home ────────────────────────────────────────────────────────────────
function AdminHome() {
  const { data: stats }      = useData('/stats');
  const { data: apps }       = useData('/applications');
  const { data: placements } = useData('/placements');

  const statCards = stats ? [
    { label: 'Total Students',      value: stats.totalStudents,      Icon: Users,        cls: 'stat-blue' },
    { label: 'Companies',           value: stats.totalCompanies,     Icon: Building2,    cls: 'stat-accent' },
    { label: 'Opportunities',       value: stats.totalOpportunities, Icon: BookOpen,     cls: '' },
    { label: 'Total Applications',  value: stats.totalApplications,  Icon: Send,         cls: '' },
    { label: 'Pending',             value: stats.pendingApplications,Icon: Clock,        cls: '' },
    { label: 'Accepted',            value: stats.acceptedApplications,Icon: CheckCircle2,cls: 'stat-green' },
    { label: 'Rejected',            value: stats.rejectedApplications,Icon: XCircle,     cls: 'stat-red' },
    { label: 'Placements',          value: stats.totalPlacements,    Icon: MapPin,       cls: 'stat-blue' },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Admin Dashboard</div>
        <div className="page-subtitle">System-wide overview of the placement process.</div>
      </div>

      <div className="stats-grid">
        {statCards.map(({ label, value, Icon, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-value">{value}</div>
              <Icon size={20} strokeWidth={1.5} style={{ color: 'var(--ink-4)' }} />
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Recent Applications</h3>
          {!apps?.length ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <Send size={28} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
              <div className="empty-title" style={{ fontSize: '0.9rem' }}>No applications yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {apps.slice(0, 5).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--paper-2)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.student?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>{a.company?.name} — {a.opportunity?.title}</div>
                  </div>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Confirmed Placements</h3>
          {!placements?.length ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <MapPin size={28} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
              <div className="empty-title" style={{ fontSize: '0.9rem' }}>No placements yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {placements.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--paper-2)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.student?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>{p.company?.name} — {p.opportunity?.title}</div>
                  </div>
                  <span className="badge badge-confirmed">confirmed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── All Students ──────────────────────────────────────────────────────────────
function AllStudents() {
  const { data: students, loading } = useData('/students');
  const [search, setSearch] = useState('');

  const filtered = students?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.university?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Students</div>
        <div className="page-subtitle">All registered students in the system.</div>
      </div>

      <div className="search-bar">
        <Search size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or university…" />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex' }}><X size={15} /></button>}
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !filtered?.length ? (
          <div className="empty-state">
            <Users size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">{search ? 'No students match your search' : 'No students registered yet'}</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>University</th><th>Year</th><th>Applications</th><th>Placement</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>{s.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.course || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.university || '—'}</td>
                    <td>{s.year || '—'}</td>
                    <td>{s.applicationCount}</td>
                    <td>
                      {s.placement
                        ? <span className="badge badge-confirmed" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={11} /> Placed</span>
                        : <span className="badge badge-inactive">None</span>
                      }
                    </td>
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

// ── All Companies ─────────────────────────────────────────────────────────────
function AllCompanies() {
  const { data: companies, loading } = useData('/companies');
  const [search, setSearch] = useState('');

  const filtered = companies?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Companies</div>
        <div className="page-subtitle">All registered companies in the system.</div>
      </div>

      <div className="search-bar">
        <Search size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or industry…" />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex' }}><X size={15} /></button>}
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !filtered?.length ? (
          <div className="empty-state">
            <Building2 size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">{search ? 'No companies match your search' : 'No companies registered yet'}</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Company</th><th>Industry</th><th>Location</th><th>Opportunities</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="company-avatar" style={{ width: 36, height: 36, fontSize: '0.95rem' }}>{c.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          {c.description && <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>{c.description.slice(0, 60)}{c.description.length > 60 ? '…' : ''}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{c.industry || '—'}</td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {c.location ? <><MapPin size={12} style={{ color: 'var(--ink-4)' }} />{c.location}</> : '—'}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <BookOpen size={13} style={{ color: 'var(--ink-4)' }} /> {c.opportunityCount}
                      </span>
                    </td>
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

// ── All Applications ──────────────────────────────────────────────────────────
function AllApplications() {
  const { data: apps, loading, refresh } = useData('/applications');
  const [tab, setTab]           = useState('pending');
  const [updating, setUpdating] = useState(null);

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
        <div className="page-title">All Applications</div>
        <div className="page-subtitle">Monitor and manage all student applications across companies.</div>
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
              <thead><tr><th>Student</th><th>Company</th><th>Position</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.student?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>{a.student?.university}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.company?.name || '—'}</td>
                    <td>{a.opportunity?.title || '—'}</td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {a.status !== 'accepted' && (
                          <button className="btn btn-xs btn-green" disabled={updating === a.id} onClick={() => updateStatus(a.id, 'accepted')}>
                            <CheckCircle2 size={12} /> Accept
                          </button>
                        )}
                        {a.status !== 'rejected' && (
                          <button className="btn btn-xs btn-red" disabled={updating === a.id} onClick={() => updateStatus(a.id, 'rejected')}>
                            <XCircle size={12} /> Reject
                          </button>
                        )}
                        {a.status !== 'pending' && (
                          <button className="btn btn-xs btn-outline" disabled={updating === a.id} onClick={() => updateStatus(a.id, 'pending')}>
                            <RotateCcw size={12} /> Reset
                          </button>
                        )}
                      </div>
                    </td>
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

// ── Placements Management ─────────────────────────────────────────────────────
function AdminPlacements() {
  const { data: placements, loading, refresh } = useData('/placements');
  const { data: students }                     = useData('/students');
  const { data: opps }                         = useData('/opportunities');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ studentId: '', companyId: '', opportunityId: '', startDate: '', endDate: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedOpp = opps?.find(o => o.id === form.opportunityId);
  useEffect(() => {
    if (selectedOpp) setForm(f => ({ ...f, companyId: selectedOpp.companyId }));
  }, [form.opportunityId]); // eslint-disable-line

  const unplacedStudents = students?.filter(s => !s.placement) || [];

  const create = async () => {
    setSaving(true); setMsg('');
    try {
      await axios.post('/placements', form);
      refresh(); setModal(false);
      setForm({ studentId: '', companyId: '', opportunityId: '', startDate: '', endDate: '', notes: '' });
    } catch (e) { setMsg(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this placement?')) return;
    await axios.delete(`/placements/${id}`); refresh();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`/placements/${id}`, { status }); refresh();
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Placements</div>
          <div className="page-subtitle">Confirm and track student attachment placements.</div>
        </div>
        <button className="btn btn-accent" onClick={() => { setModal(true); setMsg(''); }}>
          <Plus size={15} /> Confirm Placement
        </button>
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !placements?.length ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <MapPin size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">No placements confirmed yet</div>
            <p style={{ color: 'var(--ink-3)', marginTop: 8, fontSize: '0.88rem' }}>
              Use the button above to assign students to companies.
            </p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: 24 }}>
            <table>
              <thead><tr><th>Student</th><th>Company</th><th>Position</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {placements.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.student?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>{p.student?.course}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.company?.name || '—'}</td>
                    <td>{p.opportunity?.title || '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>
                      {p.startDate ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CalendarDays size={12} />{p.startDate}</span> : 'TBD'}
                    </td>
                    <td style={{ color: 'var(--ink-3)' }}>{p.endDate || 'TBD'}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {p.status === 'confirmed' && (
                          <button className="btn btn-xs btn-green" onClick={() => updateStatus(p.id, 'completed')}>
                            <CheckCircle2 size={12} /> Done
                          </button>
                        )}
                        <button className="btn btn-xs btn-red" onClick={() => remove(p.id)}>
                          <Trash2 size={12} /> Remove
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
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Confirm Placement</div>
              <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {!unplacedStudents.length ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: 'var(--paper)', borderRadius: 10, marginBottom: 16 }}>
                  <AlertCircle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>All registered students already have placements.</span>
                </div>
              ) : null}
              <div className="form-group">
                <label>Student</label>
                <select value={form.studentId} onChange={e => set('studentId', e.target.value)}>
                  <option value="">— Select student —</option>
                  {unplacedStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}{s.university ? ` (${s.university})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Opportunity</label>
                <select value={form.opportunityId} onChange={e => set('opportunityId', e.target.value)}>
                  <option value="">— Select opportunity —</option>
                  {opps?.filter(o => o.status === 'active').map(o => (
                    <option key={o.id} value={o.id}>{o.company?.name} — {o.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
                <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any additional notes or instructions…" /></div>
              {msg && <div className="alert alert-error"><AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{msg}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={create} disabled={saving || !form.studentId || !form.opportunityId}>
                {saving ? 'Saving…' : <><GraduationCap size={14} style={{ marginRight: 6 }} />Confirm Placement</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="students"     element={<AllStudents />} />
          <Route path="companies"    element={<AllCompanies />} />
          <Route path="applications" element={<AllApplications />} />
          <Route path="placements"   element={<AdminPlacements />} />
        </Routes>
      </main>
    </div>
  );
}
