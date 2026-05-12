import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  LogOut,
  Menu,
  Bell,
  Settings,
  BarChart3,
  FileText,
  AlertTriangle,
  GitPullRequest,
  ChevronRight,
} from 'lucide-react';
import { theme } from '@/config/theme';

interface LayoutProps {
  user: {
    role: 'admin' | 'devops' | 'auditor' | 'security';
    name: string;
    email: string;
  };
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();

  const navigation = {
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
      { name: 'Controls', href: '/admin/controls', icon: FileText },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
    devops: [
      { name: 'Dashboard', href: '/devops/dashboard', icon: BarChart3 },
      { name: 'My Violations', href: '/devops/violations', icon: AlertTriangle },
    ],
    auditor: [
      { name: 'Dashboard', href: '/auditor/dashboard', icon: BarChart3 },
      { name: 'Reports', href: '/auditor/reports', icon: FileText },
    ],
    security: [
      { name: 'Dashboard', href: '/security/dashboard', icon: BarChart3 },
      { name: 'Incidents', href: '/security/incidents', icon: AlertTriangle },
      { name: 'PR Tracking', href: '/security/pr-tracking', icon: GitPullRequest },
    ],
  };

  const navItems = navigation[user.role] || [];

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_25%)]" />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2 ring-1 ring-cyan-400/20">
              <Shield className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">AegisAI</p>
              <p className="text-xs text-slate-400">Compliance Operations</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{user.role}</p>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (location.pathname === '/' && item.href.includes('dashboard'));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-200'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'translate-x-0 text-cyan-300' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System Health</p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">All services operational</p>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              99.9%
            </div>
          </div>
        </div>
      </aside>

      <div className={`${sidebarOpen ? 'lg:pl-72' : ''} transition-all duration-300`}>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-base font-semibold text-white">Security & Compliance Hub</h1>
                <p className="text-xs text-slate-400">Unified visibility across teams and incidents</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-400 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-400" />
              </button>

              <div className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 md:block">
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className={`text-xs ${theme.text.secondary}`}>Active session</p>
              </div>

              <button
                onClick={onLogout}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
