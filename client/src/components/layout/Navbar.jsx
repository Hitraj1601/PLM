import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import ChatPanel from '../ui/ChatPanel';

const roleLabels = {
  engineering: 'Engineering',
  approver: 'Approver',
  operations: 'Operations',
  admin: 'Admin',
};

const roleColors = {
  engineering: 'bg-sienna-500/20 text-sienna-400',
  approver: 'bg-amber-500/20 text-amber-400',
  operations: 'bg-xanadu-500/20 text-xanadu-400',
  admin: 'bg-purple-500/20 text-purple-400',
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-navy-900 border-b border-navy-600 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-sm text-gainsboro-400 font-medium">Engineering Change Control</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Chat Panel */}
        <ChatPanel />

        {/* Role badge */}
        {user && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
            {roleLabels[user.role]}
          </span>
        )}

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sienna-500 to-xanadu-500 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm text-gainsboro-200 hidden sm:block">{user?.name}</span>
            <ChevronDown size={14} className={`text-gainsboro-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-navy-800 border border-navy-600 rounded-xl shadow-xl py-2 animate-scale-in">
              <div className="px-4 py-2 border-b border-navy-600">
                <p className="text-sm text-gainsboro-200 font-medium">{user?.name}</p>
                <p className="text-xs text-gainsboro-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-navy-700 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
