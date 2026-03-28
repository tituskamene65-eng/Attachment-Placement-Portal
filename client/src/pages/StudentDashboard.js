import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Send, Building2, BookOpen, Clock, CheckCircle2, XCircle,
  GraduationCap, AlertCircle, ChevronRight, Search, X, CalendarDays,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Badge = ({ status }) => <span className={`badge badge-${status}`}>{status}</span>;

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

// ── Student Home ──────────────────────────────────────────────────────────────
function StudentHome() {
  const { user } = useAuth();
  const { data: apps } = useData('/applications');
  const { data: placement } = useData('/placements');

  const pending  = apps?.filter(a => a.status === 'pending').length  || 0;
  const accepted = apps?.filter(a => a.status === 'accepted').length || 0;
  const rejected = apps?.filter(a => a.status === 'rejected').length || 0;
  const myPlacement = placement?.[0];

  const stats = [
    { label: 'Applications Sent', value: apps?.length || 0, Icon: Send,          cls: 'stat-accent' },
    { label: 'Pending Review',    value: pending,            Icon: Clock,         cls: '' },
    { label: 'Accepted',         value: accepted,           Icon: CheckCircle2,  cls: 'stat-green' },
    { label: 'Rejected',         value: rejected,           Icon: XCircle,       cls: 'stat-red' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Welcome back, {user?.name?.split(' ')[0]}</div>
        <div className="page-subtitle">Track your attachment journey from here.</div>
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

      {myPlacement ? (
        <div className="card" style={{ borderLeft: '4px solid var(--green)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <GraduationCap size={20} style={{ color: 'var(--green)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Placement Confirmed!</span>
            <Badge status="confirmed" />
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: '0.9rem' }}>
            <strong>{myPlacement.company?.name}</strong> — {myPlacement.opportunity?.title}
            {myPlacement.startDate && (
              <span style={{ marginLeft: 12, color: 'var(--ink-3)' }}>Starts: {myPlacement.startDate}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ borderLeft: '4px solid var(--accent)', marginBottom: 24, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>No placement confirmed yet</div>
              <div style={{ color: 'var(--ink-3)', fontSize: '0.88rem' }}>Browse opportunities and submit applications to get started.</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Recent Applications</h3>
        {!apps?.length ? (
          <div className="empty-state">
            <Send size={32} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">No applications yet</div>
            <div style={{ color: 'var(--ink-3)', fontSize: '0.85rem', marginTop: 4 }}>Browse opportunities to get started</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Company</th><th>Position</th><th>Applied</th><th>Status</th></tr></thead>
              <tbody>
                {apps.slice(0, 5).map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.company?.name || '—'}</td>
                    <td>{a.opportunity?.title || '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td><Badge status={a.status} /></td>
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

// ── Browse Companies ──────────────────────────────────────────────────────────
function BrowseCompanies() {
  const { data: companies, loading } = useData('/companies');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = companies?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Companies</div>
        <div className="page-subtitle">Discover organisations offering attachment opportunities.</div>
      </div>

      <div className="search-bar">
        <Search size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, industry or location…" />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex' }}><X size={15} /></button>}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : !filtered?.length ? (
        <div className="empty-state">
          <Building2 size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
          <div className="empty-title">No companies found</div>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(c => (
            <div className="company-card" key={c.id}
              onClick={() => navigate(`/student/opportunities?company=${c.id}`)}
              style={{ cursor: 'pointer' }}>
              <div className="company-card-header">
                <div className="company-avatar">{c.name[0]}</div>
                <div>
                  <div className="company-name">{c.name}</div>
                  <div className="company-meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 size={11} /> {c.industry}
                    {c.location && <><span style={{ margin: '0 3px' }}>·</span>{c.location}</>}
                  </div>
                </div>
              </div>
              <div className="company-card-body">
                <p className="company-desc">{c.description || 'No description provided.'}</p>
              </div>
              <div className="company-card-footer">
                <span className="text-sm text-muted">
                  <BookOpen size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {c.opportunityCount} opportunit{c.opportunityCount === 1 ? 'y' : 'ies'}
                </span>
                <span className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  View <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Opportunities ─────────────────────────────────────────────────────────────
function Opportunities() {
  const { data: opps, loading } = useData('/opportunities');
  const { data: myApps, refresh: refreshApps } = useData('/applications');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [cover, setCover] = useState('');
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState('');

  const filtered = opps?.filter(o =>
    o.status === 'active' && (
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company?.name?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const hasApplied = (oppId) => myApps?.some(a => a.opportunityId === oppId);

  const apply = async () => {
    setApplying(true); setMsg('');
    try {
      await axios.post('/applications', { opportunityId: modal.id, coverLetter: cover });
      setMsg('success');
      refreshApps();
      setTimeout(() => { setModal(null); setMsg(''); setCover(''); }, 1600);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Something went wrong');
    } finally { setApplying(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Opportunities</div>
        <div className="page-subtitle">Browse active attachment positions.</div>
      </div>

      <div className="search-bar">
        <Search size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by position or company…" />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex' }}><X size={15} /></button>}
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div className="card-grid">
          {filtered?.map(o => {
            const applied = hasApplied(o.id);
            const acceptedCount = o.applicationCount || 0;
            const full = acceptedCount >= o.slots;
            const slotsLeft = o.slots - acceptedCount;
            return (
              <div className="opp-card" key={o.id}>
                <div className="opp-title">{o.title}</div>
                <div className="opp-company" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Building2 size={12} /> {o.company?.name}
                </div>
                <div className="opp-desc">{o.description}</div>
                <div className="opp-tags">
                  <span className="opp-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CalendarDays size={11} /> {o.duration}
                  </span>
                  {o.company?.location && (
                    <span className="opp-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={11} /> {o.company.location}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="slots-indicator">
                    <div className="slots-dot" style={{ background: full ? 'var(--red)' : 'var(--green)' }} />
                    {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left
                  </div>
                  {applied
                    ? <span className="badge badge-accepted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={11} /> Applied</span>
                    : <button className="btn btn-accent btn-sm" onClick={() => { setModal(o); setMsg(''); }} disabled={full}>{full ? 'Full' : 'Apply Now'}</button>
                  }
                </div>
              </div>
            );
          })}
          {!filtered?.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <BookOpen size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
              <div className="empty-title">No opportunities found</div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Apply — {modal.title}</div>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-3)', marginBottom: 16 }}>
                <Building2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {modal.company?.name} · {modal.duration}
              </p>
              {modal.requirements && (
                <div style={{ background: 'var(--paper)', padding: '12px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>
                  <strong>Requirements:</strong> {modal.requirements}
                </div>
              )}
              <div className="form-group">
                <label>Cover Letter <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(optional)</span></label>
                <textarea value={cover} onChange={e => setCover(e.target.value)} rows={5}
                  placeholder="Briefly explain why you're a great fit for this role…" />
              </div>
              {msg === 'success' && <div className="alert alert-success"><CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Application submitted successfully!</div>}
              {msg && msg !== 'success' && <div className="alert alert-error">{msg}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={apply} disabled={applying}>
                {applying ? 'Submitting…' : <><Send size={14} style={{ marginRight: 6 }} />Submit Application</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── My Applications ───────────────────────────────────────────────────────────
function MyApplications() {
  const { data: apps, loading } = useData('/applications');

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Applications</div>
        <div className="page-subtitle">Track the status of all your submissions.</div>
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !apps?.length ? (
          <div className="empty-state">
            <Send size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
            <div className="empty-title">No applications yet</div>
            <p style={{ color: 'var(--ink-3)', marginTop: 8, fontSize: '0.88rem' }}>Browse opportunities and apply to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Company</th><th>Position</th><th>Duration</th><th>Applied On</th><th>Status</th></tr></thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.company?.name || '—'}</td>
                    <td>{a.opportunity?.title || '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{a.opportunity?.duration || '—'}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td><Badge status={a.status} /></td>
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

// ── My Placement ──────────────────────────────────────────────────────────────
function MyPlacement() {
  const { data: placements, loading } = useData('/placements');
  const placement = placements?.[0];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Placement</div>
        <div className="page-subtitle">Your confirmed attachment placement details.</div>
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div>
        : !placement ? (
          <div className="card">
            <div className="empty-state">
              <GraduationCap size={36} strokeWidth={1.2} style={{ color: 'var(--ink-4)', marginBottom: 8 }} />
              <div className="empty-title">No placement confirmed yet</div>
              <p style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: '0.88rem' }}>
                Once the university confirms your placement, the details will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div className="company-avatar" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>
                {placement.company?.name?.[0]}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{placement.company?.name}</div>
                <div style={{ color: 'var(--ink-3)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={12} /> {placement.company?.location}
                </div>
              </div>
              <span className="badge badge-confirmed" style={{ marginLeft: 'auto' }}>Confirmed</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Position',   placement.opportunity?.title],
                ['Duration',   placement.opportunity?.duration],
                ['Start Date', placement.startDate || 'TBD'],
                ['End Date',   placement.endDate   || 'TBD'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--paper)', padding: '14px 18px', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            {placement.notes && (
              <div style={{ marginTop: 16, padding: '14px', background: 'var(--accent-light)', borderRadius: 10, fontSize: '0.88rem', color: 'var(--ink-2)' }}>
                <strong>Notes:</strong> {placement.notes}
              </div>
            )}
            <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarDays size={12} /> Confirmed on {new Date(placement.confirmedAt).toLocaleDateString()}
            </div>
          </div>
        )
      }
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<StudentHome />} />
          <Route path="companies"     element={<BrowseCompanies />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="applications"  element={<MyApplications />} />
          <Route path="placement"     element={<MyPlacement />} />
        </Routes>
      </main>
    </div>
  );
}
