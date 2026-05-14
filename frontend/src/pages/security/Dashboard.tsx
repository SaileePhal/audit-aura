import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, Target, Zap, Cloud, Server } from 'lucide-react';
import { useComplianceStore } from '../../store/useComplianceStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { theme } from '@/config/theme';

export const SecurityDashboard: React.FC = () => {
  const { complianceScore, violations, fetchDashboard, dashboardData } = useComplianceStore();
  const [timeRange, setTimeRange] = useState('24h');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [cloudTrackers, setCloudTrackers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboard();
      setLastUpdated(new Date());
      
      // Fetch cloud trackers
      try {
        const response = await fetch('http://localhost:8000/dashboard');
        const data = await response.json();
        if (data.cloud_event_trackers) {
          setCloudTrackers(data.cloud_event_trackers);
        }
      } catch (error) {
        console.error('Failed to fetch cloud trackers:', error);
        // Don't use mock data
      }
    };
    
    fetchData();
    // Refresh every 30 seconds (matches backend COMPLIANCE_CHECK_INTERVAL)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const overallScore = dashboardData?.compliance_score?.overall_score
    ? Math.round(dashboardData.compliance_score.overall_score * 100)
    : complianceScore || 0;
  
  // Critical violations that need immediate attention
  const criticalViolations = (violations || []).filter((v: any) => v.severity === 'critical');
  const highViolations = (violations || []).filter((v: any) => v.severity === 'high');
  
  // Violations by category
  const categoryData = [
    { name: 'Access Control', value: (violations || []).filter((v: any) => v.category === 'Access Control').length },
    { name: 'Data Protection', value: (violations || []).filter((v: any) => v.category === 'Data Protection').length },
    { name: 'Monitoring', value: (violations || []).filter((v: any) => v.category === 'Monitoring').length },
    { name: 'Network Security', value: (violations || []).filter((v: any) => v.category === 'Network Security').length },
  ].filter(item => item.value > 0);

  const severityData = [
    { name: 'Critical', value: criticalViolations.length, color: '#ef4444' },
    { name: 'High', value: highViolations.length, color: '#f97316' },
    { name: 'Medium', value: (violations || []).filter((v: any) => v.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: (violations || []).filter((v: any) => v.severity === 'low').length, color: '#3b82f6' },
  ];

  // Mock trend data (in production, fetch from API)
  const trendData = [
    { time: '00:00', violations: 12 },
    { time: '04:00', violations: 8 },
    { time: '08:00', violations: 15 },
    { time: '12:00', violations: violations.length },
    { time: '16:00', violations: 10 },
    { time: '20:00', violations: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            Security Analyst Dashboard
          </h1>
          <p className="text-dark-500 mt-1">Real-time compliance monitoring and threat detection</p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping"></div>
            <div className="relative rounded-full w-2 h-2 bg-green-400"></div>
          </div>
          <span className="text-sm font-medium text-dark-900">Live Monitoring</span>
        </div>
      </div>

      {/* Compliance Standards Badges */}
      <div className="glass-card p-6 border-l-4 border-cyan-500">
        <h3 className="text-sm font-semibold text-dark-900 mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-cyan-400" />
          Security Compliance Standards
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(dashboardData?.compliance_score?.standards || {}).map(([name, data]: [string, any]) => {
            const score = Math.round(data.score * 100);
            return (
              <div
                key={name}
                className={`glass-card px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                  score >= 90
                    ? 'border-green-500/50 text-green-400'
                    : score >= 70
                    ? 'border-yellow-500/50 text-yellow-400'
                    : 'border-red-500/50 text-red-400'
                }`}
              >
                <span>{name}</span>
                <span className="ml-2 text-xs opacity-75">{score}%</span>
              </div>
            );
          })}
          {Object.keys(complianceScore?.standards || {}).length === 0 && (
            <span className="text-sm text-dark-500">No standards configured</span>
          )}
        </div>
      </div>

      {/* Connected Event Sources */}
      <div className="glass-card p-6 data-stream">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
              <Server className="h-5 w-5 text-cyan-400" />
              Connected Event Sources
            </h3>
            <p className="text-sm text-dark-500 mt-1">Real-time security event monitoring</p>
          </div>
          <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
            <Activity className="h-5 w-5 text-green-400 animate-pulse" />
            <span className="text-sm font-medium text-green-400">{cloudTrackers.length} Active</span>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 hover-lift">
            <div className="text-2xl font-bold text-dark-900">
              {(cloudTrackers || []).reduce((sum: number, t: any) => sum + (t.events_monitored || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-dark-500 mt-1">Total Events</div>
          </div>
          <div className="glass-card p-4 hover-lift">
            <div className="text-2xl font-bold text-orange-400">
              {(cloudTrackers || []).reduce((sum: number, t: any) => sum + (t.config_changes_detected || 0), 0)}
            </div>
            <div className="text-xs text-dark-500 mt-1">Config Changes</div>
          </div>
          <div className="glass-card p-4 hover-lift">
            <div className="text-2xl font-bold text-green-400">
              {(cloudTrackers || []).filter((t: any) => t.health === 'healthy').length}/{(cloudTrackers || []).length}
            </div>
            <div className="text-xs text-dark-500 mt-1">Healthy Sources</div>
          </div>
        </div>

        {/* Sources List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cloudTrackers.map((tracker: any) => (
            <div
              key={tracker.id}
              className="glass-card p-4 hover-lift group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-dark-900 text-sm">{tracker.name}</span>
                    <span className="text-xs text-dark-500">({tracker.region})</span>
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{tracker.provider}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className={`h-3 w-3 ${tracker.health === 'healthy' ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
                  <span className={`text-xs font-medium ${tracker.status === 'active' ? 'text-green-400' : 'text-dark-500'}`}>
                    {tracker.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-lg p-2">
                  <span className="text-xs text-dark-500">Events</span>
                  <div className="font-medium text-dark-900 mt-1">{tracker.events_monitored.toLocaleString()}</div>
                </div>
                <div className="glass rounded-lg p-2">
                  <span className="text-xs text-dark-500">Changes</span>
                  <div className="font-medium text-orange-400 mt-1">{tracker.config_changes_detected}</div>
                </div>
              </div>
            </div>
          ))}
          {cloudTrackers.length === 0 && (
            <div className="col-span-full text-center py-8 text-dark-500">
              <Cloud className="h-12 w-12 mx-auto mb-2 text-dark-400" />
              <p>No event sources configured</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl glass-strong">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-3xl font-bold text-dark-900 mb-1">{overallScore}%</h3>
          <p className="text-dark-500 text-sm">Compliance Score</p>
        </div>

        <div className="metric-card bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl glass-strong">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <Activity className="h-5 w-5 text-red-400 animate-pulse" />
          </div>
          <h3 className="text-3xl font-bold text-dark-900 mb-1">{criticalViolations.length}</h3>
          <p className="text-dark-500 text-sm">Critical Alerts</p>
        </div>

        <div className="metric-card bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl glass-strong">
              <Zap className="h-6 w-6 text-orange-400" />
            </div>
            <Target className="h-5 w-5 text-orange-400 group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <h3 className="text-3xl font-bold text-dark-900 mb-1">{highViolations.length}</h3>
          <p className="text-dark-500 text-sm">High Priority</p>
        </div>

        <div className="metric-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl glass-strong">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <Clock className="h-5 w-5 text-green-400 animate-spin-slow" />
          </div>
          <h3 className="text-3xl font-bold text-dark-900 mb-1">{lastUpdated.toLocaleTimeString()}</h3>
          <p className="text-dark-500 text-sm">Last Scan</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violations Trend */}
        <div className="glass-card p-6 data-stream">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900">Violations Trend</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="glass px-3 py-2 rounded-lg text-sm text-dark-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fafafa'
                }} 
              />
              <Line type="monotone" dataKey="violations" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Severity Distribution</h3>
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
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fafafa'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Violations by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fafafa'
              }} 
            />
            <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Critical Violations */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Critical Violations - Immediate Action Required
          </h3>
          <span className="glass-card px-3 py-1 rounded-full text-sm font-medium text-red-400 border-red-500/30">
            {criticalViolations.length} Active
          </span>
        </div>
        <div className="space-y-3">
          {criticalViolations.slice(0, 5).map((violation: any, index: number) => (
            <div key={index} className="glass-card p-4 border-l-4 border-red-500 hover-lift">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-dark-900">{violation.control_id}</h4>
                    <span className="glass-card px-2 py-1 rounded-full text-xs font-medium text-red-400 border-red-500/30">
                      CRITICAL
                    </span>
                  </div>
                  <p className="text-sm text-dark-600 mb-2">{violation.description}</p>
                  {violation.root_cause && (
                    <div className="glass rounded-lg p-3 mb-2 border border-red-500/20">
                      <p className="text-xs font-medium text-red-400 mb-1">Root Cause:</p>
                      <p className="text-xs text-dark-600">{violation.root_cause}</p>
                    </div>
                  )}
                  {violation.remediation && (
                    <div className="glass rounded-lg p-3 border border-cyan-500/20">
                      <p className="text-xs font-medium text-cyan-400 mb-1">Remediation:</p>
                      <p className="text-xs text-dark-600">{violation.remediation}</p>
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-dark-500">
                  {new Date(violation.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {criticalViolations.length === 0 && (
            <div className="text-center py-12 text-dark-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-3 text-green-400" />
              <p className="text-lg font-medium text-dark-900">No critical violations!</p>
              <p className="text-sm">System is secure and compliant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Made with Bob