// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, CheckSquare, Shield, Award, DollarSign, Archive, Link as LinkIcon, Calendar, Sliders, Star } from 'react-feather';
import { useUser } from '../../App';

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setMobileOpen, isCollapsed }) => {
  const user = useUser();

  if (!user) return null;

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', permission: user.permissions.dashboard.view },
    { to: '/members', icon: Users, label: 'Members', permission: user.permissions.members.view },
    { to: '/attendance', icon: CheckSquare, label: 'Attendance', permission: user.permissions.attendance.view },
    { to: '/uniform', icon: Shield, label: 'Uniform', permission: user.permissions.uniform.view },
    { to: '/points', icon: Award, label: 'Points', permission: user.permissions.points.view },
    { to: '/fees', icon: DollarSign, label: 'Fees', permission: user.permissions.fees.view },
    { to: '/inventory', icon: Archive, label: 'Inventory', permission: user.permissions.inventory.view },
    { to: '/honours', icon: Star, label: 'Honours', permission: user.permissions.honours.view },
    { to: '/resources', icon: LinkIcon, label: 'Resources', permission: user.permissions.resources.view },
    { to: '/events', icon: Calendar, label: 'Events', permission: user.permissions.events.view },
  ];
  
  const canViewAdminPanel = user.permissions.adminPanel.view;


  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isMobileOpen ? 'block' : 'hidden'}`} onClick={() => setMobileOpen(false)}></div>
      <aside className={`bg-gray-surface text-text-main flex-shrink-0 flex flex-col transition-all duration-300 fixed md:relative h-full z-40 w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className={`h-16 flex items-center border-b border-gray-border overflow-hidden ${isCollapsed ? 'justify-center' : 'justify-center px-4'}`}>
          <img src="https://img.icons8.com/ios-filled/50/38bdf8/shield.png" alt="Logo" className={`w-8 h-8 flex-shrink-0 ${isCollapsed ? '' : 'mr-2'}`} />
          <h1 className={`text-xl font-bold whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>Fa Nyame</h1>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul className="py-4">
            {navLinks.map(({ to, icon: Icon, label, permission }) => (
              permission && (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/dashboard'}
                    className={({ isActive }) => `flex items-center gap-3 py-3 hover:bg-gray-border transition-colors ${isActive ? 'bg-primary/10 text-primary font-semibold border-r-4 border-primary' : 'text-text-muted hover:text-text-main'} ${isCollapsed ? 'justify-center' : 'px-6'}`}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : 'inline'}`}>{label}</span>
                  </NavLink>
                </li>
              )
            ))}
          </ul>
        </nav>
        {canViewAdminPanel && (
            <div className="p-4 border-t border-gray-border">
                <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 hover:bg-gray-border rounded-md transition-colors ${isActive ? 'bg-gray-border font-semibold' : 'text-text-muted hover:text-text-main'} ${isCollapsed ? 'justify-center' : ''}`} title={isCollapsed ? "Admin Panel" : undefined}>
                    <Sliders className="w-5 h-5 flex-shrink-0" />
                    <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : 'inline'}`}>Admin Panel</span>
                </NavLink>
            </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;