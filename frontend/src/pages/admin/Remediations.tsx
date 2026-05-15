import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService } from '../../services/api';
import { useToast, ToastContainer } from '@/components/ToastNotification';

interface RemediationSummary {
  id: string;
  status: string;
  bucket_name: string;
  drift_type: string;
  risk_score: number;
  priority: string;
  created_at: string;
  expires_at: string;
  requires_approval: boolean;
  automation_available: boolean;
}

interface RemediationDetail {
  approval_request: any;
  violation_details: any;
  analysis_data: any;
  created_at: string;
}

const Remediations: React.FC = () => {
  const { toasts, removeToast, showSuccess, showWarning } = useToast();
  const [remediations, setRemediations] = useState<RemediationSummary[]>([]);
  const [selectedRemediation, setSelectedRemediation] = useState<RemediationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvalAction, setApprovalAction] = useState<string>('');
  const [approverName, setApproverName] = useState('Admin User');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRemediations();
    const interval = setInterval(fetchRemediations, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchRemediations = async () => {
    try {
      const response = await apiService.get('/remediations/pending');
      setRemediations(response.remediations || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch remediations:', error);
      setLoading(false);
    }
  };

  const fetchRemediationDetails = async (id: string) => {
    try {
      const response = await apiService.get(`/remediations/${id}`);
      setSelectedRemediation(response);
      setExpandedId(id);
    } catch (error) {
      console.error('Failed to fetch remediation details:', error);
    }
  };

  const handleApproval = async (remediationId: string) => {
    if (!approvalAction) {
      showWarning('Action Required', 'Please select an action');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.post(`/remediations/${remediationId}/approve`, {
        action: approvalAction,
        approver: approverName,
        comments: comments || undefined
      });

      showSuccess('Approval Submitted', 'Approval decision submitted successfully');
      setApprovalAction('');
      setComments('');
      setExpandedId(null);
      setSelectedRemediation(null);
      fetchRemediations();
    } catch (error: any) {
      console.error('Failed to submit approval:', error);
      showWarning('Approval Failed', error.response?.data?.detail || error.message || 'Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600 bg-red-50';
    if (score >= 6) return 'text-orange-600 bg-orange-50';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
      case 'approve_automated':
      case 'approve_manual':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDriftType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Remediation Approvals</h1>
          <p className="mt-2 text-gray-600">
            Review and approve remediation plans for detected policy drifts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">{remediations.length}</span>
          <span className="text-gray-600">Pending</span>
        </div>
      </div>

      {/* Remediations List */}
      {remediations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Remediations</h3>
          <p className="text-gray-600">All policy drifts have been addressed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {remediations.map((remediation) => (
            <div
              key={remediation.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              {/* Remediation Summary */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => {
                  if (expandedId === remediation.id) {
                    setExpandedId(null);
                    setSelectedRemediation(null);
                  } else {
                    fetchRemediationDetails(remediation.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(remediation.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {remediation.bucket_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(remediation.risk_score)}`}>
                        Risk: {remediation.risk_score}/10
                      </span>
                      {remediation.automation_available && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          Auto-Remediation Available
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Drift Type</p>
                        <p className="font-medium text-gray-900">{formatDriftType(remediation.drift_type)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className="font-medium text-gray-900">{remediation.priority}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Detected</p>
                        <p className="font-medium text-gray-900">
                          {remediation.created_at ? new Date(remediation.created_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="font-medium text-red-600">
                          {remediation.expires_at ? new Date(remediation.expires_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button className="ml-4">
                    {expandedId === remediation.id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === remediation.id && selectedRemediation && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="space-y-6">
                    {/* Impact Summary */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Impact Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Security Impact</p>
                          <p className="font-semibold text-gray-900">
                            {selectedRemediation.approval_request.impact_summary.security_impact_level?.toUpperCase()}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Data Exposure Risk</p>
                          <p className="font-semibold text-gray-900">
                            {selectedRemediation.approval_request.impact_summary.data_exposure_risk?.toUpperCase()}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Blast Radius</p>
                          <p className="font-semibold text-gray-900">
                            {selectedRemediation.approval_request.impact_summary.blast_radius?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Frameworks */}
                    {selectedRemediation.approval_request.impact_summary.compliance_frameworks_affected?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Affected Compliance Frameworks</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRemediation.approval_request.impact_summary.compliance_frameworks_affected.map((framework: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                              {framework}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remediation Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Remediation Plan</h4>
                      <div className="bg-white p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Time:</span>
                          <span className="font-medium">{selectedRemediation.approval_request.remediation_details.estimated_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Automation:</span>
                          <span className="font-medium">
                            {selectedRemediation.approval_request.remediation_details.automation_available ? 'Available' : 'Manual Only'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reversible:</span>
                          <span className="font-medium">
                            {selectedRemediation.approval_request.remediation_details.reversible ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Approval Actions */}
                    {remediation.status === 'pending' && (
                      <div className="bg-white p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Approval Decision</h4>
                        
                        <div className="space-y-4">
                          {/* Action Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Action
                            </label>
                            <div className="space-y-2">
                              {selectedRemediation.approval_request.approval_options.map((option: any) => (
                                <label
                                  key={option.action}
                                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                    approvalAction === option.action
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  } ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name="approval_action"
                                    value={option.action}
                                    checked={approvalAction === option.action}
                                    onChange={(e) => setApprovalAction(e.target.value)}
                                    disabled={!option.available}
                                    className="mt-1"
                                  />
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900">{option.label}</span>
                                      {option.recommended && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                          Recommended
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Approver Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Approver Name
                            </label>
                            <input
                              type="text"
                              value={approverName}
                              onChange={(e) => setApproverName(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter your name"
                            />
                          </div>

                          {/* Comments */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comments {approvalAction === 'reject' && <span className="text-red-600">(Required for rejection)</span>}
                            </label>
                            <textarea
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Add comments or justification..."
                            />
                          </div>

                          {/* Submit Button */}
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => {
                                setExpandedId(null);
                                setSelectedRemediation(null);
                                setApprovalAction('');
                                setComments('');
                              }}
                              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleApproval(remediation.id)}
                              disabled={!approvalAction || !approverName || submitting}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? 'Submitting...' : 'Submit Decision'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default Remediations;