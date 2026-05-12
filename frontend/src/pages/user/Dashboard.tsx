import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  GitPullRequest, Users, Zap, Server, Cloud, Database,
  Activity, Target, Timer
} from 'lucide-react';
import { useComplianceStore } from '../../store/useComplianceStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { theme } from '@/config/theme';

export const UserDashboard: React.FC = () => {
  const { complianceScore, violations, fetchDashboard } = useComplianceStore();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboard();
      setLastUpdated(new Date());
    };
    
    fetchData();
    // Refresh every 10 seconds to show changing data
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const overallScore = Math.round((complianceScore?.overall_score || 0) * 100);
  const myViolations = violations.slice(0, 10);

  // Calculate DevOps-specific metrics
  const criticalViolations = (violations || []).filter((v: any) => v.severity === 'critical').length;
  const highViolations = (violations || []).filter((v: any) => v.severity === 'high').length;
  const avgRemediationTime = 2.5; // hours - mock data
  const openPRs = 5; // mock data

  const severityData = [
    { name: 'Critical', value: criticalViolations, color: '#ef4444' },
    { name: 'High', value: highViolations, color: '#f97316' },
    { name: 'Medium', value: (violations || []).filter((v: any) => v.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: (violations || []).filter((v: any) => v.severity === 'low').length, color: '#3b82f6' },
  ];

  // Infrastructure breakdown
  const infraData = [
    { name: 'AWS', value: Math.floor(violations.length * 0.4), icon: Cloud },
    { name: 'Azure', value: Math.floor(violations.length * 0.3), icon: Server },
    { name: 'GCP', value: Math.floor(violations.length * 0.2), icon: Database },
    { name: 'On-Prem', value: Math.floor(violations.length * 0.1), icon: Server },
  ].filter(item => item.value > 0);

  // Remediation trend (mock data)
  const remediationTrend = [
    { day: 'Mon', resolved: 8, new: 5 },
    { day: 'Tue', resolved: 12, new: 7 },
    { day: 'Wed', resolved: 6, new: 9 },
    { day: 'Thu', resolved: 15, new: 4 },
    { day: 'Fri', resolved: 10, new: 6 },
    { day: 'Sat', resolved: 3, new: 2 },
    { day: 'Sun', resolved: 5, new: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme.text.primary}`}>DevOps Dashboard</h1>
        <p className={`${theme.text.secondary} mt-1`}>Track your assigned violations and remediation tasks</p>
      </div>

      {/* Compliance Standards Badges */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm p-4 border border-green-100">
        <h3 className={`text-sm font-semibold ${theme.text.primary} mb-3`}>Monitoring Compliance For:</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(complianceScore?.standards || {}).map(([name, data]: [string, any]) => {
            const score = Math.round(data.score * 100);
            return (
              <div
                key={name}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  score >= 90
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : score >= 70
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                <span>{name}</span>
                <span className="text-xs opacity-75">{score}%</span>
              </div>
            );
          })}
          {Object.keys(complianceScore?.standards || {}).length === 0 && (
            <span className={`text-sm ${theme.text.tertiary}`}>No standards configured</span>
          )}
        </div>
      </div>

      {/* DevOps Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${theme.bg.card}/20`}>
              <CheckCircle className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{overallScore}%</h3>
          <p className="text-blue-100 text-sm">Compliance Score</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${theme.bg.card}/20`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <Activity className="h-5 w-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{violations.length}</h3>
          <p className="text-red-100 text-sm">Active Violations</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${theme.bg.card}/20`}>
              <GitPullRequest className="h-6 w-6" />
            </div>
            <Target className="h-5 w-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{openPRs}</h3>
          <p className="text-purple-100 text-sm">Open PRs</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${theme.bg.card}/20`}>
              <Timer className="h-6 w-6" />
            </div>
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{avgRemediationTime}h</h3>
          <p className="text-green-100 text-sm">Avg MTTR</p>
        </div>
      </div>

      {/* Infrastructure Breakdown */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Violations by Infrastructure</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {infraData.map((infra) => {
            const Icon = infra.icon;
            return (
              <div key={infra.name} className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border ${theme.border.primary}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`font-medium ${theme.text.primary}`}>{infra.name}</span>
                </div>
                <div className={`text-2xl font-bold ${theme.text.primary}`}>{infra.value}</div>
                <div className={`text-xs ${theme.text.secondary}`}>violations</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Remediation Trend */}
        <div className={`lg:col-span-2 ${theme.bg.card} rounded-xl shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Remediation Activity</h3>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className={`px-3 py-1 border ${theme.border.secondary} rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={remediationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
              <Bar dataKey="new" fill="#ef4444" name="New" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>By Severity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Actions */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Priority Actions Required</h3>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {criticalViolations + highViolations} High Priority
          </span>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {myViolations.map((violation: any, index: number) => (
            <div key={index} className={`flex items-start gap-3 p-4 ${theme.bg.secondary} rounded-lg hover:shadow-md transition-shadow border ${theme.border.primary}`}>
              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                violation.severity === 'critical' ? 'bg-red-500' :
                violation.severity === 'high' ? 'bg-orange-500' :
                violation.severity === 'medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className={`font-semibold ${theme.text.primary} text-sm`}>{violation.control_id}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    violation.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    violation.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-cyan-400'
                  }`}>
                    {violation.severity}
                  </span>
                </div>
                <p className={`text-xs ${theme.text.secondary} mb-2`}>{violation.description}</p>
                <div className={`flex items-center gap-2 text-xs ${theme.text.tertiary}`}>
                  <Clock className="h-3 w-3" />
                  <span>Est. {Math.floor(Math.random() * 4) + 1}h to fix</span>
                  <span className="text-gray-300">•</span>
                  <Users className="h-3 w-3" />
                  <span>Unassigned</span>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-xs font-medium whitespace-nowrap">
                Take Action
              </button>
            </div>
          ))}
          {myViolations.length === 0 && (
            <div className={`text-center py-8 ${theme.text.tertiary}`}>
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No violations! You're compliant!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Made with Bob
