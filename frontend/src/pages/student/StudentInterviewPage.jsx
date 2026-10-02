import React, { useState, useEffect, useMemo } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Calendar, Video, Clock, Building2, Briefcase, Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { getStudentInterviews } from '../../services/student';

export default function StudentInterviewPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getStudentInterviews();
        if (data.success) {
          setInterviews(data.interviews);
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load scheduled interviews.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedInterviews = useMemo(() => {
    // 1. Filter
    let filtered = interviews.filter((interview) => {
      const matchesSearch = 
        interview.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.job_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.meeting_title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || interview.interview_type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [interviews, searchQuery, typeFilter, sortConfig]);

  // Extract unique interview types for the filter dropdown
  const uniqueTypes = ['All', ...new Set(interviews.map(i => i.interview_type))];

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="My Interviews"
          subtitle="View and join your scheduled placement interviews"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="mt-4 text-secondary text-sm">Loading interviews...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-6 text-center">
              <p>{error}</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-primary">No interviews scheduled</h3>
              <p className="text-secondary max-w-md mx-auto text-sm">
                You don't have any upcoming interviews scheduled at the moment. When recruiters schedule an interview with you, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Controls: Search, Filter, Sort */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card-bg p-4 rounded-xl border border-theme shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-secondary" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-theme rounded-lg bg-dashboard-bg text-primary text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search company, role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    className="block w-full sm:w-auto py-2 px-3 border border-theme rounded-lg bg-dashboard-bg text-primary text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table View */}
              <div className="bg-card-bg border border-theme rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-theme">
                    <thead className="bg-secondary/5">
                      <tr>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-secondary/10 transition-colors"
                          onClick={() => handleSort('company_name')}
                        >
                          <div className="flex items-center gap-2">
                            Company & Role
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-secondary/10 transition-colors"
                          onClick={() => handleSort('interview_type')}
                        >
                          <div className="flex items-center gap-2">
                            Round Details
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-secondary/10 transition-colors"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-2">
                            Schedule
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card-bg divide-y divide-theme">
                      {processedInterviews.length > 0 ? (
                        processedInterviews.map((interview) => (
                          <tr key={interview.id} className="hover:bg-secondary/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                                  <Building2 className="w-5 h-5" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-primary">{interview.company_name}</div>
                                  <div className="text-sm text-secondary flex items-center gap-1.5 mt-0.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {interview.job_role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-primary">{interview.meeting_title}</div>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-500">
                                  {interview.interview_type}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-primary flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-secondary" />
                                {interview.date || "TBA"}
                              </div>
                              <div className="text-sm text-secondary flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4" />
                                {interview.time || "TBA"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {interview.join_link ? (
                                <a
                                  href={interview.join_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                  <Video className="w-4 h-4" />
                                  Join Meeting
                                </a>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-2 py-2 px-4 bg-secondary/10 text-secondary rounded-lg font-medium cursor-not-allowed text-sm"
                                >
                                  Link Unavailable
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-secondary text-sm">
                            No interviews match your current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
