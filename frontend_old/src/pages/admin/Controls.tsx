import React, { useEffect, useState } from 'react';
import { FileText, Search, Filter, Plus, Edit, Trash2, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { useComplianceStore } from '../../store/useComplianceStore';
import { theme } from '@/config/theme';

interface Control {
  id: string;
  control_id?: string;
  standard: string;
  description: string;
  category?: string;
  severity?: string;
  title?: string;
}

interface PDFFile {
  filename: string;
  size_bytes: number;
  modified_time: string;
}

export const AdminControls: React.FC = () => {
  const { complianceScore } = useComplianceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [controls, setControls] = useState<Control[]>([]);
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const standards = Object.keys(complianceScore?.standards || {});

  // Fetch controls from backend
  const fetchControls = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/controls');
      if (response.ok) {
        const data = await response.json();
        setControls(data.controls || []);
      } else {
        // Use mock data if API fails
        setControls([
          {
            id: '1',
            control_id: 'CC6.1',
            standard: 'SOC2',
            title: 'Logical and Physical Access Controls',
            description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity\'s objectives.',
            category: 'Access Control',
            severity: 'high'
          },
          {
            id: '2',
            control_id: 'CC6.6',
            standard: 'SOC2',
            title: 'Network Security',
            description: 'The entity implements logical access security measures to protect against threats from sources outside its system boundaries.',
            category: 'Network Security',
            severity: 'high'
          },
          {
            id: '3',
            control_id: 'CC7.2',
            standard: 'SOC2',
            title: 'System Monitoring',
            description: 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity\'s ability to meet its objectives.',
            category: 'Monitoring',
            severity: 'medium'
          },
          {
            id: '4',
            control_id: 'HP-164.312(a)(2)(iv)',
            standard: 'HIPAA',
            title: 'Encryption and Decryption',
            description: 'Implement a mechanism to encrypt and decrypt electronic protected health information.',
            category: 'Data Protection',
            severity: 'critical'
          },
          {
            id: '5',
            control_id: 'HP-164.308(a)(5)(ii)(C)',
            standard: 'HIPAA',
            title: 'Log-in Monitoring',
            description: 'Procedures for monitoring log-in attempts and reporting discrepancies.',
            category: 'Access Control',
            severity: 'medium'
          },
          {
            id: '6',
            control_id: 'PCI-3.4',
            standard: 'PCI-DSS',
            title: 'Render PAN Unreadable',
            description: 'Render PAN unreadable anywhere it is stored (including on portable digital media, backup media, and in logs).',
            category: 'Data Protection',
            severity: 'critical'
          },
          {
            id: '7',
            control_id: 'PCI-8.2',
            standard: 'PCI-DSS',
            title: 'User Authentication',
            description: 'In addition to assigning a unique ID, ensure proper user-authentication management for non-consumer users and administrators.',
            category: 'Access Control',
            severity: 'high'
          },
          {
            id: '8',
            control_id: 'A.9.2.3',
            standard: 'ISO27001',
            title: 'Management of Privileged Access Rights',
            description: 'The allocation and use of privileged access rights shall be restricted and controlled.',
            category: 'Access Control',
            severity: 'high'
          },
          {
            id: '9',
            control_id: 'A.12.4.1',
            standard: 'ISO27001',
            title: 'Event Logging',
            description: 'Event logs recording user activities, exceptions, faults and information security events shall be produced, kept and regularly reviewed.',
            category: 'Monitoring',
            severity: 'medium'
          },
          {
            id: '10',
            control_id: 'GDPR-32',
            standard: 'GDPR',
            title: 'Security of Processing',
            description: 'Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.',
            category: 'Data Protection',
            severity: 'high'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching controls:', error);
      // Use mock data on error
      setControls([
        {
          id: '1',
          control_id: 'CC6.1',
          standard: 'SOC2',
          title: 'Logical and Physical Access Controls',
          description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity\'s objectives.',
          category: 'Access Control',
          severity: 'high'
        },
        {
          id: '2',
          control_id: 'CC6.6',
          standard: 'SOC2',
          title: 'Network Security',
          description: 'The entity implements logical access security measures to protect against threats from sources outside its system boundaries.',
          category: 'Network Security',
          severity: 'high'
        },
        {
          id: '3',
          control_id: 'HP-164.312(a)(2)(iv)',
          standard: 'HIPAA',
          title: 'Encryption and Decryption',
          description: 'Implement a mechanism to encrypt and decrypt electronic protected health information.',
          category: 'Data Protection',
          severity: 'critical'
        }
      ]);
      setMessage({ type: 'error', text: 'Failed to fetch controls, showing sample data' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stored PDFs
  const fetchPDFs = async () => {
    try {
      const response = await fetch('http://localhost:8000/pdfs');
      if (response.ok) {
        const data = await response.json();
        setPdfs(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  // Upload PDF
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Successfully uploaded ${file.name} - Extracted ${data.controls_count} controls` 
        });
        await fetchControls();
        await fetchPDFs();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || 'Upload failed' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: 'Failed to upload PDF' });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Re-ingest all PDFs
  const handleReingest = async () => {
    try {
      setIngesting(true);
      setMessage(null);

      const response = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Re-ingested ${data.files_processed} PDFs - ${data.total_controls} controls` 
        });
        await fetchControls();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || 'Re-ingestion failed' });
      }
    } catch (error) {
      console.error('Error re-ingesting:', error);
      setMessage({ type: 'error', text: 'Failed to re-ingest PDFs' });
    } finally {
      setIngesting(false);
    }
  };

  useEffect(() => {
    fetchControls();
    fetchPDFs();
  }, []);

  const filteredControls = (controls || []).filter(control => {
    const controlId = control.control_id || control.id || '';
    const description = control.description || control.title || '';
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         controlId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStandard = selectedStandard === 'all' || control.standard === selectedStandard;
    return matchesSearch && matchesStandard;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Compliance Controls</h1>
          <p className={`${theme.text.secondary} mt-1`}>Manage and configure compliance controls</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer">
            <Upload className="h-5 w-5" />
            {uploading ? 'Uploading...' : 'Upload PDF'}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <button 
            onClick={handleReingest}
            disabled={ingesting || pdfs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${ingesting ? 'animate-spin' : ''}`} />
            {ingesting ? 'Re-ingesting...' : 'Re-ingest All'}
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <AlertCircle className="h-5 w-5" />
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PDF Storage Info */}
      {pdfs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Stored PDFs ({pdfs.length})</h3>
          <div className="flex flex-wrap gap-2">
            {pdfs.map((pdf) => (
              <span key={pdf.filename} className={`px-3 py-1 ${theme.bg.card} text-cyan-400 rounded-full text-sm border border-blue-200`}>
                {pdf.filename}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm p-4`}>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme.text.muted}`} />
            <input
              type="text"
              placeholder="Search controls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${theme.border.secondary} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className={`px-4 py-2 border ${theme.border.secondary} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Standards</option>
            {standards.map(std => (
              <option key={std} value={std}>{std}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls Table */}
      <div className={`${theme.bg.card} rounded-xl shadow-sm overflow-hidden`}>
        {loading ? (
          <div className={`p-8 text-center ${theme.text.tertiary}`}>
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            Loading controls...
          </div>
        ) : filteredControls.length === 0 ? (
          <div className={`p-8 text-center ${theme.text.tertiary}`}>
            <FileText className={`h-12 w-12 mx-auto mb-3 ${theme.text.muted}`} />
            <p className="text-lg font-medium mb-2">No controls found</p>
            <p className="text-sm">Upload a compliance PDF to get started</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${theme.bg.secondary}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider`}>Control ID</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider`}>Standard</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider`}>Description</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider`}>Category</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider`}>Severity</th>
              </tr>
            </thead>
            <tbody className={`${theme.bg.card} divide-y divide-gray-200`}>
              {filteredControls.map((control, index) => (
                <tr key={control.control_id || control.id || index} className={`hover:${theme.bg.secondary}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme.text.primary}`}>
                    {control.control_id || control.id || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.tertiary}`}>
                    <span className="px-2 py-1 bg-blue-100 text-cyan-400 rounded-full text-xs font-medium">
                      {control.standard || 'Unknown'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${theme.text.primary}`}>
                    {control.description || control.title || 'No description'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.tertiary}`}>
                    {control.category || 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      control.severity === 'critical' || control.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      control.severity === 'high' || control.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                      control.severity === 'medium' || control.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      `${theme.bg.tertiary} ${theme.text.secondary}`
                    }`}>
                      {control.severity || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`${theme.bg.card} rounded-lg shadow-sm p-4`}>
          <div className={`text-sm ${theme.text.secondary}`}>Total Controls</div>
          <div className={`text-2xl font-bold ${theme.text.primary}`}>{controls.length}</div>
        </div>
        <div className={`${theme.bg.card} rounded-lg shadow-sm p-4`}>
          <div className={`text-sm ${theme.text.secondary}`}>Stored PDFs</div>
          <div className={`text-2xl font-bold ${theme.text.primary}`}>{pdfs.length}</div>
        </div>
        <div className={`${theme.bg.card} rounded-lg shadow-sm p-4`}>
          <div className={`text-sm ${theme.text.secondary}`}>Standards</div>
          <div className={`text-2xl font-bold ${theme.text.primary}`}>{standards.length}</div>
        </div>
      </div>
    </div>
  );
};
