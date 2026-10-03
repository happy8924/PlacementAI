import React, { useState, useEffect, useMemo } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Briefcase, Building2, MapPin, IndianRupee, Clock, Bookmark, Search, LayoutGrid, List, Table2, CheckCircle2, BookmarkCheck, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { getAllJobs } from '../../services/jobs';
import { getStudentBookmarks, addStudentBookmark, removeStudentBookmark, getStudentApplications, applyToJob } from '../../services/student';

// --- Subcomponents ---

const JobModal = ({ job, onClose, isBookmarked, isApplied, onBookmarkToggle, onApply, applying }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-theme flex flex-col">
        <div className="sticky top-0 bg-card-bg/95 backdrop-blur z-10 border-b border-theme p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg text-primary">Job Details</h3>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary hover:bg-secondary/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-primary truncate">{job.title}</h2>
              <p className="text-secondary text-sm font-medium">{job.company_name}</p>
              
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-md">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {job.salary_package}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.job_type}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Description</h4>
              <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
            
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Requirements / Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg border border-theme text-xs font-medium text-primary bg-secondary/5">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Eligibility</h4>
              <ul className="text-sm text-secondary list-disc list-inside space-y-1">
                <li>Minimum CGPA: <span className="font-semibold text-primary">{job.min_cgpa}</span></li>
                {job.eligible_branches && job.eligible_branches.length > 0 && (
                  <li>Branches: {job.eligible_branches.join(', ')}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-card-bg border-t border-theme p-4 flex gap-3 justify-end items-center">
          <button
            onClick={(e) => { e.stopPropagation(); onBookmarkToggle(job.id); }}
            className={`p-2.5 border rounded-xl transition-colors ${
              isBookmarked 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20' 
                : 'border-theme text-secondary hover:text-primary hover:bg-secondary/10'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => {
              if (!isApplied && !applying) onApply(job.id);
            }}
            disabled={isApplied || applying}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              isApplied
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
            }`}
          >
            {applying ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Applied
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Apply Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


export default function StudentJobsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // Default to table view
  
  const [jobs, setJobs] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set()); // Set of job_ids
  const [applications, setApplications] = useState(new Set()); // Set of job_ids
  
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null); // job_id
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 6 : 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, bookmarksData, appsData] = await Promise.all([
        getAllJobs(),
        getStudentBookmarks(),
        getStudentApplications()
      ]);
      
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      
      if (bookmarksData.success) {
        setBookmarks(new Set(bookmarksData.bookmarks.map(b => b.id || b.job_id)));
      }
      if (appsData.success) {
        setApplications(new Set(appsData.applications.map(a => a.job_id)));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (jobId) => {
    const isBookmarked = bookmarks.has(jobId);
    
    // Optimistic update
    const newBookmarks = new Set(bookmarks);
    if (isBookmarked) newBookmarks.delete(jobId);
    else newBookmarks.add(jobId);
    setBookmarks(newBookmarks);

    try {
      if (isBookmarked) {
        await removeStudentBookmark(jobId);
      } else {
        await addStudentBookmark(jobId);
      }
    } catch (err) {
      // Revert on error
      setBookmarks(bookmarks);
      console.error("Bookmark toggle failed", err);
    }
  };

  const handleApply = async (jobId) => {
    setApplyingTo(jobId);
    try {
      const res = await applyToJob(jobId);
      if (res.success) {
        const newApps = new Set(applications);
        newApps.add(jobId);
        setApplications(newApps);
      }
    } catch (err) {
      console.error("Apply failed", err);
      alert(err.response?.data?.detail || "Application failed");
    } finally {
      setApplyingTo(null);
    }
  };

  const processedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (job.title && job.title.toLowerCase().includes(q)) ||
        (job.company_name && job.company_name.toLowerCase().includes(q)) ||
        (job.requirements && job.requirements.some(r => r.toLowerCase().includes(q)));
      
      let matchesFilter = true;
      if (activeFilter === 'Full-time') matchesFilter = job.job_type === 'Full-time';
      if (activeFilter === 'Internship') matchesFilter = job.job_type === 'Internship';
      if (activeFilter === 'Remote') matchesFilter = job.location && job.location.toLowerCase().includes('remote');

      return matchesSearch && matchesFilter;
    });
    
    return filtered;
  }, [jobs, searchQuery, activeFilter]);

  const totalPages = Math.ceil(processedJobs.length / itemsPerPage) || 1;
  const currentJobs = processedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, viewMode]);

  const [selectedJob, setSelectedJob] = useState(null);

  const filters = ['All', 'Full-time', 'Internship', 'Remote'];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // View Renders
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentJobs.map(job => {
        const isBookmarked = bookmarks.has(job.id);
        const isApplied = applications.has(job.id);
        const applying = applyingTo === job.id;
        
        return (
          <div 
            key={job.id} 
            onClick={() => setSelectedJob(job)}
            className="group bg-card-bg border border-theme rounded-2xl p-5 hover:shadow-xl hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col h-full relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleBookmarkToggle(job.id); }}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'text-amber-500 bg-amber-500/10' : 'text-secondary hover:bg-secondary/10 hover:text-primary'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="mb-4 flex-1">
              <h3 className="font-bold text-primary text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{job.title}</h3>
              <p className="text-secondary text-sm font-medium">{job.company_name}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{job.location}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                <IndianRupee className="w-3 h-3" />
                {job.salary_package}
              </span>
            </div>
            
            <div className="pt-4 border-t border-theme flex items-center justify-between mt-auto">
              <span className="text-xs text-secondary flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(job.created_at)}
              </span>
              
              <button
                onClick={(e) => { e.stopPropagation(); if(!isApplied && !applying) handleApply(job.id); }}
                disabled={isApplied || applying}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  isApplied 
                    ? 'bg-emerald-500/10 text-emerald-600 cursor-not-allowed border border-emerald-500/20' 
                    : 'bg-primary text-bg-primary hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {applying ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isApplied ? (
                  <>Applied</>
                ) : (
                  <>Apply</>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {currentJobs.map(job => {
        const isBookmarked = bookmarks.has(job.id);
        const isApplied = applications.has(job.id);
        const applying = applyingTo === job.id;
        
        return (
          <div 
            key={job.id} 
            onClick={() => setSelectedJob(job)}
            className="group bg-card-bg border border-theme rounded-xl p-4 hover:shadow-md hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary text-base group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
              <p className="text-secondary text-sm font-medium">{job.company_name}</p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <span className="text-xs text-secondary flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {job.salary_package}
                </span>
                <span className="text-xs text-secondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(job.created_at)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
              <button 
                onClick={(e) => { e.stopPropagation(); handleBookmarkToggle(job.id); }}
                className={`p-2 rounded-lg transition-colors border ${
                  isBookmarked ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' : 'text-secondary border-theme hover:bg-secondary/10 hover:text-primary'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); if(!isApplied && !applying) handleApply(job.id); }}
                disabled={isApplied || applying}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto flex items-center justify-center gap-2 ${
                  isApplied 
                    ? 'bg-emerald-500/10 text-emerald-600 cursor-not-allowed border border-emerald-500/20' 
                    : 'bg-primary text-bg-primary hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {applying ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isApplied ? (
                  <>Applied</>
                ) : (
                  <>Apply Now</>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-card-bg border border-theme rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme">
          <thead className="bg-secondary/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Job Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Location & Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Salary</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Posted</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-secondary uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-card-bg divide-y divide-theme">
            {currentJobs.map(job => {
              const isBookmarked = bookmarks.has(job.id);
              const isApplied = applications.has(job.id);
              const applying = applyingTo === job.id;
              
              return (
                <tr key={job.id} onClick={() => setSelectedJob(job)} className="hover:bg-secondary/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-primary group-hover:text-indigo-600 transition-colors truncate max-w-[200px]">{job.title}</div>
                        <div className="text-sm text-secondary font-medium">{job.company_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-secondary" /> {job.location}</div>
                    <div className="text-xs text-secondary mt-1">{job.job_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {job.salary_package}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBookmarkToggle(job.id); }}
                        className={`p-1.5 rounded-md transition-colors ${
                          isBookmarked ? 'text-amber-500 bg-amber-500/10' : 'text-secondary hover:bg-secondary/20'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if(!isApplied && !applying) handleApply(job.id); }}
                        disabled={isApplied || applying}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors w-24 flex justify-center items-center ${
                          isApplied 
                            ? 'bg-emerald-500/10 text-emerald-600 cursor-not-allowed border border-emerald-500/20' 
                            : 'bg-primary text-bg-primary hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {applying ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="Jobs & Opportunities"
          subtitle="Discover and apply for campus drives and exclusive postings"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-card-bg p-4 rounded-2xl border border-theme shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search job title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-sm text-primary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            {/* Filters & Toggles */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeFilter === f 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-dashboard-bg text-secondary hover:text-primary border border-theme hover:border-indigo-500/30'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
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

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-secondary text-sm font-medium">Fetching opportunities...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-8 text-center">
              <p className="font-medium">{error}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">Try Again</button>
            </div>
          ) : processedJobs.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary">No Jobs Found</h3>
              <p className="text-secondary max-w-md mx-auto text-sm">
                We couldn't find any opportunities matching your search or filters. Try adjusting your criteria.
              </p>
              {(searchQuery || activeFilter !== 'All') && (
                <button 
                  onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                  className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {viewMode === 'grid' && renderGridView()}
              {viewMode === 'list' && renderListView()}
              {viewMode === 'table' && renderTableView()}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-card-bg border border-theme p-4 rounded-xl mt-8">
                  <span className="text-sm text-secondary font-medium hidden sm:inline">
                    Showing <span className="text-primary font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-primary font-bold">{Math.min(currentPage * itemsPerPage, processedJobs.length)}</span> of <span className="text-primary font-bold">{processedJobs.length}</span> results
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-theme rounded-lg text-secondary hover:bg-secondary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                            currentPage === i + 1 
                              ? 'bg-indigo-600 text-white' 
                              : 'border border-theme text-secondary hover:bg-secondary/10 hover:text-primary'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-theme rounded-lg text-secondary hover:bg-secondary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Job Details Modal */}
      {selectedJob && (
        <JobModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          isBookmarked={bookmarks.has(selectedJob.id)}
          isApplied={applications.has(selectedJob.id)}
          applying={applyingTo === selectedJob.id}
          onBookmarkToggle={handleBookmarkToggle}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
