import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.tsx';
import type { LucideProps } from 'lucide-react';
import { LayoutDashboard, FilePlus, ListChecks, Settings, Users, Building, FileText, Server, ClipboardList } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactElement<LucideProps>; 
  roles: string[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['FRONT_DESK', 'OFFICER', 'SECTION_HEAD', 'DEPARTMENT_HEAD', 'ADMIN'] },
  { path: '/intake/new', label: 'New Request', icon: <FilePlus size={20} />, roles: ['FRONT_DESK', 'OFFICER', 'SECTION_HEAD', 'DEPARTMENT_HEAD'] },
  { path: '/tasks', label: 'My Tasks', icon: <ListChecks size={20} />, roles: ['OFFICER', 'SECTION_HEAD'] },
  { path: '/command-center', label: 'Command Center', icon: <Server size={20} />, roles: ['DEPARTMENT_HEAD'] },
  { path: '/admin', label: 'Admin Panel', icon: <Settings size={20} />, roles: ['ADMIN'] },
  { path: '/admin/workflows', label: 'Workflows', icon: <FileText size={20} />, roles: ['ADMIN'] },
  { path: '/admin/templates', label: 'Templates', icon: <ClipboardList size={20} />, roles: ['ADMIN'] },
  { path: '/admin/users', label: 'Users', icon: <Users size={20} />, roles: ['ADMIN'] },
  { path: '/admin/offices', label: 'Offices', icon: <Building size={20} />, roles: ['ADMIN'] },
  { path: '/admin/sections', label: 'Sections', icon: <Building size={20} />, roles: ['ADMIN'] },
  { path: '/admin/subjects', label: 'Subjects', icon: <FileText size={20} />, roles: ['ADMIN'] },
  { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} />, roles: ['ADMIN'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const activeClassName = "bg-primary text-white";
  const inactiveClassName = "text-gray-600 hover:bg-primary-light hover:text-primary-dark focus:ring-primary focus:ring-offset-1";

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white shadow-lg h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {filteredNavItems.length === 0 ? (
          <div className="text-gray-500 text-sm p-2">No navigation items available for your role: {user.role}</div>
        ) : (
          filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${isActive ? activeClassName : inactiveClassName}`
              }
            >
              {React.cloneElement(item.icon, { className: "mr-3 flex-shrink-0" })}
              {item.label}
            </NavLink>
          ))
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
