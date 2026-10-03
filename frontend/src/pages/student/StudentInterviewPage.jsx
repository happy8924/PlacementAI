import React, { useState, useEffect, useMemo } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Calendar, Video, Clock, Building2, Briefcase, Search, ArrowUpDown, Loader2, LayoutGrid, List, Table2 } from 'lucide-react';
import { getStudentInterviews } from '../../services/student';

export default function StudentInterviewPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // grid, list, table
  
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
                  
                  <div className="hidden sm:flex items-center p-1 bg-dashboard-bg border border-theme rounded-lg">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-card-bg shadow-sm text-primary' : 'text-secondary hover:text-primary'}`} title="Grid View">
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-card-bg shadow-sm text-primary' : 'text-secondary hover:text-primary'}`} title="List View">
                      <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-card-bg shadow-sm text-primary' : 'text-secondary hover:text-primary'}`} title="Table View">
                      <Table2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedInterviews.length > 0 ? (
                    processedInterviews.map((interview) => (
                      <div key={interview.id} className="bg-card-bg border border-theme rounded-2xl p-6 hover:shadow-md transition-shadow relative group flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-primary line-clamp-1">{interview.company_name}</h3>
                              <p className="text-xs text-secondary flex items-center gap-1 mt-1 font-medium">
                                <Briefcase className="w-3.5 h-3.5" />
                                {interview.job_role}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 flex-1 mb-6">
                          <div className="flex items-center gap-2 text-sm text-primary font-medium">
                            <div className="w-6 h-6 rounded bg-dashboard-bg flex items-center justify-center text-secondary">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            {interview.date || "TBA"} at {interview.time || "TBA"}
                          </div>
                          
                          <div className="flex items-center justify-between bg-dashboard-bg p-3 rounded-lg border border-theme/50">
                            <div className="text-xs font-semibold text-secondary">Round</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500">
                              {interview.interview_type}
                            </span>
                          </div>
                          <div className="text-xs text-secondary font-medium">
                            {interview.meeting_title}
                          </div>
                        </div>

                        <div className="mt-auto">
                          {interview.join_link ? (
                            <a
                              href={interview.join_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold font-mono uppercase tracking-wider transition-colors text-xs flex items-center justify-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Join Meeting
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full py-2.5 px-4 bg-secondary/10 text-secondary rounded-xl font-bold font-mono uppercase tracking-wider cursor-not-allowed text-xs flex items-center justify-center gap-2"
                            >
                              Link Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-secondary text-sm">
                      No interviews match your current filters.
                    </div>
                  )}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {processedInterviews.length > 0 ? (
                    processedInterviews.map((interview) => (
                      <div key={interview.id} className="bg-card-bg border border-theme rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-primary">{interview.company_name}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-medium text-secondary">
                              <span className="flex items-center gap-1.5 text-indigo-500"><Briefcase className="w-3.5 h-3.5" />{interview.job_role}</span>
                              <span className="hidden sm:block w-1 h-1 rounded-full bg-theme" />
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{interview.date || "TBA"}</span>
                              <span className="hidden sm:block w-1 h-1 rounded-full bg-theme" />
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{interview.time || "TBA"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-theme pt-4 sm:pt-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 self-start sm:self-auto">
                            {interview.interview_type}
                          </span>
                          
                          {interview.join_link ? (
                            <a
                              href={interview.join_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold font-mono uppercase tracking-wider transition-colors text-xs flex items-center justify-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Join
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full sm:w-auto py-2 px-4 bg-secondary/10 text-secondary rounded-lg font-bold font-mono uppercase tracking-wider cursor-not-allowed text-xs flex items-center justify-center gap-2"
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-secondary text-sm bg-card-bg border border-theme rounded-2xl">
                      No interviews match your current filters.
                    </div>
                  )}
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
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
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
