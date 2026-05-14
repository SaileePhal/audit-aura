import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Skill {
  skill_id: string;
  name: string;
  description: string;
  category: string;
  control_id?: string;
  standard?: string;
  severity?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface SkillStats {
  total_skills: number;
  enabled_skills: number;
  disabled_skills: number;
  by_category: Record<string, number>;
  by_standard: Record<string, number>;
}

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<SkillStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStandard, setFilterStandard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingSkill, setTogglingSkill] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/skills');
      setSkills(response.skills || []);
      setStats(response.stats || null);
      setError(null);
    } catch (err) {
      setError('Failed to load skills');
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = async (skillId: string, currentState: boolean) => {
    try {
      setTogglingSkill(skillId);
      const endpoint = currentState ? 'disable' : 'enable';
      await apiService.post(`/skills/${skillId}/${endpoint}`);
      
      // Update local state
      setSkills(skills.map(skill => 
        skill.skill_id === skillId 
          ? { ...skill, enabled: !currentState }
          : skill
      ));
      
      // Refresh stats
      await fetchSkills();
    } catch (err) {
      console.error(`Error toggling skill ${skillId}:`, err);
      alert('Failed to toggle skill. Please try again.');
    } finally {
      setTogglingSkill(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'detection':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'analysis':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'remediation':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const matchesStandard = filterStandard === 'all' || skill.standard === filterStandard;
    const matchesSearch = searchQuery === '' || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.control_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStandard && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))];
  const standards = ['all', ...Array.from(new Set(skills.map(s => s.standard).filter(Boolean)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchSkills}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Agent Skills Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage detection agent skills and their activation state
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Skills
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total_skills}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Enabled
            </div>
            <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.enabled_skills}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Disabled
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-600 dark:text-gray-400">
              {stats.disabled_skills}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Categories
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(stats.by_category).length}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Standard
            </label>
            <select
              value={filterStandard}
              onChange={(e) => setFilterStandard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {standards.map(std => (
                <option key={std} value={std}>
                  {std === 'all' ? 'All Standards' : std}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Standard
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No skills found matching your filters
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => (
                  <tr key={skill.skill_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {skill.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {skill.description}
                      </div>
                      {skill.control_id && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Control: {skill.control_id}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(skill.category)}`}>
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {skill.standard || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {skill.severity ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(skill.severity)}`}>
                          {skill.severity.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        skill.enabled 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {skill.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleSkill(skill.skill_id, skill.enabled)}
                        disabled={togglingSkill === skill.skill_id}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md ${
                          skill.enabled
                            ? 'text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                            : 'text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {togglingSkill === skill.skill_id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          skill.enabled ? 'Disable' : 'Enable'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredSkills.length} of {skills.length} skills
      </div>
    </div>
  );
};

export default Skills;