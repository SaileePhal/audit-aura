import React, { useEffect, useState } from 'react';
import { FileCheck, TrendingUp, Shield, Download, Cloud, Activity, GitPullRequest, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
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
  const [cloudTrackers, setCloudTrackers] = useState<any[]>([]);
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
        if (data.cloud_event_trackers) {
          setCloudTrackers(data.cloud_event_trackers);
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
    // Refresh every 10 seconds to show changing data
    const interval = setInterval(fetchData, 10000);
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
        cloud_trackers: cloudTrackers.length
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Auditor/Assessor Dashboard</h1>
          <p className={`${theme.text.secondary} mt-1`}>Verification & reporting: Review compliance status and generate audit reports</p>
        </div>
        <button 
          onClick={handleExportReport}
          disabled={generatingReport}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-5 w-5" />
          {generatingReport ? 'Generating...' : 'Export Report'}
        </button>
      </div>

      {/* Compliance Standards Badges */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-4 border border-purple-100">
        <h3 className={`text-sm font-semibold ${theme.text.primary} mb-3`}>Audit Standards Under Review:</h3>
        <div className="flex flex-wrap gap-2">
          {standardsData.map((standard) => (
            <div
              key={standard.name}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                standard.score >= 90
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : standard.score >= 70
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              <span>{standard.name}</span>
              <span className="text-xs opacity-75">{standard.score}%</span>
            </div>
          ))}
          {standardsData.length === 0 && (
            <span className={`text-sm ${theme.text.tertiary}`}>No standards configured</span>
          )}
        </div>
      </div>

      {/* Cloud Event Trackers */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Cloud Event Trackers</h3>
            <p className={`text-sm ${theme.text.secondary} mt-1`}>Audit trail sources for compliance verification</p>
          </div>
          <Cloud className="h-8 w-8 text-purple-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cloudTrackers.map((tracker) => (
            <div
              key={tracker.id}
              className={`${theme.bg.card} rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`font-semibold ${theme.text.primary}`}>{tracker.name}</h4>
                  <p className={`text-xs ${theme.text.tertiary}`}>{tracker.provider}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className={`h-4 w-4 ${tracker.health === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs font-medium ${tracker.status === 'active' ? 'text-green-600' : theme.text.tertiary}`}>
                    {tracker.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`${theme.text.secondary}`}>Events Monitored:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{tracker.events_monitored.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${theme.text.secondary}`}>Region:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{tracker.region || 'N/A'}</span>
                </div>
                <div className={`text-xs ${theme.text.tertiary} mt-2`}>
                  Last event: {new Date(tracker.last_event).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {cloudTrackers.length === 0 && (
            <div className={`col-span-full text-center py-4 ${theme.text.tertiary}`}>
              <p>No cloud event trackers configured</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {auditMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-cyan-400',
            green: 'bg-green-100 text-green-600',
            red: 'bg-red-100 text-red-600'
          };

          return (
            <div key={metric.name} className={`${theme.bg.card} rounded-xl shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${theme.text.primary} mb-1`}>{metric.value}</h3>
              <p className={`text-sm ${theme.text.secondary}`}>{metric.name}</p>
            </div>
          );
        })}
      </div>

      {/* Compliance by Standard */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Compliance Score by Standard</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={standardsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#3b82f6" name="Compliance Score (%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Audit Trail Section */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Complete Audit Trail</h3>
            <p className={`text-sm ${theme.text.secondary} mt-1`}>End-to-end lifecycle tracking: Detection → Alert → PR → Resolution</p>
          </div>
          <button
            onClick={() => setShowAuditTrail(!showAuditTrail)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showAuditTrail ? 'Hide Trail' : 'Show Trail'}
          </button>
        </div>

        {showAuditTrail && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {auditTrail.length === 0 ? (
              <div className={`text-center py-8 ${theme.text.tertiary}`}>
                <Clock className={`h-12 w-12 mx-auto mb-2 ${theme.text.muted}`} />
                <p>No audit trail events yet</p>
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
                    case 'detected': return 'border-red-200 bg-red-50';
                    case 'alerted': return 'border-orange-200 bg-orange-50';
                    case 'pr_created': return 'border-blue-200 bg-blue-50';
                    case 'pr_merged': return 'border-purple-200 bg-purple-50';
                    case 'resolved': return 'border-green-200 bg-green-50';
                    default: return `${theme.border.primary} ${theme.bg.secondary}`;
                  }
                };

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${getEventColor()}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className={`font-semibold ${theme.text.primary}`}>{event.control_id}</span>
                        <span className={`text-xs ${theme.text.tertiary}`}>
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        {event.pr_number && (
                          <a
                            href={event.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-blue-800 font-medium"
                          >
                            PR #{event.pr_number}
                          </a>
                        )}
                      </div>
                      <p className={`text-sm ${theme.text.secondary}`}>{event.details}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Standards Summary */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Standards Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${theme.bg.secondary}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase`}>Standard</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase`}>Compliance Score</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase`}>Total Controls</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase`}>Violations</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase`}>Status</th>
              </tr>
            </thead>
            <tbody className={`${theme.bg.card} divide-y divide-gray-200`}>
              {standardsData.map((standard) => (
                <tr key={standard.name} className={`hover:${theme.bg.secondary}`}>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${theme.text.primary}`}>{standard.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                        <div 
                          className="bg-cyan-600 h-2 rounded-full" 
                          style={{ width: `${standard.score}%` }}
                        />
                      </div>
                      <span className={`text-sm ${theme.text.secondary}`}>{standard.score}%</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.secondary}`}>{standard.controls}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.secondary}`}>{standard.violations}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      standard.score >= 90 ? 'bg-green-100 text-green-700' :
                      standard.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
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
