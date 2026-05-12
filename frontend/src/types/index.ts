export interface ComplianceControl {
  control_id: string;
  description: string;
  condition: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
  category: string;
  standard: string;
}

export interface ComplianceEvent {
  source: string;
  event_name: string;
  event_time: string;
  username?: string;
  resource_type?: string;
  resource_name?: string;
  public?: boolean;
  encryption_enabled?: boolean;
  backup_enabled?: boolean;
  allows_all_traffic?: boolean;
  port?: number;
  [key: string]: any;
}

export interface Violation {
  control_id: string;
  standard: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  event: ComplianceEvent;
  resolved: boolean;
  resolved_at?: string;
}

export interface ViolationAlert {
  timestamp: string;
  type: 'violation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  control_id: string;
  standard: string;
  category: string;
  description: string;
  remediation: string;
  event: ComplianceEvent;
  evidence: string;
}

export interface ComplianceScore {
  overall_score?: number;
  overall?: number;  // Alternative field name for compatibility
  standard?: string;
  score?: number;
  total_controls: number;
  total_violations?: number;
  active_violations?: number;
  resolved_violations?: number;
  last_update?: string;
  standards?: Record<string, StandardData>;  // Changed from number to StandardData
}

export interface StandardData {
  score: number;
  controls: number;
  violations: number;
}

export interface DashboardData {
  compliance_score: ComplianceScore;
  violations_by_severity: Record<string, number>;
  violations_by_category: Record<string, number>;
  trend_data: {
    period_days: number;
    total_violations: number;
    daily_counts: Record<string, number>;
    average_per_day: number;
  };
  standards: Record<string, StandardData>;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  controls_count: number;
  standards: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
  mock_mode: boolean;
  services: Record<string, boolean>;
}

export interface EventSource {
  id: string;
  name: string;
  provider: string;
  type: string;
  instance: string;
  status: 'active' | 'inactive' | 'error';
  events_monitored: number;
  config_changes_detected: number;
  last_event: string;
  health: 'healthy' | 'degraded' | 'unhealthy';
  region: string;
  description: string;
}

export interface IBMCloudATEvent {
  id: string;
  timestamp: string;
  source: string;
  source_instance: string;
  event_name: string;
  action: string;
  outcome: string;
  initiator: {
    id: string;
    name: string;
    type: string;
  };
  target: {
    id: string;
    type: string;
    name: string;
  };
  resource_type: string;
  resource_name: string;
  config_change: {
    property: string;
    old_value: any;
    new_value: any;
  };
  severity: string;
  description: string;
}

export interface ConfigurationDrift {
  id: string;
  timestamp: string;
  source: string;
  source_instance: string;
  resource_type: string;
  resource_name: string;
  drift_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  expected_state: Record<string, any>;
  actual_state: Record<string, any>;
  drift_details: string;
  compliance_impact: string[];
  remediation_status: 'pending' | 'in_progress' | 'resolved';
  detected_by: string;
  assigned_to: string;
  resolved_at?: string;
}

export interface ComplianceDrift {
  total_controls_drifted: number;
  standards_affected: string[];
  drift_trend: {
    last_7_days: number[];
    last_30_days: number[];
  };
  by_standard: Record<string, {
    controls_drifted: number;
    total_controls: number;
    drift_percentage: number;
  }>;
}

export interface PersonaInsights {
  admin?: {
    priority_actions: string[];
    kpis: Record<string, any>;
  };
  security?: {
    active_threats: string[];
    investigation_queue: number;
    incidents_from_drift: number;
    kpis: Record<string, any>;
  };
  auditor?: {
    audit_findings: string[];
    compliance_gaps: string[];
    kpis: Record<string, any>;
  };
  user?: {
    my_violations: number;
    my_remediation_tasks: string[];
    training_required: string[];
    kpis: Record<string, any>;
  };
}

// Made with Bob
