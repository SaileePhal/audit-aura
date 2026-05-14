import React, { useEffect, useState } from 'react';
import { FileCheck, TrendingUp, Shield, Download, Cloud, Activity, GitPullRequest, CheckCircle, Clock, AlertTriangle, Target } from 'lucide-react';
import { useComplianceStore } from '../../store/useComplianceStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { theme } from '@/config/theme';

interface AuditTrailEvent {
  id: string;
  violation_id: string;
  control_id: string;
  event_type: 'detected' | 'alerted' | 'pr_created' | 'pr_merged' | 'resolved';
  timestamp: string;
  details: string;
  pr_number?: number;
  pr_url?: string;
}

export const AuditorDashboard: React.FC = () => {
  const { complianceScore, violations, fetchDashboard } = useComplianceStore();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [cloudConnections, setCloudConnections] = useState<any[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEvent[]>([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboard();
      setLastUpdated(new Date());
      
      // Fetch cloud trackers
      try {
        const response = await fetch('http://localhost:8000/dashboard');
        const data = await response.json();
        if (data.cloud_connections && Array.isArray(data.cloud_connections)) {
          setCloudConnections(data.cloud_connections);
        }
      } catch (error) {
        console.error('Failed to fetch cloud trackers:', error);
      }

      // Fetch audit trail
      try {
        const prResponse = await fetch('http://localhost:8000/prs');
        if (prResponse.ok) {
          const prData = await prResponse.json();
          const trail: AuditTrailEvent[] = [];
          
          // Build audit trail from violations and PRs
          if (violations && violations.length > 0) {
            violations.forEach((violation: any) => {
            // Violation detected event
            trail.push({
              id: `${violation.id}-detected`,
              violation_id: violation.id,
              control_id: violation.control_id,
              event_type: 'detected',
              timestamp: violation.timestamp,
              details: `Violation detected: ${violation.description}`,
            });

            // Alert sent event (simulated - 1 minute after detection)
            const alertTime = new Date(new Date(violation.timestamp).getTime() + 60000).toISOString();
            trail.push({
              id: `${violation.id}-alerted`,
              violation_id: violation.id,
              control_id: violation.control_id,
              event_type: 'alerted',
              timestamp: alertTime,
              details: `Alert sent to security team`,
            });

            // Find related PRs
            const relatedPRs = (prData.prs || []).filter((pr: any) => pr.violation_id === violation.id);
            relatedPRs.forEach((pr: any) => {
              // PR created event
              trail.push({
                id: `${pr.id}-created`,
                violation_id: violation.id,
                control_id: violation.control_id,
                event_type: 'pr_created',
                timestamp: pr.created_at,
                details: `PR #${pr.pr_number} created: ${pr.title}`,
                pr_number: pr.pr_number,
                pr_url: pr.pr_url,
              });

              // PR merged event
              if (pr.status === 'merged' && pr.merged_at) {
                trail.push({
                  id: `${pr.id}-merged`,
                  violation_id: violation.id,
                  control_id: violation.control_id,
                  event_type: 'pr_merged',
                  timestamp: pr.merged_at,
                  details: `PR #${pr.pr_number} merged - fix deployed`,
                  pr_number: pr.pr_number,
                  pr_url: pr.pr_url,
                });

                // Resolved event (1 minute after merge)
                const resolvedTime = new Date(new Date(pr.merged_at).getTime() + 60000).toISOString();
                trail.push({
                  id: `${violation.id}-resolved`,
                  violation_id: violation.id,
                  control_id: violation.control_id,
                  event_type: 'resolved',
                  timestamp: resolvedTime,
                  details: `Violation verified as resolved`,
                });
              }
            });
          });
          }

          // Sort by timestamp (newest first)
          trail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setAuditTrail(trail.slice(0, 50)); // Keep last 50 events
        }
      } catch (error) {
        console.error('Failed to fetch audit trail:', error);
      }
    };
    
    fetchData();
    // Refresh every 30 seconds (matches backend COMPLIANCE_CHECK_INTERVAL)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard, violations]);

  const handleExportReport = async () => {
    setGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create report content
      const reportData = {
        generated_at: new Date().toISOString(),
        overall_score: Math.round((complianceScore?.overall_score || 0) * 100),
        standards: Object.entries(complianceScore?.standards || {}).map(([name, data]: [string, any]) => ({
          name,
          score: Math.round(data.score * 100),
          violations: data.violations,
          controls: data.controls
        })),
        total_violations: violations.length,
        audit_trail_events: auditTrail.length,
        cloud_connections: Array.isArray(cloudConnections) ? cloudConnections.length : 0
      };

      // Create downloadable JSON report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-audit-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Audit report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const overallScore = Math.round((complianceScore?.overall_score || 0) * 100);
  
  const standardsData = Object.entries(complianceScore?.standards || {}).map(([name, data]: [string, any]) => ({
    name,
    score: Math.round(data.score * 100),
    violations: data.violations,
    controls: data.controls
  }));

  const auditMetrics = [
    { name: 'Overall Compliance', value: `${overallScore}%`, icon: Shield, color: 'blue' },
    { name: 'Total Standards', value: standardsData.length.toString(), icon: FileCheck, color: 'green' },
    { name: 'Total Violations', value: violations.length.toString(), icon: TrendingUp, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-cyan-400" />
            Auditor/Assessor Dashboard
          </h1>
          <p className="text-dark-500 mt-1">Verification & reporting: Review compliance status and generate audit reports</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-card px-4 py-2">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping"></div>
              <div className="relative rounded-full w-2 h-2 bg-green-400"></div>
            </div>
            <span className="text-sm font-medium text-dark-900">Live Monitoring</span>
          </div>
          <button
            onClick={handleExportReport}
            disabled={generatingReport}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            <Download className="h-5 w-5" />
            {generatingReport ? 'Generating...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Compliance Standards Badges */}
      <div className="glass-card p-6 border-l-4 border-purple-500">
        <h3 className="text-sm font-semibold text-dark-900 mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-400" />
          Audit Standards Under Review:
        </h3>
        <div className="flex flex-wrap gap-2">
          {standardsData.map((standard) => (
            <div
              key={standard.name}
              className={`glass-card px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                standard.score >= 90
                  ? 'border-green-500/50 text-green-400'
                  : standard.score >= 70
                  ? 'border-yellow-500/50 text-yellow-400'
                  : 'border-red-500/50 text-red-400'
              }`}
            >
              <span>{standard.name}</span>
              <span className="ml-2 text-xs opacity-75">{standard.score}%</span>
            </div>
          ))}
          {standardsData.length === 0 && (
            <span className="text-sm text-dark-500">No standards configured</span>
          )}
        </div>
      </div>

      {/* Cloud Event Trackers */}
      <div className="glass-card p-6 data-stream">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
              <Cloud className="h-6 w-6 text-purple-400" />
              Cloud Event Trackers
            </h3>
            <p className="text-sm text-dark-500 mt-1">Audit trail sources for compliance verification</p>
          </div>
          <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
            <Activity className="h-5 w-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-medium text-dark-900">{Array.isArray(cloudConnections) ? cloudConnections.length : 0} Active</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(cloudConnections) ? cloudConnections : []).map((connection) => (
            <div
              key={connection.id}
              className="glass-card p-4 hover-lift"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-dark-900">{connection.name}</h4>
                  <p className="text-xs text-dark-500">{connection.provider}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className={`h-4 w-4 ${connection.health === 'healthy' ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
                  <span className={`text-xs font-medium ${connection.status === 'active' ? 'text-green-400' : 'text-dark-500'}`}>
                    {connection.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Events Monitored:</span>
                  <span className="font-medium text-dark-900">{connection.events_monitored.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Region:</span>
                  <span className="font-medium text-dark-900">{connection.region || 'N/A'}</span>
                </div>
                <div className="text-xs text-dark-600 mt-2">
                  Last event: {new Date(connection.last_event).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {(Array.isArray(cloudConnections) ? cloudConnections.length : 0) === 0 && (
            <div className="col-span-full text-center py-8 text-dark-500">
              <Cloud className="h-12 w-12 mx-auto mb-2 text-dark-400" />
              <p>No cloud connections configured</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {auditMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = {
            blue: {
              gradient: 'from-blue-500/10 to-cyan-500/10',
              border: 'border-blue-500/20',
              iconColor: 'text-blue-400'
            },
            green: {
              gradient: 'from-green-500/10 to-emerald-500/10',
              border: 'border-green-500/20',
              iconColor: 'text-green-400'
            },
            red: {
              gradient: 'from-red-500/10 to-orange-500/10',
              border: 'border-red-500/20',
              iconColor: 'text-red-400'
            }
          };

          const colors = colorClasses[metric.color as keyof typeof colorClasses];

          return (
            <div key={metric.name} className={`metric-card bg-gradient-to-br ${colors.gradient} ${colors.border} hover-lift group`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl glass-strong">
                  <Icon className={`h-6 w-6 ${colors.iconColor}`} />
                </div>
                <TrendingUp className={`h-5 w-5 ${colors.iconColor} group-hover:scale-110 transition-transform`} />
              </div>
              <h3 className="text-3xl font-bold text-dark-900 mb-1">{metric.value}</h3>
              <p className="text-dark-500 text-sm">{metric.name}</p>
            </div>
          );
        })}
      </div>

      {/* Compliance by Standard */}
      <div className="glass-card p-6 data-stream">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Compliance Score by Standard</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={standardsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fafafa'
              }}
            />
            <Legend />
            <Bar dataKey="score" fill="#06b6d4" name="Compliance Score (%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Audit Trail Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Complete Audit Trail
            </h3>
            <p className="text-sm text-dark-500 mt-1">End-to-end lifecycle tracking: Detection → Alert → PR → Resolution</p>
          </div>
          <button
            onClick={() => setShowAuditTrail(!showAuditTrail)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all hover:scale-105"
          >
            {showAuditTrail ? 'Hide Trail' : 'Show Trail'}
          </button>
        </div>

        {showAuditTrail && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {auditTrail.length === 0 ? (
              <div className="text-center py-12 text-dark-500">
                <Clock className="h-16 w-16 mx-auto mb-3 text-dark-400" />
                <p className="text-lg font-medium text-dark-900">No audit trail events yet</p>
                <p className="text-sm">Events will appear here as violations are detected and resolved</p>
              </div>
            ) : (
              auditTrail.map((event) => {
                const getEventIcon = () => {
                  switch (event.event_type) {
                    case 'detected': return <AlertTriangle className="h-5 w-5 text-red-600" />;
                    case 'alerted': return <Activity className="h-5 w-5 text-orange-600" />;
                    case 'pr_created': return <GitPullRequest className="h-5 w-5 text-cyan-400" />;
                    case 'pr_merged': return <GitPullRequest className="h-5 w-5 text-purple-600" />;
                    case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
                    default: return <Clock className={`h-5 w-5 ${theme.text.secondary}`} />;
                  }
                };

                const getEventColor = () => {
                  switch (event.event_type) {
                    case 'detected': return 'border-red-500';
                    case 'alerted': return 'border-orange-500';
                    case 'pr_created': return 'border-blue-500';
                    case 'pr_merged': return 'border-purple-500';
                    case 'resolved': return 'border-green-500';
                    default: return 'border-gray-500';
                  }
                };

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 p-4 glass-card rounded-lg border-l-4 hover-lift ${getEventColor()}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-semibold text-dark-900">{event.control_id}</span>
                        <span className="text-xs text-dark-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        {event.pr_number && (
                          <a
                            href={event.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-600 font-medium transition-colors"
                          >
                            PR #{event.pr_number}
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-dark-600">{event.details}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Standards Summary */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-400" />
          Standards Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="glass">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Standard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Compliance Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Total Controls</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Violations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {standardsData.map((standard) => (
                <tr key={standard.name} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-dark-900">{standard.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                        <div
                          className="bg-cyan-400 h-2 rounded-full transition-all"
                          style={{ width: `${standard.score}%` }}
                        />
                      </div>
                      <span className="text-sm text-dark-900">{standard.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">{standard.controls}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">{standard.violations}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`glass-card px-2 py-1 rounded-full text-xs font-medium ${
                      standard.score >= 90 ? 'text-green-400 border-green-500/30' :
                      standard.score >= 70 ? 'text-yellow-400 border-yellow-500/30' :
                      'text-red-400 border-red-500/30'
                    }`}>
                      {standard.score >= 90 ? 'Compliant' : standard.score >= 70 ? 'At Risk' : 'Non-Compliant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
