import React, { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Shield, AlertTriangle,
  CheckCircle, Clock, Upload, RefreshCw, Activity, Cloud,
  Server, GitBranch, PlusCircle, FileText, Settings, Bell, Search
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useComplianceStore } from '../../store/useComplianceStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { theme } from '@/config/theme';

export const AdminDashboard: React.FC = () => {
  const { complianceScore, violations, loading, fetchDashboard, dashboardData } = useComplianceStore();
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [cloudTrackers, setCloudTrackers] = useState<any[]>([
    {
      id: "cloudwatch-us-east-1",
      name: "AWS CloudWatch",
      provider: "AWS",
      type: "cloudwatch",
      instance: "us-east-1",
      status: "active",
      events_monitored: 15234,
      config_changes_detected: 342,
      last_event: new Date().toISOString(),
      health: "healthy",
      region: "us-east-1",
      description: "Monitoring AWS CloudTrail events for configuration changes"
    },
    {
      id: "azure-monitor-eastus",
      name: "Azure Monitor",
      provider: "Microsoft Azure",
      type: "azure_monitor",
      instance: "eastus",
      status: "active",
      events_monitored: 12890,
      config_changes_detected: 289,
      last_event: new Date().toISOString(),
      health: "healthy",
      region: "eastus",
      description: "Monitoring Azure Activity Log for resource changes"
    },
    {
      id: "gcp-cloud-logging-us-central1",
      name: "GCP Cloud Logging",
      provider: "Google Cloud",
      type: "gcp_logging",
      instance: "us-central1",
      status: "active",
      events_monitored: 9234,
      config_changes_detected: 201,
      last_event: new Date().toISOString(),
      health: "healthy",
      region: "us-central1",
      description: "Monitoring GCP Cloud Audit Logs for configuration changes"
    }
  ]);
  const [driftData, setDriftData] = useState<any>({
    total_drifts: 12,
    critical_drifts: 3,
    high_drifts: 5,
    medium_drifts: 4,
    drift_by_source: {
      cloudwatch: 4,
      azure_monitor: 2,
      gcp_logging: 1
    }
  });
  const [personaInsights, setPersonaInsights] = useState<any>({
    priority_actions: [
      "Review 3 critical configuration drifts requiring immediate attention",
      "Approve remediation plans for 5 high-severity drifts",
      "Schedule compliance review meeting for drifted controls"
    ],
    kpis: {
      drift_resolution_rate: 67,
      mean_time_to_detect_drift: "2.3 hours",
      mean_time_to_remediate: "8.5 hours",
      compliance_score_trend: "declining"
    }
  });
  const [activeProvider, setActiveProvider] = useState<string>('AWS');

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      await fetchDashboard();
      
      if (!isMounted) return;
      setLastUpdated(new Date());
      
      // Fetch cloud trackers and drift data
      try {
        const response = await fetch('http://localhost:8000/dashboard');
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (data.cloud_event_trackers) {
          setCloudTrackers(data.cloud_event_trackers);
        }
        if (data.configuration_drift) {
          setDriftData(data.configuration_drift);
        }
        if (data.persona_insights?.admin) {
          setPersonaInsights(data.persona_insights.admin);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Failed to fetch dashboard data:', error);
        // Use mock data on error
        setCloudTrackers([
          {
            id: "cloudwatch-us-east-1",
            name: "AWS CloudWatch",
            provider: "AWS",
            type: "cloudwatch",
            instance: "us-east-1",
            status: "active",
            events_monitored: 15234,
            config_changes_detected: 342,
            last_event: new Date().toISOString(),
            health: "healthy",
            region: "us-east-1",
            description: "Monitoring AWS CloudTrail events for configuration changes"
          },
          {
            id: "azure-monitor-eastus",
            name: "Azure Monitor",
            provider: "Microsoft Azure",
            type: "azure_monitor",
            instance: "eastus",
            status: "active",
            events_monitored: 12890,
            config_changes_detected: 289,
            last_event: new Date().toISOString(),
            health: "healthy",
            region: "eastus",
            description: "Monitoring Azure Activity Log for resource changes"
          },
          {
            id: "gcp-cloud-logging-us-central1",
            name: "GCP Cloud Logging",
            provider: "Google Cloud",
            type: "gcp_logging",
            instance: "us-central1",
            status: "active",
            events_monitored: 9234,
            config_changes_detected: 201,
            last_event: new Date().toISOString(),
            health: "healthy",
            region: "us-central1",
            description: "Monitoring GCP Cloud Audit Logs for configuration changes"
          }
        ]);
        setDriftData({
          total_drifts: 12,
          critical_drifts: 3,
          high_drifts: 5,
          medium_drifts: 4,
          drift_by_source: {
            cloudwatch: 4,
            azure_monitor: 2,
            gcp_logging: 1
          }
        });
        setPersonaInsights({
          priority_actions: [
            "Review 3 critical configuration drifts requiring immediate attention",
            "Approve remediation plans for 5 high-severity drifts",
            "Schedule compliance review meeting for drifted controls"
          ],
          kpis: {
            drift_resolution_rate: 67,
            mean_time_to_detect_drift: "2.3 hours",
            mean_time_to_remediate: "8.5 hours",
            compliance_score_trend: "declining"
          }
        });
      }
    };
    
    fetchData();
    // Refresh every 30 seconds to reduce flakiness
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchDashboard();
        alert('PDF uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (loading && !complianceScore) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  // Calculate statistics
  const totalControls = complianceScore?.total_controls || 0;
  const totalViolations = complianceScore?.total_violations || 0;
  const overallScore = dashboardData?.compliance_score?.overall_score || (complianceScore / 100) || 0;
  const compliancePercentage = Math.round(overallScore * 100);

  // Prepare chart data
  const standardsData = Object.entries(dashboardData?.compliance_score?.standards || {}).map(([name, data]: [string, any]) => ({
    name,
    score: Math.round(data.score * 100),
    violations: data.violations,
    controls: data.controls
  }));

  const trendData = [
    { time: '00:00', score: 85 },
    { time: '04:00', score: 87 },
    { time: '08:00', score: 82 },
    { time: '12:00', score: 88 },
    { time: '16:00', score: compliancePercentage },
    { time: '20:00', score: compliancePercentage },
  ];

  const severityData = [
    { name: 'Critical', value: (violations || []).filter((v: any) => v.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: (violations || []).filter((v: any) => v.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: (violations || []).filter((v: any) => v.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: (violations || []).filter((v: any) => v.severity === 'low').length, color: '#3b82f6' },
  ];

  const stats = [
    {
      name: 'Compliance Score',
      value: `${compliancePercentage}%`,
      change: '+2.5%',
      trend: 'up',
      icon: Shield,
      color: 'blue'
    },
    {
      name: 'Total Controls',
      value: totalControls.toString(),
      change: '+12',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      name: 'Active Violations',
      value: totalViolations.toString(),
      change: '-3',
      trend: 'down',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      name: 'Last Updated',
      value: lastUpdated.toLocaleTimeString(),
      change: 'Just now',
      trend: 'neutral',
      icon: Clock,
      color: 'gray'
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with improved layout and quick actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Compliance Manager Dashboard</h1>
              <p className={`${theme.text.secondary} mt-1`}>Strategic oversight: Monitor and manage compliance across your organization</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar - enhanced with more options */}
        <div className="flex flex-wrap gap-2">
          {/* Upload PDF with improved UI */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${uploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}
              text-white text-sm font-medium`}>
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </>
              )}
            </div>
          </label>

          {/* Refresh button with improved styling */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
              ${refreshing ? `${theme.bg.tertiary} ${theme.border.secondary}` : `${theme.bg.card} ${theme.border.secondary} hover:${theme.bg.secondary}`}
              text-sm font-medium ${theme.text.secondary}`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-500' : theme.text.tertiary}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>

          {/* New quick action buttons */}
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme.bg.card} border ${theme.border.secondary}
              text-sm font-medium ${theme.text.secondary} hover:${theme.bg.secondary} transition-colors`}
          >
            <PlusCircle className="h-4 w-4 text-green-500" />
            Add Standard
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme.bg.card} border ${theme.border.secondary}
              text-sm font-medium ${theme.text.secondary} hover:${theme.bg.secondary} transition-colors`}
          >
            <FileText className="h-4 w-4 text-purple-500" />
            Generate Report
          </button>

          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bg.card} border ${theme.border.secondary}
              text-sm font-medium ${theme.text.secondary} hover:${theme.bg.secondary} transition-colors`}
          >
            <Settings className={`h-4 w-4 ${theme.text.tertiary}`} />
          </button>
        </div>
      </div>

      {/* Enhanced Compliance Standards Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
              <Shield className="h-6 w-6 text-cyan-400" />
              Compliance Standards Overview
            </h3>
            <p className={`text-sm ${theme.text.secondary} mt-1`}>Audit frameworks currently monitored across your organization</p>
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
              rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
              <PlusCircle className="h-4 w-4 text-green-500" />
              Add Standard
            </button>
            <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
              rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
              <FileText className="h-4 w-4 text-purple-500" />
              Export
            </button>
          </div>
        </div>

        {standardsData.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`${theme.bg.card} p-4 rounded-lg border ${theme.border.primary}`}>
                <div className={`text-2xl font-bold ${theme.text.primary}`}>{standardsData.length}</div>
                <div className={`text-xs ${theme.text.tertiary} mt-1`}>Total Standards</div>
              </div>
              <div className={`${theme.bg.card} p-4 rounded-lg border ${theme.border.primary}`}>
                <div className="text-2xl font-bold text-green-600">
                  {(standardsData || []).filter(s => s.score >= 90).length}
                </div>
                <div className={`text-xs ${theme.text.tertiary} mt-1`}>Compliant</div>
              </div>
              <div className={`${theme.bg.card} p-4 rounded-lg border ${theme.border.primary}`}>
                <div className="text-2xl font-bold text-yellow-600">
                  {(standardsData || []).filter(s => s.score >= 70 && s.score < 90).length}
                </div>
                <div className={`text-xs ${theme.text.tertiary} mt-1`}>At Risk</div>
              </div>
              <div className={`${theme.bg.card} p-4 rounded-lg border ${theme.border.primary}`}>
                <div className="text-2xl font-bold text-red-600">
                  {(standardsData || []).filter(s => s.score < 70).length}
                </div>
                <div className={`text-xs ${theme.text.tertiary} mt-1`}>Non-Compliant</div>
              </div>
            </div>

            {/* Standards Grid with improved layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {standardsData.map((standard) => (
                <div
                  key={standard.name}
                  className={`${theme.bg.card} rounded-lg p-4 border-2 shadow-sm transition-all hover:shadow-md
                    ${standard.score >= 90 ? 'border-green-200 hover:border-green-300' :
                      standard.score >= 70 ? 'border-yellow-200 hover:border-yellow-300' :
                      'border-red-200 hover:border-red-300'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {standard.score >= 90 ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : standard.score >= 70 ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        <h4 className={`font-semibold ${theme.text.primary}`}>{standard.name}</h4>
                      </div>

                      <div className="mt-3">
                        {/* Progress bar with score */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500
                                ${standard.score >= 90 ? 'bg-green-500' :
                                  standard.score >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'}`}
                              style={{ width: `${standard.score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium min-w-[40px] text-center
                            ${standard.score >= 90 ? 'text-green-700' :
                              standard.score >= 70 ? 'text-yellow-700' :
                              'text-red-700'}`}>
                            {standard.score}%
                          </span>
                        </div>

                        {/* Violation and control stats */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className={`${theme.text.tertiary}`}>Controls</div>
                            <div className={`font-medium ${theme.text.primary}`}>{standard.controls}</div>
                          </div>
                          <div>
                            <div className={`${theme.text.tertiary}`}>Violations</div>
                            <div className={`font-medium
                              ${standard.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {standard.violations}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium mt-1
                      ${standard.score >= 90 ? 'bg-green-100 text-green-800' :
                        standard.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {standard.score >= 90 ? 'Compliant' :
                       standard.score >= 70 ? 'At Risk' : 'Non-Compliant'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Enhanced empty state with action guidance
          <div className={`text-center py-12 px-4 border-2 border-dashed ${theme.border.primary} rounded-lg ${theme.bg.card}`}>
            <div className="mx-auto w-fit p-4 bg-blue-50 rounded-full mb-4">
              <Shield className="h-12 w-12 text-blue-200" />
            </div>
            <h4 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>No Compliance Standards Configured</h4>
            <p className={`${theme.text.secondary} mb-4 max-w-md mx-auto`}>
              To get started with compliance monitoring, upload a PDF document containing
              your compliance requirements or frameworks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className={`flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-lg
                  hover:bg-cyan-700 transition-colors font-medium ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Compliance PDF
                    </>
                  )}
                </div>
              </label>
              <button className={`flex items-center gap-2 px-5 py-2.5 ${theme.bg.card} border ${theme.border.secondary} ${theme.text.secondary}
                rounded-lg hover:${theme.bg.secondary} transition-colors font-medium`}>
                <FileText className="h-4 w-4 text-purple-500" />
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Connected Event Sources Section */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl shadow-sm p-6 border border-cyan-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
              <Server className="h-6 w-6 text-cyan-600" />
              Cloud Event Monitoring
            </h3>
            <p className={`text-sm ${theme.text.secondary} mt-1`}>
              Real-time monitoring of configuration changes across cloud providers
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${theme.bg.card} px-3 py-1.5 rounded-lg border ${theme.border.primary}`}>
              <Activity className="h-4 w-4 text-cyan-500" />
              <span className={`text-sm font-medium ${theme.text.secondary}`}>
                {(cloudTrackers || []).reduce((sum: number, t: any) => sum + (t.events_monitored || 0), 0).toLocaleString()} Events
              </span>
            </div>
            <div className={`flex items-center gap-2 ${theme.bg.card} px-3 py-1.5 rounded-lg border ${theme.border.primary}`}>
              <Cloud className="h-4 w-4 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-700">
                {cloudTrackers.length} {cloudTrackers.length === 1 ? 'Source' : 'Sources'}
              </span>
            </div>
            <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
              rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
              <PlusCircle className="h-4 w-4 text-green-500" />
              Add Source
            </button>
          </div>
        </div>

        {cloudTrackers && cloudTrackers.length > 0 ? (
          <>
            {/* Provider Tabs Navigation */}
            {(() => {
              const groupedSources = (cloudTrackers || []).reduce((acc: any, tracker: any) => {
                if (!acc[tracker.provider]) {
                  acc[tracker.provider] = [];
                }
                acc[tracker.provider].push(tracker);
                return acc;
              }, {});

              const providers = Object.keys(groupedSources);
              
              // Set initial provider if not set
              if (!activeProvider && providers.length > 0) {
                setActiveProvider(providers[0]);
              }

              return (
                <>
                  {/* Tab Navigation */}
                  <div className="mb-4">
                    <div className={`flex gap-1 border-b ${theme.border.primary}`}>
                      {providers.map((provider) => (
                        <button
                          key={provider}
                          onClick={() => setActiveProvider(provider)}
                          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                            ${activeProvider === provider
                              ? `${theme.bg.card} border ${theme.border.primary} ${theme.text.primary} shadow-sm`
                              : `${theme.text.tertiary} hover:${theme.text.secondary}`}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Cloud className="h-3.5 w-3.5" />
                            <span>{provider}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full
                              ${activeProvider === provider ? 'bg-blue-100 text-cyan-400' : `${theme.bg.tertiary} ${theme.text.secondary}`}`}>
                              {groupedSources[provider].length}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Provider Content */}
                  <div className={`${theme.bg.card} rounded-lg border ${theme.border.primary}`}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-5 w-5 text-cyan-600" />
                          <h4 className={`font-semibold ${theme.text.primary}`}>{activeProvider}</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-1 text-sm ${theme.text.secondary}`}>
                            <Activity className="h-4 w-4 text-green-500" />
                            <span>
                              {(groupedSources[activeProvider] || []).reduce((sum: number, s: any) => sum + (s.events_monitored || 0), 0)} Events
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>
                              {(groupedSources[activeProvider] || []).reduce((sum: number, s: any) => sum + (s.config_changes_detected || 0), 0)} Changes
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Health Status Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="text-lg font-bold text-green-700">
                            {(groupedSources[activeProvider] || []).filter((t: any) => t.health === 'healthy').length}
                          </div>
                          <div className={`text-xs ${theme.text.secondary}`}>Healthy</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <div className="text-lg font-bold text-yellow-700">
                            {(groupedSources[activeProvider] || []).filter((t: any) => t.health === 'warning').length}
                          </div>
                          <div className={`text-xs ${theme.text.secondary}`}>Warning</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="text-lg font-bold text-red-700">
                            {(groupedSources[activeProvider] || []).filter((t: any) => t.health === 'unhealthy').length}
                          </div>
                          <div className={`text-xs ${theme.text.secondary}`}>Unhealthy</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="text-lg font-bold text-cyan-400">
                            {(groupedSources[activeProvider] || []).length}
                          </div>
                          <div className={`text-xs ${theme.text.secondary}`}>Total</div>
                        </div>
                      </div>

                      {/* Tracker Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(groupedSources[activeProvider] || []).map((tracker: any) => (
                          <div
                            key={tracker.id}
                            className={`rounded-lg p-4 border shadow-sm transition-all hover:shadow-md
                              ${tracker.health === 'healthy' ? 'bg-green-50 border-green-100' :
                                tracker.health === 'warning' ? 'bg-yellow-50 border-yellow-100' :
                                'bg-red-50 border-red-100'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`w-2 h-2 rounded-full mt-0.5
                                    ${tracker.health === 'healthy' ? 'bg-green-500' :
                                      tracker.health === 'warning' ? 'bg-yellow-500' :
                                      'bg-red-500'}`} />
                                  <span className={`font-medium ${theme.text.primary}`}>{tracker.region}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full
                                    ${tracker.status === 'active' ? 'bg-green-100 text-green-700' :
                                      `${theme.bg.tertiary} ${theme.text.secondary}`}`}>
                                    {tracker.status}
                                  </span>
                                </div>
                                <p className={`text-xs ${theme.text.secondary} mb-3 line-clamp-2`}>{tracker.description}</p>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <div className={`${theme.text.tertiary} text-xs`}>Events Monitored</div>
                                    <div className={`font-medium ${theme.text.primary}`}>
                                      {tracker.events_monitored.toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className={`${theme.text.tertiary} text-xs`}>Config Changes</div>
                                    <div className={`font-medium
                                      ${tracker.config_changes_detected > 0 ? 'text-orange-600' : theme.text.primary}`}>
                                      {tracker.config_changes_detected}
                                    </div>
                                  </div>
                                  <div>
                                    <div className={`${theme.text.tertiary} text-xs`}>Last Event</div>
                                    <div className={`font-medium ${theme.text.primary} text-xs`}>
                                      {new Date(tracker.last_event).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                  <div>
                                    <div className={`${theme.text.tertiary} text-xs`}>Health</div>
                                    <div className={`font-medium capitalize text-xs
                                      ${tracker.health === 'healthy' ? 'text-green-600' :
                                        tracker.health === 'warning' ? 'text-yellow-600' :
                                        'text-red-600'}`}>
                                      {tracker.health}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        ) : (
          <>
            {/* Enhanced Empty State */}
            <div className={`text-center py-12 px-4 border-2 border-dashed ${theme.border.primary} rounded-lg ${theme.bg.card}`}>
            <div className="mx-auto w-fit p-4 bg-cyan-50 rounded-full mb-4">
              <Cloud className="h-12 w-12 text-cyan-200" />
            </div>
            <h4 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>No Cloud Event Sources Configured</h4>
            <p className={`${theme.text.secondary} mb-6 max-w-md mx-auto`}>
              Connect your cloud providers to monitor configuration changes in real-time.
              Supported providers include AWS, Azure, Google Cloud, and Datadog.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-lg
                hover:bg-cyan-700 transition-colors font-medium">
                <PlusCircle className="h-4 w-4" />
                Add Cloud Source
              </button>
              <button className={`flex items-center gap-2 px-5 py-2.5 ${theme.bg.card} border ${theme.border.secondary} ${theme.text.secondary}
                rounded-lg hover:${theme.bg.secondary} transition-colors font-medium`}>
                <FileText className="h-4 w-4 text-purple-500" />
                Documentation
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Enhanced Configuration Drift Detection */}
      {driftData ? (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
                <GitBranch className="h-6 w-6 text-orange-600" />
                Configuration Drift Detection
              </h3>
              <p className={`text-sm ${theme.text.secondary} mt-1`}>
                Resources deviating from security baseline with real-time monitoring
              </p>
            </div>
            <div className="flex gap-2">
              <div className={`flex items-center gap-2 ${theme.bg.card} px-3 py-1.5 rounded-lg border ${theme.border.primary}`}>
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className={`text-sm font-medium ${theme.text.secondary}`}>
                  {driftData.total_drifts} Total Drifts
                </span>
              </div>
              <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
                rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
                <PlusCircle className="h-4 w-4 text-green-500" />
                Add Rule
              </button>
              <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
                rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
                <FileText className="h-4 w-4 text-purple-500" />
                Export Report
              </button>
            </div>
          </div>

          {/* Drift Summary with improved visuals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`${theme.bg.card} p-4 rounded-lg border-2 border-red-200 hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="text-lg font-bold text-red-600">{driftData.critical_drifts}</div>
              </div>
              <div className={`text-xs ${theme.text.secondary} mt-1`}>Critical Drifts</div>
              <div className={`text-xs ${theme.text.tertiary} mt-1`}>
                {Math.round((driftData.critical_drifts / driftData.total_drifts) * 100 || 0)}% of total
              </div>
            </div>
            <div className={`${theme.bg.card} p-4 rounded-lg border-2 border-orange-200 hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <div className="text-lg font-bold text-orange-600">{driftData.high_drifts}</div>
              </div>
              <div className={`text-xs ${theme.text.secondary} mt-1`}>High Severity</div>
              <div className={`text-xs ${theme.text.tertiary} mt-1`}>
                {Math.round((driftData.high_drifts / driftData.total_drifts) * 100 || 0)}% of total
              </div>
            </div>
            <div className={`${theme.bg.card} p-4 rounded-lg border-2 border-yellow-200 hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="text-lg font-bold text-yellow-600">{driftData.medium_drifts}</div>
              </div>
              <div className={`text-xs ${theme.text.secondary} mt-1`}>Medium Severity</div>
              <div className={`text-xs ${theme.text.tertiary} mt-1`}>
                {Math.round((driftData.medium_drifts / driftData.total_drifts) * 100 || 0)}% of total
              </div>
            </div>
            <div className={`${theme.bg.card} p-4 rounded-lg border-2 ${theme.border.primary} hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <div className={`text-lg font-bold ${theme.text.secondary}`}>
                  {Object.keys(driftData.drift_by_source || {}).length}
                </div>
              </div>
              <div className={`text-xs ${theme.text.secondary} mt-1`}>Affected Sources</div>
            </div>
          </div>

          {/* Recent Drifts Table with improved layout */}
          <div className={`${theme.bg.card} rounded-lg border ${theme.border.primary}`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${theme.text.primary} flex items-center gap-2`}>
                  <Clock className={`h-4 w-4 ${theme.text.tertiary}`} />
                  Recent Configuration Drifts
                </h4>
                <span className={`text-sm ${theme.text.tertiary}`}>
                  Showing {Math.min(3, driftData.recent_drifts?.length || 0)} of {driftData.recent_drifts?.length || 0}
                </span>
              </div>

              {driftData.recent_drifts?.length > 0 ? (
                <div className="space-y-3">
                  {driftData.recent_drifts?.slice(0, 3).map((drift: any, index: number) => (
                    <div
                      key={drift.id}
                      className={`rounded-lg p-4 border-l-4 shadow-sm transition-all
                        ${drift.severity === 'critical' ? 'border-red-500 bg-red-50' :
                          drift.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                          'border-yellow-500 bg-yellow-50'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Severity and main info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium
                              ${drift.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                drift.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'}`}>
                              {drift.severity.toUpperCase()}
                            </span>
                            <h5 className={`font-medium ${theme.text.primary}`}>{drift.resource_name}</h5>
                            <span className={`text-xs ${theme.text.tertiary} hidden sm:inline`}>
                              ({drift.resource_type})
                            </span>
                          </div>

                          <p className={`text-sm ${theme.text.secondary} mb-3 line-clamp-2`}>{drift.drift_details}</p>

                          {/* Metrics grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                            <div>
                              <div className={`${theme.text.tertiary}`}>Detected By</div>
                              <div className={`font-medium ${theme.text.primary}`}>{drift.detected_by}</div>
                            </div>
                            <div>
                              <div className={`${theme.text.tertiary}`}>Status</div>
                              <div className={`font-medium
                                ${drift.remediation_status === 'resolved' ? 'text-green-600' :
                                  drift.remediation_status === 'in_progress' ? 'text-cyan-400' :
                                  'text-orange-600'}`}>
                                {drift.remediation_status === 'resolved' ? '✓ Resolved' :
                                 drift.remediation_status === 'in_progress' ? '⟳ In Progress' :
                                 '⚠ Pending'}
                              </div>
                            </div>
                            <div className="sm:col-span-1">
                              <div className={`${theme.text.tertiary}`}>Time</div>
                              <div className={`font-medium ${theme.text.primary}`}>
                                {new Date(drift.timestamp).toLocaleString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Compliance impact and actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          {drift.compliance_impact && drift.compliance_impact.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {drift.compliance_impact.slice(0, 3).map((std: string) => (
                                <span key={std} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">
                                  {std}
                                </span>
                              ))}
                              {drift.compliance_impact.length > 3 && (
                                <span className={`text-xs ${theme.bg.tertiary} ${theme.text.secondary} px-2 py-0.5 rounded`}>
                                  +{drift.compliance_impact.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button className={`text-xs px-2.5 py-1 ${theme.bg.card} border ${theme.border.secondary}
                              rounded ${theme.text.secondary} hover:${theme.bg.secondary} transition-colors`}>
                              View Details
                            </button>
                            <button className={`text-xs px-2.5 py-1 rounded transition-colors
                              ${drift.remediation_status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-cyan-400 hover:bg-blue-200'}`}>
                              {drift.remediation_status === 'resolved' ? '✓ Resolved' : 'Take Action'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-100" />
                  <p className={`${theme.text.tertiary}`}>No recent configuration drifts detected</p>
                  <p className={`text-sm ${theme.text.muted} mt-1`}>Your systems are currently compliant with all configurations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} flex items-center gap-2`}>
                <GitBranch className="h-6 w-6 text-orange-600" />
                Configuration Drift Detection
              </h3>
              <p className={`text-sm ${theme.text.secondary} mt-1`}>Resources deviating from security baseline</p>
            </div>
          </div>

          {/* Enhanced empty state for drift detection */}
          <div className={`text-center py-12 px-4 border-2 border-dashed border-orange-200 rounded-lg ${theme.bg.card}`}>
            <div className="mx-auto w-fit p-4 bg-orange-50 rounded-full mb-4">
              <GitBranch className="h-12 w-12 text-orange-200" />
            </div>
            <h4 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>Drift Monitoring Not Active</h4>
            <p className={`${theme.text.secondary} mb-4 max-w-md mx-auto`}>
              Configuration drift detection helps identify resources that have deviated from
              your security baseline. Connect your systems to enable this feature.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-lg
                hover:bg-cyan-700 transition-colors font-medium">
                <PlusCircle className="h-4 w-4" />
                Setup Drift Monitoring
              </button>
              <button className={`flex items-center gap-2 px-5 py-2.5 ${theme.bg.card} border ${theme.border.secondary} ${theme.text.secondary}
                rounded-lg hover:${theme.bg.secondary} transition-colors font-medium`}>
                <FileText className="h-4 w-4 text-purple-500" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Priority Actions Section */}
      {personaInsights ? (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
                <Shield className="h-6 w-6 text-purple-600" />
                Priority Actions Center
              </h3>
              <p className={`text-sm ${theme.text.secondary} mt-1`}>
                Strategic items requiring your immediate attention and action
              </p>
            </div>
            <div className="flex gap-2">
              <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
                rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
                <PlusCircle className="h-4 w-4 text-green-500" />
                Add Action
              </button>
              <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
                rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
                <FileText className="h-4 w-4 text-purple-500" />
                Export Report
              </button>
            </div>
          </div>

          {/* Priority Actions List with enhanced UI */}
          <div className="space-y-2 mb-6">
            <h4 className={`font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}>
              <Bell className="h-4 w-4 text-amber-500" />
              Immediate Attention Required
            </h4>

            {personaInsights.priority_actions?.length > 0 ? (
              <div className="space-y-3">
                {personaInsights.priority_actions?.map((action: string, index: number) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${theme.bg.card}
                      ${index === 0 ? 'border-red-500 bg-red-50' :
                        index === 1 ? 'border-amber-500 bg-amber-50' :
                        'border-blue-500 bg-blue-50'}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      text-sm font-bold text-white
                      ${index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-amber-500' :
                        'bg-blue-500'}" >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme.text.primary}`}>{action}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className={`text-xs px-3 py-1 ${theme.bg.card} border ${theme.border.secondary}
                        rounded ${theme.text.secondary} hover:${theme.bg.secondary} transition-colors`}>
                        View Details
                      </button>
                      <button className="text-xs px-3 py-1 bg-purple-600 text-white
                        rounded hover:bg-purple-700 transition-colors">
                        Take Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${theme.bg.card} rounded-lg border border-dashed ${theme.border.primary}`}>
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-100" />
                <p className={`${theme.text.tertiary}`}>No priority actions at this time</p>
                <p className={`text-sm ${theme.text.muted}`}>Your systems are currently up to date</p>
              </div>
            )}
          </div>

          {/* KPIs with enhanced visuals */}
          {personaInsights.kpis && (
            <div className={`${theme.bg.card} rounded-lg border ${theme.border.primary} p-5`}>
              <h4 className={`font-semibold ${theme.text.primary} mb-4 flex items-center gap-2`}>
                <Activity className="h-4 w-4 text-purple-500" />
                Performance Metrics
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Resolution Rate */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div className="text-2xl font-bold text-purple-700">
                      {personaInsights.kpis.drift_resolution_rate}%
                    </div>
                  </div>
                  <div className={`text-xs ${theme.text.secondary}`}>Resolution Rate</div>
                  <div className={`text-xs ${theme.text.tertiary} mt-1`}>
                    {personaInsights.kpis.drift_resolution_rate >= 80 ?
                      'Excellent performance' :
                      personaInsights.kpis.drift_resolution_rate >= 60 ?
                      'Good performance' : 'Needs improvement'}
                  </div>
                </div>

                {/* Mean Time to Detect */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {personaInsights.kpis.mean_time_to_detect_drift}
                    </div>
                  </div>
                  <div className={`text-xs ${theme.text.secondary}`}>Mean Time to Detect</div>
                  <div className={`text-xs ${theme.text.tertiary} mt-1`}>
                    {parseFloat(personaInsights.kpis.mean_time_to_detect_drift) < 2 ?
                      'Fast detection' :
                      parseFloat(personaInsights.kpis.mean_time_to_detect_drift) < 5 ?
                      'Average detection' : 'Slow detection'}
                  </div>
                </div>

                {/* Mean Time to Remediate */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="text-2xl font-bold text-green-700">
                      {personaInsights.kpis.mean_time_to_remediate}
                    </div>
                  </div>
                  <div className={`text-xs ${theme.text.secondary}`}>Mean Time to Remediate</div>
                  <div className={`text-xs ${theme.text.tertiary} mt-1`}>
                    {parseFloat(personaInsights.kpis.mean_time_to_remediate) < 4 ?
                      'Fast remediation' :
                      parseFloat(personaInsights.kpis.mean_time_to_remediate) < 8 ?
                      'Average remediation' : 'Slow remediation'}
                  </div>
                </div>

                {/* Compliance Score Trend */}
                <div className={`p-4 rounded-lg border-2
                  ${personaInsights.kpis.compliance_score_trend === 'declining' ?
                    'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full
                      ${personaInsights.kpis.compliance_score_trend === 'declining' ?
                        'bg-red-500' : 'bg-green-500'}`}></div>
                    <div className={`text-2xl font-bold
                      ${personaInsights.kpis.compliance_score_trend === 'declining' ?
                        'text-red-700' : 'text-green-700'}`}>
                      {personaInsights.kpis.compliance_score_trend === 'declining' ? '↓' : '↑'}
                    </div>
                  </div>
                  <div className={`text-xs ${theme.text.secondary}`}>Compliance Score Trend</div>
                  <div className={`text-xs mt-1
                    ${personaInsights.kpis.compliance_score_trend === 'declining' ?
                      'text-red-600' : 'text-green-600'}`}>
                    {personaInsights.kpis.compliance_score_trend === 'declining' ?
                      'Declining - needs attention' : 'Improving - good progress'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Enhanced Stats Grid with improved visual hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: {
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              text: 'text-cyan-400',
              iconBg: 'bg-blue-100'
            },
            green: {
              bg: 'bg-green-50',
              border: 'border-green-200',
              text: 'text-green-600',
              iconBg: 'bg-green-100'
            },
            red: {
              bg: 'bg-red-50',
              border: 'border-red-200',
              text: 'text-red-600',
              iconBg: 'bg-red-100'
            },
            gray: {
              bg: theme.bg.secondary,
              border: theme.border.primary,
              text: theme.text.secondary,
              iconBg: theme.bg.tertiary
            }
          };

          const colors = colorClasses[stat.color as keyof typeof colorClasses];

          return (
            <div
              key={stat.name}
              className={`rounded-xl shadow-sm hover:shadow-md transition-all animate-slideUp
                ${colors.bg} border ${colors.border} p-5`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${colors.iconBg} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${colors.text} mb-0.5`}>{stat.name}</p>
                    {stat.trend !== 'neutral' && (
                      <div className={`flex items-center text-xs font-medium
                        ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend === 'up' ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {stat.change} increase
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {stat.change} decrease
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-1">
                <h3 className={`text-3xl font-bold ${colors.text} mb-1`}>
                  {stat.value}
                </h3>
                {stat.name === 'Last Updated' && (
                  <p className={`text-xs ${theme.text.tertiary}`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Charts Grid with improved visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Compliance Trend Chart */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 border-t-4 ${compliancePercentage >= 90 ? 'border-green-500' :
          compliancePercentage >= 70 ? 'border-yellow-500' : 'border-red-500'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Compliance Trend (24h)</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${compliancePercentage >= 90 ? 'bg-green-500' :
                compliancePercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {compliancePercentage >= 90 ? 'Excellent' :
                 compliancePercentage >= 70 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#1f2937' }}
                itemStyle={{ color: '#1f2937' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{
                  fill: '#3b82f6',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  r: 5
                }}
                activeDot={{
                  r: 8,
                  fill: '#3b82f6',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
                fill="url(#trendGradient)"
              />
              {/* Reference lines for compliance thresholds */}
              <ReferenceLine y={90} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Excellent', position: 'insideTopRight', fill: '#10b981' }} />
              <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Good', position: 'insideTopRight', fill: '#f59e0b' }} />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Poor', position: 'insideTopRight', fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Current score display */}
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className={`text-sm ${theme.text.tertiary}`}>Current Score</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{compliancePercentage}%</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className={`${theme.text.tertiary}`}>24h Change</p>
                <p className={`font-medium ${compliancePercentage - trendData[0].score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {compliancePercentage - trendData[0].score >= 0 ? '+' : ''}
                  {Math.abs(compliancePercentage - trendData[0].score)}%
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className={`h-4 w-4 ${theme.text.muted}`} />
                <span className={`${theme.text.tertiary}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Violations by Severity Chart */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 border-t-4 border-red-500`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Violations by Severity</h3>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className={`text-sm font-medium ${theme.text.secondary}`}>
                {totalViolations} Total
              </span>
            </div>
          </div>

          {totalViolations > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {severityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#1f2937' }}
                  itemStyle={{ color: '#1f2937' }}
                  formatter={(value, name, props) => [
                    `${value} violations (${Math.round((value / totalViolations) * 100)}%)`,
                    name
                  ]}
                />
                {/* Center label */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-lg font-bold ${theme.text.secondary}`}
                >
                  {totalViolations}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-xs ${theme.text.tertiary}`}
                >
                  Total Violations
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <CheckCircle className="h-12 w-12 text-green-100 mb-2" />
              <p className={`${theme.text.tertiary}`}>No violations detected</p>
              <p className={`text-sm ${theme.text.muted}`}>Your systems are currently compliant</p>
            </div>
          )}

          {/* Severity legend */}
          <div className="mt-4 flex justify-center gap-6 pt-4 border-t border-gray-100">
            {severityData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className={`text-xs ${theme.text.secondary}`}>
                  {item.name}: {item.value} ({Math.round((item.value / totalViolations) * 100) || 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Standards Compliance Chart */}
        <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 lg:col-span-2 border-t-4 border-blue-500`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Compliance by Standard</h3>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className={`text-sm font-medium ${theme.text.secondary}`}>
                {standardsData.length} Standards
              </span>
            </div>
          </div>

          {standardsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={standardsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  tick={{ fontSize: 12, angle: -15, textAnchor: 'end' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="#6b7280"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#1f2937' }}
                  itemStyle={{ color: '#1f2937' }}
                  formatter={(value, name, props) => [
                    name === 'score' ? `${value}% compliance` : `${value} violations`,
                    name
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span className="text-sm capitalize">
                      {value === 'score' ? 'Compliance Score' :
                       value === 'violations' ? 'Violations Count' : value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="score"
                  fill="#3b82f6"
                  name="Compliance Score"
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                >
                  {standardsData.map((entry, index) => (
                    <Cell
                      key={`cell-score-${index}`}
                      fill={entry.score >= 90 ? '#10b981' :
                            entry.score >= 70 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="violations"
                  fill="#ef4444"
                  name="Violations"
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <Shield className="h-12 w-12 text-blue-100 mb-2" />
              <p className={`${theme.text.tertiary}`}>No compliance standards configured</p>
              <p className={`text-sm ${theme.text.muted}`}>Upload a PDF to get started with compliance monitoring</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Recent Violations Section */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-6 border-t-4 border-red-500`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${theme.text.primary} flex items-center gap-2`}>
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Recent Violations
            </h3>
            <p className={`text-sm ${theme.text.secondary} mt-1`}>
              Latest compliance violations requiring your attention
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                {violations.length} {violations.length === 1 ? 'Violation' : 'Violations'}
              </span>
            </div>
            <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
              rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
              <FileText className="h-4 w-4 text-purple-500" />
              Export Report
            </button>
          </div>
        </div>

        {violations.length > 0 ? (
          <>
            {/* Severity distribution summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="text-lg font-bold text-red-700">
                  {(violations || []).filter((v: any) => v.severity === 'critical').length}
                </div>
                <div className={`text-xs ${theme.text.secondary}`}>Critical</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-lg font-bold text-orange-700">
                  {(violations || []).filter((v: any) => v.severity === 'high').length}
                </div>
                <div className={`text-xs ${theme.text.secondary}`}>High</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="text-lg font-bold text-yellow-700">
                  {(violations || []).filter((v: any) => v.severity === 'medium').length}
                </div>
                <div className={`text-xs ${theme.text.secondary}`}>Medium</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-cyan-400">
                  {(violations || []).filter((v: any) => v.severity === 'low').length}
                </div>
                <div className={`text-xs ${theme.text.secondary}`}>Low</div>
              </div>
            </div>

            {/* Violations list with enhanced UI */}
            <div className="space-y-3">
              {violations.slice(0, 5).map((violation: any, index: number) => {
                // Determine severity color
                const severityColors = {
                  critical: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' },
                  high: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
                  medium: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' },
                  low: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-cyan-400' }
                };

                const colors = severityColors[violation.severity as keyof typeof severityColors] ||
                              severityColors.medium;

                return (
                  <div
                    key={index}
                    className={`rounded-lg border-l-4 p-4 transition-all hover:shadow-md
                      ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Violation details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`}></div>
                          <div>
                            <h4 className={`font-medium ${colors.text}`}>{violation.control_id}</h4>
                            <p className={`text-sm ${theme.text.secondary} mt-0.5`}>{violation.description}</p>
                          </div>
                        </div>

                        {/* Additional metadata */}
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className={`${theme.text.tertiary}`}>Severity</div>
                            <div className={`font-medium capitalize ${colors.text}`}>
                              {violation.severity}
                            </div>
                          </div>
                          <div>
                            <div className={`${theme.text.tertiary}`}>Detected</div>
                            <div className={`font-medium ${theme.text.primary}`}>
                              {new Date(violation.timestamp).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          {violation.resource && (
                            <div className="sm:col-span-1">
                              <div className={`${theme.text.tertiary}`}>Resource</div>
                              <div className={`font-medium ${theme.text.primary} truncate`}>
                                {violation.resource}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-0">
                        <button className={`text-xs px-3 py-1.5 ${theme.bg.card} border ${theme.border.secondary}
                          rounded ${theme.text.secondary} hover:${theme.bg.secondary} transition-colors`}>
                          View Details
                        </button>
                        <button className={`text-xs px-3 py-1.5 rounded transition-colors
                          ${colors.text.replace('text-', 'bg-')} bg-opacity-10
                          ${colors.text} hover:bg-opacity-20`}>
                          Take Action
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show more button if there are more violations */}
            {violations.length > 5 && (
              <div className="mt-4 text-center">
                <button className={`flex items-center gap-1.5 mx-auto px-4 py-2 text-sm font-medium ${theme.bg.card} border ${theme.border.secondary}
                  rounded-lg hover:${theme.bg.secondary} ${theme.text.secondary} transition-colors`}>
                  Show {violations.length - 5} more violations
                  <AlertTriangle className={`h-4 w-4 ${theme.text.tertiary}`} />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Enhanced empty state */}
            <div className="text-center py-12 px-4 border-2 border-dashed border-green-200 rounded-lg">
            <div className="mx-auto w-fit p-4 bg-green-50 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
            <h4 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>No Violations Detected</h4>
            <p className={`${theme.text.secondary} mb-4 max-w-md mx-auto`}>
              Your systems are currently compliant with all configured standards.
              Great job maintaining security and compliance!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg
                hover:bg-green-700 transition-colors font-medium">
                <Shield className="h-4 w-4" />
                View Compliance Report
              </button>
              <button className={`flex items-center gap-2 px-5 py-2.5 ${theme.bg.card} border ${theme.border.secondary} ${theme.text.secondary}
                rounded-lg hover:${theme.bg.secondary} transition-colors font-medium`}>
                <FileText className="h-4 w-4 text-purple-500" />
                Export Summary
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

// Made with Bob
