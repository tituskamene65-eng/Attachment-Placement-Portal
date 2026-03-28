import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Send,
  GraduationCap,
  Users,
  MapPin,
  Settings,
  BarChart3,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navConfig = {
  student: [
    { to: '/student',               label: 'Dashboard',        Icon: LayoutDashboard, end: true },
    { to: '/student/companies',     label: 'Browse Companies', Icon: Building2 },
    { to: '/student/opportunities', label: 'Opportunities',    Icon: BookOpen },
    { to: '/student/applications',  label: 'My Applications',  Icon: Send },
    { to: '/student/placement',     label: 'My Placement',     Icon: GraduationCap },
  ],
  company: [
    { to: '/company',               label: 'Dashboard',        Icon: LayoutDashboard, end: true },
    { to: '/company/opportunities', label: 'My Opportunities', Icon: ClipboardList },
    { to: '/company/applications',  label: 'Applications',     Icon: Send },
    { to: '/company/placements',    label: 'Placed Students',  Icon: MapPin },
    { to: '/company/profile',       label: 'Company Profile',  Icon: Settings },
  ],
  admin: [
    { to: '/admin',               label: 'Dashboard',    Icon: BarChart3,  end: true },
    { to: '/admin/students',      label: 'Students',     Icon: Users },
    { to: '/admin/companies',     label: 'Companies',    Icon: Building2 },
    { to: '/admin/applications',  label: 'Applications', Icon: Send },
    { to: '/admin/placements',    label: 'Placements',   Icon: MapPin },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] || [];
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-title">SAPMS</div>
        <div className="logo-sub">Attachment Placement System</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {links.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
