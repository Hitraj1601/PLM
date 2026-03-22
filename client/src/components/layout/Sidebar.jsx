import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, GitPullRequest,
  FileBarChart, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/bom', label: 'Bill of Materials', icon: Layers },
  { path: '/eco', label: 'Change Orders', icon: GitPullRequest },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-navy-900 border-r border-navy-600 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-navy-600">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sienna-500 to-xanadu-400 flex items-center justify-center flex-shrink-0">
            <GitPullRequest size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-gradient whitespace-nowrap">PLM System</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-sienna-600/20 text-sienna-400 border-l-2 border-sienna-500'
                  : 'text-gainsboro-400 hover:text-gainsboro-200 hover:bg-navy-700 border-l-2 border-transparent'
              }`}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 ${
                  isActive ? 'text-sienna-400' : 'text-gainsboro-500 group-hover:text-gainsboro-300'
                }`}
              />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-4 p-2 rounded-lg text-gainsboro-500 hover:text-gainsboro-300 hover:bg-navy-700 transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
