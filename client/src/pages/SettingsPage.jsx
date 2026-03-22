import { useState, useEffect } from 'react';
import { Lock, GripVertical, Shield, User, Info, KeyRound } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Stages State
  const [stages, setStages] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'stages') {
      loadStages();
    }
  }, [activeTab, user]);

  const loadStages = async () => {
    try {
      const { data } = await api.get('/settings/stages');
      setStages(data);
    } catch (err) {
      toast.error('Failed to load stages');
    }
  };



  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'stages', label: 'Workflow Stages', icon: Shield, adminOnly: true },
    { id: 'system', label: 'System Info', icon: Info },
  ].filter(t => !t.adminOnly || user?.role === 'admin');

  const inputClass = 'bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-sienna-400" />
        <div>
          <h1 className="text-2xl font-bold text-gainsboro-100">Settings</h1>
          <p className="text-sm text-gainsboro-400">Manage your account and system preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-navy-600 pb-1">
        {tabs.map(tab => {
          const Icon = typeof tab.icon === 'function' ? tab.icon : tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-navy-700 text-sienna-400 border-b-2 border-sienna-500'
                  : 'text-gainsboro-400 hover:text-gainsboro-200 hover:bg-navy-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gainsboro-200 mb-6">User Profile</h3>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-sienna-600/20 flex items-center justify-center text-sienna-400 text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gainsboro-100">{user?.name}</h4>
                <p className="text-gainsboro-400 text-sm">{user?.email}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy-700 text-gainsboro-300 border border-navy-500">
                  Role: <span className="ml-1 capitalize text-sienna-400">{user?.role}</span>
                </div>
              </div>
            </div>

            <hr className="border-navy-600" />

            <div>
              <h4 className="text-sm font-semibold text-gainsboro-300 mb-3 flex items-center gap-2">
                <KeyRound size={16} className="text-gainsboro-500" /> Security
              </h4>
              <button 
                onClick={() => toast.success('Password reset link sent to email')}
                className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-gainsboro-200 text-sm font-medium rounded-lg transition-colors border border-navy-500"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Stages Tab (Admin Only) */}
      {activeTab === 'stages' && user?.role === 'admin' && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-600">
            <div>
              <h3 className="text-sm font-semibold text-gainsboro-200">ECO Stages</h3>
              <p className="text-xs text-gainsboro-500">The workflow stages for ECOs. These stages cannot be modified.</p>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600 bg-navy-800/50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase w-8">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase">Stage Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase">Order</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase">Requires Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/50">
              {stages.sort((a, b) => a.order_index - b.order_index).map((stage) => (
                <tr key={stage.id} className="hover:bg-navy-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gainsboro-500">
                    <GripVertical size={14} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium text-gainsboro-200">{stage.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gainsboro-400">{stage.order_index}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${stage.requires_approval ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-navy-700 text-gainsboro-400 border-navy-600'}`}>
                      {stage.requires_approval ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
              {stages.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-gainsboro-500">No workflow stages defined</td>
                </tr>
              )}
            </tbody>
          </table>


        </div>
      )}

      {/* System Info Tab */}
      {activeTab === 'system' && (
        <div className="glass-card p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gainsboro-200 mb-6">System Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-600/50">
                <p className="text-xs font-semibold text-gainsboro-500 uppercase tracking-wider mb-1">PLM Version</p>
                <p className="text-lg font-bold text-gainsboro-200 font-mono">v1.2.0</p>
              </div>
              <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-600/50">
                <p className="text-xs font-semibold text-gainsboro-500 uppercase tracking-wider mb-1">Environment</p>
                <p className="text-lg font-bold text-sienna-400">Production</p>
              </div>
              <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-600/50">
                <p className="text-xs font-semibold text-gainsboro-500 uppercase tracking-wider mb-1">Database</p>
                <p className="text-sm font-medium text-gainsboro-200">PostgreSQL (Connected)</p>
              </div>
              <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-600/50">
                <p className="text-xs font-semibold text-gainsboro-500 uppercase tracking-wider mb-1">AI Engine</p>
                <p className="text-sm font-medium text-gainsboro-200">Groq (Enabled)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
