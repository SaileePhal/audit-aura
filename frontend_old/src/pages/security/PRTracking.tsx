import React, { useEffect, useState } from 'react';
import { theme } from '@/config/theme';
import { 
  GitPullRequest, Search, Filter, ExternalLink, CheckCircle, 
  XCircle, Clock, AlertCircle, GitMerge, GitBranch, User, Calendar
} from 'lucide-react';

interface PR {
  id: string;
  pr_url: string;
  pr_number: number;
  violation_id: string;
  title: string;
  description: string;
  author: string;
  repository: string;
  status: 'open' | 'merged' | 'closed';
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  files_changed: string[];
  commits: number;
  additions: number;
  deletions: number;
  reviewers: string[];
  labels: string[];
}

interface PRStats {
  total: number;
  open: number;
  merged: number;
  closed: number;
  violations_with_prs: number;
  average_prs_per_violation: number;
}

export const PRTracking: React.FC = () => {
  const [prs, setPrs] = useState<PR[]>([
    {
      id: 'pr-1',
      pr_url: 'https://github.com/company/infrastructure/pull/123',
      pr_number: 123,
      violation_id: 'v001',
      title: 'Fix S3 bucket public access configuration',
      description: 'Removes public access from prod-data-bucket and enables block public access settings',
      author: 'devops-team',
      repository: 'company/infrastructure',
      status: 'open',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      merged_at: null,
      closed_at: null,
      files_changed: ['terraform/s3.tf', 'terraform/iam.tf'],
      commits: 3,
      additions: 45,
      deletions: 12,
      reviewers: ['security-lead', 'platform-engineer'],
      labels: ['security', 'compliance', 'soc2']
    },
    {
      id: 'pr-2',
      pr_url: 'https://github.com/company/infrastructure/pull/124',
      pr_number: 124,
      violation_id: 'v002',
      title: 'Enable RDS encryption at rest',
      description: 'Migrates patient-db to encrypted RDS instance with KMS key',
      author: 'security-team',
      repository: 'company/infrastructure',
      status: 'merged',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      merged_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      closed_at: null,
      files_changed: ['terraform/rds.tf', 'terraform/kms.tf', 'scripts/migrate-db.sh'],
      commits: 8,
      additions: 156,
      deletions: 34,
      reviewers: ['dba-lead', 'security-lead'],
      labels: ['security', 'compliance', 'hipaa', 'critical']
    },
    {
      id: 'pr-3',
      pr_url: 'https://github.com/company/payment-service/pull/89',
      pr_number: 89,
      violation_id: 'v003',
      title: 'Implement PAN masking in application logs',
      description: 'Adds regex-based PAN detection and masking to logging middleware',
      author: 'dev-team',
      repository: 'company/payment-service',
      status: 'open',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      merged_at: null,
      closed_at: null,
      files_changed: ['src/middleware/logging.ts', 'src/utils/masking.ts', 'tests/masking.test.ts'],
      commits: 5,
      additions: 234,
      deletions: 18,
      reviewers: ['security-team', 'senior-dev'],
      labels: ['security', 'compliance', 'pci-dss', 'high-priority']
    }
  ]);
  const [stats, setStats] = useState<PRStats>({
    total: 3,
    open: 2,
    merged: 1,
    closed: 0,
    violations_with_prs: 3,
    average_prs_per_violation: 1.0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPR, setSelectedPR] = useState<PR | null>(null);

  useEffect(() => {
    fetchPRs();
    const interval = setInterval(fetchPRs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const fetchPRs = async () => {
    try {
      const statusParam = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const response = await fetch(`http://localhost:8000/prs${statusParam}`);
      const data = await response.json();
      setPrs(data.prs || prs);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching PRs:', error);
      // Keep mock data
    }
  };

  const filteredPRs = (prs || []).filter(pr =>
    pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.violation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.repository.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'merged':
        return <GitMerge className="h-5 w-5 text-purple-600" />;
      case 'open':
        return <GitBranch className="h-5 w-5 text-green-600" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <GitPullRequest className={`h-5 w-5 ${theme.text.secondary}`} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      merged: 'bg-purple-100 text-purple-700 border-purple-200',
      open: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-red-100 text-red-700 border-red-200'
    };
    return classes[status as keyof typeof classes] || `${theme.bg.tertiary} ${theme.text.secondary} ${theme.border.primary}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Pull Request Tracking</h1>
        <p className={`${theme.text.secondary} mt-1`}>Monitor compliance-related pull requests and their status</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${theme.bg.card} rounded-lg shadow-sm p-4 border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme.text.secondary}`}>Total PRs</p>
                <p className={`text-2xl font-bold ${theme.text.primary}`}>{stats.total}</p>
              </div>
              <GitPullRequest className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className={`${theme.bg.card} rounded-lg shadow-sm p-4 border-l-4 border-green-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme.text.secondary}`}>Open</p>
                <p className={`text-2xl font-bold ${theme.text.primary}`}>{stats.open}</p>
              </div>
              <GitBranch className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className={`${theme.bg.card} rounded-lg shadow-sm p-4 border-l-4 border-purple-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme.text.secondary}`}>Merged</p>
                <p className={`text-2xl font-bold ${theme.text.primary}`}>{stats.merged}</p>
              </div>
              <GitMerge className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className={`${theme.bg.card} rounded-lg shadow-sm p-4 border-l-4 border-orange-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme.text.secondary}`}>Violations with PRs</p>
                <p className={`text-2xl font-bold ${theme.text.primary}`}>{stats.violations_with_prs}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme.text.muted}`} />
            <input
              type="text"
              placeholder="Search PRs by title, violation, or repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${theme.border.secondary} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 border ${theme.border.secondary} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="merged">Merged</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* PR List */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm overflow-hidden`}>
        <div className="divide-y divide-gray-200">
          {filteredPRs.length === 0 ? (
            <div className="text-center py-12">
              <GitPullRequest className={`h-12 w-12 mx-auto ${theme.text.muted} mb-4`} />
              <p className={`${theme.text.tertiary}`}>No pull requests found</p>
            </div>
          ) : (
            filteredPRs.map((pr) => (
              <div
                key={pr.id}
                className={`p-6 hover:${theme.bg.secondary} transition-colors cursor-pointer`}
                onClick={() => setSelectedPR(pr)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(pr.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${theme.text.primary}`}>{pr.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(pr.status)}`}>
                          {pr.status.toUpperCase()}
                        </span>
                        {pr.labels.map((label) => (
                          <span key={label} className={`px-2 py-1 ${theme.bg.tertiary} ${theme.text.secondary} rounded-full text-xs`}>
                            {label}
                          </span>
                        ))}
                      </div>
                      
                      <div className={`flex items-center gap-4 text-sm ${theme.text.secondary} mb-3`}>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {pr.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitPullRequest className="h-4 w-4" />
                          #{pr.pr_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {pr.violation_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(pr.created_at)}
                        </span>
                      </div>

                      <p className={`text-sm ${theme.text.secondary} mb-3 line-clamp-2`}>{pr.description}</p>

                      <div className={`flex items-center gap-4 text-sm ${theme.text.secondary}`}>
                        <span className="text-green-600">+{pr.additions}</span>
                        <span className="text-red-600">-{pr.deletions}</span>
                        <span>{pr.commits} commits</span>
                        <span>{pr.files_changed.length} files changed</span>
                        {pr.reviewers.length > 0 && (
                          <span>{pr.reviewers.length} reviewers</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={pr.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-cyan-400 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-sm font-medium">View on GitHub</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PR Detail Modal */}
      {selectedPR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme.bg.card} rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme.border.primary}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getStatusIcon(selectedPR.status)}
                  <div>
                    <h2 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>{selectedPR.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedPR.status)}`}>
                        {selectedPR.status.toUpperCase()}
                      </span>
                      <span className={`${theme.text.secondary}`}>#{selectedPR.pr_number}</span>
                      <span className={`${theme.text.secondary}`}>•</span>
                      <span className={`${theme.text.secondary}`}>{selectedPR.repository}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPR(null)}
                  className={`${theme.text.muted} hover:${theme.text.secondary}`}
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Description</h3>
                <p className={`${theme.text.secondary} whitespace-pre-wrap`}>{selectedPR.description}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`text-sm font-medium ${theme.text.secondary} mb-1`}>Author</h4>
                  <p className={`${theme.text.primary}`}>{selectedPR.author}</p>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${theme.text.secondary} mb-1`}>Violation ID</h4>
                  <p className={`${theme.text.primary}`}>{selectedPR.violation_id}</p>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${theme.text.secondary} mb-1`}>Created</h4>
                  <p className={`${theme.text.primary}`}>{formatDate(selectedPR.created_at)}</p>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${theme.text.secondary} mb-1`}>Updated</h4>
                  <p className={`${theme.text.primary}`}>{formatDate(selectedPR.updated_at)}</p>
                </div>
                {selectedPR.merged_at && (
                  <div>
                    <h4 className={`text-sm font-medium ${theme.text.secondary} mb-1`}>Merged</h4>
                    <p className={`${theme.text.primary}`}>{formatDate(selectedPR.merged_at)}</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className={`grid grid-cols-3 gap-4 p-4 ${theme.bg.secondary} rounded-lg`}>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${theme.text.primary}`}>{selectedPR.commits}</p>
                  <p className={`text-sm ${theme.text.secondary}`}>Commits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+{selectedPR.additions}</p>
                  <p className={`text-sm ${theme.text.secondary}`}>Additions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">-{selectedPR.deletions}</p>
                  <p className={`text-sm ${theme.text.secondary}`}>Deletions</p>
                </div>
              </div>

              {/* Files Changed */}
              {selectedPR.files_changed.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Files Changed ({selectedPR.files_changed.length})</h3>
                  <div className="space-y-2">
                    {selectedPR.files_changed.map((file, index) => (
                      <div key={index} className={`p-3 ${theme.bg.secondary} rounded-lg font-mono text-sm ${theme.text.secondary}`}>
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewers */}
              {selectedPR.reviewers.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Reviewers</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPR.reviewers.map((reviewer, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-cyan-400 rounded-full text-sm">
                        {reviewer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Labels */}
              <div>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPR.labels.map((label, index) => (
                    <span key={index} className={`px-3 py-1 ${theme.bg.tertiary} ${theme.text.secondary} rounded-full text-sm`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className={`flex gap-3 pt-4 border-t ${theme.border.primary}`}>
                <a
                  href={selectedPR.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  View on GitHub
                </a>
                <button
                  onClick={() => setSelectedPR(null)}
                  className={`px-4 py-2 bg-gray-200 ${theme.text.secondary} rounded-lg hover:bg-gray-300 transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};