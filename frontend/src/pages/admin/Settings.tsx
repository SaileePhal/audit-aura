import React from 'react';
import { Bell, Mail, Shield, Database } from 'lucide-react';
import { theme } from '@/config/theme';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Settings</h1>
        <p className={`${theme.text.secondary} mt-1`}>Configure system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 border ${theme.border.primary}`}>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-cyan-400" />
            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className={theme.text.secondary}>Email Notifications</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className={theme.text.secondary}>Slack Notifications</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className={theme.text.secondary}>WebSocket Alerts</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
            </label>
          </div>
        </div>

        {/* Email Configuration */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 border ${theme.border.primary}`}>
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-6 w-6 text-cyan-400" />
            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Email Configuration</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>SMTP Host</label>
              <input 
                type="text" 
                placeholder="smtp.example.com" 
                className={`w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.input.text} border rounded-lg ${theme.input.focus} focus:ring-2 transition-all`} 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>SMTP Port</label>
              <input 
                type="number" 
                placeholder="587" 
                className={`w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.input.text} border rounded-lg ${theme.input.focus} focus:ring-2 transition-all`} 
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 border ${theme.border.primary}`}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Security</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className={theme.text.secondary}>Two-Factor Authentication</span>
              <input type="checkbox" className="w-5 h-5 text-cyan-500 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className={theme.text.secondary}>Auto-Remediation</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
            </label>
          </div>
        </div>

        {/* Data Retention */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 border ${theme.border.primary}`}>
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-cyan-400" />
            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Data Retention</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Violation History (days)</label>
              <input 
                type="number" 
                defaultValue="90" 
                className={`w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.input.text} border rounded-lg ${theme.input.focus} focus:ring-2 transition-all`} 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Log Retention (days)</label>
              <input 
                type="number" 
                defaultValue="30" 
                className={`w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.input.text} border rounded-lg ${theme.input.focus} focus:ring-2 transition-all`} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className={`px-6 py-2 ${theme.button.secondary} rounded-lg transition-colors`}>
          Cancel
        </button>
        <button className={`px-6 py-2 ${theme.button.primary} rounded-lg transition-colors`}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Made with Bob
